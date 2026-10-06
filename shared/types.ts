export type TravelStyle =
  | 'Budget + Comfortable'
  | 'Backpacker'
  | 'Cultural & Heritage'
  | 'Luxury & Leisure'
  | 'Adventure & Active'
  | 'Slow & Relaxed'
  | 'Family Friendly';

export type ActivityIntensity = 'Relaxed & Leisurely' | 'Balanced (2-3 key spots/day)' | 'Packed & High Energy';

export interface TripPreferences {
  destination: string;
  origin: string;
  duration: number; // in days
  startDate?: string;
  travelers: number;
  totalBudget: number;
  currency: string;
  travelStyle: TravelStyle;
  interests: string[];
  accommodationPreference: string;
  foodPreference: string;
  transportPreference: string;
  activityIntensity: ActivityIntensity;
  specialRequirements?: string;
}

export interface Activity {
  id: string;
  time: string; // e.g. "09:00 AM - 11:30 AM"
  period: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  name: string;
  category: string;
  duration: string;
  estimatedCost: number;
  reason: string;
  location: string;
  alternative?: string;
  isCustom?: boolean;
}

export interface Meal {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  recommendation: string;
  estimatedCost: number;
  location: string;
}

export interface ItineraryDay {
  day: number;
  date?: string;
  title: string;
  theme: string;
  routeOptimized: boolean;
  dayTravelTime: string;
  dayCost: number;
  meals: Meal[];
  activities: Activity[];
}

export interface BudgetBreakdown {
  transport: number;
  stay: number;
  food: number;
  activities: number;
  localTransport: number;
  buffer: number;
  totalEstimated: number;
  remaining: number;
  percentageUsed: number;
  costPerPerson: number;
  dailyAverage: number;
}

export interface TripPersonality {
  title: string; // e.g. "THE CULTURAL EXPLORER"
  tagline: string;
  description: string;
  badgeColor?: string;
}

export interface WeatherSummary {
  temperature: string;
  condition: string;
  packingAdvice: string;
}

export interface ToolCallRecord {
  tool: string;
  args: Record<string, any>;
  result: Record<string, any>;
  timestamp: string;
}

export interface TripSummary {
  destination: string;
  origin: string;
  duration: number;
  travelers: number;
  totalBudget: number;
  estimatedCost: number;
  currency: string;
  costPerPerson: number;
  dailyAverage: number;
  personalizationScore: number;
  tripPersonality: TripPersonality;
  whyThisTripFits: string[];
  weatherSummary: WeatherSummary;
  heroImage: string;
}

export interface TripItinerary {
  id: string;
  createdAt: string;
  preferences: TripPreferences;
  tripSummary: TripSummary;
  budgetBreakdown: BudgetBreakdown;
  days: ItineraryDay[];
  tips: string[];
  packingList: string[];
  alternatives: string[];
  toolCallsLog: ToolCallRecord[];
  isDemo?: boolean;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  changesSummary?: string[];
  suggestedAction?: string;
}

export interface WhatIfScenarioRequest {
  tripId: string;
  scenarioType: 'budget' | 'duration' | 'family' | 'weather' | 'pacing' | 'custom';
  customPrompt?: string;
  targetBudget?: number;
  targetDuration?: number;
}

export interface WhatIfComparison {
  scenarioTitle: string;
  originalBudget: number;
  newBudget: number;
  originalCost: number;
  newCost: number;
  savingsOrDiff: number;
  breakdownChanges: {
    category: string;
    original: number;
    updated: number;
    diff: number;
  }[];
  keyModifications: string[];
  optimizedItinerary: TripItinerary;
}
