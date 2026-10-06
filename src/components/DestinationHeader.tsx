import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  CloudSun,
  Award,
  HelpCircle,
  Sliders,
  TrendingDown,
  MessageSquare,
  Printer,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Share2,
  Users
} from 'lucide-react';
import { TripItinerary } from '../../shared/types.ts';

interface DestinationHeaderProps {
  itinerary: TripItinerary;
  onOpenCopilot: () => void;
  onOpenWhatIf: () => void;
  onOptimizeBudget: () => void;
  onOpenToolsModal: () => void;
  isOptimizing?: boolean;
}

export const DestinationHeader: React.FC<DestinationHeaderProps> = ({
  itinerary,
  onOpenCopilot,
  onOpenWhatIf,
  onOptimizeBudget,
  onOpenToolsModal,
  isOptimizing = false
}) => {
  const [showHighlights, setShowHighlights] = useState(false);
  const { tripSummary } = itinerary;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-[#101520] shadow-xl mb-8">
      {/* Background Hero Image with natural photographic treatment */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden">
        <img
          src={tripSummary.heroImage}
          alt={tripSummary.destination}
          className="w-full h-full object-cover object-center filter brightness-[0.85] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090C10] via-[#090C10]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090C10]/80 via-transparent to-[#090C10]/50" />

        {/* Top Badges: Realistic & Understated */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#101520]/85 text-slate-200 border border-white/10 backdrop-blur-md">
              {tripSummary.duration}-Day Curated Plan
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#101520]/85 text-amber-300 border border-amber-500/20 backdrop-blur-md">
              {tripSummary.tripPersonality.title || 'Cultural Heritage'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Weather forecast pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#101520]/85 text-slate-300 border border-white/10 backdrop-blur-md">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              <span>{tripSummary.weatherSummary.temperature}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{tripSummary.weatherSummary.condition}</span>
            </div>
          </div>
        </div>

        {/* Destination Information */}
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                <span className="flex items-center gap-1 text-amber-300">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{tripSummary.origin} → {tripSummary.destination}</span>
                </span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tripSummary.duration} Days</span>
                </span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tripSummary.travelers} Traveler{tripSummary.travelers > 1 ? 's' : ''}</span>
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight">
                {tripSummary.destination}
              </h1>

              <p className="mt-1 text-xs sm:text-sm text-slate-300 font-normal max-w-xl line-clamp-1">
                {tripSummary.tripPersonality.tagline}
              </p>
            </div>

            {/* Practical Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Print / Export PDF */}
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#101520]/90 hover:bg-[#161D2B] text-slate-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all"
                title="Print or export PDF itinerary"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>

              {/* Adjust Constraints Modal */}
              <button
                onClick={onOpenWhatIf}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#101520]/90 hover:bg-[#161D2B] text-slate-200 border border-white/10 flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all"
                title="Adjust budget or trip constraints"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Adjust Constraints</span>
              </button>

              {/* Trip Assistant Drawer */}
              <button
                onClick={onOpenCopilot}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-400/10 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Trip Assistant</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights & Logistics Section */}
      <div className="px-6 py-3.5 bg-[#0C111A]/95 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer group text-left"
            onClick={() => setShowHighlights(!showHighlights)}
          >
            <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
              Route Highlights & Logistics Notes
            </span>
            <span className="text-[11px] text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded-md border border-white/10">
              {tripSummary.whyThisTripFits.length} Notes
            </span>
            {showHighlights ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onOptimizeBudget}
              disabled={isOptimizing}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Review cost breakdown and savings"
            >
              <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
              <span>{isOptimizing ? 'Recalculating...' : 'Balance Budget'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Logistics Notes */}
        {showHighlights && (
          <div className="mt-3 pt-3 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-300 animate-fadeIn">
            {tripSummary.whyThisTripFits.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-[#101520] p-2.5 rounded-xl border border-white/[0.06]">
                <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
