import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['.loca.lt', '.bore.pub', 'bore.pub'],
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
