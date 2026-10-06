import React, { useState } from 'react';
import {
  X,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Wallet,
  Heart,
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  Building,
  Utensils,
  Car,
  Clock
} from 'lucide-react';
import { TripPreferences, TravelStyle, ActivityIntensity } from '../../shared/types.ts';

interface TripPlannerWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prefs: TripPreferences) => void;
}

const INTERESTS_OPTIONS = [
  { id: 'History', label: 'History & Forts', emoji: '🏰' },
  { id: 'Food', label: 'Culinary & Street Food', emoji: '🍲' },
  { id: 'Photography', label: 'Photography & Golden Hour', emoji: '📸' },
  { id: 'Culture', label: 'Local Culture & Bazaars', emoji: '🎭' },
  { id: 'Architecture', label: 'Royal Architecture & Stepwells', emoji: '🏛️' },
  { id: 'Spiritual', label: 'Temples & Spiritual Calm', emoji: '🪔' },
  { id: 'Nature', label: 'Lakes & Scenic Vistas', emoji: '🌿' },
  { id: 'Shopping', label: 'Handicrafts & Artisans', emoji: '🛍️' },
  { id: 'Nightlife', label: 'Rooftops & Night Illumination', emoji: '✨' },
  { id: 'Relaxation', label: 'Slow Cafes & Leisure', emoji: '☕' }
];

const TRAVEL_STYLES: { id: TravelStyle; title: string; desc: string }[] = [
  { id: 'Budget + Comfortable', title: 'Budget + Comfortable', desc: 'Smart value: boutique stays, AC rail/taxis, street delights & top sights.' },
  { id: 'Cultural & Heritage', title: 'Cultural & Heritage', desc: 'Focus on historic havelis, authentic traditions, and local crafts.' },
  { id: 'Backpacker', title: 'Backpacker & Scrappy', desc: 'Maximum adventure at minimum cost: hostels, public transit, local street stalls.' },
  { id: 'Luxury & Leisure', title: 'Luxury & Royal Leisure', desc: 'Palace hotels, private chauffeurs, curated private heritage tours.' },
  { id: 'Slow & Relaxed', title: 'Slow & Mindful', desc: 'Unhurried days, prolonged cafe stops, zero schedule rushing.' }
];

const INTENSITY_OPTIONS: { id: ActivityIntensity; label: string; desc: string }[] = [
  { id: 'Relaxed & Leisurely', label: 'Relaxed & Leisurely', desc: '1-2 major sights per day, long leisurely lunch & rests.' },
  { id: 'Balanced (2-3 key spots/day)', label: 'Balanced Pacing', desc: '2-3 key spots clustered geographically + evening market walk.' },
  { id: 'Packed & High Energy', label: 'Packed & High Energy', desc: 'See everything possible from sunrise to late night.' }
];

