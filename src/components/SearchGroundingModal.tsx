import React, { useState } from 'react';
import { X, Search, Globe, Sparkles, ExternalLink, CheckCircle2, ArrowRight } from 'lucide-react';
import { fetchSearchGrounding } from '../services/api.ts';

interface SearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
}

const PRESET_TOPICS = [
  'Current Entry Hours & Ticket Prices',
  'Live Cultural Festivals & Events This Month',
  'Trending Local Cafes & Rooftops',
  'Renovation / Construction Advisories'
];

export const SearchGroundingModal: React.FC<SearchGroundingModalProps> = ({
  isOpen,
  onClose,
  destination
}) => {
  const [topic, setTopic] = useState('Current Entry Hours & Ticket Prices');
  const [customQuery, setCustomQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    answer: string;
    sources: { title: string; url: string }[];
    searchQueries: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (searchTopic: string) => {
    setLoading(true);
    setTopic(searchTopic);
    try {
      const data = await fetchSearchGrounding(destination, searchTopic);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    handleSearch(customQuery.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#101520] border border-amber-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/15 flex items-center justify-between bg-[#0C111A]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base text-white">Google Search Grounding</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  gemini-3.5-flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Live verified information grounded with Google Search data for {destination}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Preset Buttons */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Explore Real-Time Topics:</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TOPICS.map(t => (
                <button
                  key={t}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSearch(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    topic === t && result
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-[#0C111A] border-amber-500/10 text-slate-400 hover:text-white hover:border-amber-500/30'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Search Input */}
          <form onSubmit={handleCustomSubmit} className="flex gap-2">
            <input
              type="text"
              value={customQuery}
              onChange={e => setCustomQuery(e.target.value)}
              placeholder="Ask anything live (e.g. 'Is Amber Fort open at night this week?')..."
              className="flex-1 bg-[#0C111A] border border-amber-500/20 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!customQuery.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>

          {/* Loading Animation */}
          {loading && (
            <div className="p-8 text-center space-y-3 bg-[#0C111A]/60 rounded-2xl border border-amber-500/15">
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-medium">
                Gemini 3.5 Flash is executing Google Search tool and grounding results...
              </p>
            </div>
          )}

          {/* Grounded Result Display */}
          {result && !loading && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-[#0C111A] border border-amber-500/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Search Grounded Intel for {destination}</span>
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {result.answer}
                </div>

                {/* Google Search Queries */}
                {result.searchQueries && result.searchQueries.length > 0 && (
                  <div className="pt-2 border-t border-amber-500/10">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Google Queries Used:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.searchQueries.map((q, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-[#131924] text-slate-400 border border-amber-500/10">
                          🔍 {q}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Sources */}
                {result.sources && result.sources.length > 0 && (
                  <div className="pt-2 border-t border-amber-500/10 space-y-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Grounding Sources & Citations:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-[#131924] hover:bg-[#1A2232] border border-amber-500/10 hover:border-amber-400/30 text-xs flex items-center justify-between text-amber-300 transition-all group"
                        >
                          <span className="truncate mr-2 text-[11px]">{s.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-amber-500/15 bg-[#0C111A]/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white bg-[#131924] hover:bg-[#1D2638] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
