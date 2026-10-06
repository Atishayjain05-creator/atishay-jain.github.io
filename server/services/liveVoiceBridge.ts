import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export function setupLiveVoiceServer(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: '/live-voice' });

  wss.on('connection', async (clientWs: WebSocket) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      clientWs.send(JSON.stringify({ error: 'GEMINI_API_KEY is not set on the server.' }));
      clientWs.close();
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    try {
      const session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' }
            }
          },
          systemInstruction: 'You are TravelMind Live, an intelligent, enthusiastic real-time voice travel planner. Help travelers navigate destinations, suggest local foods, adjust budgets, and answer cultural questions concisely and naturally.'
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (audio) {
              clientWs.send(JSON.stringify({ audio, text }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            clientWs.send(JSON.stringify({ sessionClosed: true }));
          }
        }
      });

      clientWs.on('message', (rawData) => {
        try {
          const msg = JSON.parse(rawData.toString());
          if (msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' }
            });
          } else if (msg.text) {
            session.sendRealtimeInput({
              text: msg.text
            });
          }
        } catch (e) {
          console.warn('Error handling client live voice message:', e);
        }
      });

      clientWs.on('close', () => {
        try {
          session.close();
        } catch (_) {}
      });
    } catch (err: any) {
      console.warn('Error connecting to Gemini Live API:', err);
      clientWs.send(JSON.stringify({ error: err.message || 'Live API connection error' }));
    }
  });

  console.log('🎙️ Gemini 3.8 Live Voice WebSocket bridge mounted at /live-voice');
}
