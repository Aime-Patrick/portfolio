import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'Aime Patrick Ndagijimana - Full Stack Developer Portfolio',
        short_name: 'Aime Patrick Portfolio',
        description: 'Professional portfolio of Aime Patrick Ndagijimana, Full Stack Developer & Software Engineer specializing in React, Node.js, and TypeScript',
        theme_color: '#ff5722',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/Icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/Icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/_MAL0853.jpg',
            sizes: '1280x720',
            type: 'image/jpeg',
            label: 'Portfolio Homepage'
          }
        ],
        categories: ['portfolio', 'developer', 'technology'],
        lang: 'en',
        dir: 'ltr'
      }
    })
  ],
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/firestore', 'firebase/auth'],
          'ui-vendor': ['framer-motion', 'react-hot-toast'],
          'icons-vendor': ['react-icons'],
        },
      },
    },
    // Optimize asset file names
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    // Minify (esbuild is faster than terser)
    minify: 'esbuild',
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  server: {
    port: 5173,
    allowedHosts: ['bad765c74ab3.ngrok-free.app'],
  },
})
