import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '20mb' }));

// Memory cache for video buffers to avoid repeated fetches
const videoCache = new Map<string, { buffer: Buffer; contentType: string }>();

// Shared Gemini SDK client instance
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Start Veo 3 Video Generation
app.post('/api/generate-video', async (req, res) => {
  try {
    const {
      prompt,
      aspectRatio = '16:9',
      resolution = '720p',
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string.' });
    }

    const ai = getAiClient();

    // Veo 3 fast generate model required: 'veo-3.1-fast-generate-preview'
    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt.trim(),
      config: {
        numberOfVideos: 1,
        resolution: resolution === '1080p' ? '1080p' : '720p',
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
      },
    });

    console.log(`[Veo 3] Video generation initiated. Operation: ${operation.name}`);
    return res.json({
      success: true,
      operationName: operation.name,
      model: 'veo-3.1-fast-generate-preview',
      aspectRatio,
      resolution,
    });
  } catch (error: any) {
    console.error('[Veo 3] Error starting video generation:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to initiate video generation with Veo 3.',
    });
  }
});

// Poll Veo 3 Video Operation Status
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required.' });
    }

    const ai = getAiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    const hasVideo = !!(updated.response?.generatedVideos?.[0]?.video?.uri);

    return res.json({
      done: Boolean(updated.done),
      error: updated.error || null,
      metadata: updated.metadata || null,
      hasVideo,
    });
  } catch (error: any) {
    console.error('[Veo 3] Error polling video status:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to fetch video generation status.',
    });
  }
});

// Download Video (POST pattern as documented in Google GenAI SDK guidelines)
app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    // Check memory cache first
    const cached = videoCache.get(operationName);
    if (cached) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Content-Length', cached.buffer.length);
      return res.send(cached.buffer);
    }

    const ai = getAiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ error: 'Video URI not found in operation result.' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      const errText = await videoRes.text();
      return res.status(videoRes.status).json({
        error: `Failed to fetch video stream: ${errText}`,
      });
    }

    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cache the video
    videoCache.set(operationName, { buffer, contentType: 'video/mp4' });

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', 'attachment; filename="tamil-ai-scene.mp4"');
    return res.send(buffer);
  } catch (error: any) {
    console.error('[Veo 3] Error downloading video:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to download video.',
    });
  }
});

// Stream Video direct to HTML5 video player
app.get('/api/video-stream', async (req, res) => {
  try {
    const operationName = req.query.operationName as string;
    if (!operationName) {
      return res.status(400).send('operationName query parameter is required.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).send('GEMINI_API_KEY is not configured.');
    }

    // Check memory cache
    const cached = videoCache.get(operationName);
    if (cached) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Content-Length', cached.buffer.length);
      return res.send(cached.buffer);
    }

    const ai = getAiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).send('Video URI not found or video generation not finished.');
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      const errText = await videoRes.text();
      return res.status(videoRes.status).send(`Failed to stream video: ${errText}`);
    }

    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    videoCache.set(operationName, { buffer, contentType: 'video/mp4' });

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (error: any) {
    console.error('[Veo 3] Error streaming video:', error);
    return res.status(500).send(error?.message || 'Error streaming video');
  }
});

// Tamil Voice-over Audio generation via Gemini TTS
app.post('/api/generate-voiceover', async (req, res) => {
  try {
    const { text, voiceName = 'Fenrir', style = 'Clear, engaging conversational Tamil speaker' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for voice-over generation.' });
    }

    const ai = getAiClient();

    // Use Gemini 3.8 Flash Lite TTS as recommended for standard audio dubbing/localization
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from speech synthesis.' });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('[TTS] Error generating voiceover:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to synthesize voice-over audio.',
    });
  }
});

// AI Scene Director / Script Generator powered by gemini-3.8-flash
app.post('/api/ai-assist', async (req, res) => {
  try {
    const { prompt, currentScene, requestType } = req.body;
    const ai = getAiClient();

    const systemInstruction = `You are an expert Tamil cinema director and AI video producer specialized in creating prompts for Google Veo 3 ('veo-3.1-fast-generate-preview').
Your specialty is maintaining strict "character_identity" lock and "environment_lock" across scenes, crafting authentic colloquial Tamil voice-overs with natural English loanwords ("Online-ல", "Buy பட்டனை"), and outputting structured JSON scenes.

Return a valid JSON object matching this schema:
{
  "language": "Tamil",
  "scene_title": "string",
  "voice_over": "Tamil voiceover text with English loan words if colloquial",
  "voice_over_english_meaning": "English translation for reference",
  "character_identity": "Full character lock description",
  "environment_lock": "Full environment lock description",
  "character_action": "Precise character action in the scene",
  "camera_movement": "Cinematic camera movement",
  "lighting_and_atmosphere": "Lighting and color grading",
  "suggested_aspect_ratio": "16:9" | "9:16"
}`;

    let userMessage = '';
    if (requestType === 'next_tip') {
      userMessage = `Based on current scene 1 where Arjun says: "Online-ல ஏதாவது வாங்கப் போறீங்களா? ஒரு நிமிஷம்… உடனே Buy பட்டனை அழுத்தாதீங்க. வாங்குறதுக்கு முன்னாடி இந்த மூணு விஷயத்தை செக் பண்ணுங்க."
Generate the next scene (Scene 2 - Tip #1: Check Seller Ratings and Fake Review patterns).
Keep the exact character Arjun (28-year-old Tamil Indian man, dark-blue casual shirt, black trousers, neat beard) and exact environment lock (modern Indian home dining table, beige walls, indoor plant).
Make character action show Arjun tapping the seller profile, zooming in on reviews with an analytical look.`;
    } else if (requestType === 'refine') {
      userMessage = `Refine and optimize this scene configuration for Veo 3: ${JSON.stringify(currentScene)}. Make the prompt even more photorealistic, cinema-grade, and keep the Tamil voiceover crisp.`;
    } else {
      userMessage = prompt || 'Create an engaging Tamil shopping advice scene for Veo 3';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, scene: parsed });
  } catch (error: any) {
    console.error('[AI Assist] Error generating scene:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate scene assistance.',
    });
  }
});

// Mount Vite or serve static files
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tamil Veo 3 Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
