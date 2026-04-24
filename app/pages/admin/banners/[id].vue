<template>
  <div class="space-y-6 text-neutral-900">
    <div class="flex items-center gap-4">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        @click="navigateTo('/admin/banners')"
      />
      <h2 class="text-sm font-bold uppercase tracking-widest text-neutral-900">
        Редактировать баннер
      </h2>
    </div>

    <UCard class="border border-neutral-200 shadow-none relative">
      <!-- Loading overlay -->
      <div
        v-if="!isDataLoaded"
        class="absolute inset-0 bg-white/80 flex items-center justify-center z-10"
      >
        <div class="flex flex-col items-center gap-3">
          <UIcon
            name="i-lucide-loader-2"
            class="w-8 h-8 animate-spin text-primary"
          />
          <span class="text-sm text-neutral-500">Загрузка данных...</span>
        </div>
      </div>

      <UForm
        :state="state"
        :validate="validate"
        class="space-y-8"
        :disabled="!isDataLoaded"
        @submit="onSubmit"
      >
        <div class="space-y-6">
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2"
          >
            Основная информация
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField label="Основной текст" name="mainText" required>
              <UInput
                v-model="state.mainText"
                size="lg"
                placeholder="Заголовок баннера"
              />
            </UFormField>

            <UFormField label="Дополнительный текст" name="subText">
              <UInput
                v-model="state.subText"
                size="lg"
                placeholder="Подзаголовок или описание"
              />
            </UFormField>
          </div>

          <UFormField label="Медиа" name="mediaId">
            <AdminMediaUploader
              v-model="mediaUrl"
              label="Загрузить изображение или видео"
              icon="i-lucide-file-video"
              @update:model-value="state.mediaId = $event"
            />
          </UFormField>
        </div>

        <div class="space-y-6 pt-4">
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2"
          >
            Настройки отображения
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField label="Порядок сортировки" name="sortOrder">
              <UInput
                v-model.number="state.sortOrder"
                type="number"
                size="lg"
                placeholder="0"
              />
            </UFormField>

            <div class="flex items-center pt-4">
              <UCheckbox
                v-model="state.isActive"
                label="Баннер активен и отображается"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <UButton
            color="neutral"
            variant="ghost"
            @click="navigateTo('/admin/banners')"
          >
            Отмена
          </UButton>
          <UButton type="submit" color="primary" :loading="loading">
            Сохранить изменения
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { bannersService } from "~/api/banners.service";
import type { UpdateBannerDto } from "~/api/types";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const id = route.params.id as string;

const loading = ref(false);
const toast = useToast();

const state = reactive<{
  mainText: string;
  subText?: string;
  mediaId?: string | null;
  sortOrder: number;
  isActive: boolean;
}>({
  mainText: "",
  subText: undefined,
  mediaId: undefined,
  sortOrder: 0,
  isActive: true,
});

// Separate ref for URL display (ImageUploader needs URL for preview)
const mediaUrl = ref<string | null>(null);
const isDataLoaded = ref(false);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const data = await bannersService.getById(id);

    Object.assign(state, {
      mainText: data.mainText,
      subText: data.subText ?? undefined,
      mediaId: data.media?.[0]?.id ?? undefined,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    });

    // Set URL for preview (media is an array)
    mediaUrl.value = data.media?.[0]?.url ?? null;
    isDataLoaded.value = true;
  } catch (error: any) {
    console.error("Failed to load banner:", error);
    toast.add({
      title: "Ошибка",
      description: "Не удалось загрузить данные баннера",
      color: "primary",
    });
  } finally {
    isLoading.value = false;
  }
});

const validate = (state: any) => {
  const errors: any[] = [];
  if (!state.mainText)
    errors.push({ path: "mainText", message: "Основной текст обязателен" });

  return errors;
};

async function onSubmit() {
  const errors = validate(state);
  if (errors.length > 0) {
    console.error("Validation errors:", errors);
    return;
  }

  loading.value = true;
  try {
    await bannersService.update(id, state as UpdateBannerDto);

    toast.add({
      title: "Успех",
      description: "Баннер успешно обновлен",
      color: "primary",
    });

    navigateTo("/admin/banners");
  } catch (error: any) {
    console.error("Failed to update banner:", error);
    toast.add({
      title: "Ошибка",
      description: error.message || "Не удалось обновить баннер",
      color: "primary",
    });
  } finally {
    loading.value = false;
  }
}
</script>
