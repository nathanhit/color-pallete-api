import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import OpenAI from 'openai';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting for palette endpoints
const rateWindowMs = Number(process.env.RATE_WINDOW_MS) || 60_000; // 1 minute
const rateMax = Number(process.env.RATE_MAX) || 60; // 60 requests per window per IP
const paletteLimiter = rateLimit({
  windowMs: rateWindowMs,
  max: rateMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/palette', paletteLimiter);

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.warn('Warning: OPENAI_API_KEY not set. The /palette endpoint will fail until it is set.');
}
const openai = new OpenAI({ apiKey: openaiApiKey });

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

function normalizeHex(hex) {
  if (typeof hex !== 'string') return null;
  const match = hex.trim().match(/^#?[0-9a-fA-F]{6}$/);
  if (!match) return null;
  const withHash = hex.startsWith('#') ? hex : `#${hex}`;
  return withHash.toUpperCase();
}

function ensureHexArray(value) {
  if (!Array.isArray(value)) return null;
  const cleaned = value.map(normalizeHex).filter(Boolean);
  return cleaned.length ? cleaned : null;
}

async function generatePalette({ text, count }) {
  let desired = Number.isFinite(count) ? Math.round(count) : 5;
  if (desired < 5) desired = 5;
  if (desired > 8) desired = 8;

  const system = [
    'You are a color palette generator.',
    'Return only a JSON object: {"colors": ["#RRGGBB", ...]}.',
    `Exactly ${desired} colors.`,
    'Order strictly: primary, secondary, accent(s), background, high-contrast text.',
    'If fewer than 5 colors, omit background and text and provide only primary, secondary, accent(s).',
    'Colors must be distinct, aesthetically cohesive, and valid 6-digit hex codes (RRGGBB).',
    'Ensure the final two colors (when present) are background then a high-contrast text color that meets WCAG AA readability on that background.',
    'No explanations, no extra fields, no trailing commas.'
  ].join(' ');

  const user = [
    `Generate a color palette that evokes: "${text.trim()}".`,
    'Follow the exact ordering specification above.',
    'Consider cultural and natural associations, but avoid copyrighted brand palettes.',
    'Ensure all hex codes are valid 6-digit values.'
  ].join(' ');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1-nano-2025-04-14',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    return { error: { status: 502, message: 'Model returned empty response' } };
  }

  try {
    const parsed = JSON.parse(content);
    const colors = ensureHexArray(parsed.colors) || [];
    const unique = Array.from(new Set(colors)).slice(0, desired);
    if (unique.length < 3) {
      return { error: { status: 502, message: 'Model returned insufficient valid colors' } };
    }
    return { result: { colors: unique } };
  } catch {
    const matches = content.match(/#?[0-9a-fA-F]{6}\b/g) || [];
    const colors = Array.from(new Set(matches.map(normalizeHex).filter(Boolean))).slice(0, desired);
    if (colors.length >= 3) {
      return { result: { colors } };
    }
    return { error: { status: 502, message: 'Invalid JSON from model' } };
  }
}

app.post('/palette', async (req, res) => {
  try {
    const { text, count } = req.body ?? {};
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'text is required' });
    }
    const { result, error } = await generatePalette({ text, count });
    if (error) return res.status(error.status).json({ error: error.message });
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.get('/palette', async (req, res) => {
  try {
    const text = typeof req.query.text === 'string' ? req.query.text : '';
    const count = req.query.count ? Number(req.query.count) : undefined;
    if (text.trim().length === 0) {
      return res.status(400).json({ error: 'text is required' });
    }
    const { result, error } = await generatePalette({ text, count });
    if (error) return res.status(error.status).json({ error: error.message });
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Color Palette API listening on http://localhost:${port}`);
});
