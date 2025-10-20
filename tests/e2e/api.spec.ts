import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('API Tests', () => {
  test('should return health check', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.version).toBe('2.0.0');
    expect(data.timestamp).toBeDefined();
  });

  test('should return a quote', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/quote`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.content).toBeDefined();
    expect(data.author).toBeDefined();
    expect(typeof data.content).toBe('string');
    expect(typeof data.author).toBe('string');
  });

  test('should create a session', async ({ request }) => {
    const session = {
      mode: 'focus',
      duration: 25,
      completedAt: new Date().toISOString()
    };

    const response = await request.post(`${API_URL}/api/sessions`, {
      data: session
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data.id).toBeDefined();
    expect(data.mode).toBe('focus');
    expect(data.duration).toBe(25);
    expect(data.completedAt).toBe(session.completedAt);
  });

  test('should get all sessions', async ({ request }) => {
    // Create a session first
    await request.post(`${API_URL}/api/sessions`, {
      data: {
        mode: 'focus',
        duration: 25,
        completedAt: new Date().toISOString()
      }
    });

    // Get all sessions
    const response = await request.get(`${API_URL}/api/sessions`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
  });

  test('should get session statistics', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/sessions/stats`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.total).toBeDefined();
    expect(data.totalMinutes).toBeDefined();
    expect(data.today).toBeDefined();
    expect(data.thisWeek).toBeDefined();
    expect(data.byMode).toBeDefined();
    expect(typeof data.total).toBe('number');
  });

  test('should validate session creation', async ({ request }) => {
    // Missing fields
    const response1 = await request.post(`${API_URL}/api/sessions`, {
      data: { mode: 'focus' }
    });
    expect(response1.status()).toBe(400);

    // Invalid mode
    const response2 = await request.post(`${API_URL}/api/sessions`, {
      data: {
        mode: 'invalid',
        duration: 25,
        completedAt: new Date().toISOString()
      }
    });
    expect(response2.status()).toBe(400);

    // Invalid duration
    const response3 = await request.post(`${API_URL}/api/sessions`, {
      data: {
        mode: 'focus',
        duration: -5,
        completedAt: new Date().toISOString()
      }
    });
    expect(response3.status()).toBe(400);
  });

  test('should clear all sessions', async ({ request }) => {
    // Create some sessions
    await request.post(`${API_URL}/api/sessions`, {
      data: {
        mode: 'focus',
        duration: 25,
        completedAt: new Date().toISOString()
      }
    });

    // Clear sessions
    const response = await request.delete(`${API_URL}/api/sessions`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.ok).toBe(true);

    // Verify sessions are cleared
    const sessionsResponse = await request.get(`${API_URL}/api/sessions`);
    const sessions = await sessionsResponse.json();
    expect(sessions.length).toBe(0);
  });
});
