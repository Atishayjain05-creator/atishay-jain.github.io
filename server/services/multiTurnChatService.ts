import { GoogleGenAI } from '@google/genai';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

export interface ChatMessagePayload {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface MultiTurnChatRequest {
  model?: 'gemini-3.1-flash-lite' | 'gemini-3.5-flash' | 'gemini-3.8-flash';
  systemRole?: 'guide' | 'budget' | 'food';
  destination?: string;
  history: ChatMessagePayload[];
  message: string;
}

const ROLE_PROMPTS = {
  guide: 'You are an authentic, knowledgeable Local Heritage Guide for the destination. Share rich historical anecdotes, hidden architectural nuances, optimal photography timings, and respectful cultural etiquette.',
  budget: 'You are a meticulous Travel Budget & Logistics Strategist. Help travelers optimize routes, eliminate unnecessary booking fees, negotiate fares, and get maximum adventure for their budget.',
  food: 'You are a passionate Epicurean & Street Food Connoisseur. Guide travelers to legendary hundred-year-old sweetshops, authentic hole-in-the-wall regional food stalls, and iconic dinner terraces.'
};

export async function processMultiTurnChat(req: MultiTurnChatRequest) {
  const ai = getAiClient();
  const selectedModel = req.model || 'gemini-3.5-flash';
  const roleInstruction = ROLE_PROMPTS[req.systemRole || 'guide'] + (req.destination ? ` Specifically for ${req.destination}.` : '');

  if (ai) {
    try {
      const contents = [
        ...req.history,
        {
          role: 'user',
          parts: [{ text: req.message }]
        }
      ];

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: roleInstruction,
          temperature: 0.7
        }
      });

      return {
        reply: response.text || 'I am ready to assist with your journey.',
        modelUsed: selectedModel,
        role: req.systemRole || 'guide'
      };
    } catch (err) {
      console.warn('Gemini Chatbot error, falling back:', err);
    }
  }

  // Fallback response
  return {
    reply: `As your ${req.systemRole || 'travel'} specialist: ${req.message.toLowerCase().includes('food') ? 'I recommend trying local kachoris, fresh lassi, and dining at a rooftop courtyard overlooking the city.' : 'I suggest planning visits around morning light and grouping nearby landmarks to save time and energy.'}`,
    modelUsed: selectedModel,
    role: req.systemRole || 'guide'
  };
}
