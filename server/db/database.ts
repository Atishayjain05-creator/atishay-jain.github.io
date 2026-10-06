import fs from 'fs';
import path from 'path';
import { TripItinerary, CopilotMessage, Activity } from '../../shared/types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseSchema {
  trips: Record<string, TripItinerary>;
  chatMessages: Record<string, CopilotMessage[]>;
  savedPlaces: Record<string, string[]>;
}

let dbCache: DatabaseSchema = {
  trips: {},
  chatMessages: {},
  savedPlaces: {}
};

function ensureDbFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
    } else {
      seedDefaultTrip();
      saveDbToFile();
    }
  } catch (err) {
    console.warn('Error reading db file, using in-memory cache:', err);
    seedDefaultTrip();
  }
}

function saveDbToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error persisting db to file:', err);
  }
}

export function seedDefaultTrip() {
  const demoTripId = 'demo-jaipur-bhopal-trip';
  
  const demoTrip: TripItinerary = {
    id: demoTripId,
    createdAt: new Date().toISOString(),
    isDemo: true,
    preferences: {
      destination: 'Jaipur',
      origin: 'Bhopal',
      duration: 4,
      travelers: 2,
      totalBudget: 25000,
      currency: '₹',
      travelStyle: 'Budget + Comfortable',
      interests: ['History', 'Food', 'Photography', 'Culture'],
      accommodationPreference: 'Boutique Heritage Haveli in Bani Park',
      foodPreference: 'Authentic Rajasthani & Legendary Street Food',
      transportPreference: 'AC 3-Tier Train + Local Auto & Metro Pass',
      activityIntensity: 'Balanced (2-3 key spots/day)',
      specialRequirements: 'Avoid peak afternoon heat for outdoor fort walks'
    },
    tripSummary: {
      destination: 'Jaipur',
      origin: 'Bhopal',
      duration: 4,
      travelers: 2,
      totalBudget: 25000,
      estimatedCost: 22800,
      currency: '₹',
      costPerPerson: 11400,
      dailyAverage: 5700,
      personalizationScore: 96,
      tripPersonality: {
        title: 'THE CULTURAL EXPLORER',
        tagline: 'Centuries-old ramparts, fragrant spice bazaars & royal courtyards',
        description: 'An itinerary engineered around Rajput architecture, golden-hour photography, and historic culinary institutions without rushed transitions.'
      },
      whyThisTripFits: [
        'Directly centers your 4 chosen interests: History, Rajasthani Food, Photography, and Living Culture',
        'Stays safely within your ₹25,000 budget with a ₹2,200 contingency reserve',
        'Route-optimized by geographic clusters: Amer Ridge Day, UNESCO Walled City Day, Artisan Living Arts Day, and Heritage Farewell Day',
        'Schedules high-elevation forts in cool morning breezes and bustling bazaars at golden hour'
      ],
      weatherSummary: {
        temperature: '26°C High / 14°C Low',
        condition: 'Clear Autumn Sunshine with Gentle Breeze',
        packingAdvice: 'Breathable cotton shirts, sturdy walking sneakers for fort inclines, sunglasses, and a light jacket for cool evening terrace dining.'
      },
      heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=80'
    },
    budgetBreakdown: {
      transport: 4600,
      stay: 7200,
      food: 5400,
      activities: 1800,
      localTransport: 2000,
      buffer: 1800,
      totalEstimated: 22800,
      remaining: 2200,
      percentageUsed: 91,
      costPerPerson: 11400,
      dailyAverage: 5700
    },
    days: [
      {
        day: 1,
        date: 'Day 1 - Amer Ridge',
        title: 'Fortress Vistas & Symmetrical Stepwells',
        theme: 'Grand Architecture & Aravalli Ridges',
        routeOptimized: true,
        dayTravelTime: '45 mins total transit (North Ridge Cluster)',
        dayCost: 5200,
        meals: [
          {
            id: 'd1_m1',
            type: 'Breakfast',
            name: 'Pyaaz Kachori & Masala Chai',
            recommendation: 'Crispy onion-stuffed kachori with sweet tamarind chutney at Rawat Mishtan Bhandar',
            estimatedCost: 300,
            location: 'Station Road'
          },
          {
            id: 'd1_m2',
            type: 'Lunch',
            name: 'Traditional Thali at 1135 AD / Heritage Courtyard',
            recommendation: 'Authentic Dal Baati Churma and Gatte ki Sabzi with fresh buttermilk',
            estimatedCost: 1100,
            location: 'Amer Fort'
          },
          {
            id: 'd1_m3',
            type: 'Dinner',
            name: 'Padao Open-Air Terrace at Nahargarh',
            recommendation: 'Dining under the stars with panorama of Jaipur twinkling lights below',
            estimatedCost: 1000,
            location: 'Nahargarh Ridge'
          }
        ],
        activities: [
          {
            id: 'd1_a1',
            time: '08:30 AM - 11:30 AM',
            period: 'Morning',
            name: 'Amer Fort (Amber Palace)',
            category: 'Historical Landmark',
            duration: '3 hours',
            estimatedCost: 200,
            reason: 'Chosen for history & architecture. Scheduled at 8:30 AM to explore Sheesh Mahal before tour crowds arrive.',
            location: 'Amer, 11 km north of Jaipur',
            alternative: 'Jaigarh Fort & subterranean tunnel network'
          },
          {
            id: 'd1_a2',
            time: '11:45 AM - 12:45 PM',
            period: 'Morning',
            name: 'Panna Meena Ka Kund Stepwell',
            category: 'Architectural Gem',
            duration: '1 hour',
            estimatedCost: 0,
            reason: 'Selected for your photography passion. Intricate 16th-century geometric staircases just 5 mins from Amer Fort.',
            location: 'Near Amer Fort',
            alternative: 'Anokhi Museum of Hand Printing'
          },
          {
            id: 'd1_a3',
            time: '02:30 PM - 04:00 PM',
            period: 'Afternoon',
            name: 'Jal Mahal (Water Palace) Promenade',
            category: 'Scenic Viewpoint',
            duration: '1.5 hours',
            estimatedCost: 0,
            reason: 'Located directly on return route from Amer. Spectacular mid-lake reflection photography opportunity.',
            location: 'Amer Road',
            alternative: 'Kanak Vrindavan Gardens'
          },
          {
            id: 'd1_a4',
            time: '04:45 PM - 06:45 PM',
            period: 'Evening',
            name: 'Nahargarh Fort Sunset Overlook',
            category: 'Scenic Viewpoint',
            duration: '2 hours',
            estimatedCost: 100,
            reason: 'Best sunset in Rajasthan. Watch the sun dip over the Aravalli hills and the city illuminate.',
            location: 'Nahargarh Ridge',
            alternative: 'Charan Mandir scenic viewpoint'
          }
        ]
      },
      {
        day: 2,
        date: 'Day 2 - UNESCO Walled City',
        title: 'Palaces of the Sun & Living Bazaars',
        theme: 'Pink City Royal Core & Artisan Walk',
        routeOptimized: true,
        dayTravelTime: '20 mins total transit (Old City Cluster)',
        dayCost: 4900,
        meals: [
          {
            id: 'd2_m1',
            type: 'Breakfast',
            name: 'Kulhad Lassi at Lassiwala (Est. 1944)',
            recommendation: 'Creamy malai lassi served chilled in earthen cups',
            estimatedCost: 240,
            location: 'MI Road'
          },
          {
            id: 'd2_m2',
            type: 'Lunch',
            name: 'The Tattoo Cafe & Lounge',
            recommendation: 'Rooftop cafe directly overlooking the intricate facade of Hawa Mahal',
            estimatedCost: 750,
            location: 'Opposite Hawa Mahal'
          },
          {
            id: 'd2_m3',
            type: 'Dinner',
            name: 'Laxmi Mishtan Bhandar (LMB) Heritage Feast',
            recommendation: 'Signature Rajasthani Royal Thali & fresh Mawa Ghewar',
            estimatedCost: 1100,
            location: 'Johari Bazaar'
          }
        ],
        activities: [
          {
            id: 'd2_a1',
            time: '08:30 AM - 10:00 AM',
            period: 'Morning',
            name: 'Hawa Mahal (Palace of Winds)',
            category: 'Iconic Landmark',
            duration: '1.5 hours',
            estimatedCost: 100,
            reason: 'Morning sunlight directly illuminates all 953 honeycombed casements. Optimal lighting for crisp photos.',
            location: 'Badi Choupad, Old City',
            alternative: 'Wind View Cafe observation terrace'
          },
          {
            id: 'd2_a2',
            time: '10:15 AM - 12:45 PM',
            period: 'Morning',
            name: 'City Palace & Chandra Mahal Courtyards',
            category: 'Royal Heritage',
            duration: '2.5 hours',
            estimatedCost: 600,
            reason: 'Residence of Jaipur royal family. Features the famous peacock gates representing the four seasons.',
            location: 'Jaleb Chowk, Old City',
            alternative: 'Maharaja Sawai Man Singh II Museum'
          },
          {
            id: 'd2_a3',
            time: '01:45 PM - 03:15 PM',
            period: 'Afternoon',
            name: 'Jantar Mantar Astronomical Observatory',
            category: 'UNESCO Scientific Heritage',
            duration: '1.5 hours',
            estimatedCost: 100,
            reason: 'Directly across City Palace gate. World’s largest stone sundial measuring time to 2 seconds precision.',
            location: 'Next to City Palace',
            alternative: 'Albert Hall miniature museum'
          },
          {
            id: 'd2_a4',
            time: '04:15 PM - 07:15 PM',
            period: 'Evening',
            name: 'Johari & Bapu Bazaar Culinary Walk',
            category: 'Food & Cultural Walk',
            duration: '3 hours',
            estimatedCost: 400,
            reason: 'Immersive street culture: watch bangle artisans, sample mirchi vadas, and browse block-printed textiles.',
            location: 'Walled Pink City Bazaars',
            alternative: 'Tripolia Bazaar brass market'
          }
        ]
      },
      {
        day: 3,
        date: 'Day 3 - Living Arts & Spirituality',
        title: 'Cenotaphs, Sacred Springs & Light Projections',
        theme: 'Sacred Passes, Indo-Saracenic Art & Night Magic',
        routeOptimized: true,
        dayTravelTime: '35 mins total transit (East & South Cluster)',
        dayCost: 4600,
        meals: [
          {
            id: 'd3_m1',
            type: 'Breakfast',
            name: 'Poha Jalebi & Kadak Chai',
            recommendation: 'Warm spiced flattened rice with crisp saffron jalebi',
            estimatedCost: 220,
            location: 'Chaura Rasta'
          },
          {
            id: 'd3_m2',
            type: 'Lunch',
            name: 'Peacock Rooftop Garden Restaurant',
            recommendation: 'Peaceful garden oasis serving rich North Indian delicacies',
            estimatedCost: 800,
            location: 'Hathroi Fort'
          },
          {
            id: 'd3_m3',
            type: 'Dinner',
            name: 'Handi Restaurant on MI Road',
            recommendation: 'Famous slow-cooked handi paneer and traditional bread',
            estimatedCost: 1050,
            location: 'MI Road'
          }
        ],
        activities: [
          {
            id: 'd3_a1',
            time: '08:30 AM - 10:30 AM',
            period: 'Morning',
            name: 'Gaitore Ki Chhatriyan Royal Cenotaphs',
            category: 'Architectural Gem',
            duration: '2 hours',
            estimatedCost: 60,
            reason: 'Quiet, uncrowded royal marble memorials with exquisite umbrella domes sheltered below the hills.',
            location: 'Brahmapuri Foothills',
            alternative: 'Sisodia Rani Palace gardens'
          },
          {
            id: 'd3_a2',
            time: '11:00 AM - 01:00 PM',
            period: 'Morning',
            name: 'Galta Ji Temple (Sacred Mountain Springs)',
            category: 'Spiritual & Heritage',
            duration: '2 hours',
            estimatedCost: 0,
            reason: 'Natural mountain springs carved into pink gorge rock face; authentic spiritual rituals and playful macaques.',
            location: 'Galta Hills, East Jaipur',
            alternative: 'Sun Temple sunrise viewpoint'
          },
          {
            id: 'd3_a3',
            time: '03:00 PM - 05:00 PM',
            period: 'Afternoon',
            name: 'Jawahar Kala Kendra Cultural Center',
            category: 'Modern Art & Culture',
            duration: '2 hours',
            estimatedCost: 0,
            reason: 'Designed by Charles Correa; houses folk art exhibitions, craft exhibitions, and artisan cafes.',
            location: 'Jawaharlal Nehru Marg',
            alternative: 'Anokhi Block Printing Studio'
          },
          {
            id: 'd3_a4',
            time: '06:30 PM - 08:30 PM',
            period: 'Evening',
            name: 'Albert Hall Museum Illumination & Masala Chowk',
            category: 'Art & Artifacts',
            duration: '2 hours',
            estimatedCost: 80,
            reason: 'Spectacular evening light projection on Indo-Saracenic facade followed by dinner at open-air Masala Chowk.',
            location: 'Ram Niwas Garden',
            alternative: 'Bikaner House Gallery'
          }
        ]
      },
      {
        day: 4,
        date: 'Day 4 - Farewell to Pink City',
        title: 'Painted Gates, Blue Pottery & Sunset Departure',
        theme: 'Living Crafts & Panoramic Farewell',
        routeOptimized: true,
        dayTravelTime: '30 mins transit (South & Transit Hub)',
        dayCost: 4200,
        meals: [
          {
            id: 'd4_m1',
            type: 'Breakfast',
            name: 'Samrat Sweet Shop Hot Breakfast',
            recommendation: 'Crispy samosas and piping hot rabdi jalebi straight from the kadai',
            estimatedCost: 260,
            location: 'Chaura Rasta'
          },
          {
            id: 'd4_m2',
            type: 'Lunch',
            name: 'Masala Chowk Open Air Food Plaza',
            recommendation: 'Sampling pav bhaji, kulfi falooda, and shrikhand from top street stalls',
            estimatedCost: 650,
            location: 'Ram Niwas Garden'
          },
          {
            id: 'd4_m3',
            type: 'Dinner',
            name: 'Baradari Heritage Courtyard Fare',
            recommendation: 'Celebratory farewell meal in the royal courtyards of City Palace',
            estimatedCost: 1200,
            location: 'City Palace'
          }
        ],
        activities: [
          {
            id: 'd4_a1',
            time: '09:00 AM - 11:30 AM',
            period: 'Morning',
            name: 'Patrika Gate at Jawahar Circle',
            category: 'Architectural Gem',
            duration: '2.5 hours',
            estimatedCost: 0,
            reason: 'Magnificent 9-arched gate painted with historic scenes of Rajasthan. Unmatched photo composition.',
            location: 'Jawahar Circle, Malviya Nagar',
            alternative: 'Central Park Jaipur promenade'
          },
          {
            id: 'd4_a2',
            time: '12:00 PM - 02:00 PM',
            period: 'Afternoon',
            name: 'Authentic Blue Pottery & Textile Workshop',
            category: 'Cultural Experience',
            duration: '2 hours',
            estimatedCost: 0,
            reason: 'Meet local master craftsmen practicing UNESCO-recognized Jaipur blue pottery and natural vegetable dyes.',
            location: 'Kot Jeweler Lane & MI Road',
            alternative: 'Rajasthali Handicrafts Emporium'
          },
          {
            id: 'd4_a3',
            time: '03:30 PM - 05:30 PM',
            period: 'Afternoon',
            name: 'Birla Temple & Moti Dungri Shrine',
            category: 'Spiritual & Heritage',
            duration: '2 hours',
            estimatedCost: 0,
            reason: 'Pristine white marble temple against green Aravalli hill backdrop. Peaceful farewell blessing.',
            location: 'JLN Marg, Jaipur',
            alternative: 'Govind Dev Ji Temple evening aarti'
          }
        ]
      }
    ],
    tips: [
      'Book the official Rajasthan Tourism composite ticket to save entry fee across Amer Fort, Hawa Mahal, Jantar Mantar, and Albert Hall.',
      'Prefer e-rickshaws inside the narrow walled city lanes to avoid traffic delays.',
      'Morning hours (8:30 - 10:30 AM) give the best soft lighting for photography at Hawa Mahal and Amer Fort.',
      'Carry cash in small denominations (₹20, ₹50, ₹100) for authentic street food and artisan tipping.'
    ],
    packingList: [
      'Breathable cotton outfits and comfortable walking shoes for fort ramps',
      'Wide-brim sun hat and sunglasses',
      'Sunscreen SPF 50 & moisturizing lip balm',
      'Light shawl or cardigan for breezy evening terrace dining',
      'High-capacity power bank for heavy camera/phone usage'
    ],
    alternatives: [
      'Jaigarh Fort Cannon & military underground tunnels',
      'Anokhi Museum of Hand Printing near Amer Fort',
      'Sisodia Rani terraced garden pavilion'
    ],
    toolCallsLog: [
      {
        tool: 'get_destination_information',
        args: { destination: 'Jaipur' },
        result: {
          name: 'Jaipur',
          country: 'India',
          tagline: 'The Pink City of Forts, Palaces & Vibrant Bazaars',
          bestSeason: 'October to March'
        },
        timestamp: new Date().toISOString()
      },
      {
        tool: 'get_weather',
        args: { destination: 'Jaipur', dateRange: '4 Days' },
        result: {
          temperature: '26°C High / 14°C Low',
          condition: 'Sunny & Clear Skies'
        },
        timestamp: new Date().toISOString()
      },
      {
        tool: 'estimate_transport_cost',
        args: { origin: 'Bhopal', destination: 'Jaipur', travelers: 2 },
        result: {
          recommendedMode: 'Superfast Train (AC 3-Tier)',
          totalTransportCost: 4600
        },
        timestamp: new Date().toISOString()
      },
      {
        tool: 'calculate_trip_budget',
        args: { totalBudget: 25000, travelers: 2, durationDays: 4 },
        result: {
          totalBudget: 25000,
          totalEstimated: 22800,
          remaining: 2200,
          percentageUsed: 91
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  dbCache.trips[demoTripId] = demoTrip;
  dbCache.chatMessages[demoTripId] = [
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: "Hello! I am your TravelMind AI Copilot. I created this 4-day Jaipur itinerary tailored to your ₹25,000 budget and interest in history, food, and photography. You can ask me anytime to adjust your schedule, reduce spending, or swap activities!",
      timestamp: new Date().toISOString()
    }
  ];
}

// Initialize on module load
ensureDbFile();

export const Database = {
  getTrip(id: string): TripItinerary | null {
    return dbCache.trips[id] || null;
  },

  getAllTrips(): TripItinerary[] {
    return Object.values(dbCache.trips).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  saveTrip(trip: TripItinerary): TripItinerary {
    dbCache.trips[trip.id] = trip;
    if (!dbCache.chatMessages[trip.id]) {
      dbCache.chatMessages[trip.id] = [
        {
          id: 'welcome_' + Date.now(),
          sender: 'assistant',
          text: `Welcome to your ${trip.tripSummary.destination} itinerary! I am your AI Copilot. Ask me anytime to modify activities, adjust your budget, or suggest alternatives.`,
          timestamp: new Date().toISOString()
        }
      ];
    }
    saveDbToFile();
    return trip;
  },

  updateTrip(id: string, updates: Partial<TripItinerary>): TripItinerary | null {
    const trip = dbCache.trips[id];
    if (!trip) return null;
    const updated = { ...trip, ...updates };
    dbCache.trips[id] = updated;
    saveDbToFile();
    return updated;
  },

  deleteTrip(id: string): boolean {
    if (dbCache.trips[id]) {
      delete dbCache.trips[id];
      delete dbCache.chatMessages[id];
      saveDbToFile();
      return true;
    }
    return false;
  },

  // Activities CRUD
  addActivity(tripId: string, dayNumber: number, activity: Activity): TripItinerary | null {
    const trip = dbCache.trips[tripId];
    if (!trip) return null;

    const day = trip.days.find(d => d.day === dayNumber);
    if (!day) return null;

    day.activities.push(activity);
    day.dayCost += activity.estimatedCost;

    // Recalculate trip total
    const newTotal = trip.days.reduce((acc, d) => acc + d.dayCost, 0) + trip.budgetBreakdown.transport;
    trip.tripSummary.estimatedCost = newTotal;
    trip.budgetBreakdown.totalEstimated = newTotal;
    trip.budgetBreakdown.remaining = Math.max(0, trip.tripSummary.totalBudget - newTotal);
    trip.budgetBreakdown.percentageUsed = Math.min(100, Math.round((newTotal / trip.tripSummary.totalBudget) * 100));

    saveDbToFile();
    return trip;
  },

  updateActivity(tripId: string, activityId: string, updates: Partial<Activity>): TripItinerary | null {
    const trip = dbCache.trips[tripId];
    if (!trip) return null;

    for (const day of trip.days) {
      const idx = day.activities.findIndex(a => a.id === activityId);
      if (idx !== -1) {
        const oldCost = day.activities[idx].estimatedCost;
        day.activities[idx] = { ...day.activities[idx], ...updates };
        const costDiff = (day.activities[idx].estimatedCost || 0) - oldCost;
        day.dayCost += costDiff;

        const newTotal = trip.days.reduce((acc, d) => acc + d.dayCost, 0) + trip.budgetBreakdown.transport;
        trip.tripSummary.estimatedCost = newTotal;
        trip.budgetBreakdown.totalEstimated = newTotal;
        trip.budgetBreakdown.remaining = Math.max(0, trip.tripSummary.totalBudget - newTotal);
        trip.budgetBreakdown.percentageUsed = Math.min(100, Math.round((newTotal / trip.tripSummary.totalBudget) * 100));

        saveDbToFile();
        return trip;
      }
    }
    return null;
  },

  deleteActivity(tripId: string, activityId: string): TripItinerary | null {
    const trip = dbCache.trips[tripId];
    if (!trip) return null;

    for (const day of trip.days) {
      const idx = day.activities.findIndex(a => a.id === activityId);
      if (idx !== -1) {
        const removed = day.activities.splice(idx, 1)[0];
        day.dayCost = Math.max(0, day.dayCost - removed.estimatedCost);

        const newTotal = trip.days.reduce((acc, d) => acc + d.dayCost, 0) + trip.budgetBreakdown.transport;
        trip.tripSummary.estimatedCost = newTotal;
        trip.budgetBreakdown.totalEstimated = newTotal;
        trip.budgetBreakdown.remaining = Math.max(0, trip.tripSummary.totalBudget - newTotal);
        trip.budgetBreakdown.percentageUsed = Math.min(100, Math.round((newTotal / trip.tripSummary.totalBudget) * 100));

        saveDbToFile();
        return trip;
      }
    }
    return null;
  },

  // Copilot messages
  getMessages(tripId: string): CopilotMessage[] {
    return dbCache.chatMessages[tripId] || [];
  },

  addMessage(tripId: string, message: CopilotMessage): CopilotMessage[] {
    if (!dbCache.chatMessages[tripId]) {
      dbCache.chatMessages[tripId] = [];
    }
    dbCache.chatMessages[tripId].push(message);
    saveDbToFile();
    return dbCache.chatMessages[tripId];
  }
};
