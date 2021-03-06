import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'


// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue(),
  AutoImport({
    // 自动导入vue相关的Api
    imports: ["vue"],   // 也支持vue-router、axios等
    // 声明文件的存放位置
    dts: 'auto-imports.d.ts',
  }),
  AutoImport({
    resolvers: [ElementPlusResolver()],
  }),
  Components({
    resolvers: [ElementPlusResolver()],
  })
  ],
  server: {
    host: "0.0.0.0", // 默认为localhost
    port: 4004, // 端口号
    open: true, // 是否自动打开浏览器
    strictPort: true,
    hmr: {
      overlay: false
    },
  },
  build: {
    outDir: 'docs'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
