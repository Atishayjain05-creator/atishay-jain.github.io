# TRAVELMIND AI
### “Your trip. Your budget. Your interests. One intelligent itinerary.”

**TravelMind AI** is a production-grade full-stack travel planning platform built with Google Gemma 4 and an autonomous tool-calling backend. It solves the fragmentation, time sink, and budget guesswork of travel planning by generating realistic, geographically clustered, and mathematically verified itineraries in seconds.

---

## 🚀 Live Demo & Hackathon Walkthrough

- **One-Click Demo Trip**: Bhopal → Jaipur (4 Days, 2 Travelers, ₹25,000 Budget, History + Food + Photography + Culture)
- **Live Copilot**: Modify live itineraries using natural language (e.g. *"Make Day 2 less tiring"*, *"Reduce budget by ₹3,000"*)
- **"WHAT IF?" Simulator**: Tweak one constraint (*"What if my budget drops to ₹20,000?"*, *"What if I add an extra day?"*, *"What if it rains?"*) and compare Current Plan vs. Optimized Plan with real component deltas.
- **Backend Tool Transparency**: Inspect real tool executions (`get_destination_information`, `get_weather`, `search_places`, `estimate_transport_cost`, `estimate_accommodation`, `calculate_trip_budget`, `optimize_itinerary`).

---

## 🧩 The Core Problem

Travelers spend an average of 10–20 hours researching destinations across disconnected tabs:
1. **Unrealistic Itineraries**: Generic AI chatbots propose impossible schedules that criss-cross cities without accounting for traffic or fatigue.
2. **Budget Delusion**: Most planners lack a deterministic budget engine, leading to unexpected overruns.
3. **Impersonal Plans**: Travelers receive cookie-cutter lists of tourist traps instead of journeys tuned to their passions.
4. **Static Schedules**: Changing one item in a plan often requires rebuilding the entire itinerary from scratch.

---

## 💡 The Solution

TravelMind AI combines **Google Gemma 4 reasoning** with a **deterministic backend tool execution pipeline**:
- **Tool Calling**: Gemma decides when empirical data is needed; the Node.js backend executes real calculators and database queries, returning concrete outputs back to the AI.
- **Strict JSON Itinerary**: The model synthesizes data into a validated, strongly-typed JSON schema.
- **Geographic Clustering**: Activities are sequenced by proximity (e.g., Amer Ridge vs. UNESCO Walled City) to eliminate transit zigzagging.
- **Live Copilot**: A conversational assistant that modifies the actual data structures rather than merely giving conversational advice.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER / CLIENT                         │
│  React 19 + TypeScript + Tailwind CSS + Lucide + Vite SPA              │
│  - Multi-step Trip Planner Wizard (7 steps)                           │
│  - Interactive Itinerary Dashboard (Day & Activity CRUD)               │
│  - Visual Budget Intelligence Progress Bar & Breakdown                 │
│  - Live AI Trip Copilot Drawer                                         │
│  - "What If?" Scenario Explorer Modal                                  │
│  - AI Tool Traces Inspector Modal                                      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTP REST (JSON)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NODE.JS / EXPRESS BACKEND                       │
│  - Server Entry (`server.ts`) with Vite Middleware on Port 3000        │
│  - API Routes: `/api/trips/*`, `/api/copilot`, `/api/trips/what-if`    │
│  - Persistence Layer (`/server/db/database.ts`): Trips, Days, Messages │
└───────────────────┬─────────────────────────────────┬──────────────────┘
                    │                                 │
     Tool Request   ▼                                 ▼  Tool Result
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│     BACKEND TOOL PIPELINE       │   │      GEMMA 4 AI SERVICE         │
│  /server/tools/travelTools.ts   │   │  /server/services/gemmaService  │
│  - get_destination_information  │   │  - Google GenAI SDK             │
│  - get_weather                  │   │  - Model: gemini-3.8-flash      │
│  - search_places                │   │  - System Prompt Persona        │
│  - estimate_transport_cost      │   │  - Structured JSON Output       │
│  - estimate_local_transport     │   │  - Dynamic Budget Repair        │
│  - estimate_food_cost           │   │  - Live Copilot Modification    │
│  - estimate_accommodation       │   └─────────────────────────────────┘
│  - calculate_trip_budget        │
│  - optimize_itinerary           │
└─────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion |
| **Backend** | Node.js, Express, TypeScript (`tsx`), REST APIs |
| **AI Engine** | Google Gemma 4 via official `@google/genai` SDK (`gemini-3.8-flash`) |
| **Database** | Structured JSON database with atomic file persistence & memory cache |
| **Calculators** | Custom deterministic travel math, transit pricing, lodging & budget engine |

