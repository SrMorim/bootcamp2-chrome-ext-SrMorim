import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/bootcamp2-chrome-ext-SrMorim/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Bootcamp Pomodoro PWA',
        short_name: 'PomoPWA',
        description: 'Timer Pomodoro com histórico de sessões e frases motivacionais',
        theme_color: '#27ae60',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/bootcamp2-chrome-ext-SrMorim/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.quotable\.io\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'quotes-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^http:\/\/localhost:3000\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 8080
  },
  preview: {
    port: 8080
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
