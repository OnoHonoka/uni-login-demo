import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    proxy: {
      // 把key的路径代理到target位置
      // detail: https://cli.vuejs.org/config/#devserver-proxy
      "/api": {
        // 需要代理的路径   例如 '/api'
        target: `http://localhost:8080`, // 代理到 目标路径
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(new RegExp('^/api'), '')
      }
    },
  },
})
