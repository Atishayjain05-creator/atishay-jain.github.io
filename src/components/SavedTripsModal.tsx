import React from 'react';
import { X, Bookmark, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { TripItinerary } from '../../shared/types.ts';

interface SavedTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: TripItinerary[];
  activeTripId?: string;
  onSelectTrip: (trip: TripItinerary) => void;
}

export const SavedTripsModal: React.FC<SavedTripsModalProps> = ({
  isOpen,
  onClose,
  trips,
  activeTripId,
  onSelectTrip
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#101520] border border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/15 flex items-center justify-between bg-[#0C111A]/60">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-display font-bold text-base text-white">Saved Itineraries</h3>
              <p className="text-xs text-slate-400">{trips.length} itinerary records stored</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trips List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {trips.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No saved trips yet. Generate a new trip to get started!
            </div>
          ) : (
            trips.map(trip => {
              const isActive = trip.id === activeTripId;
              return (
                <div
                  key={trip.id}
                  onClick={() => { onSelectTrip(trip); onClose(); }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-400/80 shadow-md shadow-amber-500/10'
                      : 'bg-[#0C111A] border-amber-500/10 hover:border-amber-500/30 hover:bg-[#151D2A]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-sm sm:text-base text-white">
                        {trip.tripSummary.destination}
                      </h4>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                          Active
                        </span>
                      )}
                      {trip.isDemo && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#161D2B] text-orange-300 border border-orange-500/20">
                          Demo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        From {trip.tripSummary.origin}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {trip.tripSummary.duration} Days
                      </span>
                      <span>·</span>
                      <span className="text-amber-300 font-bold">
                        {trip.tripSummary.currency}{trip.tripSummary.estimatedCost.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 italic truncate max-w-sm">
                      {trip.tripSummary.tripPersonality.title}
                    </p>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-500 hover:text-amber-300 transition-colors flex-shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
