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

async function openOptionsPage(): Promise<Page> {
  const optionsPath = `chrome-extension://${extensionId}/src/options/options.html`;
  const page = await context.newPage();
  await page.goto(optionsPath);
  await page.waitForLoadState('domcontentloaded');
  return page;
}

test.describe('Options Page', () => {
  test('options page should open and display settings', async () => {
    const options = await openOptionsPage();

    // Check page title
    const title = await options.title();
    expect(title).toContain('Configurações');

    // Check form elements exist
    await expect(options.locator('#focusDuration')).toBeVisible();
    await expect(options.locator('#shortBreakDuration')).toBeVisible();
    await expect(options.locator('#longBreakDuration')).toBeVisible();
    await expect(options.locator('#longBreakInterval')).toBeVisible();
    await expect(options.locator('#soundEnabled')).toBeVisible();

    await options.close();
  });

  test('options should load default values', async () => {
    const options = await openOptionsPage();

    // Wait for settings to load
    await options.waitForTimeout(500);

    // Check default values
    const focusDuration = await options.inputValue('#focusDuration');
    const shortBreakDuration = await options.inputValue('#shortBreakDuration');
    const longBreakDuration = await options.inputValue('#longBreakDuration');
    const longBreakInterval = await options.inputValue('#longBreakInterval');

    expect(Number(focusDuration)).toBeGreaterThanOrEqual(1);
    expect(Number(shortBreakDuration)).toBeGreaterThanOrEqual(1);
    expect(Number(longBreakDuration)).toBeGreaterThanOrEqual(5);
    expect(Number(longBreakInterval)).toBeGreaterThanOrEqual(2);

    await options.close();
  });

  test('should save custom settings', async () => {
    const options = await openOptionsPage();

    // Wait for page to load
    await options.waitForTimeout(500);

    // Change settings
    await options.fill('#focusDuration', '30');
    await options.fill('#shortBreakDuration', '10');
    await options.fill('#longBreakDuration', '20');
    await options.fill('#longBreakInterval', '3');

    // Submit form
    await options.click('button[type="submit"]');

    // Wait for save
    await options.waitForTimeout(1000);

    // Check status message
    const status = options.locator('#status');
    await expect(status).toHaveClass(/success/);

    // Verify settings were saved to storage
    const savedSettings = await options.evaluate(async () => {
      const result = await chrome.storage.local.get('settings');
      return result.settings;
    });

    expect(savedSettings.focusDuration).toBe(30);
    expect(savedSettings.shortBreakDuration).toBe(10);
    expect(savedSettings.longBreakDuration).toBe(20);
    expect(savedSettings.longBreakInterval).toBe(3);

    await options.close();
  });

  test('should restore default settings', async () => {
    const options = await openOptionsPage();

    await options.waitForTimeout(500);

    // Change some values
    await options.fill('#focusDuration', '45');
    await options.fill('#shortBreakDuration', '15');

    // Click restore defaults
    await options.click('#resetBtn');

    // Wait for restore
    await options.waitForTimeout(1000);

    // Check values are reset to defaults
    const focusDuration = await options.inputValue('#focusDuration');
    const shortBreakDuration = await options.inputValue('#shortBreakDuration');
    const longBreakDuration = await options.inputValue('#longBreakDuration');
    const longBreakInterval = await options.inputValue('#longBreakInterval');

    expect(focusDuration).toBe('25');
    expect(shortBreakDuration).toBe('5');
    expect(longBreakDuration).toBe('15');
    expect(longBreakInterval).toBe('4');

    // Check status message
    const status = options.locator('#status');
    await expect(status).toHaveClass(/success/);

    await options.close();
  });

  test('sound toggle should work', async () => {
    const options = await openOptionsPage();

    await options.waitForTimeout(500);

    // Get initial checkbox state
    const initialState = await options.isChecked('#soundEnabled');

    // Toggle checkbox
    await options.click('#soundEnabled');

    // Save
    await options.click('button[type="submit"]');
    await options.waitForTimeout(1000);

    // Verify setting was saved
    const savedSettings = await options.evaluate(async () => {
      const result = await chrome.storage.local.get('settings');
      return result.settings;
    });

    expect(savedSettings.soundEnabled).toBe(!initialState);

    // Toggle back and save (cleanup)
    await options.click('#soundEnabled');
    await options.click('button[type="submit"]');
    await options.waitForTimeout(500);

    await options.close();
  });

  test('settings should persist after closing page', async () => {
    // Set custom values
    let options = await openOptionsPage();
    await options.waitForTimeout(500);

    await options.fill('#focusDuration', '35');
    await options.click('button[type="submit"]');
    await options.waitForTimeout(1000);

    // Close page
    await options.close();

    // Reopen
    options = await openOptionsPage();
    await options.waitForTimeout(500);

    // Check value persisted
    const focusDuration = await options.inputValue('#focusDuration');
    expect(focusDuration).toBe('35');

    // Restore defaults (cleanup)
    await options.click('#resetBtn');
    await options.waitForTimeout(500);

    await options.close();
  });

  test('form validation should prevent invalid values', async () => {
    const options = await openOptionsPage();

    await options.waitForTimeout(500);

    // Try to set invalid value (0 for focus duration - min is 1)
    await options.fill('#focusDuration', '0');

    // Try to submit
    const isValid = await options.evaluate(() => {
      const form = document.getElementById('settingsForm') as HTMLFormElement;
      return form.checkValidity();
    });

    expect(isValid).toBe(false);

    await options.close();
  });
});
