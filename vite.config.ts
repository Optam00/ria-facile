import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import ssr from 'vite-plugin-ssr/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ssr({
      prerender: true
    })
  ],
  server: {
    port: 3000,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['tailwindcss']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
    copyPublicDir: true
  },
  publicDir: 'public'
}) 