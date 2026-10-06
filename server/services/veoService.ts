import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import { Response } from 'express';

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

export async function startImageToVideo(
  imageBase64: string,
  mimeType: string,
  prompt: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<{ operationName: string }> {
  const ai = getAiClient();
  if (!ai) throw new Error('GEMINI_API_KEY is not configured on the server.');

  const operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || 'Cinematic smooth pan across the scenic travel destination, golden hour light, beautiful realism',
    image: {
      imageBytes: imageBase64,
      mimeType: mimeType || 'image/jpeg'
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio
    }
  });

  return { operationName: operation.name || '' };
}

export async function checkVideoStatus(operationName: string): Promise<{ done: boolean; error?: any }> {
  const ai = getAiClient();
  if (!ai) throw new Error('GEMINI_API_KEY is not configured.');

  const op = new GenerateVideosOperation();
  op.name = operationName;
  const updated = await ai.operations.getVideosOperation({ operation: op });

  return {
    done: !!updated.done,
    error: updated.error
  };
}

export async function streamVideoDownload(operationName: string, res: Response) {
  const ai = getAiClient();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!ai || !apiKey) throw new Error('GEMINI_API_KEY not configured.');

  const op = new GenerateVideosOperation();
  op.name = operationName;
  const updated = await ai.operations.getVideosOperation({ operation: op });

  const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
  if (!uri) throw new Error('Video URI not found in completed operation.');

  const videoRes = await fetch(uri, {
    headers: { 'x-goog-api-key': apiKey }
  });

  res.setHeader('Content-Type', 'video/mp4');
  if (videoRes.body) {
    const reader = videoRes.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } else {
    res.status(500).send('Failed to read video stream');
  }
}
