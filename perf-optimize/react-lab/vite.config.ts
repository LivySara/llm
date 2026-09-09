import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: false },
  build: {
    // 关闭压缩警告门槛，方便观察体积类案例
    chunkSizeWarningLimit: 2000,
  },
})
