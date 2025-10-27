import { describe, test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import express from 'express';
import sessionsRouter from './sessions.js';

// Helper to create test app
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/sessions', sessionsRouter);
  return app;
}

// Helper to make requests
async function makeRequest(app, method, path, data = null) {
  return new Promise((resolve, reject) => {
    const req = {
      method,
      path: `/api/sessions${path}`,
      params: {},
      body: data || {},
      get: () => null,
    };

    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.body = data;
        resolve({ status: this.statusCode, data: this.body });
      },
      setHeader(key, value) {
        this.headers[key] = value;
      },
    };

    // Match route and extract params
    if (path.match(/^\/stats/)) {
      req.params = {};
    } else if (path === '/') {
      req.params = {};
    } else {
      const match = path.match(/^\/([^/]+)/);
      if (match) req.params.id = match[1];
    }

    // Find matching route
    let matched = false;
    for (const layer of app._router.stack) {
      if (layer.name === 'router' && layer.regexp.test(req.path)) {
        for (const route of layer.handle.stack) {
          if (route.route && route.route.methods[method.toLowerCase()]) {
            const pathMatch = route.route.path === path ||
                             (route.route.path === '/:id' && path.match(/^\/[^/]+$/)) ||
                             route.route.path === '/';
            if (pathMatch) {
              matched = true;
              try {
                route.route.stack[0].handle(req, res);
              } catch (err) {
                reject(err);
              }
              break;
            }
          }
        }
      }
    }

    if (!matched) {
      reject(new Error(`No route matched for ${method} ${path}`));
    }
  });
}