---

## 🤖 Gemma 4 Integration & Tool Calling

Gemma 4 is integrated strictly on the server side (`/server/services/gemmaService.ts`):
1. **Zero Client Leakage**: `GEMINI_API_KEY` is never exposed to the frontend bundle.
2. **Clear Separation**: AI reasoning → tool request → backend execution → tool result → final structured JSON.
3. **System Persona**: Enforces realistic pacing, Geographic clustering, respect for budget constraints, and strict schema adherence.
4. **Resilient Fallback & Demo Mode**: If offline or if API limits are reached, deterministic tool execution generates high-fidelity itineraries without crashing.

---

## 📊 Database Schema

```typescript
interface DatabaseSchema {
  trips: Record<string, TripItinerary>;
  chatMessages: Record<string, CopilotMessage[]>;
  savedPlaces: Record<string, string[]>;
}

interface TripItinerary {
  id: string;
  createdAt: string;
  preferences: TripPreferences;
  tripSummary: {
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
    tripPersonality: { title: string; tagline: string; description: string };
    whyThisTripFits: string[];
    weatherSummary: { temperature: string; condition: string; packingAdvice: string };
    heroImage: string;
  };
  budgetBreakdown: {
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
  };
  days: ItineraryDay[];
  tips: string[];
  packingList: string[];
  alternatives: string[];
  toolCallsLog: ToolCallRecord[];
}
```

---

## 🌐 API Endpoints

- `GET /api/trips`: List all saved itineraries
- `POST /api/trips/generate`: Create a new personalized itinerary with Gemma 4
- `GET /api/trips/:id`: Retrieve itinerary and copilot chat history
- `PATCH /api/trips/:id`: Update trip budget or preferences
- `POST /api/trips/:id/optimize`: Run budget optimization algorithm
- `POST /api/trips/:id/regenerate-day`: Re-plan a single day with curated alternatives
- `POST /api/trips/:id/activity`: Add custom activity to a day
- `PATCH /api/trips/:id/activity/:activityId`: Edit existing activity
- `DELETE /api/trips/:id/activity/:activityId`: Remove activity (auto-recalculates budget)
- `POST /api/trips/what-if`: Run "What If?" scenario comparison simulation
- `POST /api/copilot`: Natural language itinerary modification
- `GET /api/destinations/:destination`: Destination insights & weather
- `GET /api/health`: Health status & Gemma integration status

---

## 💻 Running Locally

### 1. Prerequisites
- Node.js 20+ installed
- npm or yarn

### 2. Environment Variables
Create a `.env` file (copied from `.env.example`):
```bash
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 3. Installation
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏆 Hackathon Demo Sequence (3-Minute Judge Script)

1. **Landing & Hook**: Highlight *"Travel planned around YOU"*, pointing out the 4 pillars (Personalization, Budget, Routes, Copilot).
2. **Instant Demo**: Click **"Try Demo Trip"** to instantly load the Bhopal → Jaipur 4-day plan.
3. **Trip Personality & Fit**: Point out *"THE CULTURAL EXPLORER"* personality badge and the *"Why this plan fits you"* section (96% personalization score).
4. **Budget Intelligence**: Show how ₹25,000 is distributed across rail, haveli stays, local food, and contingency buffer.
5. **Interactive Itinerary**: Expand Day 1 (Amer Ridge) and Day 2 (UNESCO Walled City). Show that morning, afternoon, and evening are geographically clustered. Click **Swap with alternative** on any activity.
6. **Live Copilot WOW Moment**: Open Copilot and click *"Reduce my budget by ₹3,000"*. Watch Gemma modify the live data, adjust accommodation and activities, and drop the total from ₹22,800 to ₹19,700!
7. **"WHAT IF?" Simulator**: Click *"“What If?” Simulator"* and select *"What if I add one extra day?"*. View the side-by-side comparison showing new Day 5 village excursion and exact component costs.
8. **Inspect AI Tools**: Click *"AI Tools"* in the top banner to show judges the exact inputs and outputs of real backend tools executed during trip synthesis.
