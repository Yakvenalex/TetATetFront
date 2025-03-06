import "./assets/main.css";
import { VueTelegramPlugin } from "vue-tg";
import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueTelegramPlugin);

app.mount("#app");
