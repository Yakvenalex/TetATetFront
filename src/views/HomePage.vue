<script setup lang="ts">
import { ref } from 'vue';
import SearchForm from '@/components/SearchForm.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import ActionButtons from '@/components/ActionButtons.vue';
import { useRouter } from 'vue-router'; // Импортируем useRouter

const router = useRouter(); // Используем useRouter
const gender = ref('');
const ageFrom = ref<number | null>(null);
const ageTo = ref<number | null>(null);
const isLoading = ref(false);


const findCompanion = () => {
    isLoading.value = true;
    console.log('Поиск собеседника...', {
        gender: gender.value,
        ageFrom: ageFrom.value,
        ageTo: ageTo.value
    });
    setTimeout(() => {
        isLoading.value = false;
        console.log('Собеседник найден!');
        router.push('/chat');
    }, 5000);
};

const closeSearch = () => {
    isLoading.value = false;
    console.log('Поиск закрыт');
};



</script>

<template>
    <div class="container">
        <h1 class="title">Поиск Собеседника</h1>
        <div class="content">
            <SearchForm v-if="!isLoading" v-model:gender="gender" v-model:ageFrom="ageFrom" v-model:ageTo="ageTo"
                @find="findCompanion" @close="closeSearch" />

            <LoadingIndicator v-if="isLoading" message="Ищем подходящего собеседника...">
                <ActionButtons primary-text="Назад" secondary-text="Закрыть" @primary-click="isLoading = false"
                    @secondary-click="closeSearch" />
            </LoadingIndicator>
            <router-view />
        </div>
    </div>
</template>

<style scoped>
/* Стили для главного компонента */
</style>