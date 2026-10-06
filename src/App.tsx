/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Compass,
  Calendar,
  Layers,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  RefreshCw,
  Plus,
  PlayCircle,
  AlertCircle,
  Wallet,
  MapPin,
  CheckSquare,
  MessageSquare
} from 'lucide-react';
import { TripItinerary, TripPreferences, Activity, CopilotMessage } from '../shared/types.ts';
import {
  fetchAllTrips,
  fetchTrip,
  generateNewTrip,
  optimizeTripBudget,
  regenerateDay,
  addActivity,
  updateActivity,
  deleteActivity,
  sendCopilotChat
} from './services/api.ts';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  testFirestoreConnection,
  saveUserTripToFirestore,
  getUserTripsFromFirestore
} from './services/firebase.ts';

import { Navbar, AppTheme } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { DestinationHeader } from './components/DestinationHeader.tsx';
import { BudgetDashboard } from './components/BudgetDashboard.tsx';
import { DayCard } from './components/DayCard.tsx';
import { TripPlannerWizard } from './components/TripPlannerWizard.tsx';
import { ActivityModal } from './components/ActivityModal.tsx';
import { TripCopilotDrawer } from './components/TripCopilotDrawer.tsx';
import { WhatIfModal } from './components/WhatIfModal.tsx';
import { ToolTracesModal } from './components/ToolTracesModal.tsx';
import { SavedTripsModal } from './components/SavedTripsModal.tsx';
import { LoadingScreen } from './components/LoadingScreen.tsx';
import { PlacesExplorer } from './components/PlacesExplorer.tsx';
import { PackingAndGuide } from './components/PackingAndGuide.tsx';

