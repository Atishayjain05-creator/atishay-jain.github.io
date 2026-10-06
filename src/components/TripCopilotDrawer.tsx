import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Compass,
  User,
  Coffee,
  Utensils,
  ShieldCheck,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { CopilotMessage, TripItinerary } from '../../shared/types.ts';

interface TripCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: CopilotMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  itinerary: TripItinerary;
}

const QUICK_PROMPTS = [
  { label: 'Save on budget', icon: TrendingDown, query: 'Reduce my budget by ₹3,000 without removing top attractions' },
  { label: 'Relaxed pacing', icon: Coffee, query: 'Make Day 2 less tiring with more shaded rest breaks' },
  { label: 'Local food spots', icon: Utensils, query: 'Add authentic local street food institutions to the itinerary' },
  { label: 'Family & kids pace', icon: ShieldCheck, query: 'Make this trip suitable for family with minimal stair climbing' }
];

export const TripCopilotDrawer: React.FC<TripCopilotDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
  itinerary
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    await onSendMessage(msg);
  };

  const handleQuickPrompt = async (query: string) => {
    if (isLoading) return;
    await onSendMessage(query);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#101520] border-l border-white/10 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="px-5 py-4 border-b border-white/[0.08] bg-[#0C111A] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm sm:text-base text-white">Trip Assistant</h3>
            <p className="text-[11px] text-slate-400">Adjust activities, schedule pace, or dining stops</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2.5 bg-[#0C111A]/80 border-b border-white/[0.06] overflow-x-auto flex gap-2 no-scrollbar">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => handleQuickPrompt(qp.query)}
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            <qp.icon className="w-3 h-3 text-amber-400" />
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs sm:text-sm ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender !== 'user' && (
              <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                <Compass className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-amber-400 text-slate-950 font-medium rounded-br-none ml-auto'
                  : 'bg-[#161D2B] text-slate-200 border border-white/10 rounded-bl-none'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {/* Show changes summary bullet list if returned by assistant */}
              {msg.changesSummary && msg.changesSummary.length > 0 && (
                <div className="pt-2 border-t border-white/10 text-xs space-y-1">
                  <span className="font-semibold text-amber-300 block text-[11px]">Updated in Itinerary:</span>
                  {msg.changesSummary.map((change, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{change}</span>
                    </div>
                  ))}
                </div>
              )}

              <span className={`text-[10px] block text-right ${msg.sender === 'user' ? 'text-slate-800' : 'text-slate-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 text-xs items-center text-slate-400 p-3 bg-white/[0.04] rounded-2xl border border-white/10 w-fit">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Updating itinerary and checking transit times...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-[#0C111A] flex items-center gap-2">
        <input
          type="text"
          value={input}
          disabled={isLoading}
          onChange={e => setInput(e.target.value)}
          placeholder="E.g. 'Add a scenic sunset viewpoint' or 'Find cheaper haveli'..."
          className="flex-1 bg-[#131924] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-amber-400/10"
        >
          <Send className="w-4 h-4 text-slate-950" />
        </button>
      </form>
    </div>
  );
};
