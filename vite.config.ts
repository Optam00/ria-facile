import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        quiz: path.resolve(__dirname, 'public/quiz.html'),
        consulter: path.resolve(__dirname, 'public/consulter.html'),
      },
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