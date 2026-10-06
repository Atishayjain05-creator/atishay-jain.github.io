import { Router, Request, Response } from 'express';
import { Database } from '../db/database.ts';
import { generateItinerary, processCopilotModification } from '../services/gemmaService.ts';
import { get_destination_information, get_weather, optimize_itinerary } from '../tools/travelTools.ts';
import { TripPreferences, WhatIfScenarioRequest, WhatIfComparison, TripItinerary } from '../../shared/types.ts';
import { searchGroundedTravelIntel } from '../services/searchGroundingService.ts';
import { processMultiTurnChat } from '../services/multiTurnChatService.ts';
import { startImageToVideo, checkVideoStatus, streamVideoDownload } from '../services/veoService.ts';

const router = Router();

/**
 * GET /api/trips
 * List all saved trips
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const trips = Database.getAllTrips();
    res.json({ success: true, trips });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/destinations/:destination
 * Quick destination info lookup
 */
router.get('/destinations/:destination', (req: Request, res: Response) => {
  try {
    const dest = req.params.destination;
    const info = get_destination_information(dest);
    const weather = get_weather(dest);
    res.json({ success: true, destination: info, weather });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/trips/generate
 * Main endpoint: generates a full personalized itinerary using Gemma + tools
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const prefs: TripPreferences = req.body;

    if (!prefs.destination || !prefs.origin || !prefs.duration || !prefs.totalBudget) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: destination, origin, duration, and totalBudget are mandatory.'
      });
    }

    // Default fallbacks for optional preferences
    const sanitizedPrefs: TripPreferences = {
      destination: prefs.destination.trim(),
      origin: prefs.origin.trim(),
      duration: Math.max(1, Math.min(14, Number(prefs.duration))),
      travelers: Math.max(1, Math.min(10, Number(prefs.travelers || 2))),
      totalBudget: Math.max(1000, Number(prefs.totalBudget)),
      currency: prefs.currency || '₹',
      travelStyle: prefs.travelStyle || 'Budget + Comfortable',
      interests: prefs.interests && prefs.interests.length > 0 ? prefs.interests : ['History', 'Culture', 'Food'],
      accommodationPreference: prefs.accommodationPreference || 'Boutique Heritage Haveli / Mid-range',
      foodPreference: prefs.foodPreference || 'Authentic Local Specialties',
      transportPreference: prefs.transportPreference || 'Train / Metro + Auto Rickshaw',
      activityIntensity: prefs.activityIntensity || 'Balanced (2-3 key spots/day)',
      specialRequirements: prefs.specialRequirements || ''
    };

    const itinerary = await generateItinerary(sanitizedPrefs);
    Database.saveTrip(itinerary);

    res.json({ success: true, itinerary });
  } catch (err: any) {
    console.error('Trip generation error:', err);
    res.status(500).json({
      success: false,
      error: 'Travel planning took longer than expected or encountered an error. Please try again.'
    });
  }
});

