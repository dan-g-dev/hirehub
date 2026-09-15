import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Backend API server URL (used only in dev, to proxy /api and /uploads
// so the frontend can keep using relative paths like axios baseURL '/api').
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: BACKEND_URL,
          changeOrigin: true,
        },
        '/uploads': {
          target: BACKEND_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
