import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'robxme-85-175-194-59.ru.tuna.am',
      '.ru.tuna.am',
      '.amvera.io',
    ],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
