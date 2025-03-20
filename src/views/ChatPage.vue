<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import IconSend from '@/components/icons/IconSend.vue'
import { Centrifuge } from 'centrifuge'
import { useWebApp } from 'vue-tg'

const { close } = useWebApp()

const router = useRouter()
const route = useRoute()

const BASE_SITE = inject('BASE_SITE') as string
const CENTRIFUGO_URL = inject('CENTRIFUGO_URL') as string

const route_query = route.query

const token = route_query.token as string
const user_id = route_query.user_id as string
const sender = route_query.sender

const originalRoom = route.query.room as string
const room = originalRoom.replace('chat_room:', '')

// Состояния
const messages = ref<
  { sender: string; text: string; type?: 'system' | 'user' }[]
>([])
const newMessage = ref('')

// Инициализация Centrifuge
const centrifuge = new Centrifuge(CENTRIFUGO_URL, {
  token: token,
})

let sub: ReturnType<typeof centrifuge.newSubscription>

// Функция для отправки системного сообщения
const sendSystemMessage = async (message: string) => {
  try {
    await fetch(`${BASE_SITE}/api/send-msg/${room}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: 'Система',
        user_id: 0,
        message: message,
      }),
    })
  } catch (error) {
    console.error('Ошибка при отправке системного сообщения:', error)
  }
}

// Функция для инициализации подписки
const initializeSubscription = () => {
  sub = centrifuge.newSubscription(room)
  sub.on('publication', (ctx) => {
    const data = JSON.parse(ctx.data)

    // Проверяем, что сообщение не от текущего пользователя
    if (data.user_id !== parseInt(user_id)) {
      receiveMessage(
        data.sender,
        data.message,
        data.sender === 'Система' ? 'system' : 'user'
      )
    }

    console.log('Received publication:', data)
  })
  sub.subscribe()

  // Отправляем системное сообщение о подключении
  sendSystemMessage(`Пользователь ${sender} присоединился к чату`)
}

// Подключение к Centrifugo и инициализация подписки при монтировании компонента
onMounted(() => {
  centrifuge.connect()
  initializeSubscription()
})

// Отключение от Centrifugo и отписка от канала при уничтожении компонента
onUnmounted(() => {
  // Отправляем системное сообщение о выходе
  sendSystemMessage(`Пользователь ${sender} покинул чат`)

  if (sub) {
    sub.unsubscribe()
  }
  centrifuge.disconnect()
})

// Функция отправки сообщения через сервер
const sendMessageWithServer = async () => {
  if (newMessage.value.trim() !== '') {
    try {
      const response = await fetch(`${BASE_SITE}/api/send-msg/${room}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: sender,
          user_id: parseInt(user_id),
          message: newMessage.value.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка при отправке сообщения')
      }

      // Добавляем сообщение как "Вы" только после успешной отправки
      messages.value.push({
        sender: 'Вы',
        text: newMessage.value.trim(),
        type: 'user',
      })
      newMessage.value = ''

      nextTick(() => {
        scrollChatToBottom()
      })

      console.log('Сообщение отправлено на сервер успешно')
    } catch (error) {
      console.error('Ошибка при отправке сообщения на сервер:', error)
      alert(
        'Не удалось отправить сообщение. Проверьте подключение к интернету.'
      )
    }
  }
}

// Функция получения сообщения
const receiveMessage = (
  sender: string,
  message: string,
  type: 'system' | 'user' = 'user'
) => {
  messages.value.push({ sender, text: message, type })

  nextTick(() => {
    scrollChatToBottom()
  })
}

// Прокрутка чата вниз
const scrollChatToBottom = () => {
  const chatContainer = document.getElementById('chatContainer')
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight
  }
}

