<template>
  <div class="lg:hidden fixed top-4 left-4 z-50">
    <UButton
      icon="i-lucide-menu"
      color="neutral"
      variant="solid"
      @click="isSidebarOpen = true"
    />
  </div>

  <aside
    class="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-neutral-200 z-40 flex-col"
  >
    <div
      class="h-16 flex items-center px-6 border-b border-neutral-200 shrink-0"
    >
      <NuxtLink to="/admin" class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-neutral-900 flex items-center justify-center shrink-0"
        >
          <UIcon name="i-lucide-layout-dashboard" class="w-5 h-5 text-white" />
        </div>
        <div>
          <h1
            class="text-sm font-bold tracking-wider uppercase leading-none text-neutral-900"
          >
            Дельтастрой
          </h1>
          <span
            class="text-[10px] tracking-[0.15em] uppercase text-neutral-500"
          >
            Система управления
          </span>
        </div>
      </NuxtLink>
    </div>

    <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
      <UButton
        v-for="item in navigation"
        :key="item.path"
        :to="item.path"
        :icon="item.icon"
        :label="item.label"
        variant="ghost"
        color="neutral"
        class="w-full justify-start"
        :class="{ 'bg-neutral-100 text-neutral-900': isActive(item.path) }"
      />
    </nav>

    <div class="p-4 border-t border-neutral-200 shrink-0">
      <UButton
        to="/"
        icon="i-lucide-arrow-left"
        label="На сайт"
        variant="ghost"
        color="neutral"
        class="w-full justify-start"
      />
    </div>
  </aside>

  <div class="lg:hidden fixed top-4 left-4 z-50">
    <UButton
      icon="i-lucide-menu"
      color="neutral"
      variant="solid"
      @click="isSidebarOpen = true"
    />
  </div>

  <USlideover v-model:open="isSidebarOpen" side="left">
    <template #content>
      <div class="flex flex-col h-full w-full bg-white">
        <div
          class="h-16 flex items-center px-6 border-b border-neutral-200 shrink-0"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-neutral-900 flex items-center justify-center shrink-0"
            >
              <UIcon
                name="i-lucide-layout-dashboard"
                class="w-5 h-5 text-white"
              />
            </div>
            <div>
              <h1
                class="text-sm font-bold tracking-wider uppercase leading-none text-neutral-900"
              >
                Дельтастрой
              </h1>
              <span
                class="text-[10px] tracking-[0.15em] uppercase text-neutral-500"
              >
                Система управления
              </span>
            </div>
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            class="ml-auto lg:hidden"
            @click="isSidebarOpen = false"
          />
        </div>

        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          <UButton
            v-for="item in navigation"
            :key="item.path"
            :to="item.path"
            :icon="item.icon"
            :label="item.label"
            variant="ghost"
            color="neutral"
            class="w-full justify-start"
            :class="{
              'bg-neutral-100 text-neutral-900': isActive(item.path),
            }"
            @click="isSidebarOpen = false"
          />
        </nav>

        <div class="p-4 border-t border-neutral-200 shrink-0 pb-safe">
          <UButton
            to="/"
            icon="i-lucide-arrow-left"
            label="На сайт"
            variant="ghost"
            color="neutral"
            class="w-full justify-start"
          />
        </div>
      </div>
    </template>
  </USlideover>
  <div class="lg:ml-64 min-h-screen flex flex-col">
    <header
      class="h-16 bg-white border-b border-neutral-200 flex items-center justify-end px-4 lg:px-8 sticky top-0 z-30"
    >
      <UButton
        icon="i-lucide-log-out"
        label="Выйти"
        color="neutral"
        variant="ghost"
        class="text-xs uppercase tracking-widest"
        @click="handleLogout"
      />
    </header>

    <main class="p-8 max-w-7xl mx-auto w-full flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { isAuthenticated, logout, fetchProfile } = useAuth();
const toast = useToast();

// Check auth and redirect if needed
onMounted(async () => {
  if (isAuthenticated.value && route.path !== "/admin/login") {
    // Verify token is still valid
    const profile = await fetchProfile();
    if (!profile) {
      toast.add({
        title: "Сессия истекла",
        description: "Пожалуйста, войдите снова",
        color: "neutral",
        icon: "i-lucide-clock",
      });
      navigateTo("/admin/login");
    }
  } else if (!isAuthenticated.value && route.path !== "/admin/login") {
    navigateTo("/admin/login");
  }
});

// Watch auth state and redirect if logged out
watch(isAuthenticated, (val) => {
  if (!val && route.path !== "/admin/login") {
    navigateTo("/admin/login");
  }
});

const navigation = [
  {
    path: "/admin",
    label: "Панель управления",
    icon: "i-lucide-layout-dashboard",
  },
  { path: "/admin/objects", label: "Объекты", icon: "i-lucide-building-2" },
  { path: "/admin/apartments", label: "Квартиры", icon: "i-lucide-door-open" },
  { path: "/admin/projects", label: "Проекты", icon: "i-lucide-hard-hat" },
  { path: "/admin/banners", label: "Баннеры", icon: "i-lucide-image" },
  { path: "/admin/news", label: "Новости", icon: "i-lucide-newspaper" },
  { path: "/admin/applications", label: "Заявки", icon: "i-lucide-inbox" },
];

function isActive(path: string): boolean {
  if (path === "/admin") {
    return route.path === "/admin";
  }
  return route.path.startsWith(path);
}

const isSidebarOpen = ref(false);

watch(
  () => route.path,
  () => {
    isSidebarOpen.value = false;
  },
);

async function handleLogout() {
  await logout();
  toast.add({
    title: "Выход выполнен",
    description: "До свидания!",
    color: "neutral",
    icon: "i-lucide-log-out",
  });
  await navigateTo("/admin/login");
}
</script>
