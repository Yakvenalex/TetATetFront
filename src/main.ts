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
app.mount('#app')