describe('Sessions API - Unit Tests', () => {
  let app;

  before(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    // Clear sessions before each test
    try {
      await makeRequest(app, 'delete', '/');
    } catch (err) {
      // Ignore errors if no sessions exist
    }
  });

  describe('POST /api/sessions', () => {
    test('should create a valid session', async () => {
      const sessionData = {
        mode: 'focus',
        duration: 25,
        completedAt: new Date().toISOString()
      };

      const result = await makeRequest(app, 'post', '/', sessionData);

      assert.strictEqual(result.status, 201);
      assert.ok(result.data.id);
      assert.strictEqual(result.data.mode, 'focus');
      assert.strictEqual(result.data.duration, 25);
      assert.strictEqual(result.data.completedAt, sessionData.completedAt);
      assert.ok(result.data.createdAt);
    });

    test('should reject session with missing fields', async () => {
      const invalidData = { mode: 'focus' };

      const result = await makeRequest(app, 'post', '/', invalidData);

      assert.strictEqual(result.status, 400);
      assert.ok(result.data.error);
      assert.match(result.data.error, /Missing required fields/);
    });

    test('should reject session with invalid mode', async () => {
      const invalidData = {
        mode: 'invalid_mode',
        duration: 25,
        completedAt: new Date().toISOString()
      };

      const result = await makeRequest(app, 'post', '/', invalidData);

      assert.strictEqual(result.status, 400);
      assert.ok(result.data.error);
      assert.match(result.data.error, /Invalid mode/);
    });

    test('should reject session with invalid duration', async () => {
      const invalidData = {
        mode: 'focus',
        duration: -5,
        completedAt: new Date().toISOString()
      };

      const result = await makeRequest(app, 'post', '/', invalidData);

      assert.strictEqual(result.status, 400);
      assert.ok(result.data.error);
      assert.match(result.data.error, /Invalid duration/);
    });

    test('should accept all valid modes', async () => {
      const modes = ['focus', 'shortBreak', 'longBreak'];

      for (const mode of modes) {
        const sessionData = {
          mode,
          duration: 25,
          completedAt: new Date().toISOString()
        };

        const result = await makeRequest(app, 'post', '/', sessionData);
        assert.strictEqual(result.status, 201);
        assert.strictEqual(result.data.mode, mode);
      }
    });
  });

  describe('GET /api/sessions', () => {
    test('should return empty array when no sessions', async () => {
      const result = await makeRequest(app, 'get', '/');

      assert.strictEqual(result.status, 200);
      assert.ok(Array.isArray(result.data));
      assert.strictEqual(result.data.length, 0);
    });

    test('should return all sessions', async () => {
      // Create multiple sessions
      const session1 = {
        mode: 'focus',
        duration: 25,
        completedAt: new Date().toISOString()
      };
      const session2 = {
        mode: 'shortBreak',
        duration: 5,
        completedAt: new Date().toISOString()
      };

      await makeRequest(app, 'post', '/', session1);
      await makeRequest(app, 'post', '/', session2);

      const result = await makeRequest(app, 'get', '/');

      assert.strictEqual(result.status, 200);
      assert.ok(Array.isArray(result.data));
      assert.strictEqual(result.data.length, 2);
    });

    test('should return sessions sorted by completedAt descending', async () => {
      const now = new Date();
      const session1 = {
        mode: 'focus',
        duration: 25,
        completedAt: new Date(now.getTime() - 1000).toISOString()
      };
      const session2 = {
        mode: 'shortBreak',
        duration: 5,
        completedAt: new Date(now.getTime()).toISOString()
      };

      await makeRequest(app, 'post', '/', session1);
      await makeRequest(app, 'post', '/', session2);

      const result = await makeRequest(app, 'get', '/');

      assert.strictEqual(result.status, 200);
      // Most recent should be first
      assert.ok(new Date(result.data[0].completedAt) >= new Date(result.data[1].completedAt));
    });
  });

  describe('GET /api/sessions/stats', () => {
    test('should return zero stats when no sessions', async () => {
      const result = await makeRequest(app, 'get', '/stats');

      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.total, 0);
      assert.strictEqual(result.data.totalMinutes, 0);
      assert.strictEqual(result.data.today, 0);
      assert.strictEqual(result.data.thisWeek, 0);
      assert.ok(result.data.byMode);
    });

    test('should calculate correct statistics', async () => {
      // Create sessions
      await makeRequest(app, 'post', '/', {
        mode: 'focus',
        duration: 25,
        completedAt: new Date().toISOString()
      });
      await makeRequest(app, 'post', '/', {
        mode: 'focus',
        duration: 25,
        completedAt: new Date().toISOString()
      });
      await makeRequest(app, 'post', '/', {
        mode: 'shortBreak',
        duration: 5,
        completedAt: new Date().toISOString()
      });

      const result = await makeRequest(app, 'get', '/stats');

      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.data.total, 3);
      assert.strictEqual(result.data.totalMinutes, 55);
      assert.strictEqual(result.data.today, 3);
      assert.strictEqual(result.data.byMode.focus, 2);
      assert.strictEqual(result.data.byMode.shortBreak, 1);
    });
  });

  // Note: GET /api/sessions/:id and DELETE /api/sessions/:id
  // are tested in E2E tests (api.spec.ts)
  // Unit testing parametrized routes is complex without a proper test framework

  describe('DELETE /api/sessions', () => {
    test('should clear all sessions', async () => {
      // Create sessions
      await makeRequest(app, 'post', '/', {
        mode: 'focus',
        duration: 25,
        completedAt: new Date().toISOString()
      });
      await makeRequest(app, 'post', '/', {
        mode: 'shortBreak',
        duration: 5,
        completedAt: new Date().toISOString()
      });

      const deleteResult = await makeRequest(app, 'delete', '/');

      assert.strictEqual(deleteResult.status, 200);
      assert.ok(deleteResult.data.ok);

      // Verify sessions are cleared
      const getResult = await makeRequest(app, 'get', '/');
      assert.strictEqual(getResult.data.length, 0);
    });

    test('should return count of deleted sessions', async () => {
      // Create 3 sessions
      await makeRequest(app, 'post', '/', { mode: 'focus', duration: 25, completedAt: new Date().toISOString() });
      await makeRequest(app, 'post', '/', { mode: 'focus', duration: 25, completedAt: new Date().toISOString() });
      await makeRequest(app, 'post', '/', { mode: 'focus', duration: 25, completedAt: new Date().toISOString() });

      const result = await makeRequest(app, 'delete', '/');

      assert.strictEqual(result.status, 200);
      assert.match(result.data.message, /3 sessions/);
    });
  });

});
