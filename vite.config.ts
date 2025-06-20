import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined
      }
    },
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  ssr: {
    noExternal: ['@supabase/supabase-js']
  }
})