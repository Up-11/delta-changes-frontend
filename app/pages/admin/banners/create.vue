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
        Создать баннер
      </h2>
    </div>

    <UCard class="border border-neutral-200 shadow-none">
      <UForm
        :state="state"
        :validate="validate"
        class="space-y-8"
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
              v-model="state.mediaId"
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
            Создать баннер
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { bannersService } from "~/api/banners.service";
import type { CreateBannerDto } from "~/api/types";

definePageMeta({
  layout: "admin",
});

const loading = ref(false);
const toast = useToast();

const state = reactive<CreateBannerDto>({
  mainText: "",
  subText: "",
  mediaId: undefined,
  sortOrder: 0,
  isActive: true,
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
    console.log(
      "[Banner Create] Submitting state:",
      JSON.stringify(state, null, 2),
    );
    await bannersService.create(state);

    toast.add({
      title: "Успех",
      description: "Баннер успешно создан",
      color: "primary",
    });

    navigateTo("/admin/banners");
  } catch (error: any) {
    console.error("Failed to create banner:", error);
    toast.add({
      title: "Ошибка",
      description: error.message || "Не удалось создать баннер",
      color: "primary",
    });
  } finally {
    loading.value = false;
  }
}
</script>
