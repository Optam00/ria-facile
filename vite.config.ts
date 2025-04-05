import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      './lib/base64url': path.resolve(__dirname, 'node_modules/@supabase/auth-js/dist/module/lib/base64url.js')
    },
    dedupe: ['react', 'react-dom']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    commonjsOptions: {
      include: [
        /node_modules/,
        /node_modules\/@supabase\/auth-js/,
        /node_modules\/@supabase\/supabase-js/
      ],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js']
        },
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    sourcemap: true,
    minify: 'terser',
    target: 'es2018'
  },
  server: {
    port: 3000
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js', '@supabase/auth-js'],
    force: true
  }
}) 