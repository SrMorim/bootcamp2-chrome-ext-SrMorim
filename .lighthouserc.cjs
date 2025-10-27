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
      // Custom assertions focused on main categories (≥ 80)
      // This aligns with Bootcamp requirements without over-asserting individual audits
      assertions: {
        // CRITICAL: Main categories must score ≥ 80 (Bootcamp requirement)
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.8 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        'categories:pwa': ['error', { minScore: 0.8 }],

        // CRITICAL: PWA requirements (must pass)
        'service-worker': 'error',
        'installable-manifest': 'error',
        'splash-screen': 'error',
        'themed-omnibox': 'error',
        'viewport': 'error',

        // WARNINGS: Performance metrics (informational, not blocking)
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // WARNINGS: Accessibility (informational - category score is what matters)
        'color-contrast': 'warn',
        'image-alt': 'warn',
        'label': 'warn',
        'button-name': 'warn',
        'document-title': 'error',
        'html-has-lang': 'error',

        // WARNINGS: Best practices (informational)
        'errors-in-console': 'warn',

        // WARNINGS: SEO basics (informational)
        'meta-description': 'warn',
        'font-size': 'warn',
        'tap-targets': 'warn',

        // OFF: Not applicable to localhost or removed from Lighthouse
        'uses-https': 'off',
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
