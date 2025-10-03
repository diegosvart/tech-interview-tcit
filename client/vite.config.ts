import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy to backend http://localhost:3000 avoiding CORS in dev
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
