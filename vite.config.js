import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'https://c4ba947d9455f026.ngrok.app',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://c4ba947d9455f026.ngrok.app',
        ws: true,
      },
    },
  },
})