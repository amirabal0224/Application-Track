import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8000',
      '/applications': 'http://localhost:8000',
      '/statuses': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
