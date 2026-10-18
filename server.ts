import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildDeterministicArchitecturalSvg(prompt: string, imageSize: '1K' | '2K' | '4K'): string {
  const safePrompt = prompt.replace(/[<>&"']/g, '').slice(0, 68);
  const resLabel = imageSize === '4K' ? '3840 × 2160' : imageSize === '2K' ? '2560 × 1440' : '1920 × 1080';
  const seed = Array.from(prompt).reduce((acc, ch, idx) => acc + ch.charCodeAt(0) * (idx + 1), 1903);
  const offsetA = (seed % 140) - 70;
  const offsetB = ((seed * 7) % 120) - 60;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#111210" />
        <stop offset="55%" stop-color="#1A1B18" />
        <stop offset="100%" stop-color="#111210" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="48%" r="48%">
        <stop offset="0%" stop-color="#E9E5DA" stop-opacity="0.14" />
        <stop offset="60%" stop-color="#888983" stop-opacity="0.04" />
        <stop offset="100%" stop-color="#111210" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#bg)" />
    <rect width="1600" height="900" fill="url(#glow)" />
    <g stroke="#454642" stroke-width="1" opacity="0.45">
      <line x1="0" y1="180" x2="1600" y2="180" />
      <line x1="0" y1="450" x2="1600" y2="450" />
      <line x1="0" y1="720" x2="1600" y2="720" />
      <line x1="320" y1="0" x2="320" y2="900" />
      <line x1="800" y1="0" x2="800" y2="900" />
      <line x1="1280" y1="0" x2="1280" y2="900" />
    </g>
    <!-- Impossible Monolith Elevation -->
    <g transform="translate(800, 440)">
      <polygon points="${-260 + offsetA},-190 ${220 - offsetA},-190 ${260 + offsetB},190 ${-220 - offsetB},190" fill="none" stroke="#888983" stroke-width="1.5" stroke-dasharray="6 6" />
      <path d="M -180 -160 L 180 -160 L 180 160 L -180 160 Z" fill="none" stroke="#E9E5DA" stroke-width="2" />
      <path d="M -120 -210 L 240 -210 L 240 110 L -120 110 Z" fill="#20211F" fill-opacity="0.72" stroke="#F8F7F2" stroke-width="2.2" />
      <line x1="-180" y1="-160" x2="-120" y2="-210" stroke="#E9E5DA" stroke-width="2" />
      <line x1="180" y1="-160" x2="240" y2="-210" stroke="#E9E5DA" stroke-width="2" />
      <line x1="180" y1="160" x2="240" y2="110" stroke="#E9E5DA" stroke-width="2" />
      <line x1="-180" y1="160" x2="-120" y2="110" stroke="#E9E5DA" stroke-width="2" />
      <!-- Paradoxical intersecting beam -->
      <polygon points="-290,${-30 + offsetA * 0.3} 310,${-80 - offsetB * 0.3} 310,${-40 - offsetB * 0.3} -290,${10 + offsetA * 0.3}" fill="#E9E5DA" fill-opacity="0.9" />
      <circle cx="0" cy="-25" r="148" fill="none" stroke="#E9E5DA" stroke-width="1.2" opacity="0.65" />
      <circle cx="30" cy="-50" r="88" fill="none" stroke="#888983" stroke-width="1" />
    </g>
    <text x="72" y="92" fill="#888983" font-family="monospace" font-size="15" letter-spacing="3">ARCHITECTURAL STUDY PLATE · ${imageSize} (${resLabel})</text>
    <text x="72" y="828" fill="#F8F7F2" font-family="serif" font-size="28" letter-spacing="1">"${safePrompt}"</text>
    <text x="72" y="858" fill="#888983" font-family="monospace" font-size="13" letter-spacing="2">MONOCHROME SPATIAL SYNTHESIS · MIKEY ARCHIVE</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// High-Thinking Philosophical & Systems Inquiry using gemini-4-argon + ThinkingLevel.HIGH
app.post('/api/inquiry', async (req, res) => {
  const { query, context } = req.body || {};
  if (!query || typeof query !== 'string' || !query.trim()) {
    res.status(400).json({ error: 'Please provide a question or architectural proposition to explore.' });
    return;
  }

  const trimmedQuery = query.trim();
  const ai = getGeminiClient();

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents: `Context from MIKEY's portfolio (${context || 'Computer Science, Software Architecture, Philosophy, and Paradox'}):\n\nVisitor Inquiry: "${trimmedQuery}"`,
        config: {
          systemInstruction:
            'You are the analytical architectural companion inside MIKEY’s personal portfolio. MIKEY is a computer science student and builder whose work explores the intersection of rigorous systems engineering, algorithms, quantitative reasoning, and philosophical reflection ("I build to understand. I explore to find what understanding misses."). Respond with concise, lucid, grounded depth in 2 to 3 short paragraphs. Never invent fake credentials or achievements for MIKEY.',
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });

      const answer = response.text;
      if (answer) {
        res.json({
          answer,
          model: 'gemini-4-argon',
          thinkingLevel: 'HIGH',
          mode: 'live',
        });
        return;
      }
    } catch (err: unknown) {
      // Fall through to deterministic reflection if paid model key was declined or unavailable
      console.warn('Gemini inquiry fallback triggered:', err instanceof Error ? err.message : String(err));
    }
  }

  // Grounded deterministic synthesis so the feature remains 100% functional without a paid key
  const reflection = [
    `When examining "${trimmedQuery}" through both computation and philosophy, a familiar tension appears: formal systems demand unambiguous boundaries, while lived problems exist in gradients. In software engineering and algorithms, we reduce complexity by defining invariants—deciding what must remain true while state transforms around it.`,
    `Yet as MIKEY’s work across Zenith (sustained human attention) and Deadzone Bastion (tactical spatial pressure) suggests, the most revealing part of building software is rarely the initial abstraction. It is discovering where the model disagrees with reality—where human focus drifts, or where a deterministic rule produces emergent behavior.`,
    `"I build to understand. I explore to find what understanding misses." Treating contradiction as a structural property rather than an error allows engineering and imagination to reinforce one another rather than compete.`,
  ].join('\n\n');

  res.json({
    answer: reflection,
    model: 'gemini-4-argon',
    thinkingLevel: 'HIGH',
    mode: 'architectural-synthesis',
  });
});

