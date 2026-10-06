import React from 'react';
import {
  Wallet,
  TrendingDown,
  AlertTriangle,
  Train,
  Building,
  Utensils,
  Ticket,
  Car,
  ShieldAlert
} from 'lucide-react';
import { BudgetBreakdown, TripSummary } from '../../shared/types.ts';

interface BudgetDashboardProps {
  summary: TripSummary;
  breakdown: BudgetBreakdown;
  onOptimizeBudget: () => void;
  isOptimizing?: boolean;
}

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({
  summary,
  breakdown,
  onOptimizeBudget,
  isOptimizing = false
}) => {
  const isOverBudget = breakdown.totalEstimated > summary.totalBudget;
  const remaining = summary.totalBudget - breakdown.totalEstimated;
  const percentUsed = Math.min(100, Math.round((breakdown.totalEstimated / summary.totalBudget) * 100));

  const categories = [
    { name: 'Intercity Transport', amount: breakdown.transport, icon: Train, color: 'text-sky-400', barBg: 'bg-sky-400' },
    { name: 'Lodging (Havelis / Hotels)', amount: breakdown.stay, icon: Building, color: 'text-amber-400', barBg: 'bg-amber-400' },
    { name: 'Dining & Cafes', amount: breakdown.food, icon: Utensils, color: 'text-orange-400', barBg: 'bg-orange-400' },
    { name: 'Monuments & Sightseeing', amount: breakdown.activities, icon: Ticket, color: 'text-emerald-400', barBg: 'bg-emerald-400' },
    { name: 'Local Taxis & Rickshaws', amount: breakdown.localTransport, icon: Car, color: 'text-indigo-400', barBg: 'bg-indigo-400' },
    { name: 'Contingency Reserve', amount: breakdown.buffer, icon: ShieldAlert, color: 'text-slate-400', barBg: 'bg-slate-400' }
  ];

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#101520] p-6 shadow-xl mb-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Trip Budget & Expense Breakdown
            </h2>
            <p className="text-xs text-slate-400">
              Itemized estimates across lodging, dining, sightseeing tickets, and local travel.
            </p>
          </div>
        </div>

        <button
          onClick={onOptimizeBudget}
          disabled={isOptimizing}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <TrendingDown className="w-4 h-4 text-amber-400" />
          <span>{isOptimizing ? 'Calculating Savings...' : 'Balance Expenses'}</span>
        </button>
      </div>

      {/* Main KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5">
        <div className="p-3.5 rounded-2xl bg-[#0C111A] border border-white/[0.06]">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Budget Target</span>
          <span className="text-xl sm:text-2xl font-bold text-white">
            {summary.currency}{summary.totalBudget.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Planned ceiling</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0C111A] border border-white/[0.06]">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Estimated Spend</span>
          <span className="text-xl sm:text-2xl font-bold text-amber-300">
            {summary.currency}{breakdown.totalEstimated.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">{percentUsed}% of total budget</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0C111A] border border-white/[0.06]">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
            {isOverBudget ? 'Over Budget' : 'Remaining Cushion'}
          </span>
          <span className={`text-xl sm:text-2xl font-bold ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
            {summary.currency}{Math.abs(remaining).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {isOverBudget ? 'Exceeds budget limit' : 'Unallocated reserve'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0C111A] border border-white/[0.06]">
          <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Cost Per Traveler</span>
          <span className="text-xl sm:text-2xl font-bold text-sky-300">
            {summary.currency}{breakdown.costPerPerson.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">
            ~{summary.currency}{breakdown.dailyAverage.toLocaleString()} / day avg
          </span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-2 py-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">Allocation breakdown</span>
          <span className={isOverBudget ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
            {summary.currency}{breakdown.totalEstimated.toLocaleString()} of {summary.currency}{summary.totalBudget.toLocaleString()} committed ({percentUsed}%)
          </span>
        </div>

        <div className="w-full bg-[#090C10] rounded-full h-3 p-0.5 border border-white/[0.08] overflow-hidden flex">
          {categories.map((cat, idx) => {
            const widthPct = Math.max(3, Math.round((cat.amount / Math.max(1, breakdown.totalEstimated)) * 100));
            return (
              <div
                key={idx}
                className={`${cat.barBg} h-full first:rounded-l-full last:rounded-r-full transition-all`}
                style={{ width: `${widthPct}%` }}
                title={`${cat.name}: ${summary.currency}${cat.amount.toLocaleString()}`}
              />
            );
          })}
        </div>
      </div>

      {/* Category breakdown pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-4">
        {categories.map((cat, idx) => (
          <div key={idx} className="p-2.5 rounded-xl bg-[#0C111A] border border-white/[0.06] text-xs">
            <div className="flex items-center gap-1.5 mb-1">
              <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
              <span className="text-[11px] text-slate-400 truncate">{cat.name}</span>
            </div>
            <div className="font-bold text-white text-sm">
              {summary.currency}{cat.amount.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">
              {Math.round((cat.amount / Math.max(1, breakdown.totalEstimated)) * 100)}% of total
            </div>
          </div>
        ))}
      </div>

      {/* Over budget warning if applicable */}
      {isOverBudget && (
        <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>
              Your plan currently exceeds the target by <strong>{summary.currency}{Math.abs(remaining).toLocaleString()}</strong>.
            </span>
          </div>
          <button
            onClick={onOptimizeBudget}
            className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold cursor-pointer transition-colors"
          >
            Balance Plan
          </button>
        </div>
      )}
    </div>
  );
};
