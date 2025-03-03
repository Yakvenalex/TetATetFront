<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
// @ts-ignore
import ActionButtons from './ActionButtons.vue';

const props = defineProps({
    gender: {
        type: String,
        required: true
    },
    ageFrom: {
        type: Number,
        default: null
    },
    ageTo: {
        type: Number,
        default: null
    }
});

const emit = defineEmits([
    'update:gender',
    'update:ageFrom',
    'update:ageTo',
    'find',
    'close'
]);
</script>

<template>
    <div class="form-container">
        <div class="form-group">
            <label for="gender">Пол:</label>
            <select id="gender" :value="gender"
                @input="emit('update:gender', ($event.target as HTMLSelectElement).value)" class="form-control">
                <option value="">Не указывать</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
            </select>
        </div>

        <div class="form-group">
            <label>Возраст:</label>
            <div class="age-range">
                <input type="number" :value="ageFrom"
                    @input="emit('update:ageFrom', ($event.target as HTMLInputElement).value ? parseInt(($event.target as HTMLInputElement).value) : null)"
                    class="form-control" placeholder="От">
                <input type="number" :value="ageTo"
                    @input="emit('update:ageTo', ($event.target as HTMLInputElement).value ? parseInt(($event.target as HTMLInputElement).value) : null)"
                    class="form-control" placeholder="До">
            </div>
        </div>

        <ActionButtons primary-text="Найти собеседника" secondary-text="Закрыть" @primary-click="emit('find')"
            @secondary-click="emit('close')" />
    </div>
</template>

<style scoped>
/* Стили для формы */
</style>