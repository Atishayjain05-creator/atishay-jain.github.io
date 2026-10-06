import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, Trash2, Zap, Compass, Utensils, Wallet } from 'lucide-react';
import { fetchGeminiChat } from '../services/api.ts';

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
}

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  isOpen,
  onClose,
  destination
}) => {
  const [model, setModel] = useState<'gemini-3.1-flash-lite' | 'gemini-3.5-flash' | 'gemini-3.8-flash'>('gemini-3.5-flash');
  const [systemRole, setSystemRole] = useState<'guide' | 'budget' | 'food'>('guide');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'model',
      text: `Hello! I am your dedicated ${destination} specialist. Ask me anything about cultural landmarks, hidden spots, or logistics!`
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: userText
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.text }]
      }));

      const res = await fetchGeminiChat({
        model,
        systemRole,
        destination,
        history: historyPayload,
        message: userText
      });

      setMessages(prev => [
        ...prev,
        {
          id: 'model_' + Date.now(),
          sender: 'model',
          text: res.reply
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'model',
          text: 'Error getting response from Gemini. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'init_new',
        sender: 'model',
        text: `Conversation cleared. I am ready to help with ${destination}.`
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#101520] border border-amber-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/15 flex items-center justify-between bg-[#0C111A]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base text-white">Gemini Multi-Turn Chatbot</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {model}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Conversational thread with customizable role personas for {destination}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Model & Role Selectors */}
        <div className="px-6 py-3 bg-[#0C111A]/60 border-b border-amber-500/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Role pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-semibold">Persona:</span>
            {[
              { id: 'guide', label: 'Local Guide', icon: Compass },
              { id: 'budget', label: 'Budget Master', icon: Wallet },
              { id: 'food', label: 'Culinary Scout', icon: Utensils }
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSystemRole(r.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  systemRole === r.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                    : 'bg-[#131924] text-slate-400 hover:text-white'
                }`}
              >
                <r.icon className="w-3 h-3" />
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {/* Model picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-semibold">Model:</span>
            <select
              value={model}
              onChange={e => setModel(e.target.value as any)}
              className="bg-[#131924] border border-amber-500/20 text-amber-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="gemini-3.1-flash-lite">Fast (3.1 Flash Lite)</option>
              <option value="gemini-3.5-flash">Standard (3.5 Flash)</option>
              <option value="gemini-3.8-flash">Deep Reasoning (3.8 Flash)</option>
            </select>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs sm:text-sm ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'model' && (
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-1 shadow-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-bold rounded-br-none ml-auto'
                    : 'bg-[#161D2B]/95 text-slate-200 border border-amber-500/15 rounded-bl-none whitespace-pre-wrap'
                }`}
              >
                <p>{m.text}</p>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#1D2638] border border-amber-500/20 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 text-xs items-center text-slate-400 p-3 bg-[#0C111A]/80 rounded-2xl border border-amber-500/20 w-fit">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Gemini is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-amber-500/15 bg-[#0C111A]/95 flex items-center gap-2">
          <input
            type="text"
            value={input}
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask your Gemini travel advisor..."
            className="flex-1 bg-[#131924] border border-amber-500/20 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Send className="w-4 h-4 text-slate-950" />
          </button>
        </form>
      </div>
    </div>
  );
};