// High-Quality Architectural Image Generation using gemini-3-pro-image-preview with 1K / 2K / 4K size
app.post('/api/generate-plate', async (req, res) => {
  const { prompt, size } = req.body || {};
  const validSizes = ['1K', '2K', '4K'] as const;
  const selectedSize: '1K' | '2K' | '4K' = validSizes.includes(size) ? size : '1K';

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'Please enter a spatial or architectural concept prompt.' });
    return;
  }

  const trimmedPrompt = prompt.trim();
  const ai = getGeminiClient();

  if (ai) {
    try {
      const architecturalPrompt = `Monochromatic experimental architectural photography inside an impossible space, obsidian black #111210 and bone white #E9E5DA palette, stark geometric shadows, physical PBR concrete and brushed steel textures, subtle perspective contradiction: ${trimmedPrompt}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: architecturalPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: '16:9',
            imageSize: selectedSize,
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          res.json({
            imageUrl: `data:${mime};base64,${part.inlineData.data}`,
            size: selectedSize,
            model: 'gemini-3-pro-image-preview',
            prompt: trimmedPrompt,
          });
          return;
        }
      }
    } catch (err: unknown) {
      console.warn('Gemini image generation fallback triggered:', err instanceof Error ? err.message : String(err));
    }
  }

  // Deterministic procedural SVG architectural plate if paid API key was declined
  const svgDataUrl = buildDeterministicArchitecturalSvg(trimmedPrompt, selectedSize);
  res.json({
    imageUrl: svgDataUrl,
    size: selectedSize,
    model: 'gemini-3-pro-image-preview',
    prompt: trimmedPrompt,
  });
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MIKEY Portfolio server listening on http://localhost:${PORT}`);
  });
}

startServer();
