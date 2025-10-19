import { chromium, type BrowserContext } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '..', 'dist');

export interface ExtensionContext {
  context: BrowserContext;
  extensionId: string;
}

/**
 * Try to get extension ID from service workers
 */
async function getExtensionIdFromServiceWorkers(context: BrowserContext): Promise<string | undefined> {
  const serviceWorkers = context.serviceWorkers();

  for (const sw of serviceWorkers) {
    const url = sw.url();
    const match = url.match(/chrome-extension:\/\/([a-z]+)\//);
    if (match && match[1]) {
      console.log('✅ Found extension via service worker:', match[1]);
      return match[1];
    }
  }

  return undefined;
}

/**
 * Try to get extension ID from background pages
 */
async function getExtensionIdFromBackgroundPages(context: BrowserContext): Promise<string | undefined> {
  const backgroundPages = context.backgroundPages();

  for (const page of backgroundPages) {
    const url = page.url();
    const match = url.match(/chrome-extension:\/\/([a-z]+)\//);
    if (match && match[1]) {
      console.log('✅ Found extension via background page:', match[1]);
      return match[1];
    }
  }

  return undefined;
}

/**
 * Try to get extension ID by checking all pages for chrome-extension:// URLs
 */
async function getExtensionIdFromPages(context: BrowserContext): Promise<string | undefined> {
  try {
    const pages = context.pages();
    for (const p of pages) {
      const url = p.url();
      const match = url.match(/chrome-extension:\/\/([a-z]+)\//);
      if (match && match[1]) {
        console.log('✅ Found extension via page URL:', match[1]);
        return match[1];
      }
    }
  } catch (error) {
    console.log('⚠️  Failed to get extension ID from pages:', error);
  }

  return undefined;
}

/**
 * Setup browser context with extension loaded
 * Robust method that works in CI headless mode
 */
export async function setupExtensionContext(): Promise<ExtensionContext> {
  console.log('🚀 Launching Chromium with extension...');
  console.log('📁 Extension path:', distPath);

  // Verify dist directory exists
  if (!fs.existsSync(distPath)) {
    throw new Error(`Extension build directory not found: ${distPath}`);
  }

  const manifestPath = path.join(distPath, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`manifest.json not found in: ${distPath}`);
  }

  console.log('✅ Extension build verified');

  // Create temporary user data directory
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'playwright-chrome-'));
  console.log('📂 Using temp user data dir:', userDataDir);

  // Use launchPersistentContext which has better extension support
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false, // Extensions don't work reliably in true headless mode
    args: [
      `--disable-extensions-except=${distPath}`,
      `--load-extension=${distPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  });

  console.log('🌐 Waiting for extension to load...');

  // Wait a moment for extension to initialize
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Wait for extension to be ready using multiple detection methods
  let extensionId: string | undefined;
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds

  while (!extensionId && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;

    // Try multiple detection methods
    extensionId = await getExtensionIdFromServiceWorkers(context);

    if (!extensionId) {
      extensionId = await getExtensionIdFromBackgroundPages(context);
    }

    if (!extensionId && attempts > 5) {
      // After 5 seconds, try pages method
      extensionId = await getExtensionIdFromPages(context);
    }

    if (!extensionId && attempts % 10 === 0) {
      console.log(`⏳ Waiting for extension... (${attempts}/${maxAttempts})`);
      console.log(`   Service workers: ${context.serviceWorkers().length}`);
      console.log(`   Background pages: ${context.backgroundPages().length}`);
      console.log(`   Pages: ${context.pages().length}`);
    }
  }

  if (!extensionId) {
    await context.close();
    // Clean up temp dir
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
    throw new Error('Failed to get extension ID - extension may not have loaded correctly');
  }

  console.log('🎉 Extension loaded successfully!');
  console.log('🆔 Extension ID:', extensionId);

  return { context, extensionId };
}

/**
 * Cleanup extension context
 */
export async function cleanupExtensionContext(context: BrowserContext): Promise<void> {
  try {
    await context?.close();
    console.log('🧹 Context cleaned up');
  } catch (error) {
    console.error('Error cleaning up context:', error);
  }
}
