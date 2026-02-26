import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    uni(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:8080`,
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(new RegExp('^/api'), '')
      }
    },
  },
})
