<script setup lang="ts">
import IconSend from '@/components/icons/IconSend.vue'
import {
  BASE_SITE,
  CENTRIFUGO_URL,
  clearRoom,
  sendSystemMessage,
} from '@/services/api'
import { Centrifuge } from 'centrifuge'
import { nextTick, onMounted, onUnmounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMiniApp } from 'vue-tg'
const { close } = useMiniApp()

const router = useRouter()
const route = useRoute()

const route_query = route.query

const token = route_query.token as string
const user_id = route_query.user_id as string
const sender = route_query.sender

const originalRoom = route.query.room as string
const room = originalRoom.replace('chat_room:', '')

// Получаем имя собеседника
const interlocutorName = computed(() => {
  // Если есть сообщения от собеседника, берем имя из первого такого сообщения
  const interlocutorMessage = messages.value.find(
    (msg) => msg.sender !== 'Вы' && msg.sender !== 'Система'
  )
  return interlocutorMessage?.sender || 'собеседником'
})

// Состояния
const messages = ref<
  { sender: string; text: string; type?: 'system' | 'user' }[]
>([])
const newMessage = ref('')
const inputRef = ref(null)

// Инициализация Centrifuge
const centrifuge = new Centrifuge(CENTRIFUGO_URL, {
  token: token,
})

let sub: ReturnType<typeof centrifuge.newSubscription>

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
  sendSystemMessage(
    `Пользователь ${sender} присоединился к чату`,
    room,
    parseInt(user_id)
  )
}

// Подключение к Centrifugo и инициализация подписки при монтировании компонента
onMounted(() => {
  centrifuge.connect()
  initializeSubscription()

  // Добавляем обработчик для скрытия клавиатуры при скролле
  const chatContainer = document.getElementById('chatContainer')
  if (chatContainer) {
    chatContainer.addEventListener('touchstart', () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    })
  }
})

// Отключение от Centrifugo и отписка от канала при уничтожении компонента
onUnmounted(() => {
  // Отправляем системное сообщение о выходе
  sendSystemMessage(
    `Пользователь ${sender} покинул чат`,
    room,
    parseInt(user_id)
  )

  if (sub) {
    sub.unsubscribe()
  }
  centrifuge.disconnect()

  // Удаляем обработчик
  const chatContainer = document.getElementById('chatContainer')
  if (chatContainer) {
    chatContainer.removeEventListener('touchstart', () => {})
  }
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

      // Скрываем клавиатуру после отправки сообщения
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }

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

// Функция смены собеседника
const changeInterlocutor = async () => {
  await clearRoom(originalRoom)
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
  await sendSystemMessage(
    `Пользователь ${sender} покинул чат`,
    room,
    parseInt(user_id)
  )
  await clearRoom(originalRoom)
  close()
}
</script>

<template>
  <div class="chat-wrapper">
    <div class="chat-header">
      <button
        class="header-button new-button"
        @click="changeInterlocutor"
        title="Новый собеседник"
      >
        <i class="icon-change">↺</i> Новый
      </button>
      <div class="chat-title">Чат с {{ interlocutorName }}</div>
      <button
        class="header-button close-button"
        @click="closeChat"
        title="Закрыть"
      >
        <i class="icon-close">✕</i> Закрыть
      </button>
    </div>

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
        ref="inputRef"
      />
      <button class="send-button" @click="sendMessageWithServer">
        <IconSend />
      </button>
    </div>
  </div>
</template>
<style scoped>
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 2px solid #ef5350;
}

.chat-title {
  font-weight: bold;
  color: #e53935;
  font-size: 1.1rem;
  text-align: center;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 0.5rem;
}

.header-button {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background-color: #ef5350;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  border: none;
}

.header-button:hover {
  background-color: #e53935;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-button i {
  margin-right: 0.25rem;
  font-style: normal;
  font-weight: bold;
}

.action-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-size: 1.2rem;
  color: white;
}

.change-button {
  background-color: #ef5350;
}

.close-button {
  background-color: #e53935;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.icon-change,
.icon-close {
  font-style: normal;
  font-weight: bold;
}

.chat-container {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding: 0.75rem;
  border: 1px solid #ef5350;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  background-color: #fff8f8;
  transition: background-color 0.3s ease;
  height: calc(100vh - 200px);
  min-height: 40vh;
  max-height: 70vh;
}

@media screen and (max-width: 768px) {
  .chat-container {
    height: calc(100vh - 180px);
  }
}

@media screen and (max-width: 480px) {
  .chat-container {
    height: calc(100vh - 160px);
    padding: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .chat-header {
    padding: 0.4rem 0;
    margin-bottom: 0.5rem;
  }

  .header-button {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }

  .chat-title {
    font-size: 0.9rem;
  }
}

@media screen and (max-height: 600px) {
  .chat-container {
    min-height: 30vh;
  }
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
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 10;
}

.message-input {
  flex-grow: 1;
  padding: 1rem;
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
  min-width: 48px;
  height: 48px;
  background-color: #e53935;
  color: white;
  padding: 0.5rem;
  border-radius: 0.75rem;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  border: none;
}

.send-button:hover {
  background-color: #d32f2f;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

/* Адаптивные стили для мобильных устройств */
@media screen and (max-width: 640px) {
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
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  .send-button {
    min-width: 42px;
    height: 42px;
    padding: 0.3rem;
  }
}

/* Дополнительные стили для очень маленьких экранов */
@media screen and (max-width: 320px) {
  .message-input {
    padding: 0.6rem;
  }

  .send-button {
    min-width: 38px;
    height: 38px;
  }

  .header-button {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
  }
}

.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: env(safe-area-inset-bottom, 0);
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
