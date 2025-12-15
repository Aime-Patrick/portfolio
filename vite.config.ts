import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
