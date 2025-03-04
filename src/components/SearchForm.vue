<script setup lang="ts">
// @ts-ignore
import ActionButtons from './ActionButtons.vue';
import { ref } from 'vue';

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
    },
    userId: {  // Добавляем props для ID пользователя
        type: Number,
        required: true
    }
});

const emit = defineEmits([
    'update:gender',
    'update:ageFrom',
    'update:ageTo',
    'find',
    'close',
    'partner-found',  // Новый emit для случая, когда партнер найден
    'waiting'         // Новый emit для случая ожидания партнера
]);

const isLoading = ref(false);
const error = ref('');

// Функция для отправки запроса на поиск партнера
async function findPartner() {
    isLoading.value = true;
    error.value = '';

    try {
        const response = await fetch('https://bash10-85-175-194-59.ru.tuna.am/api/find-partner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: props.userId,
                gender: props.gender,
                age_from: props.ageFrom,
                age_to: props.ageTo
            })
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        const data = await response.json();

        // Обработка ответа
        if (data.status === 'matched') {
            // Партнер найден
            emit('partner-found', {
                roomKey: data.room_key,
                partner: data.partner,
                token: data.token
            });
        } else if (data.status === 'waiting') {
            // Ожидаем партнера
            emit('waiting', {
                roomKey: data.room_key,
                message: data.message,
                token: data.token
            });
        }

        // Также вызываем оригинальный emit для совместимости
        emit('find', data);

    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Произошла ошибка при поиске партнера';
        console.error('Ошибка при поиске партнера:', err);
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <div class="form-container">
        <div v-if="error" class="error-message">{{ error }}</div>

        <div class="form-group">
            <label for="gender">Пол:</label>
            <select id="gender" :value="gender"
                @input="emit('update:gender', ($event.target as HTMLSelectElement).value)" class="form-control"
                :disabled="isLoading">
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
                    class="form-control" placeholder="От" :disabled="isLoading">

                <input type="number" :value="ageTo"
                    @input="emit('update:ageTo', ($event.target as HTMLInputElement).value ? parseInt(($event.target as HTMLInputElement).value) : null)"
                    class="form-control" placeholder="До" :disabled="isLoading">
            </div>
        </div>

        <ActionButtons primary-text="Найти собеседника" secondary-text="Закрыть" @primary-click="findPartner"
            @secondary-click="emit('close')" :primary-disabled="isLoading" :primary-loading="isLoading" />
    </div>
</template>

<style scoped></style>