<script setup lang="ts">
defineProps({
    message: {
        type: String,
        default: 'Загрузка...'
    }
});
</script>

<template>
    <div class="loader-container">
        <div class="loader">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
        <div class="status-message">{{ message }}</div>
        <slot></slot>
    </div>
</template>

<style scoped>
/* Стили для загрузчика */
</style>