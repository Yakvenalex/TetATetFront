<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SearchForm from '@/components/SearchForm.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import ActionButtons from '@/components/ActionButtons.vue';
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Состояния формы поиска
const gender = ref('');
const ageFrom = ref<number | null>(null);
const ageTo = ref<number | null>(null);

// Состояния процесса поиска
const isLoading = ref(false);
const searchStatus = ref<'idle' | 'searching' | 'matched' | 'error'>('idle');
const searchError = ref('');
const roomKey = ref('');
const partnerInfo = ref<any>(null);
const userToken = ref('');

const currentUserId = parseInt(route.query.currentUserId as string);

// Таймер для проверки статуса комнаты
let statusCheckInterval: number | null = null;

// Функция для поиска собеседника (будет вызываться из SearchForm)
const findCompanion = () => {
    // Форма уже сама отправляет запрос, поэтому просто показываем загрузку
    isLoading.value = true;
    searchStatus.value = 'searching';
};

// Обработчик события, когда партнер найден
const handlePartnerFound = (data: any) => {
    console.log('Партнер найден:', data);
    isLoading.value = false;
    searchStatus.value = 'matched';
    roomKey.value = data.roomKey;
    partnerInfo.value = data.partner;
    userToken.value = data.token;

    // Переходим в комнату чата
    router.push({
        path: '/chat',
        query: { room: roomKey.value, token: userToken.value }
    });

    // Очищаем интервал проверки статуса, если он был
    clearStatusCheckInterval();
};

// Обработчик события, когда создана комната ожидания
const handleWaiting = (data: any) => {
    console.log('Ожидание партнера:', data);
    isLoading.value = true;
    searchStatus.value = 'searching';
    roomKey.value = data.roomKey;
    userToken.value = data.token;

    // Начинаем периодически проверять статус комнаты
    startStatusCheck();
};

// Функция для периодической проверки статуса комнаты
const startStatusCheck = () => {
    // Очищаем предыдущий интервал, если он существует
    clearStatusCheckInterval();

    // Устанавливаем новый интервал
    statusCheckInterval = window.setInterval(checkRoomStatus, 5000); // Проверка каждые 5 секунд
};

// Функция для проверки статуса комнаты
const checkRoomStatus = async () => {
    try {
        // Здесь должен быть запрос к API для проверки статуса комнаты
        const response = await fetch(`https://bash10-85-175-194-59.ru.tuna.am/api/room-status?key=${roomKey.value}&user_id=${currentUserId.value}`);

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        const data = await response.json();

        // Проверяем статус комнаты
        if (data.status === 'matched') {
            // Партнер найден, переходим в чат
            clearStatusCheckInterval();
            handlePartnerFound({
                roomKey: roomKey.value,
                partner: data.partner,
                token: userToken.value
            });
        } else if (data.status === 'closed' || data.status === 'expired') {
            // Комната была закрыта или истекло время ожидания
            clearStatusCheckInterval();
            isLoading.value = false;
            searchStatus.value = 'idle';
            searchError.value = 'Время ожидания истекло. Попробуйте снова.';
        }
    } catch (error) {
        console.error('Ошибка при проверке статуса комнаты:', error);
    }
};

// Функция для очистки интервала проверки статуса
const clearStatusCheckInterval = () => {
    if (statusCheckInterval !== null) {
        clearInterval(statusCheckInterval);
        statusCheckInterval = null;
    }
};

// Закрытие поиска
const closeSearch = () => {
    isLoading.value = false;
    searchStatus.value = 'idle';
    clearStatusCheckInterval();

    // Если есть активная комната ожидания, отменяем поиск
    if (roomKey.value) {
        cancelSearch();
    }
};

// Отмена поиска
const cancelSearch = async () => {
    try {
        await fetch(`https://bash10-85-175-194-59.ru.tuna.am/api/cancel-search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                room_key: roomKey.value,
                token: userToken.value
            })
        });
    } catch (error) {
        console.error('Ошибка при отмене поиска:', error);
    } finally {
        roomKey.value = '';
        userToken.value = '';
    }
};

// Очистка при размонтировании компонента
onMounted(() => {
    return () => {
        clearStatusCheckInterval();
    };
});

</script>

<template>
    <h1 class="title">Поиск Собеседника</h1>
    <div class="content">
        <!-- Форма поиска -->
        <SearchForm v-if="!isLoading" v-model:gender="gender" v-model:ageFrom="ageFrom" v-model:ageTo="ageTo"
            :userId="currentUserId" @find="findCompanion" @partner-found="handlePartnerFound" @waiting="handleWaiting"
            @close="closeSearch" />

        <!-- Индикатор загрузки -->
        <LoadingIndicator v-if="isLoading"
            :message="searchStatus === 'searching' ? 'Ищем подходящего собеседника...' : 'Подключение к чату...'">
            <p v-if="searchError" class="error-message">{{ searchError }}</p>
            <ActionButtons primary-text="Отменить" secondary-text="Закрыть" @primary-click="closeSearch"
                @secondary-click="closeSearch" />
        </LoadingIndicator>

        <router-view />
    </div>
</template>

<style scoped></style>