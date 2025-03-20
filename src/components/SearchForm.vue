<script setup lang="ts">
import { findPartner } from '@/services/api'
import { ref } from 'vue'
import ActionButtons from './ActionButtons.vue'

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
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.form-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.15);
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background-color: #f8fafc;
}

.form-control:hover {
  border-color: #cbd5e1;
  background-color: #ffffff;
}

.form-control:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15);
  background-color: #ffffff;
}

.form-control:disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.7;
}

.age-range {
  display: flex;
  gap: 12px;
  align-items: center;
}

.age-range input {
  flex: 1;
}

.error-message {
  margin-bottom: 20px;
  padding: 12px 16px;
  background-color: #fee2e2;
  border: 2px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Стили для select */
select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234a5568' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

/* Стили для number input */
input[type='number'] {
  -moz-appearance: textfield;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
