import React, { useEffect, useState } from 'react';
import { Compass, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoadingScreenProps {
  destination: string;
  duration: number;
}

const GENERATION_STEPS = [
  'Checking regional attractions and geographic clusters...',
  'Analyzing typical daylight and weather conditions...',
  'Filtering landmarks based on your travel interests...',
  'Estimating intercity transit and local transport costs...',
  'Selecting top-rated boutique accommodations within budget...',
  'Sequencing morning, afternoon & evening stops by proximity...',
  'Finalizing day-by-day schedule and budget calculations...'
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ destination, duration }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="w-full max-w-md bg-[#101520] border border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Animated Icon */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="w-full h-full rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Compass className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="font-display text-xl font-bold text-white">
            Curating Your {destination} Itinerary
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Assembling your balanced {duration}-day plan with realistic transit times
          </p>
        </div>

        {/* Progress Step List */}
        <div className="space-y-2.5 text-left bg-[#0C111A] p-4 rounded-2xl border border-white/[0.06]">
          {GENERATION_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 text-xs transition-opacity ${
                  isDone ? 'text-slate-400' : isCurrent ? 'text-amber-300 font-bold' : 'text-slate-600'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin flex-shrink-0 mt-0.5" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-tight">{step}</span>
              </div>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-500 font-normal">
          Calculating budget allocations and proximity routing
        </div>
      </div>
    </div>
  );
};
