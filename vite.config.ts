import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2018',
    rollupOptions: {
      output: {
        format: 'cjs'
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2018'
    }
  }
}) 