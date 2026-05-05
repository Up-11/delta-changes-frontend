<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1
          class="text-2xl font-bold uppercase tracking-widest text-neutral-900"
        >
          О компании
        </h1>
        <p class="text-sm text-neutral-500 mt-1">
          Управление медиа для страницы "О ДЕЛЬТАСТРОЙ"
        </p>
      </div>
    </div>

    <!-- Hero Media Section -->
    <UCard class="border border-neutral-200 shadow-none">
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-video" class="w-5 h-5 text-primary" />
          <h3 class="font-bold uppercase tracking-wider">
            Видео / Фото для Hero
          </h3>
        </div>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-neutral-500">
          Загрузите видео или фоновое изображение для главного экрана страницы
          "О компании"
        </p>
        <AdminMediaUploader
          v-model="heroMediaId"
          label="Загрузить видео или фото"
          icon="i-lucide-video"
        />
      </div>
    </UCard>

    <!-- Save Button -->
    <div class="flex justify-end pt-6 border-t border-neutral-200">
      <UButton
        color="primary"
        size="xl"
        icon="i-lucide-save"
        label="Сохранить"
        :loading="isSaving"
        @click="saveMedia"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { aboutService } from "~/api/about.service";

definePageMeta({
  layout: "admin",
});

// State
const heroMediaId = ref<string | null>(null);
const isSaving = ref(false);
const toast = useToast();

// Load existing media (client-only to see in Network tab)
const { data: aboutData, execute: loadAboutData } = await useAsyncData(
  "admin-about-data",
  () => {
    console.log("[About Admin] Fetching about data...");
    return aboutService.getAboutData();
  },
  { server: false, immediate: false },
);

// Load on mount (client-side only)
onMounted(() => {
  console.log("[About Admin] Component mounted, loading data...");
  loadAboutData();
});

// Set media from loaded data
watch(
  aboutData,
  (val) => {
    console.log("[About Admin] Data loaded:", val);
    if (val?.about?.media?.[0]?.url) {
      heroMediaId.value = val.about.media[0].url;
    }
  },
  { immediate: true },
);

// Save only media
async function saveMedia() {
  isSaving.value = true;
  try {
    await aboutService.updateAbout({
      mediaIds: heroMediaId.value ? [heroMediaId.value] : [],
    });
    toast.add({ title: "Медиа сохранено", color: "primary" });
  } catch (e) {
    toast.add({ title: "Ошибка при сохранении", color: "primary" });
  } finally {
    isSaving.value = false;
  }
}
</script>
