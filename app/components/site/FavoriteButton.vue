<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    apartmentId: string;
    size?: "sm" | "md" | "lg";
    variant?: "overlay" | "inline";
  }>(),
  {
    size: "md",
    variant: "overlay",
  },
);

const toast = useToast();
const { isAuthenticated } = useSiteAuth();
const { isFavorite, toggleFavorite, ensureInitialized } = useFavorites();

const busy = ref(false);
const favorited = computed(() => isFavorite(props.apartmentId));

onMounted(() => {
  ensureInitialized();
});

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const iconClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

async function handleClick(event: Event) {
  event.preventDefault();
  event.stopPropagation();

  if (!isAuthenticated.value) {
    toast.add({
      title: "Войдите в аккаунт",
      description: "Чтобы сохранять квартиры в избранное",
      color: "neutral",
    });
    const route = useRoute();
    await navigateTo({
      path: "/auth/login",
      query: { redirect: route.fullPath },
    });
    return;
  }

  busy.value = true;
  try {
    const result = await toggleFavorite(props.apartmentId);

    if (result === "added") {
      toast.add({
        title: "Квартира добавлена в избранное",
        color: "neutral",
        icon: "i-lucide-heart",
      });
    }
  } catch {
    toast.add({
      title: "Ошибка",
      description: "Не удалось обновить избранное",
      color: "neutral",
    });
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <button
    type="button"
    :class="[
      'flex items-center justify-center rounded-full transition-all shrink-0',
      sizeClasses[size],
      variant === 'overlay'
        ? favorited
          ? 'bg-red-50 shadow-md border border-red-200 text-red-600'
          : 'bg-white/90 shadow-md hover:bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900'
        : favorited
          ? 'bg-red-50 hover:bg-red-100 border border-red-200 text-red-600'
          : 'bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-500 hover:text-neutral-900',
      busy ? 'opacity-60 pointer-events-none' : '',
    ]"
    :aria-label="favorited ? 'Убрать из избранного' : 'Добавить в избранное'"
    :aria-pressed="favorited"
    @click="handleClick"
  >
    <UIcon
      v-if="busy"
      name="i-lucide-loader-2"
      :class="[iconClasses[size], 'animate-spin']"
    />
    <UIcon
      v-else-if="favorited"
      name="i-lucide-heart"
      :class="[iconClasses[size], 'fill-current stroke-current']"
    />
    <UIcon
      v-else
      name="i-lucide-heart"
      :class="[iconClasses[size], 'fill-none stroke-current']"
    />
  </button>
</template>