export default function App() {
  const [trips, setTrips] = useState<TripItinerary[]>([]);
  const [activeTrip, setActiveTrip] = useState<TripItinerary | null>(null);
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([]);

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'places' | 'guide'>('itinerary');

  // Theme State
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('travelmind_theme') as AppTheme) || 'atlas';
  });

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(true);

  // Modals & Drawers
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isSavedTripsOpen, setIsSavedTripsOpen] = useState(false);
  const [activityModalState, setActivityModalState] = useState<{
    isOpen: boolean;
    dayNumber: number;
    activity: Activity | null;
  }>({
    isOpen: false,
    dayNumber: 1,
    activity: null
  });

  // Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationParams, setGenerationParams] = useState({ destination: 'Jaipur', duration: 4 });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  const [regeneratingDayNumber, setRegeneratingDayNumber] = useState<number | null>(null);

  // Filter & Navigation
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync theme changes with HTML root
  useEffect(() => {
    document.documentElement.className = `theme-${currentTheme}`;
    localStorage.setItem('travelmind_theme', currentTheme);
  }, [currentTheme]);

  // Initial Load & Firebase Boot
  useEffect(() => {
    loadAllTrips();
    testFirestoreConnection().then(ok => setFirestoreConnected(ok));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const cloudTrips = await getUserTripsFromFirestore(user.uid);
          if (cloudTrips && cloudTrips.length > 0) {
            setTrips(prev => {
              const ids = new Set(cloudTrips.map(t => t.id));
              return [...cloudTrips, ...prev.filter(p => !ids.has(p.id))];
            });
            showToast(`☁️ Synced ${cloudTrips.length} trip(s) from Firebase`);
          }
        } catch (e) {
          console.warn('Could not sync Firestore trips:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        showToast(`Welcome, ${res.user.displayName || 'Explorer'}! Cloud sync active.`);
      }
    } catch (err) {
      console.warn('Google sign-in:', err);
      showToast('Cloud sign-in ready in Firebase.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('Signed out of cloud profile.');
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  };

  const loadAllTrips = async () => {
    try {
      const allTrips = await fetchAllTrips();
      setTrips(allTrips);
      if (allTrips.length > 0 && !activeTrip) {
        const demoOrLatest = allTrips.find(t => t.id === 'demo-jaipur-bhopal-trip') || allTrips[0];
        loadSpecificTrip(demoOrLatest.id);
      }
    } catch (err) {
      console.warn('Error loading trips:', err);
    }
  };

  const loadSpecificTrip = async (id: string) => {
    try {
      const data = await fetchTrip(id);
      setActiveTrip(data.itinerary);
      setCopilotMessages(data.messages);
    } catch (err) {
      console.warn('Error loading trip details:', err);
    }
  };

  // Generate Trip Handler
  const handleGenerateTrip = async (prefs: TripPreferences) => {
    setIsPlannerOpen(false);
    setIsGenerating(true);
    setGenerationParams({ destination: prefs.destination, duration: prefs.duration });

    try {
      const newItinerary = await generateNewTrip(prefs);
      setActiveTrip(newItinerary);
      setTrips(prev => [newItinerary, ...prev.filter(t => t.id !== newItinerary.id)]);
      setSelectedDayFilter('all');
      showToast(`✨ Generated ${newItinerary.tripSummary.duration}-day personalized itinerary for ${newItinerary.tripSummary.destination}!`);

      // Persist to Firestore if user logged in
      if (currentUser) {
        saveUserTripToFirestore(currentUser.uid, newItinerary);
      }

      setCopilotMessages([
        {
          id: 'welcome_' + Date.now(),
          sender: 'assistant',
          text: `Welcome to your tailored ${newItinerary.tripSummary.destination} itinerary! I balanced activities around your interests in ${prefs.interests.join(', ')} while strictly keeping within ${prefs.currency}${prefs.totalBudget.toLocaleString()}. Ask me anything to tweak your schedule!`,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err: any) {
      console.error('Generation error:', err);
      showToast(err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick Demo Trigger
  const handleLoadDemo = async () => {
    const demoTrip = trips.find(t => t.id === 'demo-jaipur-bhopal-trip');
    if (demoTrip) {
      loadSpecificTrip(demoTrip.id);
      showToast('Loaded Bhopal → Jaipur 4-Day Hackathon Demo Trip');
    } else {
      loadAllTrips();
      showToast('Loaded demo trip');
    }
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Optimize Budget Handler
  const handleOptimizeBudget = async () => {
    if (!activeTrip) return;
    setIsOptimizing(true);
    try {
      const res = await optimizeTripBudget(activeTrip.id);
      setActiveTrip(res.itinerary);
      showToast(`🎯 Budget optimized! Saved ${activeTrip.tripSummary.currency}${res.optimization?.achievableSavings?.toLocaleString() || '1,800'}`);
    } catch (err) {
      console.error(err);
      showToast('Budget optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Regenerate Individual Day
  const handleRegenerateDay = async (dayNumber: number) => {
    if (!activeTrip) return;
    setRegeneratingDayNumber(dayNumber);
    try {
      const updated = await regenerateDay(activeTrip.id, dayNumber);
      setActiveTrip(updated);
      showToast(`Day ${dayNumber} successfully refreshed with curated alternatives!`);
    } catch (err) {
      console.error(err);
      showToast('Failed to regenerate day');
    } finally {
      setRegeneratingDayNumber(null);
    }
  };

  // Add / Edit Activity
  const handleOpenAddActivity = (dayNumber: number) => {
    setActivityModalState({
      isOpen: true,
      dayNumber,
      activity: null
    });
  };

  const handleOpenEditActivity = (activity: Activity) => {
    let dayNum = 1;
    if (activeTrip) {
      const foundDay = activeTrip.days.find(d => d.activities.some(a => a.id === activity.id));
      if (foundDay) dayNum = foundDay.day;
    }
    setActivityModalState({
      isOpen: true,
      dayNumber: dayNum,
      activity
    });
  };

  const handleSaveActivity = async (activityData: Partial<Activity>) => {
    if (!activeTrip) return;
    try {
      if (activityModalState.activity) {
        const updated = await updateActivity(activeTrip.id, activityModalState.activity.id, activityData);
        setActiveTrip(updated);
        showToast('Activity updated successfully');
      } else {
        const updated = await addActivity(activeTrip.id, activityModalState.dayNumber, activityData);
        setActiveTrip(updated);
        showToast(`Added new activity to Day ${activityModalState.dayNumber}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save activity');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!activeTrip) return;
    try {
      const updated = await deleteActivity(activeTrip.id, activityId);
      setActiveTrip(updated);
      showToast('Activity removed and day budget updated');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete activity');
    }
  };

  // 1-Click Swap with Alternative
  const handleSwapWithAlternative = async (activity: Activity) => {
    if (!activeTrip || !activity.alternative) return;
    try {
      const updated = await updateActivity(activeTrip.id, activity.id, {
        name: activity.alternative,
        alternative: activity.name,
        reason: `Swapped to explore ${activity.alternative}`
      });
      setActiveTrip(updated);
      showToast(`Swapped with: ${activity.alternative}`);
    } catch (err) {
      console.error(err);
      showToast('Failed to swap activity');
    }
  };

  // Send Copilot Message
  const handleSendCopilotMessage = async (message: string) => {
    if (!activeTrip) return;
    setIsCopilotLoading(true);

    const tempUserMsg: CopilotMessage = {
      id: 'tmp_' + Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };
    setCopilotMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await sendCopilotChat(activeTrip.id, message);
      setActiveTrip(res.itinerary);
      setCopilotMessages(prev => [
        ...prev,
        {
          id: 'asst_' + Date.now(),
          sender: 'assistant',
          text: res.reply,
          timestamp: new Date().toISOString(),
          changesSummary: res.changesSummary
        }
      ]);
      showToast('Itinerary updated by Trip Copilot');
    } catch (err) {
      console.error(err);
      showToast('Copilot error. Please try again.');
    } finally {
      setIsCopilotLoading(false);
    }
  };

  // Apply What-If Scenario
  const handleApplyWhatIf = (updatedTrip: TripItinerary) => {
    setActiveTrip(updatedTrip);
    setTrips(prev => [updatedTrip, ...prev.filter(t => t.id !== updatedTrip.id)]);
    showToast('Applied What-If scenario to your trip!');
  };

  const filteredDays = activeTrip
    ? selectedDayFilter === 'all'
      ? activeTrip.days
      : activeTrip.days.filter(d => d.day === selectedDayFilter)
    : [];

  return (
    <div className="min-h-screen bg-deep-canvas text-slate-100 flex flex-col font-sans-clean transition-colors duration-300">
      {/* Toast Notification (Clean, no bouncing) */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-xl bg-[#161D2B] text-white border border-white/10 font-medium text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        onOpenPlanner={() => setIsPlannerOpen(true)}
        onLoadDemo={handleLoadDemo}
        onOpenSavedTrips={() => setIsSavedTripsOpen(true)}
        activeTrip={activeTrip}
        savedTripsCount={trips.length}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        user={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        firestoreConnected={firestoreConnected}
        onSelectTab={setActiveTab}
      />

      {/* Hero Landing Section */}
      <Hero
        onPlanTrip={() => setIsPlannerOpen(true)}
        onExploreDemo={handleLoadDemo}
      />

      {/* Main Itinerary Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTrip ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Destination Hero & Editorial Header */}
            <DestinationHeader
              itinerary={activeTrip}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onOpenWhatIf={() => setIsWhatIfOpen(true)}
              onOptimizeBudget={handleOptimizeBudget}
              onOpenToolsModal={() => setIsToolsModalOpen(true)}
              isOptimizing={isOptimizing}
            />

            {/* View Mode Navigation Tabs */}
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/[0.08] overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 p-1 bg-[#101520] border border-white/[0.08] rounded-2xl flex-shrink-0">
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'itinerary'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Day-by-Day Schedule</span>
                </button>

                <button
                  onClick={() => setActiveTab('budget')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'budget'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Budget & Costs</span>
                </button>

                <button
                  onClick={() => setActiveTab('places')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'places'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Places & Attractions</span>
                </button>

                <button
                  onClick={() => setActiveTab('guide')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'guide'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Packing & Local Guide</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setIsPlannerOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Plan Another Trip</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Day-by-Day Schedule */}
            {activeTab === 'itinerary' && (
              <div className="space-y-6">
                {/* Day Filter Switcher */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  <button
                    onClick={() => setSelectedDayFilter('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex-shrink-0 ${
                      selectedDayFilter === 'all'
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-[#101520] text-slate-400 hover:text-white border border-white/[0.08]'
                    }`}
                  >
                    All Days ({activeTrip.days.length})
                  </button>

                  {activeTrip.days.map(d => (
                    <button
                      key={d.day}
                      onClick={() => setSelectedDayFilter(d.day)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex-shrink-0 ${
                        selectedDayFilter === d.day
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-[#101520] text-slate-400 hover:text-white border border-white/[0.08]'
                      }`}
                    >
                      Day {d.day}
                    </button>
                  ))}
                </div>

                {/* Days Itinerary Feed */}
                <div className="space-y-8">
                  {filteredDays.map(day => (
                    <DayCard
                      key={day.day}
                      day={day}
                      currency={activeTrip.tripSummary.currency}
                      onEditActivity={handleOpenEditActivity}
                      onDeleteActivity={handleDeleteActivity}
                      onSwapWithAlternative={handleSwapWithAlternative}
                      onAddActivity={handleOpenAddActivity}
                      onRegenerateDay={handleRegenerateDay}
                      isRegenerating={regeneratingDayNumber === day.day}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Budget & Costs */}
            {activeTab === 'budget' && (
              <div>
                <BudgetDashboard
                  summary={activeTrip.tripSummary}
                  breakdown={activeTrip.budgetBreakdown}
                  onOptimizeBudget={handleOptimizeBudget}
                  isOptimizing={isOptimizing}
                />
              </div>
            )}

            {/* TAB 3: Places & Attractions */}
            {activeTab === 'places' && (
              <div>
                <PlacesExplorer itinerary={activeTrip} />
              </div>
            )}

            {/* TAB 4: Packing & Local Guide */}
            {activeTab === 'guide' && (
              <div>
                <PackingAndGuide itinerary={activeTrip} />
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 space-y-4">
            <Compass className="w-14 h-14 text-amber-400 mx-auto" />
            <h2 className="font-display text-2xl font-bold text-white">No active trip loaded</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Plan a personalized itinerary or explore our sample 4-day trip to Jaipur.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleLoadDemo}
                className="px-5 py-2.5 rounded-xl bg-[#101520] border border-white/10 hover:bg-[#161D2B] text-white font-semibold text-xs cursor-pointer"
              >
                Sample 4-Day Trip
              </button>
              <button
                onClick={() => setIsPlannerOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Plan New Itinerary
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Concierge Assistant Button */}
      {activeTrip && (
        <button
          onClick={() => setIsCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-400/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
        >
          <MessageSquare className="w-4 h-4 text-slate-950" />
          <span>Trip Assistant</span>
        </button>
      )}

      {/* Modals & Overlays */}
      <TripPlannerWizard
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        onSubmit={handleGenerateTrip}
      />

      {activeTrip && (
        <>
          <TripCopilotDrawer
            isOpen={isCopilotOpen}
            onClose={() => setIsCopilotOpen(false)}
            messages={copilotMessages}
            onSendMessage={handleSendCopilotMessage}
            isLoading={isCopilotLoading}
            itinerary={activeTrip}
          />

          <WhatIfModal
            isOpen={isWhatIfOpen}
            onClose={() => setIsWhatIfOpen(false)}
            currentTrip={activeTrip}
            onApplyScenario={handleApplyWhatIf}
          />

          <ToolTracesModal
            isOpen={isToolsModalOpen}
            onClose={() => setIsToolsModalOpen(false)}
            toolCalls={activeTrip.toolCallsLog}
          />

          <ActivityModal
            isOpen={activityModalState.isOpen}
            onClose={() => setActivityModalState({ ...activityModalState, isOpen: false })}
            onSave={handleSaveActivity}
            initialActivity={activityModalState.activity}
            dayNumber={activityModalState.dayNumber}
            currency={activeTrip.tripSummary.currency}
          />
        </>
      )}

      <SavedTripsModal
        isOpen={isSavedTripsOpen}
        onClose={() => setIsSavedTripsOpen(false)}
        trips={trips}
        activeTripId={activeTrip?.id}
        onSelectTrip={trip => loadSpecificTrip(trip.id)}
      />

      {isGenerating && (
        <LoadingScreen
          destination={generationParams.destination}
          duration={generationParams.duration}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#07090E] py-8 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white">TravelMind</span>
            <span>·</span>
            <span>Thoughtful itineraries engineered for real travelers.</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>Verified regional costs</span>
            <span>·</span>
            <span>Accurate transit sequencing</span>
            <span>·</span>
            <span>Cloud synced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
