import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../playwright-report', open: 'never' }],
    ['json', { outputFile: '../../test-results/results.json' }]
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  webServer: process.env.CI ? undefined : [
    {
      command: 'cd ../../apps/api && npm start',
      url: 'http://localhost:3000/api/health',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'cd ../../apps/web && npm run preview',
      url: 'http://localhost:8080',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
