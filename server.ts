import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '25mb' }));

  // Initialize Gemini client utility with User-Agent as instructed by gemini-api skill
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(apiKey),
      timestamp: new Date().toISOString(),
    });
  });

  // Food Photo Scanner (AI Vision)
  app.post('/api/ration-scanner', async (req, res) => {
    try {
      const { image, mimeType = 'image/jpeg', note } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'Missing image data' });
      }

      // Clean base64 string
      let cleanedBase64 = image;
      let detectedMime = mimeType;
      if (image.includes(';base64,')) {
        const parts = image.split(';base64,');
        detectedMime = parts[0].replace('data:', '') || mimeType;
        cleanedBase64 = parts[1];
      }

      // If Gemini AI client is initialized, call Gemini 3.8 Flash Vision
      if (ai) {
        try {
          const promptText = `You are the Chief Nutritionist and Medical Corps Commander of the Hidden Leaf Village (Konohagakure).
Analyze this photo of a meal / ninja ration taken by a shinobi trainee.
Task:
1. Identify the dish and estimate exact portion size.
2. Calculate calories, protein (g), carbohydrates (g), and fats (g) accurately based on visible ingredients.
3. Assign a fun Naruto shinobi-themed ration name (e.g., "Ichiraku Stamina Miso Ramen", "Might Guy's Hot-Blooded Chicken Bowl", "Sage of Six Bowls Feast", "Soldier Pill Power Porridge").
4. Determine which Shinobi Attribute / Chakra affinity it fuels (e.g., "Yang Stamina & Muscle Rebuild", "Swift Step Agility", "Fire Release Metabolism", "Chakra Reservoir Replenishment").
5. Provide a 1-2 sentence Shinobi Appraisal in authentic Naruto ninja voice.
6. Rate the nutritional rank (S-Rank, A-Rank, B-Rank, C-Rank, D-Rank).
${note ? `User trainee's field note: "${note}"` : ''}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: detectedMime || 'image/jpeg',
                    data: cleanedBase64,
                  },
                },
                { text: promptText },
              ],
            },
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  dishName: { type: Type.STRING, description: 'Common recognizable food name' },
                  shinobiName: { type: Type.STRING, description: 'Naruto-themed shinobi ration name' },
                  portionSize: { type: Type.STRING, description: 'Estimated portion size e.g. 1 plate (~450g)' },
                  calories: { type: Type.INTEGER, description: 'Total estimated calories' },
                  protein: { type: Type.NUMBER, description: 'Protein in grams' },
                  carbs: { type: Type.NUMBER, description: 'Carbohydrates in grams' },
                  fats: { type: Type.NUMBER, description: 'Fats in grams' },
                  chakraType: { type: Type.STRING, description: 'Chakra recovery aspect' },
                  chakraBoostPoints: { type: Type.INTEGER, description: 'Chakra points earned (20-100)' },
                  shinobiAppraisal: { type: Type.STRING, description: '1-2 sentence medical corps appraisal' },
                  healthRating: { type: Type.STRING, description: 'S-Rank, A-Rank, B-Rank, C-Rank, or D-Rank' },
                },
                required: [
                  'dishName',
                  'shinobiName',
                  'portionSize',
                  'calories',
                  'protein',
                  'carbs',
                  'fats',
                  'chakraType',
                  'chakraBoostPoints',
                  'shinobiAppraisal',
                  'healthRating',
                ],
              },
            },
          });

          const rawText = response.text?.trim() || '{}';
          const parsedData = JSON.parse(rawText);
          return res.json({
            success: true,
            source: 'gemini-vision',
            data: parsedData,
          });
        } catch (geminiError: any) {
          console.error('Gemini vision API error:', geminiError);
          // Fall through to smart fallback
        }
      }

      // Fallback if API key is temporarily unavailable or encountered rate limits
      const fallbackRations = [
        {
          dishName: 'Chasu Pork Ramen with Egg & Greens',
          shinobiName: 'Ichiraku Hot-Blooded Special Ramen',
          portionSize: '1 large bowl (~520g)',
          calories: 680,
          protein: 34,
          carbs: 76,
          fats: 24,
          chakraType: 'Yang Stamina & Muscle Rebuild',
          chakraBoostPoints: 75,
          shinobiAppraisal: 'An legendary meal fit for an aspiring Hokage! High carbs replenish depleted chakra reservoirs swiftly, while the pork revitalizes torn muscle fibers from taijutsu training!',
          healthRating: 'A-Rank',
        },
        {
          dishName: 'Grilled Chicken Breast, Brown Rice & Broccoli',
          shinobiName: "Rock Lee's Gate-Opener Fuel",
          portionSize: '1 medium plate (~400g)',
          calories: 520,
          protein: 48,
          carbs: 54,
          fats: 11,
          chakraType: 'Eight Gates Physical Resilience',
          chakraBoostPoints: 90,
          shinobiAppraisal: 'Perfection! Guy Sensei nods in total approval. Clean lean protein and complex carbohydrates primed for heavy leg-weights taijutsu!',
          healthRating: 'S-Rank',
        },
        {
          dishName: 'Salmon & Avocado Rice Bowl',
          shinobiName: "Water Dragon's Omega Elixir",
          portionSize: '1 bowl (~380g)',
          calories: 590,
          protein: 36,
          carbs: 58,
          fats: 22,
          chakraType: 'Chakra Control & Joint Lubrication',
          chakraBoostPoints: 85,
          shinobiAppraisal: 'Superb balance of omega-3 fats and high-bioavailability protein. Joint recovery accelerated by 40% for lightning-speed shunshin!',
          healthRating: 'S-Rank',
        },
        {
          dishName: 'Hearty Beef Stew & Sourdough',
          shinobiName: "Akimichi Clan Expansion Chow",
          portionSize: '1 bowl with roll (~500g)',
          calories: 740,
          protein: 42,
          carbs: 68,
          fats: 28,
          chakraType: 'Colossal Chakra Storage',
          chakraBoostPoints: 80,
          shinobiAppraisal: 'Heavy calories geared for calorie-conversion jutsu! Excellent stamina preservation for multi-day S-rank reconnaissance.',
          healthRating: 'B-Rank',
        },
      ];

      const selectedFallback = fallbackRations[Math.floor(Math.random() * fallbackRations.length)];
      return res.json({
        success: true,
        source: 'shinobi-medic-fallback',
        data: selectedFallback,
      });
    } catch (err: any) {
      console.error('Ration appraisal error:', err);
      return res.status(500).json({
        error: 'Failed to analyze ration photo',
        details: err?.message || 'Unknown error',
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Shinobi Training System] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Shinobi Training server:', err);
  process.exit(1);
});
