<script setup lang="ts">
import { onMounted, ref } from 'vue'

const emit = defineEmits(['loaded'])
const progress = ref(0)

onMounted(() => {
  const interval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += 5
    } else {
      clearInterval(interval)
      setTimeout(() => {
        emit('loaded')
      }, 200)
    }
  }, 20)
})
</script>

<template>
  <div class="loader-container">
    <div class="loader-content">
      <div class="clock-loader">
        <div class="clock">
          <div class="hand hour-hand"></div>
          <div class="hand minute-hand"></div>
        </div>
      </div>
      <div class="loading-text">Загрузка приложения...</div>
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loader-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader-content {
  text-align: center;
}

.clock-loader {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  position: relative;
}

.clock {
  width: 100%;
  height: 100%;
  border: 4px solid #4a90e2;
  border-radius: 50%;
  position: relative;
  animation: rotate 2s linear infinite;
}

.hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: bottom;
  background: #4a90e2;
  border-radius: 4px;
}

.hour-hand {
  width: 4px;
  height: 25px;
  margin-left: -2px;
  animation: rotate 6s linear infinite;
}

.minute-hand {
  width: 3px;
  height: 35px;
  margin-left: -1.5px;
  animation: rotate 1s linear infinite;
}

.loading-text {
  color: #2c3e50;
  font-size: 1.1rem;
  margin-bottom: 15px;
  font-weight: 500;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: rgba(74, 144, 226, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #4a90e2;
  border-radius: 2px;
  transition: width 0.3s ease;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
