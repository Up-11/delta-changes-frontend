<template>
  <div
    class="min-h-screen flex items-center justify-center bg-neutral-50 p-4 font-sans"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-3">
          <div
            class="w-12 h-12 bg-neutral-900 flex items-center justify-center"
          >
            <UIcon name="i-lucide-shield-check" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1
              class="text-2xl font-bold tracking-[0.2em] text-neutral-900 uppercase"
            >
              DELTA
            </h1>
            <p class="text-xs text-neutral-500 uppercase tracking-wider">
              Админ панель
            </p>
          </div>
        </div>
      </div>

      <UCard
        class="shadow-none ring-1 ring-neutral-200 bg-white"
        :ui="{ body: { padding: 'p-12' } }"
      >
        <form @submit.prevent="handleLogin" class="flex justify-center">
          <div
            class="w-full max-w-[320px] space-y-2 flex flex-col justify-center"
          >
            <UInput
              v-model="form.username"
              placeholder="Логин"
              icon="i-lucide-user"
              size="md"
              color="neutral"
              variant="outline"
              autocomplete="username"
              :ui="{
                rounded: 'rounded-none',
                ring: 'focus:ring-1 focus:ring-neutral-900',
                icon: {
                  leading: { pointer: 'none' },
                  base: 'text-neutral-400',
                },
              }"
            />

            <UInput
              v-model="form.password"
              type="password"
              placeholder="Пароль"
              icon="i-lucide-lock"
              size="md"
              color="neutral"
              variant="outline"
              autocomplete="current-password"
              :ui="{
                rounded: 'rounded-none',
                ring: 'focus:ring-1 focus:ring-neutral-900',
                icon: {
                  leading: { pointer: 'none' },
                  base: 'text-neutral-400',
                },
              }"
            />

            <UButton
              type="submit"
              color="neutral"
              variant="solid"
              block
              size="md"
              :loading="loading"
              class="mt-4 uppercase text-[11px] tracking-[0.2em] font-bold h-11 rounded-none bg-neutral-900 hover:bg-neutral-800 transition-all"
            >
              Войти в систему
            </UButton>
          </div>
        </form>
      </UCard>

      <div class="text-center mt-8">
        <UButton
          to="/"
          variant="link"
          color="neutral"
          size="sm"
          class="text-neutral-400 hover:text-neutral-900 transition-colors uppercase text-[10px] tracking-widest"
        >
          <UIcon name="i-lucide-arrow-left" class="mr-1 w-3 h-3" />
          Вернуться на главную
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";

definePageMeta({
  layout: false,
});

const { login, isAuthenticated, loading, error } = useAuth();
const toast = useToast();

const form = reactive({
  username: "",
  password: "",
});

// Show toast on error
watch(error, (err) => {
  if (err) {
    toast.add({
      title: "Ошибка авторизации",
      description: err,
      color: "neutral",
      icon: "i-lucide-circle-alert",
    });
  }
});

// Redirect if already logged in
onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo("/admin");
  }
});

async function handleLogin() {
  if (!form.username || !form.password) {
    toast.add({
      title: "Заполните поля",
      description: "Введите логин и пароль",
      color: "neutral",
      icon: "i-lucide-alert-circle",
    });
    return;
  }

  const success = await login({
    username: form.username,
    password: form.password,
  });

  if (success) {
    toast.add({
      title: "Успешный вход",
      description: "Добро пожаловать в админку",
      color: "primary",
      icon: "i-lucide-check-circle",
    });
    await navigateTo("/admin");
  }
}
</script>
