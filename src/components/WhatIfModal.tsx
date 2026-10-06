import React, { useState } from 'react';
import {
  Sliders,
  Zap,
  X,
  ArrowRight,
  TrendingDown,
  Calendar,
  CloudRain,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  Check
} from 'lucide-react';
import { WhatIfComparison, TripItinerary } from '../../shared/types.ts';
import { runWhatIfScenario } from '../services/api.ts';

interface WhatIfModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrip: TripItinerary;
  onApplyScenario: (updatedTrip: TripItinerary) => void;
}

const PRESET_SCENARIOS = [
  {
    type: 'budget',
    title: 'What if my budget drops to ₹20,000?',
    desc: 'Simulate a ₹5,000 tighter budget while keeping all top fortresses intact.',
    icon: TrendingDown,
    color: 'from-orange-500/20 to-amber-500/10 border-orange-500/30'
  },
  {
    type: 'duration',
    title: 'What if I add one extra day?',
    desc: 'Explore Bagru village block printing & regional excursions.',
    icon: Calendar,
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30'
  },
  {
    type: 'family',
    title: 'What if I travel with parents / kids?',
    desc: 'Eliminate steep climbs, add battery vehicles, and extend afternoon rest intervals.',
    icon: Users,
    color: 'from-emerald-500/20 to-amber-500/10 border-emerald-500/30'
  },
  {
    type: 'weather',
    title: 'What if it rains heavily?',
    desc: 'Pivot to indoor museums, covered royal courtyards, and cozy culinary tea stops.',
    icon: CloudRain,
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30'
  }
];

export const WhatIfModal: React.FC<WhatIfModalProps> = ({
  isOpen,
  onClose,
  currentTrip,
  onApplyScenario
}) => {
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<WhatIfComparison | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('budget');

  if (!isOpen) return null;

  const handleRunSimulation = async (scenarioType: string) => {
    setLoading(true);
    setSelectedPreset(scenarioType);
    try {
      const comp = await runWhatIfScenario({
        tripId: currentTrip.id,
        scenarioType: scenarioType as any
      });
      setComparison(comp);
    } catch (err) {
      console.error('What-If simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (comparison?.optimizedItinerary) {
      onApplyScenario(comparison.optimizedItinerary);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#101520] border border-amber-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0C111A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Trip Adjustments & Scenarios</h3>
              <p className="text-[11px] text-slate-400">Test alternative budgets, pace, or weather contingencies</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Preset Buttons Grid */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Select a What-If Scenario to Simulate:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_SCENARIOS.map(preset => (
                <button
                  key={preset.type}
                  type="button"
                  disabled={loading}
                  onClick={() => handleRunSimulation(preset.type)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer bg-gradient-to-br ${preset.color} ${
                    selectedPreset === preset.type
                      ? 'ring-2 ring-amber-400 shadow-md shadow-amber-500/15'
                      : 'hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <preset.icon className="w-4 h-4 text-white" />
                    <span className="font-display font-bold text-xs sm:text-sm text-white">{preset.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

            {/* Loading Animation */}
          {loading && (
            <div className="p-8 text-center space-y-3 bg-[#0C111A] rounded-2xl border border-white/10">
              <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-medium">
                Recalculating itinerary stops, route timing, and budget allocations...
              </p>
            </div>
          )}

          {/* Comparison Output */}
          {comparison && !loading && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-[#0C111A] border border-white/10 space-y-3">
                <h4 className="font-display font-bold text-sm text-white flex items-center justify-between">
                  <span>{comparison.scenarioTitle}</span>
                  {comparison.savingsOrDiff > 0 && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                      Saves {currentTrip.tripSummary.currency}{comparison.savingsOrDiff.toLocaleString()}
                    </span>
                  )}
                </h4>

                {/* Side-by-side KPI boxes */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#131924] border border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 font-medium uppercase block">Current Plan</span>
                    <div className="font-display text-lg font-bold text-slate-200 mt-0.5">
                      {currentTrip.tripSummary.currency}{comparison.originalCost.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-slate-400">Target: {currentTrip.tripSummary.currency}{comparison.originalBudget.toLocaleString()}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#162030] border border-amber-400/30">
                    <span className="text-[10px] text-amber-300 font-medium uppercase block">Adjusted Plan</span>
                    <div className="font-display text-lg font-bold text-amber-200 mt-0.5">
                      {currentTrip.tripSummary.currency}{comparison.newCost.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-amber-300">Target: {currentTrip.tripSummary.currency}{comparison.newBudget.toLocaleString()}</span>
                  </div>
                </div>

                {/* Category Deltas */}
                {comparison.breakdownChanges.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.06] space-y-1.5 text-xs">
                    <span className="text-slate-400 text-[11px] font-medium block">Category Adjustments:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {comparison.breakdownChanges.map((item, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-[#131924] text-[11px] flex justify-between items-center border border-white/[0.06]">
                          <span className="text-slate-300">{item.category}</span>
                          <span className={item.diff <= 0 ? 'text-emerald-400 font-medium' : 'text-amber-300 font-medium'}>
                            {currentTrip.tripSummary.currency}{item.original.toLocaleString()} → {currentTrip.tripSummary.currency}{item.updated.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Modifications */}
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                  <span className="text-slate-400 text-[11px] font-medium block">Key Adjustments:</span>
                  <div className="space-y-1">
                    {comparison.keyModifications.map((mod, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-amber-500/15 bg-[#0C111A]/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white bg-[#131924] hover:bg-[#1D2638] transition-colors cursor-pointer"
          >
            Close
          </button>

          {comparison && (
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition-all cursor-pointer hover:from-amber-300 hover:to-orange-300"
            >
              <Check className="w-4 h-4 text-slate-950" />
              <span>Apply This Scenario to My Trip</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
