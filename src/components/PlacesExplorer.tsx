import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  ExternalLink,
  Search,
  Tag,
  Ticket,
  Utensils,
  Compass
} from 'lucide-react';
import { TripItinerary, Activity, Meal } from '../../shared/types.ts';

interface PlacesExplorerProps {
  itinerary: TripItinerary;
}

export const PlacesExplorer: React.FC<PlacesExplorerProps> = ({ itinerary }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract all distinct attractions
  const allActivities: (Activity & { dayNum: number })[] = [];
  itinerary.days.forEach(d => {
    d.activities.forEach(a => {
      allActivities.push({ ...a, dayNum: d.day });
    });
  });

  const categories = ['all', ...Array.from(new Set(allActivities.map(a => a.category)))];

  const filtered = allActivities.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="p-5 rounded-3xl bg-[#101520] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search attractions or spots..."
            className="w-full bg-[#0C111A] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize cursor-pointer transition-colors flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {cat === 'all' ? 'All Places' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Places */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => {
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.location}`)}`;
          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#101520] border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-medium text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                    Day {item.dayNum} · {item.period}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    {item.estimatedCost > 0 ? `${itinerary.tripSummary.currency}${item.estimatedCost.toLocaleString()}` : 'Free'}
                  </span>
                </div>

                <h4 className="font-display font-bold text-base text-white">{item.name}</h4>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>{item.duration} recommended stay</span>
                </div>

                <div className="mt-1 flex items-start gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{item.location}</span>
                </div>

                {item.reason && (
                  <p className="mt-3 text-[11px] text-slate-400 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04] leading-relaxed">
                    {item.reason}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded">
                  {item.category}
                </span>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-xs text-slate-500">
          No attractions match "{searchQuery}".
        </div>
      )}
    </div>
  );
};
