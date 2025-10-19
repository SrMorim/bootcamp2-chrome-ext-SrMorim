import { chromium, type BrowserContext } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '..', 'dist');

export interface ExtensionContext {
  context: BrowserContext;
  extensionId: string;
}

/**
 * Setup browser context with extension loaded
 * Robust method that works in CI headless mode
 */
export async function setupExtensionContext(): Promise<ExtensionContext> {
  console.log('🚀 Launching Chromium with extension...');
  console.log('📁 Extension path:', distPath);

  const context = await chromium.launchPersistentContext('', {
    headless: true,
    args: [
      `--disable-extensions-except=${distPath}`,
      `--load-extension=${distPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });

  // Wait for service worker to be ready (robust method for CI)
  let extensionId: string | undefined;
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds

  while (!extensionId && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const serviceWorkers = context.serviceWorkers();

    if (serviceWorkers.length > 0) {
      for (const sw of serviceWorkers) {
        const url = sw.url();
        console.log('🔍 Found service worker:', url);

        const match = url.match(/chrome-extension:\/\/([a-z]+)\//);
        if (match && match[1]) {
          extensionId = match[1];
          console.log('✅ Extension ID:', extensionId);
          break;
        }
      }
    }

    attempts++;

    if (!extensionId && attempts < maxAttempts) {
      console.log(`⏳ Waiting for extension... (${attempts}/${maxAttempts})`);
    }
  }

  if (!extensionId) {
    await context.close();
    throw new Error('Failed to get extension ID - extension may not have loaded correctly');
  }

  console.log('🎉 Extension loaded successfully!');

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
