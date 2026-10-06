import React from 'react';
import {
  Clock,
  MapPin,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { Activity } from '../../shared/types.ts';

interface ActivityCardProps {
  activity: Activity;
  currency: string;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
  onSwapWithAlternative: (activity: Activity) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  currency,
  onEdit,
  onDelete,
  onSwapWithAlternative
}) => {
  const getPeriodBadge = (period: string) => {
    switch (period) {
      case 'Morning':
        return 'bg-amber-400/10 text-amber-300 border-amber-400/20';
      case 'Afternoon':
        return 'bg-orange-400/10 text-orange-300 border-orange-400/20';
      case 'Evening':
        return 'bg-sky-400/10 text-sky-300 border-sky-400/20';
      default:
        return 'bg-purple-400/10 text-purple-300 border-purple-400/20';
    }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activity.name} ${activity.location}`)}`;

  return (
    <div className="group relative rounded-2xl bg-[#0C111A] border border-white/[0.08] hover:border-white/[0.18] p-4 transition-all hover:bg-[#111722] hover:shadow-lg">
      {/* Top Header: Period, Timing, & Action Icons */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${getPeriodBadge(activity.period)}`}>
            {activity.period}
          </span>
          <span className="flex items-center gap-1 text-slate-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{activity.time}</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">{activity.duration}</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          {activity.alternative && (
            <button
              onClick={() => onSwapWithAlternative(activity)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/[0.05] transition-colors cursor-pointer"
              title={`Switch to: ${activity.alternative}`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onEdit(activity)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-white/[0.05] transition-colors cursor-pointer"
            title="Edit activity details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(activity.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.05] transition-colors cursor-pointer"
            title="Remove from itinerary"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Title & Price */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h4 className="font-display font-bold text-sm sm:text-base text-white">
          {activity.name}
        </h4>
        <span className="text-xs font-semibold text-slate-200 bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/10 flex-shrink-0">
          {activity.estimatedCost > 0 ? `${currency}${activity.estimatedCost.toLocaleString()} / person` : 'Free Entry'}
        </span>
      </div>

      {/* Location & Category */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2.5">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
          title="Open in Google Maps"
        >
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate max-w-[200px]">{activity.location}</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>
        <span className="text-slate-600">·</span>
        <span className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 text-[11px] border border-white/[0.06] font-medium">
          {activity.category}
        </span>
      </div>

      {/* Traveler Tip (Real, practical advice) */}
      {activity.reason && (
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs text-slate-300 flex items-start gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-amber-300/90 font-medium">Traveler note: </strong>
            {activity.reason}
          </p>
        </div>
      )}

      {/* Alternative suggestion if available */}
      {activity.alternative && (
        <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate mr-2">
            Alternative option: <span className="text-slate-200">{activity.alternative}</span>
          </span>
          <button
            onClick={() => onSwapWithAlternative(activity)}
            className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer flex-shrink-0 hover:underline"
          >
            <span>Switch</span>
            <ArrowRightLeft className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
