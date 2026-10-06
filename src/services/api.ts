import { TripItinerary, TripPreferences, Activity, WhatIfScenarioRequest, WhatIfComparison, CopilotMessage } from '../../shared/types.ts';

const BASE_URL = '/api/trips';

export async function fetchAllTrips(): Promise<TripItinerary[]> {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch trips');
    const data = await res.json();
    return data.trips || [];
  } catch (err) {
    console.warn('API error in fetchAllTrips:', err);
    return [];
  }
}

export async function fetchTrip(id: string): Promise<{ itinerary: TripItinerary; messages: CopilotMessage[] }> {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) {
    throw new Error('Failed to load trip itinerary');
  }
  const data = await res.json();
  return {
    itinerary: data.itinerary,
    messages: data.messages || []
  };
}

export async function generateNewTrip(prefs: TripPreferences): Promise<TripItinerary> {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate itinerary. Please try again.');
  }

  const data = await res.json();
  return data.itinerary;
}

export async function optimizeTripBudget(id: string): Promise<{ itinerary: TripItinerary; optimization: any }> {
  const res = await fetch(`${BASE_URL}/${id}/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) throw new Error('Budget optimization failed');
  return res.json();
}

export async function regenerateDay(id: string, dayNumber: number): Promise<TripItinerary> {
  const res = await fetch(`${BASE_URL}/${id}/regenerate-day`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dayNumber })
  });

  if (!res.ok) throw new Error('Failed to regenerate day');
  const data = await res.json();
  return data.itinerary;
}

export async function addActivity(id: string, dayNumber: number, activity: Partial<Activity>): Promise<TripItinerary> {
  const res = await fetch(`${BASE_URL}/${id}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dayNumber, activity })
  });

  if (!res.ok) throw new Error('Failed to add activity');
  const data = await res.json();
  return data.itinerary;
}

export async function updateActivity(id: string, activityId: string, updates: Partial<Activity>): Promise<TripItinerary> {
  const res = await fetch(`${BASE_URL}/${id}/activity/${activityId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });

  if (!res.ok) throw new Error('Failed to update activity');
  const data = await res.json();
  return data.itinerary;
}

export async function deleteActivity(id: string, activityId: string): Promise<TripItinerary> {
  const res = await fetch(`${BASE_URL}/${id}/activity/${activityId}`, {
    method: 'DELETE'
  });

  if (!res.ok) throw new Error('Failed to delete activity');
  const data = await res.json();
  return data.itinerary;
}

export async function sendCopilotChat(tripId: string, message: string): Promise<{
  reply: string;
  changesSummary: string[];
  itinerary: TripItinerary;
}> {
  const res = await fetch(`${BASE_URL}/copilot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tripId, message })
  });

  if (!res.ok) throw new Error('Trip Copilot request failed');
  return res.json();
}

export async function runWhatIfScenario(request: WhatIfScenarioRequest): Promise<WhatIfComparison> {
  const res = await fetch(`${BASE_URL}/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!res.ok) throw new Error('What-If simulation failed');
  const data = await res.json();
  return data.comparison;
}

export async function fetchSearchGrounding(destination: string, topic?: string): Promise<{
  answer: string;
  sources: { title: string; url: string }[];
  searchQueries: string[];
}> {
  const res = await fetch(`${BASE_URL}/search-grounding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destination, topic })
  });

  if (!res.ok) throw new Error('Search Grounding failed');
  return res.json();
}

export async function fetchGeminiChat(params: {
  model?: 'gemini-3.1-flash-lite' | 'gemini-3.5-flash' | 'gemini-3.8-flash';
  systemRole?: 'guide' | 'budget' | 'food';
  destination?: string;
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  message: string;
}): Promise<{ reply: string; modelUsed: string; role: string }> {
  const res = await fetch(`${BASE_URL}/gemini-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) throw new Error('Gemini chat request failed');
  return res.json();
}

export async function startVeoVideoGeneration(params: {
  imageBase64: string;
  mimeType: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
}): Promise<{ operationName: string }> {
  const res = await fetch(`${BASE_URL}/generate-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to start video generation');
  }
  return res.json();
}

export async function pollVeoVideoStatus(operationName: string): Promise<{ done: boolean; error?: any }> {
  const res = await fetch(`${BASE_URL}/video-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName })
  });

  if (!res.ok) throw new Error('Failed to check video status');
  return res.json();
}

