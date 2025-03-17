import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { VueTelegramPlugin } from 'vue-tg'
import './assets/main.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueTelegramPlugin)
app.provide('BASE_SITE', 'https://chatbackend-yakvenalex.amvera.io')
app.provide(
  'CENTRIFUGO_URL',
  'wss://mycentrifugo-yakvenalex.amvera.io/connection/websocket'
)
app.mount('#app')
