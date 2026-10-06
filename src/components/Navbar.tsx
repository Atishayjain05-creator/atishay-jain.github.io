import React, { useState } from 'react';
import { Compass, Sparkles, PlusCircle, Plus, Bookmark, PlayCircle, Palette, Cloud, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { TripItinerary } from '../../shared/types.ts';
import { User } from '../services/firebase.ts';

export type AppTheme = 'atlas' | 'kyoto' | 'nordic' | 'aegean';

interface NavbarProps {
  onOpenPlanner: () => void;
  onLoadDemo: () => void;
  onOpenSavedTrips?: () => void;
  activeTrip: TripItinerary | null;
  savedTripsCount?: number;
  currentTheme?: AppTheme;
  onThemeChange?: (theme: AppTheme) => void;
  user?: User | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  firestoreConnected?: boolean;
  onSelectTab?: (tab: 'itinerary' | 'budget' | 'places' | 'guide') => void;
}

const THEME_OPTIONS: { id: AppTheme; name: string; color: string; label: string }[] = [
  { id: 'atlas', name: 'Atlas Saffron', color: 'bg-amber-400', label: 'Sahara & Lapis' },
  { id: 'kyoto', name: 'Kyoto Plum', color: 'bg-rose-400', label: 'Temples & Sakura' },
  { id: 'nordic', name: 'Nordic Aurora', color: 'bg-emerald-400', label: 'Glacier & Mint' },
  { id: 'aegean', name: 'Aegean Cobalt', color: 'bg-sky-400', label: 'Mediterranean Blue' },
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPlanner,
  onLoadDemo,
  onOpenSavedTrips,
  activeTrip,
  savedTripsCount = 0,
  currentTheme = 'atlas',
  onThemeChange,
  user,
  onSignIn,
  onSignOut,
  firestoreConnected = true,
  onSelectTab
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#090C10]/90 border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-display font-black text-lg tracking-tight text-white">
            TravelMind
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => {
              onSelectTab?.('itinerary');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Itinerary
          </button>
          <button
            onClick={() => {
              onSelectTab?.('budget');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Budget & Costs
          </button>
          <button
            onClick={() => {
              onSelectTab?.('places');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Places to Visit
          </button>
          <button
            onClick={() => {
              onSelectTab?.('guide');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Packing & Guide
          </button>
          {onOpenSavedTrips && (
            <button
              onClick={onOpenSavedTrips}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Saved Trips</span>
              {savedTripsCount > 0 && (
                <span className="text-[10px] text-amber-400 font-semibold">({savedTripsCount})</span>
              )}
            </button>
          )}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Palette Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title="Change visual theme"
              aria-label="Theme settings"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#121722] border border-white/10 shadow-2xl p-1.5 z-50 animate-fadeIn">
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 px-2.5 py-1">
                  Color Theme
                </div>
                {THEME_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onThemeChange?.(opt.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      currentTheme === opt.id
                        ? 'bg-white/[0.08] text-amber-300 font-semibold'
                        : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                      <span>{opt.name}</span>
                    </div>
                    {currentTheme === opt.id && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Account / Sync */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="truncate max-w-[100px] text-xs">{user.displayName || user.email?.split('@')[0]}</span>
              <button
                onClick={onSignOut}
                title="Sign out"
                className="text-slate-400 hover:text-rose-400 ml-1 transition-colors"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            onSignIn && (
              <button
                onClick={onSignIn}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in</span>
              </button>
            )
          )}

          <button
            onClick={onLoadDemo}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] transition-all cursor-pointer"
          >
            <span>Sample Trip</span>
          </button>

          <button
            onClick={onOpenPlanner}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Trip</span>
          </button>
        </div>
      </div>
    </header>
  );
};

