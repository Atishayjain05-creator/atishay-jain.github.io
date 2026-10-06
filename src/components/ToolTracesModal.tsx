import React from 'react';
import { X, Wrench, Terminal, CheckCircle2, ArrowRight } from 'lucide-react';
import { ToolCallRecord } from '../../shared/types.ts';

interface ToolTracesModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolCalls: ToolCallRecord[];
}

export const ToolTracesModal: React.FC<ToolTracesModalProps> = ({ isOpen, onClose, toolCalls = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#101520] border border-amber-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/15 flex items-center justify-between bg-[#0C111A]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-white">AI Tool Execution Log (Backend Execution)</h3>
              <p className="text-[11px] text-slate-400">Concrete function invocations executed by the backend for Gemma 4</p>
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="p-3.5 rounded-xl bg-[#0C111A]/80 border border-amber-500/15 text-xs text-slate-300">
            <span className="font-bold text-amber-300 block mb-0.5">Architectural Separation of Concerns:</span>
            <p className="text-slate-400 text-[11px]">
              The model requests external or empirical data → The Node.js server executes concrete travel calculators and database lookups → Exact results are fed back into Gemma 4 to formulate the final structured itinerary.
            </p>
          </div>

          <div className="space-y-3">
            {toolCalls.map((tc, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#0C111A] border border-amber-500/15 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-mono font-bold text-amber-300 text-xs">{tc.tool}()</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(tc.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                  {/* Tool Arguments */}
                  <div className="p-2.5 rounded-xl bg-[#131924] border border-amber-500/10 overflow-x-auto">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Inputs (Arguments):</span>
                    <pre className="text-slate-300 whitespace-pre-wrap">{JSON.stringify(tc.args, null, 2)}</pre>
                  </div>

                  {/* Tool Result */}
                  <div className="p-2.5 rounded-xl bg-[#131924] border border-amber-500/10 overflow-x-auto">
                    <span className="text-amber-300 text-[10px] uppercase font-bold block mb-1">Backend Output:</span>
                    <pre className="text-amber-200/90 whitespace-pre-wrap">{JSON.stringify(tc.result, null, 2)}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-amber-500/15 bg-[#0C111A]/70 flex justify-end">
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
