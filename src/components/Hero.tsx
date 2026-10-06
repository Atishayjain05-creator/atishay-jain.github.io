import React, { useState } from 'react';
import { MapPin, Calendar, Wallet, ArrowRight, PlayCircle, Clock, Check } from 'lucide-react';

interface HeroProps {
  onPlanTrip: () => void;
  onExploreDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onPlanTrip, onExploreDemo }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-18 lg:pb-20 border-b border-white/[0.08] bg-[#090C10]">
      {/* Subtle warm glow in background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-amber-500/[0.07] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Clean headline */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-3xl mx-auto">
          Thoughtful itineraries for real travel.
        </h1>

        {/* Natural subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-400 font-normal max-w-xl mx-auto leading-relaxed">
          Set your destination, budget, and travel interests. Get a balanced, day-by-day plan with realistic transit times and costs.
        </p>

        {/* Action Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onPlanTrip}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-400/10"
          >
            <span>Plan an Itinerary</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4 text-amber-400" />
            <span>Explore Sample (Jaipur, 4 Days)</span>
          </button>
        </div>

        {/* Popular Quick Destinations */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span>Popular destinations:</span>
          {['Jaipur', 'Kyoto', 'Paris', 'Rome', 'Barcelona'].map(city => (
            <button
              key={city}
              onClick={onPlanTrip}
              className="text-slate-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer transition-colors"
            >
              {city}
            </button>
          ))}
        </div>

        {/* 3 Real Product Pillars (clean, understated) */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-white/[0.06] text-left">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white">Route Sequencing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Attractions grouped by geographic proximity and opening hours to prevent wasted transit.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white">Transparent Expenses</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real calculations for accommodation, local transit, entry passes, and a reserve buffer.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-white">Customizable Schedule</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Swap stops, adjust pace, add custom visits, or refine the day with quick conversational notes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
