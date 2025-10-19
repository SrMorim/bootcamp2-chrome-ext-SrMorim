import { test, expect, type BrowserContext } from '@playwright/test';
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

test.describe('Extension Loading', () => {
  test('extension should be loaded successfully', async () => {
    expect(context).toBeDefined();
    expect(extensionId).toBeDefined();
    expect(extensionId).not.toBe('undefined');

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
    expect(manifest.version).toBe('1.1.0');
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