// Очистка комнаты
const clearRoom = async () => {
  try {
    await fetch(`${BASE_SITE}/api/clear_room/${originalRoom}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Ошибка при очистке комнаты:', error)
  }
}

// Функция смены собеседника
const changeInterlocutor = async () => {
  await clearRoom()
  router.push({
    path: '/',
    query: {
      user_id: user_id,
      sender: sender,
    },
  })
}

// Функция закрытия чата
const closeChat = async () => {
  // Отправляем системное сообщение о выходе перед закрытием
  await sendSystemMessage(`Пользователь ${sender} покинул чат`)
  await clearRoom()
  close()
}
</script>

<template>
  <div class="chat-wrapper">
    <h1>Чат с Собеседником</h1>

    <div id="chatContainer" class="chat-container">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[
          'message-container',
          message.type === 'system'
            ? 'system'
            : message.sender === 'Вы'
            ? 'sent'
            : 'received',
        ]"
      >
        <div
          class="message-sender"
          :class="{ 'system-sender': message.type === 'system' }"
        >
          {{ message.sender }}:
        </div>
        <div class="message">
          {{ message.text }}
        </div>
      </div>
    </div>

    <div class="message-input-area">
      <input
        type="text"
        v-model="newMessage"
        @keyup.enter="sendMessageWithServer"
        class="message-input"
        placeholder="Введите сообщение"
      />
      <button class="send-button" @click="sendMessageWithServer">
        <IconSend />
      </button>
    </div>

    <div class="chat-buttons">
      <button class="btn-secondary" @click="changeInterlocutor">
        Другой собеседник
      </button>
      <button class="btn-secondary" @click="closeChat">Закрыть</button>
    </div>
  </div>
</template>
<style scoped>
.container {
  max-width: 640px;
  margin: 2rem auto;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 1.25rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 75vh;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #e53935;
  color: white;
  padding: 0.875rem 1.75rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.3s ease;
  display: inline-block;
  width: 100%;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.btn-secondary {
  background-color: #ef5350;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.3s ease;
  display: inline-block;
  width: 48%;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #e53935;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.form-control {
  width: 100%;
  padding: 0.875rem;
  margin-bottom: 1.25rem;
  border: 2px solid #ef5350;
  border-radius: 0.75rem;
  font-size: 1rem;
  color: #424242;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #e53935;
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.25);
}

label {
  display: block;
  margin-bottom: 0.625rem;
  color: #e53935;
  font-weight: 500;
  font-size: 1rem;
}

select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%23e53935' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.875rem top 50%;
  background-size: 1.25rem auto;
}

.age-range {
  display: flex;
  gap: 1.25rem;
}

.age-range input {
  width: 50%;
}

.chat-container {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 1.25rem;
  padding: 0.75rem;
  border: 1px solid #ef5350;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  background-color: #fff8f8;
  transition: background-color 0.3s ease;
  height: 40vh;
}

.message-container {
  width: 100%;
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
}

.message-container.sent {
  align-items: flex-end;
}

.message-container.received {
  align-items: flex-start;
}

.message {
  padding: 0.75rem 1.25rem;
  border-radius: 1.25rem;
  max-width: 80%;
  font-size: 1rem;
  word-wrap: break-word;
  margin-top: 0.25rem;
}

.message-container.sent .message {
  background-color: #e57373;
  color: white;
  border-radius: 1.25rem 0.25rem 1.25rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.message-container.received .message {
  background-color: #f06292;
  color: white;
  border-radius: 0.25rem 1.25rem 1.25rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.message-sender {
  font-size: 0.8rem;
  color: #e53935;
  font-weight: bold;
}

.message-input-area {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.message-input {
  flex-grow: 1;
  padding: 0.875rem;
  border: 2px solid #ef5350;
  border-radius: 0.75rem;
  font-size: 1rem;
  color: #424242;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.message-input:focus {
  outline: none;
  border-color: #e53935;
  box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.25);
}

.send-button {
  min-width: 44px;
  height: 44px;
  background-color: #e53935;
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.send-button:hover {
  background-color: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.chat-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

/* Адаптивные стили для мобильных устройств */
@media screen and (max-width: 640px) {
  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .chat-container {
    max-height: 300px;
    min-height: 150px;
  }

  .message {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    max-width: 85%;
  }

  .message-input-area {
    gap: 0.5rem;
  }

  .message-input {
    padding: 0.6rem;
    font-size: 0.9rem;
  }

  .send-button {
    min-width: 38px;
    height: 38px;
    padding: 0.3rem;
  }

  .chat-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-secondary {
    width: 100%;
    padding: 0.5rem 1rem;
    margin-bottom: 0.5rem;
  }
}

/* Дополнительные стили для очень маленьких экранов */
@media screen and (max-width: 320px) {
  .container {
    padding: 1rem;
  }

  h1 {
    font-size: 1.25rem;
  }

  .message-input {
    padding: 0.5rem;
  }

  .send-button {
    min-width: 34px;
    height: 34px;
  }
}

.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
}

.message-container.system {
  text-align: center;
  color: #888;
  font-style: italic;
}

.system-sender {
  display: none;
}
</style>
