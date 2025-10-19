import { test, expect, chromium, type BrowserContext, type Page } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '..', 'dist');

let context: BrowserContext;
let extensionId: string;

test.beforeAll(async () => {
  context = await chromium.launchPersistentContext('', {
    headless: true,
    args: [
      `--disable-extensions-except=${distPath}`,
      `--load-extension=${distPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  const serviceWorkers = context.serviceWorkers();
  if (serviceWorkers.length > 0) {
    const url = serviceWorkers[0].url();
    const match = url.match(/chrome-extension:\/\/([a-z]+)\//);
    if (match) {
      extensionId = match[1];
    }
  }
});

test.afterAll(async () => {
  await context?.close();
});

async function openPopup(): Promise<Page> {
  const popupPath = `chrome-extension://${extensionId}/src/popup/popup.html`;
  const page = await context.newPage();
  await page.goto(popupPath);
  await page.waitForLoadState('domcontentloaded');
  return page;
}

test.describe('State Persistence', () => {
  test('timer state should persist after closing popup', async () => {
    // Open popup and start timer
    let popup = await openPopup();

    await popup.click('#startBtn');
    await popup.waitForTimeout(3000);

    // Get current state
    const stateBefore = await popup.evaluate(async () => {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
      return {
        timeRemaining: response.timeRemaining,
        isRunning: response.isRunning,
        mode: response.mode
      };
    });

    expect(stateBefore.isRunning).toBe(true);

    // Close popup
    await popup.close();

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Reopen popup
    popup = await openPopup();

    // Get state again
    const stateAfter = await popup.evaluate(async () => {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
      return {
        timeRemaining: response.timeRemaining,
        isRunning: response.isRunning,
        mode: response.mode
      };
    });

    // Timer should still be running
    expect(stateAfter.isRunning).toBe(true);

    // Mode should be the same
    expect(stateAfter.mode).toBe(stateBefore.mode);

    // Time should have decreased
    expect(stateAfter.timeRemaining).toBeLessThan(stateBefore.timeRemaining);

    // Stop timer (cleanup)
    await popup.click('#pauseBtn');
    await popup.click('#resetBtn');

    await popup.close();
  });

  test('session count should persist', async () => {
    // Get initial session count from storage
    const popup = await openPopup();

    const initialCount = await popup.evaluate(async () => {
      const result = await chrome.storage.local.get('sessionsCompleted');
      return result.sessionsCompleted || 0;
    });

    // Close and reopen
    await popup.close();

    const newPopup = await openPopup();

    const persistedCount = await newPopup.evaluate(async () => {
      const result = await chrome.storage.local.get('sessionsCompleted');
      return result.sessionsCompleted || 0;
    });

    expect(persistedCount).toBe(initialCount);

    await newPopup.close();
  });

  test('mode change should persist', async () => {
    let popup = await openPopup();

    // Change to Short Break
    await popup.click('button[data-mode="shortBreak"]');
    await popup.waitForTimeout(500);

    // Verify mode changed
    let mode = await popup.locator('#modeDisplay').textContent();
    expect(mode).toBe('Pausa Curta');

    // Close popup
    await popup.close();

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reopen popup
    popup = await openPopup();

    // Mode should still be Short Break
    mode = await popup.locator('#modeDisplay').textContent();
    expect(mode).toBe('Pausa Curta');

    // Reset to Focus mode (cleanup)
    await popup.click('button[data-mode="focus"]');
    await popup.waitForTimeout(500);

    await popup.close();
  });

  test('paused timer should remain paused after reopening', async () => {
    let popup = await openPopup();

    // Start timer
    await popup.click('#startBtn');
    await popup.waitForTimeout(2000);

    // Pause
    await popup.click('#pauseBtn');

    // Get time
    const timePaused = await popup.locator('#timerDisplay').textContent();

    // Close popup
    await popup.close();

    // Wait
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Reopen
    popup = await openPopup();

    // Time should be the same (not running)
    const timeAfterReopen = await popup.locator('#timerDisplay').textContent();
    expect(timeAfterReopen).toBe(timePaused);

    // Should not be running
    const isRunning = await popup.evaluate(async () => {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
      return response.isRunning;
    });

    expect(isRunning).toBe(false);

    // Reset (cleanup)
    await popup.click('#resetBtn');

    await popup.close();
  });
});
