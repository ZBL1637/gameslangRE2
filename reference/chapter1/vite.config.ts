import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/game_slangRE/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('echarts')) return 'vendor-echarts';
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('react-dom') || id.includes('react')) return 'vendor-react';
          if (id.includes('lucide-react')) return 'vendor-icons';
          return 'vendor';
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.manusvm.computer'
    ],
    proxy: {
      '/api/deepseek': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/deepseek/, '/v1/chat/completions')
      }
    }
  }
})
