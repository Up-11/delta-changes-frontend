<script setup lang="ts">
definePageMeta({ layout: "default" });

const toast = useToast();
const { login, loading, error } = useSiteAuth();
const route = useRoute();

const form = reactive({
  email: "",
  password: "",
});

const redirectTo = computed(
  () => (route.query.redirect as string) || "/profile",
);

const isAdminSession = computed(
  () => import.meta.client && !!localStorage.getItem("auth_token"),
);

onMounted(() => {
  if (isAdminSession.value) {
    toast.add({
      title: "Активна админ-сессия",
      description:
        "Выйдите из админ-панели, чтобы войти на сайт как пользователь.",
      color: "neutral",
      icon: "i-lucide-circle-alert",
    });
  }
});

watch(error, (message) => {
  if (message) {
    toast.add({
      title: "Ошибка входа",
      description: message,
      color: "neutral",
      icon: "i-lucide-circle-alert",
    });
  }
});

async function handleSubmit() {
  if (!form.email.trim() || !form.password) {
    toast.add({
      title: "Заполните поля",
      description: "Введите email и пароль",
      color: "neutral",
      icon: "i-lucide-alert-circle",
    });
    return;
  }

  const ok = await login({
    email: form.email.trim(),
    password: form.password,
  });
  if (ok) {
    const { loadFavoriteIds } = useFavorites();
    await loadFavoriteIds();
    await navigateTo(redirectTo.value);
  }
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-md">
      <div class="text-center mb-10">
        <h1
          class="text-3xl font-bold uppercase tracking-[0.2em] text-neutral-900"
        >
          Вход
        </h1>
        <p class="text-sm text-neutral-500 mt-2 uppercase tracking-wider">
          Личный кабинет
        </p>
      </div>

      <UAlert
        v-if="isAdminSession"
        color="neutral"
        variant="subtle"
        icon="i-lucide-shield-alert"
        title="Вы вошли в админ-панель"
        description="Выйдите из админки, чтобы авторизоваться на сайте как пользователь."
        class="mb-6"
      />

      <UCard class="ring-1 ring-neutral-200 shadow-none" :ui="{ body: 'p-8' }">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <SiteInput
            v-model="form.email"
            label="Email"
            type="text"
            placeholder="email@example.com"
            autocomplete="email"
            required
          />

          <SiteInput
            v-model="form.password"
            label="Пароль"
            type="password"
            placeholder="••••••"
            autocomplete="current-password"
            required
          />

          <UButton
            type="submit"
            color="neutral"
            block
            size="lg"
            :loading="loading"
            class="rounded-none uppercase tracking-widest bg-neutral-900"
          >
            Войти
          </UButton>
        </form>

        <p class="text-center text-sm text-neutral-500 mt-6">
          Нет аккаунта?
          <NuxtLink
            to="/auth/register"
            class="text-neutral-900 font-medium hover:underline ml-1"
          >
            Зарегистрироваться
          </NuxtLink>
        </p>
      </UCard>
    </div>
  </div>
</template>
