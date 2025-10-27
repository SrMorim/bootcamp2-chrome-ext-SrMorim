import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:8080';

test.describe('PWA Tests', () => {
  test('should load PWA homepage', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/Bootcamp Pomodoro/);

    // Check header
    const header = page.locator('header h1');
    await expect(header).toContainText('Bootcamp Pomodoro');
  });

  test('should have valid manifest', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check manifest link (Vite-PWA injects it automatically)
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);

    // Check if manifest is accessible
    const manifestResponse = await page.request.get(`${BASE_URL}/manifest.webmanifest`);
    expect(manifestResponse.ok()).toBeTruthy();

    const manifest = await manifestResponse.json();
    expect(manifest.name).toBe('Bootcamp Pomodoro PWA');
    expect(manifest.short_name).toBe('PomoPWA');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('should register service worker', async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for service worker registration
    await page.waitForTimeout(2000);

    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined;
      }
      return false;
    });

    expect(swRegistered).toBeTruthy();
  });

  test('should display timer with initial state', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check timer display
    const timerDisplay = page.locator('#timerDisplay');
    await expect(timerDisplay).toBeVisible();
    await expect(timerDisplay).toHaveText('25:00');

    // Check mode display
    const modeDisplay = page.locator('#modeDisplay');
    await expect(modeDisplay).toBeVisible();
    await expect(modeDisplay).toHaveText('Foco');

    // Check session count
    const sessionCount = page.locator('#sessionCount');
    await expect(sessionCount).toHaveText('0');
  });

  test('should start and pause timer', async ({ page }) => {
    await page.goto(BASE_URL);

    // Start timer
    const startBtn = page.locator('#startBtn');
    await startBtn.click();

    // Wait for timer to count down
    await page.waitForTimeout(2000);

    // Check timer changed
    const timerDisplay = page.locator('#timerDisplay');
    const timerText = await timerDisplay.textContent();
    expect(timerText).not.toBe('25:00');

    // Check start button is disabled
    await expect(startBtn).toBeDisabled();

    // Check pause button is enabled
    const pauseBtn = page.locator('#pauseBtn');
    await expect(pauseBtn).toBeEnabled();

    // Pause timer
    await pauseBtn.click();

    // Check pause button is disabled
    await expect(pauseBtn).toBeDisabled();
    await expect(startBtn).toBeEnabled();
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.goto(BASE_URL);

    // Navigate to history tab
    const historyTab = page.locator('.nav-btn[data-tab="history"]');
    await historyTab.click();

    // Check history content is visible
    const historyContent = page.locator('#historyTab');
    await expect(historyContent).toBeVisible();

    // Check stats are displayed
    const totalSessions = page.locator('#totalSessions');
    await expect(totalSessions).toBeVisible();

    // Navigate to settings tab
    const settingsTab = page.locator('.nav-btn[data-tab="settings"]');
    await settingsTab.click();

    // Check settings content is visible
    const settingsContent = page.locator('#settingsTab');
    await expect(settingsContent).toBeVisible();

    // Check settings form is present
    const settingsForm = page.locator('.settings-form');
    await expect(settingsForm).toBeVisible();

    // Navigate back to timer
    const timerTab = page.locator('.nav-btn[data-tab="timer"]');
    await timerTab.click();

    // Check timer is visible
    const timerDisplay = page.locator('#timerDisplay');
    await expect(timerDisplay).toBeVisible();
  });

  test('should show online status', async ({ page }) => {
    await page.goto(BASE_URL);

    const onlineStatus = page.locator('#onlineStatus');
    await expect(onlineStatus).toBeVisible();
    await expect(onlineStatus).toHaveClass(/online/);
  });

  test('should be installable (PWA criteria)', async ({ page, context }) => {
    await page.goto(BASE_URL);

    // Check if page meets PWA criteria
    // Note: actual installability depends on browser and HTTPS

    // Check meta theme-color
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#27ae60');

    // Check viewport meta
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);

    // Check icons are accessible by getting their URLs from the HTML
    const iconLink = page.locator('link[rel="icon"]');
    const iconHref = await iconLink.getAttribute('href');
    expect(iconHref).toBeTruthy();

    // Test icon accessibility using the actual URL from the page
    const iconUrl = new URL(iconHref!, page.url()).href;
    const iconResponse = await page.request.get(iconUrl);
    expect(iconResponse.ok()).toBeTruthy();

    // Check apple-touch-icon
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    const appleTouchHref = await appleTouchIcon.getAttribute('href');
    expect(appleTouchHref).toBeTruthy();

    const appleTouchUrl = new URL(appleTouchHref!, page.url()).href;
    const appleTouchResponse = await page.request.get(appleTouchUrl);
    expect(appleTouchResponse.ok()).toBeTruthy();
  });

  test('should work offline (service worker caching)', async ({ page, context }) => {
    await page.goto(BASE_URL);

    // Wait for service worker to cache assets
    await page.waitForTimeout(3000);

    // Simulate offline
    await context.setOffline(true);

    // Reload page
    await page.reload();

    // Check page still loads from cache
    await expect(page.locator('#timerDisplay')).toBeVisible();

    // Restore online
    await context.setOffline(false);
  });
});