export const TripPlannerWizard: React.FC<TripPlannerWizardProps> = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);

  // Form State
  const [destination, setDestination] = useState('Jaipur');
  const [origin, setOrigin] = useState('Bhopal');
  const [duration, setDuration] = useState(4);
  const [startDate, setStartDate] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [totalBudget, setTotalBudget] = useState(25000);
  const [currency, setCurrency] = useState('₹');
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('Budget + Comfortable');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['History', 'Food', 'Photography', 'Culture']);
  const [accommodationPreference, setAccommodationPreference] = useState('Boutique Heritage Haveli in Bani Park');
  const [foodPreference, setFoodPreference] = useState('Authentic Local Rajasthani & Legendary Street Food');
  const [transportPreference, setTransportPreference] = useState('Train / Metro + Local Auto Rickshaw');
  const [activityIntensity, setActivityIntensity] = useState<ActivityIntensity>('Balanced (2-3 key spots/day)');
  const [specialRequirements, setSpecialRequirements] = useState('');

  if (!isOpen) return null;

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter(i => i !== id));
      }
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const fillHackathonDemo = () => {
    setDestination('Jaipur');
    setOrigin('Bhopal');
    setDuration(4);
    setTravelers(2);
    setTotalBudget(25000);
    setCurrency('₹');
    setTravelStyle('Budget + Comfortable');
    setSelectedInterests(['History', 'Food', 'Photography', 'Culture']);
    setAccommodationPreference('Boutique Heritage Haveli in Bani Park');
    setFoodPreference('Authentic Rajasthani & Legendary Street Food');
    setTransportPreference('Train / Metro + Local Auto Rickshaw');
    setActivityIntensity('Balanced (2-3 key spots/day)');
    setSpecialRequirements('Avoid peak midday heat for outdoor fort walks');
    setStep(7);
  };

  const handleNext = () => {
    if (step < 7) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinalSubmit = () => {
    const prefs: TripPreferences = {
      destination,
      origin,
      duration,
      startDate: startDate || undefined,
      travelers,
      totalBudget,
      currency,
      travelStyle,
      interests: selectedInterests,
      accommodationPreference,
      foodPreference,
      transportPreference,
      activityIntensity,
      specialRequirements
    };
    onSubmit(prefs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#101520] border border-amber-500/20 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/15 flex items-center justify-between bg-[#0C111A]/60">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 flex items-center justify-center font-bold text-sm">
              {step}
            </span>
            <div>
              <h2 className="font-display text-sm sm:text-base font-bold text-white">Plan Your Custom Itinerary</h2>
              <p className="text-[11px] text-slate-400">Step {step} of 7 · Personalized travel route</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fillHackathonDemo}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
              title="Auto-fill Jaipur sample itinerary"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Sample Trip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#0C111A] h-1">
          <div
            className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 h-1 transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>

        {/* Body content based on step */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: DESTINATION & ORIGIN */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  Where are you going?
                </h3>
                <p className="text-xs text-slate-400 mt-1">Specify destination and your departure location for transit calculations.</p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination City</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={destination}
                      onChange={e => setDestination(e.target.value)}
                      placeholder="e.g. Jaipur, Udaipur, Paris, Kyoto..."
                      className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-medium"
                    />
                    <div className="absolute right-3 top-3 text-xs text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Rajasthan, India
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Starting From (Origin)</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    placeholder="e.g. Bhopal, New Delhi, Mumbai..."
                    className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-medium"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Used to calculate realistic train, bus, or cab transit estimates.</p>
                </div>
              </div>

              {/* Popular destination quick chips */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">Popular Quick Picks:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { dest: 'Jaipur', orig: 'Bhopal' },
                    { dest: 'Udaipur', orig: 'Ahmedabad' },
                    { dest: 'Goa', orig: 'Mumbai' },
                    { dest: 'Kyoto', orig: 'Tokyo' }
                  ].map(item => (
                    <button
                      key={item.dest}
                      type="button"
                      onClick={() => { setDestination(item.dest); setOrigin(item.orig); }}
                      className="px-3 py-1.5 text-xs rounded-lg bg-[#131924] hover:bg-[#1A2232] text-slate-300 hover:text-white border border-amber-500/15 cursor-pointer transition-all"
                    >
                      {item.dest} <span className="text-slate-500">from {item.orig}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DURATION */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  When and how long?
                </h3>
                <p className="text-xs text-slate-400 mt-1">Select the duration of your adventure.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-300">Trip Duration</label>
                    <span className="text-base font-extrabold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                      {duration} Days ({duration - 1} Nights)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>1 Day</span>
                    <span>4 Days (Ideal)</span>
                    <span>7 Days</span>
                    <span>10 Days</span>
                  </div>
                </div>

                {/* Duration chip presets */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {[2, 3, 4, 5].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        duration === d
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                          : 'bg-[#0C111A] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Optional Starting Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TRAVELERS */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  Who's travelling?
                </h3>
                <p className="text-xs text-slate-400 mt-1">Tell us your party size so we can optimize rooms and transit tickets.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { count: 1, title: 'Solo Traveler', icon: '🎒', desc: '1 Person' },
                  { count: 2, title: 'Couple / Duo', icon: '👫', desc: '2 Travelers' },
                  { count: 3, title: 'Small Group', icon: '👥', desc: '3 Friends' },
                  { count: 4, title: 'Family / Crew', icon: '👨‍👩‍👧‍👦', desc: '4+ People' }
                ].map(opt => (
                  <button
                    key={opt.count}
                    type="button"
                    onClick={() => setTravelers(opt.count)}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      travelers === opt.count
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/10'
                        : 'bg-[#0C111A] border-amber-500/10 text-slate-400 hover:border-amber-500/30 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{opt.icon}</span>
                    <span className="font-bold text-sm block text-white">{opt.title}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{opt.desc}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Custom Number of Travelers</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="w-10 h-10 rounded-xl bg-[#131924] border border-amber-500/20 text-white text-lg font-bold flex items-center justify-center hover:bg-[#1A2232] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-lg font-bold text-amber-300 px-4">{travelers} Travelers</span>
                  <button
                    type="button"
                    onClick={() => setTravelers(Math.min(10, travelers + 1))}
                    className="w-10 h-10 rounded-xl bg-[#131924] border border-amber-500/20 text-white text-lg font-bold flex items-center justify-center hover:bg-[#1A2232] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BUDGET */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-400" />
                  What's your total budget?
                </h3>
                <p className="text-xs text-slate-400 mt-1">Our budget engine will strictly respect this ceiling with realistic math.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C111A] border border-amber-500/15 space-y-4">
                <div className="flex items-center gap-3">
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="bg-[#131924] border border-amber-500/25 rounded-xl px-3 py-3 text-amber-300 font-bold text-base focus:outline-none"
                  >
                    <option value="₹">₹ INR</option>
                    <option value="$">$ USD</option>
                    <option value="€">€ EUR</option>
                    <option value="£">£ GBP</option>
                  </select>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="500"
                      min="3000"
                      max="500000"
                      value={totalBudget}
                      onChange={e => setTotalBudget(Number(e.target.value))}
                      className="w-full bg-[#131924] border border-amber-500/25 rounded-xl px-4 py-3 text-white font-extrabold text-xl focus:outline-none focus:border-amber-400"
                    />
                    <span className="absolute right-3 top-3 text-xs text-slate-400">Total Budget</span>
                  </div>
                </div>

                {/* Per person & daily preview */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-amber-500/10">
                  <div className="p-2.5 rounded-xl bg-[#131924]/60 text-xs border border-amber-500/10">
                    <span className="text-slate-400 block">Cost Per Traveler:</span>
                    <span className="font-bold text-amber-300 text-sm">
                      {currency}{Math.round(totalBudget / Math.max(1, travelers)).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#131924]/60 text-xs border border-amber-500/10">
                    <span className="text-slate-400 block">Daily Allowance:</span>
                    <span className="font-bold text-orange-300 text-sm">
                      {currency}{Math.round(totalBudget / Math.max(1, duration)).toLocaleString()} / day
                    </span>
                  </div>
                </div>

                {/* Quick Budget Chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[15000, 20000, 25000, 35000, 50000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTotalBudget(amt)}
                      className={`px-3 py-1 text-xs rounded-lg border font-medium cursor-pointer transition-all ${
                        totalBudget === amt
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-[#131924] border-amber-500/15 text-slate-400 hover:text-white'
                      }`}
                    >
                      {currency}{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: INTERESTS */}
          {step === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-orange-400" />
                  What do you love doing?
                </h3>
                <p className="text-xs text-slate-400 mt-1">Select all that apply. Gemma uses these to calculate your Personalization Score.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 pt-2">
                {INTERESTS_OPTIONS.map(opt => {
                  const isSelected = selectedInterests.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleInterest(opt.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm'
                          : 'bg-[#0C111A] border-amber-500/10 text-slate-400 hover:border-amber-500/30 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{opt.emoji}</span>
                        <span className="text-xs sm:text-sm font-semibold">{opt.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-[#0C111A]/80 border border-amber-500/15 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Selected: <strong className="text-amber-300">{selectedInterests.join(', ')}</strong></span>
              </div>
            </div>
          )}

          {/* STEP 6: TRAVEL STYLE */}
          {step === 6 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  Travel Style & Pacing
                </h3>
                <p className="text-xs text-slate-400 mt-1">Fine-tune the vibe, accommodation, and daily energy level.</p>
              </div>

              {/* Travel Style */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Travel Style</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TRAVEL_STYLES.map(ts => (
                    <button
                      key={ts.id}
                      type="button"
                      onClick={() => setTravelStyle(ts.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        travelStyle === ts.id
                          ? 'bg-amber-500/15 border-amber-400 text-white'
                          : 'bg-[#0C111A] border-amber-500/10 text-slate-400 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="font-bold text-xs sm:text-sm text-white">{ts.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{ts.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Intensity */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Daily Intensity / Energy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {INTENSITY_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setActivityIntensity(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        activityIntensity === opt.id
                          ? 'bg-amber-500/15 border-amber-400 text-white'
                          : 'bg-[#0C111A] border-amber-500/10 text-slate-400 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Special requirements */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Special Requirements (Optional)</label>
                <input
                  type="text"
                  value={specialRequirements}
                  onChange={e => setSpecialRequirements(e.target.value)}
                  placeholder="e.g. Traveling with parents, vegetarian dining, avoid steep climbs..."
                  className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-4 py-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW & GENERATE */}
          {step === 7 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                  Ready to Generate Your Trip
                </h3>
                <p className="text-xs text-slate-400 mt-1">Review your parameters before Gemma 4 initiates tool execution.</p>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-[#0C111A] border border-amber-500/20 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Trip Route</span>
                    <span className="font-bold text-white text-sm">{origin} → {destination}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration & Dates</span>
                    <span className="font-bold text-white text-sm">{duration} Days ({duration - 1} Nights)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Travelers</span>
                    <span className="font-bold text-white text-sm">{travelers} Person{travelers > 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Budget</span>
                    <span className="font-bold text-amber-300 text-sm">{currency}{totalBudget.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Travel Style</span>
                    <span className="font-semibold text-orange-300 text-xs">{travelStyle}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Daily Intensity</span>
                    <span className="font-semibold text-slate-300 text-xs">{activityIntensity}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-500/10">
                  <span className="text-slate-500 block text-xs mb-1">Interests Selected</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInterests.map(i => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/25 font-medium">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>

                {specialRequirements && (
                  <div className="pt-2 border-t border-amber-500/10 text-xs">
                    <span className="text-slate-500 block mb-0.5">Special Constraints:</span>
                    <span className="text-slate-300 italic">{specialRequirements}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 border-t border-amber-500/15 bg-[#0C111A]/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white bg-[#131924] hover:bg-[#1A2232] border border-amber-500/15 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold rounded-xl text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              className="flex items-center gap-2 px-7 py-3 text-sm font-bold rounded-xl text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <span>Build My Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
