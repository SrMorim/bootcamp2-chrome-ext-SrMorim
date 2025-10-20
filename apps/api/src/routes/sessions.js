import express from 'express';

const router = express.Router();

// In-memory storage for sessions
let sessions = [];
let nextId = 1;

/**
 * GET /api/sessions/stats
 * Get statistics about sessions
 * NOTE: Must be before /:id route to avoid conflict
 */
router.get('/stats', (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const stats = {
    total: sessions.length,
    totalMinutes: sessions.reduce((sum, s) => sum + s.duration, 0),
    today: sessions.filter(s => new Date(s.completedAt) >= today).length,
    thisWeek: sessions.filter(s => new Date(s.completedAt) >= weekAgo).length,
    byMode: {
      focus: sessions.filter(s => s.mode === 'focus').length,
      shortBreak: sessions.filter(s => s.mode === 'shortBreak').length,
      longBreak: sessions.filter(s => s.mode === 'longBreak').length
    }
  };

  res.json(stats);
});

/**
 * GET /api/sessions
 * Get all sessions
 */
router.get('/', (req, res) => {
  // Sort by completedAt descending (newest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(b.completedAt) - new Date(a.completedAt);
  });

  res.json(sortedSessions);
});

/**
 * GET /api/sessions/:id
 * Get session by ID
 */
router.get('/:id', (req, res) => {
  const session = sessions.find(s => s.id === req.params.id);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json(session);
});

/**
 * POST /api/sessions
 * Create a new session
 */
router.post('/', (req, res) => {
  const { mode, duration, completedAt } = req.body;

  // Validation
  if (!mode || !duration || !completedAt) {
    return res.status(400).json({
      error: 'Missing required fields: mode, duration, completedAt'
    });
  }

  if (!['focus', 'shortBreak', 'longBreak'].includes(mode)) {
    return res.status(400).json({
      error: 'Invalid mode. Must be: focus, shortBreak, or longBreak'
    });
  }

  if (typeof duration !== 'number' || duration <= 0) {
    return res.status(400).json({
      error: 'Invalid duration. Must be a positive number'
    });
  }

  // Create session
  const session = {
    id: String(nextId++),
    mode,
    duration,
    completedAt,
    createdAt: new Date().toISOString()
  };

  sessions.push(session);

  console.log(`✓ Session created: ${mode} (${duration}min)`);

  res.status(201).json(session);
});

/**
 * DELETE /api/sessions
 * Clear all sessions
 */
router.delete('/', (req, res) => {
  const count = sessions.length;
  sessions = [];
  nextId = 1;

  console.log(`✓ Cleared ${count} sessions`);

  res.json({
    ok: true,
    message: `Cleared ${count} sessions`
  });
});

/**
 * DELETE /api/sessions/:id
 * Delete session by ID
 */
router.delete('/:id', (req, res) => {
  const index = sessions.findIndex(s => s.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const [deleted] = sessions.splice(index, 1);

  console.log(`✓ Session deleted: ${deleted.id}`);

  res.json({
    ok: true,
    message: 'Session deleted',
    session: deleted
  });
});

export default router;
