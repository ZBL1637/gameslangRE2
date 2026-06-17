import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/gameslangRE2/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('zrender')) return 'vendor-zrender';
          if (id.includes('echarts/charts')) return 'vendor-echarts-charts';
          if (id.includes('echarts/components')) return 'vendor-echarts-components';
          if (id.includes('echarts/renderers')) return 'vendor-echarts-renderers';
          if (id.includes('echarts')) return 'vendor-echarts-core';
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
