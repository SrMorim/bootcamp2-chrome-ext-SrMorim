/**
 * Lighthouse CI Configuration
 * Defines thresholds for PWA quality metrics
 * All scores must be ≥ 80 to pass (as per Bootcamp requirements)
 */

module.exports = {
  ci: {
    collect: {
      // URL to audit
      url: ['http://localhost:8080'],

      // Number of runs per URL (median of 3 for consistency)
      numberOfRuns: 3,

      // Chromium settings
      settings: {
        // Emulate mobile device
        preset: 'desktop',

        // Throttling (simulated 4G)
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },

        // Skip certain audits that might fail in CI
        skipAudits: [
          'uses-http2', // Not applicable to localhost
          'canonical', // Not critical for PWA
        ],
      },
    },

    assert: {
      // Assertion presets
      preset: 'lighthouse:no-pwa',

      // Custom assertions with thresholds ≥ 80
      assertions: {
        // Core Web Vitals
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.8 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        'categories:pwa': ['error', { minScore: 0.8 }],

        // Critical PWA requirements
        'service-worker': 'error',
        'installable-manifest': 'error',
        'splash-screen': 'error',
        'themed-omnibox': 'error',
        'viewport': 'error',

        // Performance metrics (targets for LCP, FID, CLS)
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // Accessibility requirements
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'aria-valid-attr': 'error',
        'button-name': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',

        // Best practices
        'errors-in-console': 'warn',
        'no-vulnerable-libraries': 'warn',
        'uses-https': 'off', // Not applicable to localhost

        // SEO basics
        'meta-description': 'error',
        'font-size': 'error',
        'tap-targets': 'warn',
      },
    },

    upload: {
      // Upload reports to temporary public storage
      target: 'temporary-public-storage',

      // Or use filesystem for CI artifacts
      // target: 'filesystem',
      // outputDir: './lighthouse-results',
    },

    // Server configuration (if needed)
    // server: {
    //   port: 8080,
    //   command: 'npm run preview',
    // },
  },
};
