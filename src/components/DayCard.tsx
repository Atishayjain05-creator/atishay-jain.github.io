import React from 'react';
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Utensils,
  Car,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { ItineraryDay, Activity, Meal } from '../../shared/types.ts';
import { ActivityCard } from './ActivityCard.tsx';

interface DayCardProps {
  day: ItineraryDay;
  currency: string;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
  onSwapWithAlternative: (activity: Activity) => void;
  onAddActivity: (dayNumber: number) => void;
  onRegenerateDay: (dayNumber: number) => void;
  isRegenerating?: boolean;
}

export const DayCard: React.FC<DayCardProps> = ({
  day,
  currency,
  onEditActivity,
  onDeleteActivity,
  onSwapWithAlternative,
  onAddActivity,
  onRegenerateDay,
  isRegenerating = false
}) => {
  // Group activities into Morning, Afternoon, Evening
  const morningActivities = day.activities.filter(a => a.period === 'Morning');
  const afternoonActivities = day.activities.filter(a => a.period === 'Afternoon');
  const eveningActivities = day.activities.filter(a => a.period === 'Evening' || a.period === 'Night');

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#101520] p-5 sm:p-7 shadow-xl mb-8 space-y-6">
      {/* Day Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display px-2.5 py-0.5 rounded-lg bg-amber-400/10 text-amber-300 font-bold text-xs tracking-wider border border-amber-400/20">
              DAY {day.day}
            </span>
            <span className="text-xs text-slate-400 font-medium">{day.date || `Day ${day.day}`}</span>
            {day.routeOptimized && (
              <span className="text-[11px] font-medium text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.08]">
                Proximity Clustered
              </span>
            )}
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-bold text-white">{day.title}</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{day.theme}</p>
        </div>

        {/* Day Meta & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#0C111A] border border-white/[0.06] text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Day Cost Est.</span>
            <span className="text-sm font-bold text-amber-300">{currency}{day.dayCost.toLocaleString()}</span>
          </div>

          <button
            onClick={() => onAddActivity(day.day)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Stop</span>
          </button>

          <button
            onClick={() => onRegenerateDay(day.day)}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh this day's schedule"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Updating...' : 'Re-sequence'}</span>
          </button>
        </div>
      </div>

      {/* Transit summary indicator */}
      {day.dayTravelTime && (
        <div className="px-3.5 py-2 rounded-xl bg-[#0C111A] border border-white/[0.06] text-xs text-slate-400 flex items-center gap-2">
          <Car className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span>Transit estimate: <strong className="text-slate-200">{day.dayTravelTime}</strong></span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="text-slate-400 hidden sm:inline">Planned in geographic order to minimize commute.</span>
        </div>
      )}

      {/* Activities Grid */}
      <div className="space-y-5">
        {/* Morning */}
        {morningActivities.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
              <span>Morning</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {morningActivities.map(act => (
                <ActivityCard
                  key={act.id}
                  activity={act}
                  currency={currency}
                  onEdit={onEditActivity}
                  onDelete={onDeleteActivity}
                  onSwapWithAlternative={onSwapWithAlternative}
                />
              ))}
            </div>
          </div>
        )}

        {/* Afternoon */}
        {afternoonActivities.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-300/90 flex items-center gap-1.5">
              <span>Afternoon</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {afternoonActivities.map(act => (
                <ActivityCard
                  key={act.id}
                  activity={act}
                  currency={currency}
                  onEdit={onEditActivity}
                  onDelete={onDeleteActivity}
                  onSwapWithAlternative={onSwapWithAlternative}
                />
              ))}
            </div>
          </div>
        )}

        {/* Evening */}
        {eveningActivities.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300/90 flex items-center gap-1.5">
              <span>Evening</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {eveningActivities.map(act => (
                <ActivityCard
                  key={act.id}
                  activity={act}
                  currency={currency}
                  onEdit={onEditActivity}
                  onDelete={onDeleteActivity}
                  onSwapWithAlternative={onSwapWithAlternative}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Curated Meals for this Day */}
      {day.meals && day.meals.length > 0 && (
        <div className="pt-4 border-t border-white/[0.06]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span>Recommended Dining for Day {day.day}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {day.meals.map(meal => (
              <div key={meal.id} className="p-3 rounded-2xl bg-[#0C111A] border border-white/[0.06] text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-amber-300 text-[11px] uppercase tracking-wider">{meal.type}</span>
                  <span className="font-medium text-slate-300 text-[11px]">~{currency}{meal.estimatedCost.toLocaleString()}</span>
                </div>
                <div className="font-bold text-white text-xs mb-0.5">{meal.name}</div>
                <p className="text-[11px] text-slate-400 leading-tight mb-1.5">{meal.recommendation}</p>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{meal.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