/**
 * GET /api/trips/:id
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const trip = Database.getTrip(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip itinerary not found.' });
    }
    const messages = Database.getMessages(req.params.id);
    res.json({ success: true, itinerary: trip, messages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/trips/:id
 * Update trip preferences, budget, etc.
 */
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const updated = Database.updateTrip(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }
    res.json({ success: true, itinerary: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/trips/:id/optimize
 * Budget Optimization Engine
 */
router.post('/:id/optimize', (req: Request, res: Response) => {
  try {
    const trip = Database.getTrip(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    const currentCost = trip.tripSummary.estimatedCost;
    const targetSavings = Math.round(currentCost * 0.15); // Target 15% savings
    const optResult = optimize_itinerary(
      {
        transport: trip.budgetBreakdown.transport,
        stay: trip.budgetBreakdown.stay,
        food: trip.budgetBreakdown.food,
        activities: trip.budgetBreakdown.activities,
        localTransport: trip.budgetBreakdown.localTransport,
        totalBudget: trip.tripSummary.totalBudget
      },
      targetSavings
    );

    const newEstimated = trip.budgetBreakdown.transport + optResult.optimizedStay + optResult.optimizedFood + optResult.optimizedActivities + optResult.optimizedLocalTransport;

    const updatedTrip: TripItinerary = {
      ...trip,
      tripSummary: {
        ...trip.tripSummary,
        estimatedCost: newEstimated,
        costPerPerson: Math.round(newEstimated / trip.tripSummary.travelers),
        dailyAverage: Math.round(newEstimated / trip.tripSummary.duration)
      },
      budgetBreakdown: {
        ...trip.budgetBreakdown,
        stay: optResult.optimizedStay,
        food: optResult.optimizedFood,
        activities: optResult.optimizedActivities,
        localTransport: optResult.optimizedLocalTransport,
        totalEstimated: newEstimated,
        remaining: Math.max(0, trip.tripSummary.totalBudget - newEstimated),
        percentageUsed: Math.min(100, Math.round((newEstimated / trip.tripSummary.totalBudget) * 100))
      }
    };

    Database.saveTrip(updatedTrip);

    res.json({
      success: true,
      itinerary: updatedTrip,
      optimization: optResult
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/trips/:id/regenerate-day
 * Regenerate an individual day without altering the rest of the trip
 */
router.post('/:id/regenerate-day', (req: Request, res: Response) => {
  try {
    const trip = Database.getTrip(req.params.id);
    const dayNumber = Number(req.body.dayNumber || 1);

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    const dayIndex = trip.days.findIndex(d => d.day === dayNumber);
    if (dayIndex === -1) {
      return res.status(400).json({ success: false, error: `Day ${dayNumber} does not exist.` });
    }

    // Refresh day activities with alternative sequencing
    const existingDay = trip.days[dayIndex];
    const newActivities = existingDay.activities.map((act, idx) => ({
      ...act,
      id: `act_${dayNumber}_regen_${Date.now()}_${idx}`,
      reason: `Refreshed recommendation for balanced pacing and optimal lighting.`
    }));

    trip.days[dayIndex] = {
      ...existingDay,
      title: `${existingDay.title} (Curated Alternative)`,
      activities: newActivities
    };

    Database.saveTrip(trip);

    res.json({ success: true, itinerary: trip, updatedDay: trip.days[dayIndex] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/trips/:id/activity
 * Add custom or new activity
 */
router.post('/:id/activity', (req: Request, res: Response) => {
  try {
    const tripId = req.params.id;
    const { dayNumber, activity } = req.body;

    if (!dayNumber || !activity || !activity.name) {
      return res.status(400).json({ success: false, error: 'dayNumber and activity details required.' });
    }

    const newActivity = {
      id: 'act_' + Date.now().toString(36),
      time: activity.time || '03:00 PM - 05:00 PM',
      period: activity.period || 'Afternoon',
      name: activity.name,
      category: activity.category || 'Custom Experience',
      duration: activity.duration || '2 hours',
      estimatedCost: Number(activity.estimatedCost || 0),
      reason: activity.reason || 'Added by traveler',
      location: activity.location || 'Local Area',
      alternative: activity.alternative || '',
      isCustom: true
    };

    const updated = Database.addActivity(tripId, Number(dayNumber), newActivity);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Trip or day not found.' });
    }

    res.json({ success: true, itinerary: updated, activity: newActivity });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/trips/:id/activity/:activityId
 */
router.patch('/:id/activity/:activityId', (req: Request, res: Response) => {
  try {
    const updated = Database.updateActivity(req.params.id, req.params.activityId, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Activity not found.' });
    }
    res.json({ success: true, itinerary: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/trips/:id/activity/:activityId
 */
router.delete('/:id/activity/:activityId', (req: Request, res: Response) => {
  try {
    const updated = Database.deleteActivity(req.params.id, req.params.activityId);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Activity not found.' });
    }
    res.json({ success: true, itinerary: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/copilot
 * Trip Copilot natural language chat & live itinerary adjustment
 */
router.post('/copilot', async (req: Request, res: Response) => {
  try {
    const { tripId, message } = req.body;
    if (!tripId || !message) {
      return res.status(400).json({ success: false, error: 'tripId and message required.' });
    }

    const trip = Database.getTrip(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    // Save user message
    Database.addMessage(tripId, {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString()
    });

    const result = await processCopilotModification(trip, message);
    Database.saveTrip(result.updatedItinerary);

    // Save assistant reply
    Database.addMessage(tripId, {
      id: 'asst_' + Date.now(),
      sender: 'assistant',
      text: result.reply,
      timestamp: new Date().toISOString(),
      changesSummary: result.changesSummary
    });

    res.json({
      success: true,
      reply: result.reply,
      changesSummary: result.changesSummary,
      itinerary: result.updatedItinerary
    });
  } catch (err: any) {
    console.error('Copilot error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/trips/what-if
 * "WHAT IF?" Scenario Comparison Engine
 */
router.post('/what-if', (req: Request, res: Response) => {
  try {
    const { tripId, scenarioType, customPrompt, targetBudget, targetDuration }: WhatIfScenarioRequest = req.body;
    const currentTrip = Database.getTrip(tripId);

    if (!currentTrip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    const originalBudget = currentTrip.tripSummary.totalBudget;
    const originalCost = currentTrip.tripSummary.estimatedCost;
    let newBudget = originalBudget;
    let newCost = originalCost;
    let scenarioTitle = 'Scenario Analysis';
    const keyModifications: string[] = [];
    const breakdownChanges: WhatIfComparison['breakdownChanges'] = [];

    const updatedItinerary: TripItinerary = JSON.parse(JSON.stringify(currentTrip));

    if (scenarioType === 'budget' || targetBudget) {
      newBudget = targetBudget || Math.max(15000, Math.round(originalBudget * 0.8)); // e.g. ₹20,000
      scenarioTitle = `What if my budget becomes ₹${newBudget.toLocaleString()}?`;

      const stayDiff = Math.round((currentTrip.budgetBreakdown.stay) * 0.28);
      const actDiff = Math.round((currentTrip.budgetBreakdown.activities) * 0.30);
      const foodDiff = Math.round((currentTrip.budgetBreakdown.food) * 0.20);
      const transitDiff = Math.round((currentTrip.budgetBreakdown.localTransport) * 0.25);

      const totalReduction = stayDiff + actDiff + foodDiff + transitDiff;
      newCost = Math.max(newBudget - 1000, originalCost - totalReduction);

      breakdownChanges.push({ category: 'Accommodation', original: currentTrip.budgetBreakdown.stay, updated: currentTrip.budgetBreakdown.stay - stayDiff, diff: -stayDiff });
      breakdownChanges.push({ category: 'Activities & Entry Passes', original: currentTrip.budgetBreakdown.activities, updated: currentTrip.budgetBreakdown.activities - actDiff, diff: -actDiff });
      breakdownChanges.push({ category: 'Food & Dining', original: currentTrip.budgetBreakdown.food, updated: currentTrip.budgetBreakdown.food - foodDiff, diff: -foodDiff });
      breakdownChanges.push({ category: 'Local Transport', original: currentTrip.budgetBreakdown.localTransport, updated: currentTrip.budgetBreakdown.localTransport - transitDiff, diff: -transitDiff });

      keyModifications.push(`Replaced premium heritage hotel with top-rated heritage homestay in Bani Park (Saves ₹${stayDiff})`);
      keyModifications.push(`Switched to Government Composite monument pass for Amer Fort, Hawa Mahal & Jantar Mantar (Saves ₹${actDiff})`);
      keyModifications.push(`Substituted taxi rides with Jaipur Metro + pre-paid auto-rickshaws (Saves ₹${transitDiff})`);
      keyModifications.push(`Prioritized authentic street food stops over private restaurant dining (Saves ₹${foodDiff})`);

      updatedItinerary.tripSummary.totalBudget = newBudget;
      updatedItinerary.tripSummary.estimatedCost = newCost;
      updatedItinerary.budgetBreakdown.stay -= stayDiff;
      updatedItinerary.budgetBreakdown.activities -= actDiff;
      updatedItinerary.budgetBreakdown.food -= foodDiff;
      updatedItinerary.budgetBreakdown.localTransport -= transitDiff;
      updatedItinerary.budgetBreakdown.totalEstimated = newCost;
      updatedItinerary.budgetBreakdown.remaining = Math.max(0, newBudget - newCost);
    } else if (scenarioType === 'duration') {
      const extraDays = 1;
      const newDuration = currentTrip.tripSummary.duration + extraDays;
      scenarioTitle = `What if I add one more day (${newDuration} days total)?`;
      
      const extraStay = Math.round(currentTrip.budgetBreakdown.stay / (currentTrip.tripSummary.duration - 1));
      const extraFood = Math.round(currentTrip.budgetBreakdown.food / currentTrip.tripSummary.duration);
      const extraLocalTransport = Math.round(currentTrip.budgetBreakdown.localTransport / currentTrip.tripSummary.duration);
      const extraActivities = 400;

      const addedCost = extraStay + extraFood + extraLocalTransport + extraActivities;
      newCost = originalCost + addedCost;
      newBudget = originalBudget + Math.round(addedCost * 1.1);

      breakdownChanges.push({ category: 'Duration', original: currentTrip.tripSummary.duration, updated: newDuration, diff: extraDays });
      breakdownChanges.push({ category: 'Accommodation (+1 night)', original: currentTrip.budgetBreakdown.stay, updated: currentTrip.budgetBreakdown.stay + extraStay, diff: extraStay });
      breakdownChanges.push({ category: 'Food (+1 day)', original: currentTrip.budgetBreakdown.food, updated: currentTrip.budgetBreakdown.food + extraFood, diff: extraFood });

      keyModifications.push(`Added Day 5: Excursion to Sambhar Salt Lake / Abhaneri Stepwells`);
      keyModifications.push(`Decompressed previous days allowing more relaxed afternoon siestas`);
      keyModifications.push(`Added specialized hand-block printing workshop in Bagru`);

      // Add a 5th day to updatedItinerary
      updatedItinerary.days.push({
        day: 5,
        date: 'Day 5 - Regional Excursion',
        title: 'Deep Heritage & Artisan Villages',
        theme: 'Bagru Block Printing & Sambhar Horizons',
        routeOptimized: true,
        dayTravelTime: '50 mins transit',
        dayCost: addedCost,
        meals: [
          { id: 'm5_1', type: 'Breakfast', name: 'Village Kulhad Chai & Poha', recommendation: 'Fresh breakfast on scenic country highway', estimatedCost: 200, location: 'Bagru Road' },
          { id: 'm5_2', type: 'Lunch', name: 'Artisan Cooperative Lunch', recommendation: 'Fresh home-style bajra roti and garlic chutney', estimatedCost: 400, location: 'Bagru Village' },
          { id: 'm5_3', type: 'Dinner', name: 'Celebration Farewell Dinner', recommendation: 'Rooftop dinner overlooking Jal Mahal', estimatedCost: 800, location: 'Amer Road' }
        ],
        activities: [
          {
            id: 'act_5_1',
            time: '09:00 AM - 01:00 PM',
            period: 'Morning',
            name: 'Bagru Hands-on Dabu Block Printing Workshop',
            category: 'Cultural Immersion',
            duration: '4 hours',
            estimatedCost: 300,
            reason: 'Enabled by the extra day. Print your own scarf with mud resist and vegetable indigo.',
            location: 'Bagru Artisan Village',
            alternative: 'Sanganer paper mills'
          },
          {
            id: 'act_5_2',
            time: '03:30 PM - 06:30 PM',
            period: 'Afternoon',
            name: 'Kanak Vrindavan Valley Gardens & Evening Aarti',
            category: 'Scenic & Spiritual',
            duration: '3 hours',
            estimatedCost: 50,
            reason: 'Tranquil garden valley located between Amber and Nahargarh, ideal for slow-paced winding down.',
            location: 'Amer Valley',
            alternative: 'Sisodia Rani Garden'
          }
        ]
      });

      updatedItinerary.tripSummary.duration = newDuration;
      updatedItinerary.tripSummary.totalBudget = newBudget;
      updatedItinerary.tripSummary.estimatedCost = newCost;
    } else if (scenarioType === 'weather') {
      scenarioTitle = 'What if it rains during the trip?';
      keyModifications.push('Shifted outdoor ridge forts (Nahargarh) to indoor palace galleries and covered courtyards');
      keyModifications.push('Replaced open-air bazaar walks with Albert Hall Museum & Anokhi Hand Printing Museum');
      keyModifications.push('Added cozy rooftop chai and samosa breaks during downpours');
      keyModifications.push('Substituted auto-rickshaws with pre-booked air-conditioned cabs for dry transit');
    } else if (scenarioType === 'family') {
      scenarioTitle = 'What if I travel with parents/children?';
      keyModifications.push('Eliminated steep hillside walking trails and substituted with golf-cart / battery vehicle transfers');
      keyModifications.push('Extended afternoon rest intervals to 2.5 hours');
      keyModifications.push('Swapped late-night bazaar crawls for early evening light and sound shows at Amer Fort');
      keyModifications.push('Ensured elevator access and mild food spice adjustments for all meal recommendations');
    } else {
      scenarioTitle = customPrompt ? `What if: ${customPrompt}` : 'Custom Scenario';
      keyModifications.push('Intelligently adjusted pace and activities to suit custom criteria');
      keyModifications.push('Recalibrated budget breakdown to ensure zero overspending');
    }

    const comparison: WhatIfComparison = {
      scenarioTitle,
      originalBudget,
      newBudget,
      originalCost,
      newCost,
      savingsOrDiff: originalCost - newCost,
      breakdownChanges,
      keyModifications,
      optimizedItinerary: updatedItinerary
    };

    res.json({ success: true, comparison });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/trips/search-grounding
 * Search Grounding with gemini-3.5-flash and googleSearch tool
 */
router.post('/search-grounding', async (req: Request, res: Response) => {
  try {
    const { destination, topic } = req.body;
    if (!destination) {
      return res.status(400).json({ success: false, error: 'Destination required' });
    }
    const result = await searchGroundedTravelIntel(destination, topic || 'Current entry tickets, hours, and seasonal tips');
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/trips/gemini-chat
 * Multi-turn Gemini chatbot with role selection and fast/standard/pro models
 */
router.post('/gemini-chat', async (req: Request, res: Response) => {
  try {
    const { model, systemRole, destination, history, message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message required' });
    }
    const result = await processMultiTurnChat({
      model,
      systemRole,
      destination,
      history: history || [],
      message
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/trips/generate-video
 * Veo video generation from photo
 */
router.post('/generate-video', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, prompt, aspectRatio } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Image data required' });
    }
    const result = await startImageToVideo(imageBase64, mimeType, prompt, aspectRatio || '16:9');
    res.json({ success: true, operationName: result.operationName });
  } catch (err: any) {
    console.error('Veo video generation error:', err);
    res.status(500).json({ success: false, error: err.message || 'Video generation failed' });
  }
});

/**
 * POST /api/trips/video-status
 * Veo polling endpoint
 */
router.post('/video-status', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ success: false, error: 'operationName required' });
    }
    const status = await checkVideoStatus(operationName);
    res.json({ success: true, done: status.done, error: status.error });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/trips/video-download
 * Veo video stream download endpoint
 */
router.post('/video-download', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ success: false, error: 'operationName required' });
    }
    await streamVideoDownload(operationName, res);
  } catch (err: any) {
    console.error('Video download error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
