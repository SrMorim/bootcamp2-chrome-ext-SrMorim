import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { setupExtensionContext, cleanupExtensionContext } from './helpers.js';

let context: BrowserContext;
let extensionId: string;

test.beforeAll(async () => {
  const setup = await setupExtensionContext();
  context = setup.context;
  extensionId = setup.extensionId;
}, 90000); // 90 second timeout for setup

test.afterAll(async () => {
  await cleanupExtensionContext(context);
});

async function openPopup(): Promise<Page> {
  const popupPath = `chrome-extension://${extensionId}/src/popup/popup.html`;
  const page = await context.newPage();
  await page.goto(popupPath);
  await page.waitForLoadState('domcontentloaded');
  return page;
}

test.describe('Timer Functionality', () => {
  test('popup should open and display initial state', async () => {
    const popup = await openPopup();

    // Check timer display shows initial time (25:00)
    const timerDisplay = await popup.locator('#timerDisplay').textContent();
    expect(timerDisplay).toBe('25:00');

    // Check mode display
    const modeDisplay = await popup.locator('#modeDisplay').textContent();
    expect(modeDisplay).toBe('Foco');

    // Check session count
    const sessionCount = await popup.locator('#sessionCount').textContent();
    expect(sessionCount).toBe('0');

    await popup.close();
  });

  test('start button should be enabled initially', async () => {
    const popup = await openPopup();

    const startBtn = popup.locator('#startBtn');
    const pauseBtn = popup.locator('#pauseBtn');

    await expect(startBtn).toBeEnabled();
    await expect(pauseBtn).toBeDisabled();

    await popup.close();
  });

  test('timer should start when clicking start button', async () => {
    const popup = await openPopup();

    // Click start button
    await popup.click('#startBtn');

    // Wait a bit
    await popup.waitForTimeout(1000);

    // Start button should be disabled, pause button enabled
    const startBtn = popup.locator('#startBtn');
    const pauseBtn = popup.locator('#pauseBtn');

    await expect(startBtn).toBeDisabled();
    await expect(pauseBtn).toBeEnabled();

    // Timer should be running (check via service worker state)
    const isRunning = await popup.evaluate(async () => {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
      return response.isRunning;
    });

    expect(isRunning).toBe(true);

    // Pause the timer (cleanup)
    await popup.click('#pauseBtn');

    await popup.close();
  });

  test('timer should count down when running', async () => {
    const popup = await openPopup();

    // Get initial time
    const initialTime = await popup.locator('#timerDisplay').textContent();

    // Start timer
    await popup.click('#startBtn');

    // Wait for 3 seconds
    await popup.waitForTimeout(3000);

    // Get new time
    const newTime = await popup.locator('#timerDisplay').textContent();

    // Time should have decreased
    expect(newTime).not.toBe(initialTime);

    // Convert times to seconds for comparison
    const parseTime = (time: string | null) => {
      if (!time) return 0;
      const [mins, secs] = time.split(':').map(Number);
      return mins * 60 + secs;
    };

    const initialSeconds = parseTime(initialTime);
    const newSeconds = parseTime(newTime);

    // Should have decreased by approximately 3 seconds (with 1s tolerance)
    expect(initialSeconds - newSeconds).toBeGreaterThanOrEqual(2);
    expect(initialSeconds - newSeconds).toBeLessThanOrEqual(4);

    // Pause the timer (cleanup)
    await popup.click('#pauseBtn');

    await popup.close();
  });

  test('pause button should pause the timer', async () => {
    const popup = await openPopup();

    // Start timer
    await popup.click('#startBtn');
    await popup.waitForTimeout(1000);

    // Get current time
    const timeBeforePause = await popup.locator('#timerDisplay').textContent();

    // Pause
    await popup.click('#pauseBtn');
    await popup.waitForTimeout(2000);

    // Time should not have changed after pause
    const timeAfterPause = await popup.locator('#timerDisplay').textContent();
    expect(timeAfterPause).toBe(timeBeforePause);

    await popup.close();
  });

  test('reset button should reset timer to current mode duration', async () => {
    const popup = await openPopup();

    // Start and let it run
    await popup.click('#startBtn');
    await popup.waitForTimeout(2000);

    // Timer should have decreased
    const timeRunning = await popup.locator('#timerDisplay').textContent();
    expect(timeRunning).not.toBe('25:00');

    // Reset
    await popup.click('#resetBtn');
    await popup.waitForTimeout(500);

    // Should be back to 25:00
    const timeAfterReset = await popup.locator('#timerDisplay').textContent();
    expect(timeAfterReset).toBe('25:00');

    await popup.close();
  });

  test('mode tabs should be functional', async () => {
    const popup = await openPopup();

    // Click on "Pausa Curta" tab
    await popup.click('button[data-mode="shortBreak"]');
    await popup.waitForTimeout(500);

    // Mode should change
    const modeDisplay = await popup.locator('#modeDisplay').textContent();
    expect(modeDisplay).toBe('Pausa Curta');

    // Timer should show short break duration (5:00)
    const timerDisplay = await popup.locator('#timerDisplay').textContent();
    expect(timerDisplay).toBe('05:00');

    // Click back to Focus
    await popup.click('button[data-mode="focus"]');
    await popup.waitForTimeout(500);

    const modeAfter = await popup.locator('#modeDisplay').textContent();
    expect(modeAfter).toBe('Foco');

    await popup.close();
  });
});
