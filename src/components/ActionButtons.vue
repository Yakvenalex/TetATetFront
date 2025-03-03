<script setup lang="ts">
defineProps({
    primaryText: {
        type: String,
        required: true
    },
    secondaryText: {
        type: String,
        required: true
    }
});
const emit = defineEmits(['primary-click', 'secondary-click']);
</script>

<template>
    <div class="buttons-container">
        <button class="btn-primary" @click="emit('primary-click')">
            {{ primaryText }}
        </button>
        <button class="btn-secondary" @click="emit('secondary-click')">
            {{ secondaryText }}
        </button>
    </div>
</template>

<style scoped>
.buttons-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
}

.btn-primary,
.btn-secondary {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 0.5rem;
    transition: 0.3s ease;
    cursor: pointer;
    margin-bottom: 1rem;
    border: none;
}

.btn-primary {
    background-color: #ff3c32;
    color: white;
}

.btn-primary:hover {
    background-color: #b71c1c;
}

.btn-secondary {
    background-color: #000000;
    color: white;
}

.btn-secondary:hover {
    background-color: #f06292;
}
</style>