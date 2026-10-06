import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Compass,
  PhoneCall,
  ShieldCheck,
  Sun,
  AlertCircle,
  Lightbulb,
  MapPin,
  Check
} from 'lucide-react';
import { TripItinerary } from '../../shared/types.ts';

interface PackingAndGuideProps {
  itinerary: TripItinerary;
}

export const PackingAndGuide: React.FC<PackingAndGuideProps> = ({ itinerary }) => {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const totalItems = itinerary.packingList.length;
  const packedCount = Object.values(checkedItems).filter(Boolean).length;
  const pct = Math.round((packedCount / Math.max(1, totalItems)) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner: Climate & Packing Progress */}
      <div className="p-6 rounded-3xl bg-[#101520] border border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-1">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Climate & Advisory for {itinerary.tripSummary.destination}</span>
          </div>
          <h3 className="font-display font-bold text-lg text-white">
            {itinerary.tripSummary.weatherSummary.temperature} · {itinerary.tripSummary.weatherSummary.condition}
          </h3>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            {itinerary.tripSummary.weatherSummary.packingAdvice}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0C111A] border border-white/[0.06] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Packing Readiness</span>
            <span className="text-amber-300 font-bold">
              {packedCount} of {totalItems} items packed ({pct}%)
            </span>
          </div>
          <div className="w-full bg-[#161D2B] h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Check off essentials as you pack your bags before departure.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Packing Checklist Column */}
        <div className="p-5 rounded-3xl bg-[#101520] border border-white/[0.08] space-y-3.5 lg:col-span-1">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Recommended Packing List</span>
            </h4>
            <span className="text-[11px] text-slate-500">{totalItems} items</span>
          </div>

          <div className="space-y-2">
            {itinerary.packingList.map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`p-3 rounded-xl border text-xs flex items-center gap-3 cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-300 line-through opacity-75'
                      : 'bg-[#0C111A] border-white/[0.06] text-white hover:border-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                      isChecked
                        ? 'bg-emerald-400 border-emerald-400 text-slate-950'
                        : 'border-slate-500 bg-transparent'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="select-none leading-tight">{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Local Travel Advice & Logistics */}
        <div className="p-5 rounded-3xl bg-[#101520] border border-white/[0.08] space-y-3.5 lg:col-span-1">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Local Traveler Tips</span>
            </h4>
            <span className="text-[11px] text-slate-500">{itinerary.tips.length} Tips</span>
          </div>

          <div className="space-y-2.5">
            {itinerary.tips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#0C111A] border border-white/[0.06] text-xs text-slate-300 flex items-start gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>

          {/* Emergency & Helpline Info */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2">
            <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-3 h-3 text-amber-400" />
              <span>Essential Helplines</span>
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#0C111A] border border-white/[0.04]">
                <span className="text-slate-400 block text-[10px]">Tourist Helpline</span>
                <span className="font-bold text-white">1363 (24/7 Toll-Free)</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0C111A] border border-white/[0.04]">
                <span className="text-slate-400 block text-[10px]">Emergency Response</span>
                <span className="font-bold text-white">112 / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Backup Excursions & Day Trips */}
        <div className="p-5 rounded-3xl bg-[#101520] border border-white/[0.08] space-y-3.5 lg:col-span-1">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Alternative Day Trips</span>
            </h4>
            <span className="text-[11px] text-slate-500">Flexible options</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            If you finish early or want to swap an activity due to heat or crowds, these nearby spots make great additions:
          </p>

          <div className="space-y-2.5">
            {itinerary.alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#0C111A] border border-white/[0.06] text-xs text-slate-300 flex items-start gap-2.5 hover:border-white/20 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400/80 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed font-medium">{alt}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 rounded-xl bg-amber-400/5 border border-amber-400/20 text-xs text-amber-200/90 leading-relaxed">
            💡 <strong>Pro Tip:</strong> Pre-paid auto-rickshaws at major railway stations offer fixed government fares, saving bargaining time.
          </div>
        </div>
      </div>
    </div>
  );
};
