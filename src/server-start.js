// Server startup file - separated to avoid import issues
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { generatePalette } from './server.js';

export function startServer() {
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

  // Server routes
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

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
}

// If run directly, start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
