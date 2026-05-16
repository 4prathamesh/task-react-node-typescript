import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ FIX: added server proxy so /api calls forward to Express backend
// This replaces the "proxy" field in package.json which only works with CRA (react-scripts)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
