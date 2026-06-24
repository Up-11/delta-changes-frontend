<script setup lang="ts">
definePageMeta({ layout: "default" });

const toast = useToast();
const { register, loading, error } = useSiteAuth();

const form = reactive({
  name: "",
  email: "",
  password: "",
  passwordConfirm: "",
});

const localError = ref("");

const isAdminSession = computed(
  () => import.meta.client && !!localStorage.getItem("auth_token"),
);

onMounted(() => {
  if (isAdminSession.value) {
    toast.add({
      title: "Активна админ-сессия",
      description:
        "Выйдите из админ-панели, чтобы зарегистрироваться на сайте.",
      color: "neutral",
      icon: "i-lucide-circle-alert",
    });
  }
});

watch(error, (message) => {
  if (message) {
    toast.add({
      title: "Ошибка регистрации",
      description: message,
      color: "neutral",
      icon: "i-lucide-circle-alert",
    });
  }
});

async function handleSubmit() {
  localError.value = "";

  if (form.password !== form.passwordConfirm) {
    localError.value = "Пароли не совпадают";
    toast.add({
      title: "Ошибка регистрации",
      description: localError.value,
      color: "neutral",
      icon: "i-lucide-circle-alert",
    });
    return;
  }

  if (form.password.length < 6) {
    localError.value = "Пароль должен быть не короче 6 символов";
    toast.add({
      title: "Ошибка регистрации",
      description: localError.value,
      color: "neutral",
      icon: "i-lucide-circle-alert",
    });
    return;
  }

  const ok = await register({
    name: form.name.trim(),
    email: form.email.trim(),
    password: form.password,
  });

  if (ok) {
    const { loadFavoriteIds } = useFavorites();
    await loadFavoriteIds();
    await navigateTo("/profile");
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
          Регистрация
        </h1>
        <p class="text-sm text-neutral-500 mt-2 uppercase tracking-wider">
          Создайте аккаунт
        </p>
      </div>

      <UAlert
        v-if="isAdminSession"
        color="neutral"
        variant="subtle"
        icon="i-lucide-shield-alert"
        title="Вы вошли в админ-панель"
        description="Выйдите из админки, чтобы создать пользовательский аккаунт."
        class="mb-6"
      />

      <UCard class="ring-1 ring-neutral-200 shadow-none" :ui="{ body: 'p-8' }">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <SiteInput
            v-model="form.name"
            label="Имя"
            placeholder="Иван"
            autocomplete="name"
            required
          />

          <SiteInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="email@example.com"
            autocomplete="email"
            required
          />

          <SiteInput
            v-model="form.password"
            label="Пароль"
            type="password"
            placeholder="Минимум 6 символов"
            autocomplete="new-password"
            required
          />

          <SiteInput
            v-model="form.passwordConfirm"
            label="Повторите пароль"
            type="password"
            autocomplete="new-password"
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
            Зарегистрироваться
          </UButton>
        </form>

        <p class="text-center text-sm text-neutral-500 mt-6">
          Уже есть аккаунт?
          <NuxtLink
            to="/auth/login"
            class="text-neutral-900 font-medium hover:underline ml-1"
          >
            Войти
          </NuxtLink>
        </p>
      </UCard>
    </div>
  </div>
</template>
