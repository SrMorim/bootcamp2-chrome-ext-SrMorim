import express from 'express';
import cors from 'cors';
import sessionsRouter from './routes/sessions.js';
import { getRandomQuote } from './services/quotes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Bootcamp Pomodoro API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Get motivational quote (proxy to Quotable API)
app.get('/api/quote', async (req, res) => {
  try {
    const quote = await getRandomQuote();
    res.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({
      error: 'Failed to fetch quote',
      fallback: {
        content: 'A persistência é o caminho do êxito.',
        author: 'Charles Chaplin'
      }
    });
  }
});

// Sessions routes
app.use('/api/sessions', sessionsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bootcamp Pomodoro API v2.0.0`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
});
