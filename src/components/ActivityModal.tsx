import React, { useState, useEffect } from 'react';
import { X, Check, Clock, MapPin, Tag, Wallet } from 'lucide-react';
import { Activity } from '../../shared/types.ts';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Partial<Activity>) => void;
  initialActivity?: Activity | null;
  dayNumber?: number;
  currency?: string;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialActivity,
  dayNumber = 1,
  currency = '₹'
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Historical Landmark');
  const [period, setPeriod] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');
  const [time, setTime] = useState('09:00 AM - 11:30 AM');
  const [duration, setDuration] = useState('2.5 hours');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [location, setLocation] = useState('');
  const [reason, setReason] = useState('');
  const [alternative, setAlternative] = useState('');

  useEffect(() => {
    if (initialActivity) {
      setName(initialActivity.name);
      setCategory(initialActivity.category);
      setPeriod(initialActivity.period);
      setTime(initialActivity.time);
      setDuration(initialActivity.duration);
      setEstimatedCost(initialActivity.estimatedCost);
      setLocation(initialActivity.location);
      setReason(initialActivity.reason);
      setAlternative(initialActivity.alternative || '');
    } else {
      setName('');
      setCategory('Historical Landmark');
      setPeriod('Morning');
      setTime('09:00 AM - 11:30 AM');
      setDuration('2 hours');
      setEstimatedCost(100);
      setLocation('');
      setReason('Selected for your specific interests');
      setAlternative('');
    }
  }, [initialActivity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      category,
      period,
      time,
      duration,
      estimatedCost: Number(estimatedCost),
      location: location.trim() || 'Central District',
      reason: reason.trim() || 'Personalized activity recommendation',
      alternative: alternative.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#101520] border border-amber-500/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/15 flex items-center justify-between bg-[#0C111A]/60">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              {initialActivity ? 'Edit Activity' : `Add Activity to Day ${dayNumber}`}
            </h3>
            <p className="text-xs text-slate-400">Updates will instantly recalculate day and trip budgets.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Amber Fort Guided Mirror Hall Tour"
              className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Time of Day</label>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value as any)}
                className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
              >
                <option value="Historical Landmark">Historical Landmark</option>
                <option value="Architectural Gem">Architectural Gem</option>
                <option value="Food & Cultural Walk">Food & Cultural Walk</option>
                <option value="Scenic Viewpoint">Scenic Viewpoint</option>
                <option value="Royal Heritage">Royal Heritage</option>
                <option value="Spiritual & Heritage">Spiritual & Heritage</option>
                <option value="Art & Artifacts">Art & Artifacts</option>
                <option value="Leisure & Relaxation">Leisure & Relaxation</option>
                <option value="Custom Experience">Custom Experience</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Time Slot</label>
              <input
                type="text"
                value={time}
                onChange={e => setTime(e.target.value)}
                placeholder="e.g. 09:00 AM - 11:30 AM"
                className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="e.g. 2.5 hours"
                className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Cost ({currency})</label>
              <input
                type="number"
                min="0"
                step="50"
                value={estimatedCost}
                onChange={e => setEstimatedCost(Number(e.target.value))}
                className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Area</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Amer Road / Old City"
                className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Traveler Note / Local Tip</label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Practical advice, optimal visit time, or booking tips..."
              className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Alternative Option (Optional)</label>
            <input
              type="text"
              value={alternative}
              onChange={e => setAlternative(e.target.value)}
              placeholder="e.g. Albert Hall indoor galleries if crowded"
              className="w-full bg-[#0C111A] border border-amber-500/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-amber-500/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white bg-[#131924] hover:bg-[#1D2638] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
            >
              {initialActivity ? 'Save Changes' : 'Add Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
