import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '..', 'dist');

let context: BrowserContext;
let extensionId: string;

test.beforeAll(async () => {
  // Launch browser with extension
  context = await chromium.launchPersistentContext('', {
    headless: true,
    args: [
      `--disable-extensions-except=${distPath}`,
      `--load-extension=${distPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  // Get extension ID
  await context.waitForEvent('page');

  // Find extension ID from background service worker
  const backgroundPages = context.serviceWorkers();
  if (backgroundPages.length > 0) {
    const backgroundPage = backgroundPages[0];
    const extensionUrl = backgroundPage.url();
    const match = extensionUrl.match(/chrome-extension:\/\/([a-z]+)\//);
    if (match) {
      extensionId = match[1];
      console.log(`Extension ID: ${extensionId}`);
    }
  }
});

test.afterAll(async () => {
  await context?.close();
});

test.describe('Extension Loading', () => {
  test('extension should be loaded successfully', async () => {
    expect(context).toBeDefined();

    // Verify service worker is running
    const serviceWorkers = context.serviceWorkers();
    expect(serviceWorkers.length).toBeGreaterThan(0);

    const backgroundWorker = serviceWorkers.find(sw =>
      sw.url().includes('service-worker.js')
    );
    expect(backgroundWorker).toBeDefined();
  });

  test('manifest should be valid', async () => {
    const [page] = context.pages();

    // Read manifest through extension API
    const manifest = await page.evaluate(async () => {
      return chrome.runtime.getManifest();
    });

    expect(manifest).toBeDefined();
    expect(manifest.name).toBe('Bootcamp Pomodoro');
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.manifest_version).toBe(3);
  });

  test('icons should be present', async () => {
    const [page] = context.pages();

    const manifest = await page.evaluate(() => {
      return chrome.runtime.getManifest();
    });

    expect(manifest.icons).toBeDefined();
    expect(manifest.icons['16']).toBeDefined();
    expect(manifest.icons['32']).toBeDefined();
    expect(manifest.icons['48']).toBeDefined();
    expect(manifest.icons['128']).toBeDefined();
  });

  test('required permissions should be declared', async () => {
    const [page] = context.pages();

    const manifest = await page.evaluate(() => {
      return chrome.runtime.getManifest();
    });

    expect(manifest.permissions).toContain('storage');
    expect(manifest.permissions).toContain('alarms');
    expect(manifest.permissions).toContain('notifications');
    expect(manifest.permissions).toContain('offscreen');
  });
});
