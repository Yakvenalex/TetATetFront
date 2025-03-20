<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useMiniApp } from 'vue-tg'
import AppLoader from './components/AppLoader.vue'
const isLoading = ref(true)
const handleLoaded = () => {
  isLoading.value = false
}

const miniApp = useMiniApp()

const initializeTelegramAds = () => {
  miniApp.ready()
  // @ts-ignore
  window.TelegramAdsController = new TelegramAdsController()
  // @ts-ignore
  window.TelegramAdsController.initialize({
    pubId: '965290',
    appId: '1835',
  })
}

onMounted(() => {
  initializeTelegramAds()
})
</script>

<template>
  <div class="app-container">
    <AppLoader v-if="isLoading" @loaded="handleLoaded" />
    <div v-show="!isLoading" class="container">
      <router-view />
    </div>
  </div>
</template>

<style>
:root {
  --primary-color: #4a90e2;
  --background-color: #f5f7fa;
  --text-color: #2c3e50;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

/* Анимация появления контента */
.container {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
