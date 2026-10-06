import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, Sparkles, AlertCircle, Radio } from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  destination
}) => {
  const [connected, setConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<{ sender: 'user' | 'gemini'; text: string }[]>([
    { sender: 'gemini', text: `Hi! I'm TravelMind Live. Ask me anything about ${destination} or your itinerary!` }
  ]);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    if (isOpen) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }
    return () => disconnectWebSocket();
  }, [isOpen]);

  const connectWebSocket = () => {
    setError(null);
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live-voice`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            setError(data.error);
          }
          if (data.text) {
            setTranscripts(prev => [...prev, { sender: 'gemini', text: data.text }]);
          }
          if (data.audio) {
            playAudioChunk(data.audio);
          }
        } catch (e) {
          console.warn('Live voice message parse error:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setError('Live Voice connection error. Check server status.');
      };

      ws.onclose = () => {
        setConnected(false);
      };
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Live Voice server');
    }
  };

  const disconnectWebSocket = () => {
    stopRecording();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  };

  const playAudioChunk = (base64Audio: string) => {
    try {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioCtx = audioContextRef.current;
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.copyToChannel(float32Array, 0);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    } catch (e) {
      console.warn('Playback error:', e);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
        }

        let binary = '';
        const bytes = new Uint8Array(pcm16.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);

        wsRef.current.send(JSON.stringify({ audio: base64Audio }));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
      setIsRecording(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !wsRef.current) return;
    const txt = textInput.trim();
    setTextInput('');
    setTranscripts(prev => [...prev, { sender: 'user', text: txt }]);
    wsRef.current.send(JSON.stringify({ text: txt }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#101520] border border-amber-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/15 flex items-center justify-between bg-[#0C111A]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-center">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base text-white">Live Voice Conversation</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Low-latency real-time voice interaction with Zephyr voice</p>
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
          {/* Animated Voice Orb */}
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="relative">
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
              )}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!connected}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                  isRecording
                    ? 'bg-gradient-to-tr from-rose-500 to-orange-500 shadow-rose-500/30 ring-4 ring-rose-400/40'
                    : 'bg-gradient-to-tr from-amber-400 via-orange-400 to-sky-500 shadow-amber-500/30 hover:scale-105'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-slate-950" />
                )}
              </button>
            </div>

            <div className="mt-4">
              <span className="font-display text-sm font-bold text-white block">
                {isRecording ? 'Listening in real-time...' : 'Tap to Speak'}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                {connected ? 'Connected to Gemini 3.8 Live API' : 'Connecting to Live Server...'}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Live Transcripts Feed */}
          <div className="p-4 rounded-2xl bg-[#0C111A] border border-amber-500/10 max-h-[160px] overflow-y-auto space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Live Conversation Stream:</span>
            {transcripts.map((t, idx) => (
              <div
                key={idx}
                className={`text-xs p-2 rounded-xl ${
                  t.sender === 'user'
                    ? 'bg-amber-500/10 text-amber-200 border border-amber-500/20 ml-auto max-w-[85%]'
                    : 'bg-[#131924] text-slate-200 border border-amber-500/10 mr-auto max-w-[85%]'
                }`}
              >
                <span className="font-bold block text-[10px] text-slate-400">{t.sender === 'user' ? 'You' : 'TravelMind (Zephyr)'}</span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>

          {/* Quick text input fallback */}
          <form onSubmit={handleSendText} className="flex gap-2">
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Or type a question to speak into Live..."
              className="flex-1 bg-[#0C111A] border border-amber-500/20 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || !connected}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all disabled:opacity-40 cursor-pointer"
            >
              Send
            </button>
          </form>
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
