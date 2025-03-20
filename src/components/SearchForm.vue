<script setup lang="ts">
// @ts-ignore
import ActionButtons from './ActionButtons.vue'
import { ref, inject } from 'vue'
import { BASE_SITE } from '@/services/api'
import { findPartner, type PartnerSearchResponse } from '@/services/api'

const props = defineProps({
  gender: {
    type: String,
    required: true,
  },
  ageFrom: {
    type: Number,
    default: null,
  },
  ageTo: {
    type: Number,
    default: null,
  },
  userId: {
    // Добавляем props для ID пользователя
    type: Number,
    required: true,
  },
})

const emit = defineEmits([
  'update:gender',
  'update:ageFrom',
  'update:ageTo',
  'find',
  'close',
  'partner-found',
  'waiting',
])

const isLoading = ref(false)
const error = ref('')

// Функция для отправки запроса на поиск партнера
async function findPartnerHandler() {
  isLoading.value = true
  error.value = ''

  try {
    const data = await findPartner({
      id: props.userId,
      gender: props.gender,
      age_from: props.ageFrom,
      age_to: props.ageTo,
    })

    // Обработка ответа
    if (data.status === 'matched') {
      emit('partner-found', {
        roomKey: data.room_key,
        partner: data.partner,
        token: data.token,
      })
    } else if (data.status === 'waiting') {
      emit('waiting', {
        roomKey: data.room_key,
        message: data.message,
        token: data.token,
      })
    }

    emit('find', data)
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Произошла ошибка при поиске партнера'
    console.error('Ошибка при поиске партнера:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="form-container">
    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="form-group">
      <label for="gender">Пол:</label>
      <select
        id="gender"
        :value="gender"
        @input="
          emit('update:gender', ($event.target as HTMLSelectElement).value)
        "
        class="form-control"
        :disabled="isLoading"
      >
        <option value="any">Не указывать</option>
        <option value="man">Мужской</option>
        <option value="woman">Женский</option>
      </select>
    </div>

    <div class="form-group">
      <label>Возраст:</label>
      <div class="age-range">
        <input
          type="number"
          :value="ageFrom"
          @input="
            emit(
              'update:ageFrom',
              ($event.target as HTMLInputElement).value
                ? parseInt(($event.target as HTMLInputElement).value)
                : null
            )
          "
          class="form-control"
          placeholder="От"
          :disabled="isLoading"
        />

        <input
          type="number"
          :value="ageTo"
          @input="
            emit(
              'update:ageTo',
              ($event.target as HTMLInputElement).value
                ? parseInt(($event.target as HTMLInputElement).value)
                : null
            )
          "
          class="form-control"
          placeholder="До"
          :disabled="isLoading"
        />
      </div>
    </div>

    <ActionButtons
      primary-text="Найти собеседника"
      secondary-text="Закрыть"
      @primary-click="findPartnerHandler"
      @secondary-click="emit('close')"
      :primary-disabled="isLoading"
      :primary-loading="isLoading"
    />
  </div>
</template>

<style scoped>
.form-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.form-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.age-range {
  display: flex;
  gap: 10px;
}

.age-range input {
  flex: 1;
}

.error-message {
  margin-bottom: 16px;
  padding: 10px;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #dc2626;
  font-size: 14px;
}
</style>
