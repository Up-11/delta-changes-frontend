<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        @click="navigateTo('/admin/projects')"
      />
      <h2 class="text-sm font-bold uppercase tracking-widest text-neutral-900">
        Создать проект
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
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2">
            Основная информация
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField
              label="Название"
              name="name"
              required
              description="Название проекта (например, Дельта)"
            >
              <UInput
                v-model="state.name"
                size="lg"
                class="w-full"
                placeholder="Название проекта"
                @update:model-value="generateSlug"
              />
            </UFormField>

            <UFormField
              label="Slug"
              name="slug"
              required
              description="URL-идентификатор"
            >
              <UInput
                v-model="state.slug"
                size="lg"
                class="w-full"
                placeholder="delta"
                @input="onSlugInput"
              >
                <template #trailing>
                  <UButton
                    v-if="isSlugManual"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-refresh-cw"
                    size="xs"
                    title="Включить автогенерацию"
                    @click="resetSlug"
                  />
                </template>
              </UInput>
            </UFormField>
          </div>

          <UFormField
            label="Краткое описание"
            name="shortDescription"
            description="Текст для карточек"
          >
            <UInput
              v-model="state.shortDescription"
              size="lg"
              class="w-full"
              placeholder="Кратко о проекте..."
            />
          </UFormField>

          <UFormField
            label="Полное описание"
            name="description"
            description="Подробное описание проекта"
          >
            <UTextarea
              v-model="state.description"
              size="lg"
              class="w-full"
              placeholder="Введите подробное описание..."
              rows="6"
            />
          </UFormField>
        </div>

        <div class="space-y-6 pt-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2">
            Настройки
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <UFormField
              label="Порядок сортировки"
              name="sortOrder"
              description="Приоритет в списке"
            >
              <UInput
                v-model.number="state.sortOrder"
                size="lg"
                class="w-full"
                type="number"
                placeholder="0"
              />
            </UFormField>

            <div class="flex items-center pt-4">
              <UCheckbox
                v-model="state.isActive"
                label="Проект активен"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <UButton
            color="neutral"
            variant="ghost"
            @click="navigateTo('/admin/projects')"
          >
            Отмена
          </UButton>
          <UButton type="submit" color="primary" :loading="loading">
            Создать проект
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { projectsService } from "~/api/projects.service";
import type { CreateProjectDto } from "~/api/types";

definePageMeta({
  layout: "admin",
});

const loading = ref(false);
const isSlugManual = ref(false);
const toast = useToast();

const state = reactive<CreateProjectDto>({
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  isActive: true,
  sortOrder: 0,
});

const validate = (state: any) => {
  const errors: any[] = [];
  if (!state.name) errors.push({ path: "name", message: "Название обязательно" });
  if (!state.slug) errors.push({ path: "slug", message: "Slug обязателен" });
  if (state.slug && !/^[a-z0-9-]+$/.test(state.slug)) {
    errors.push({ path: "slug", message: "Slug может содержать только латиницу, цифры и дефисы" });
  }
  return errors;
};

function cyrillicToSlug(text: string) {
  const dictionary: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i",
    й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
    у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ь: "", ы: "y", ъ: "",
    э: "e", ю: "yu", я: "ya",
  };

  return text
    .toLowerCase()
    .split("")
    .map((char) => dictionary[char] || char)
    .join("")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function generateSlug() {
  if (!isSlugManual.value && state.name) {
    state.slug = cyrillicToSlug(state.name);
  }
}

function onSlugInput() {
  isSlugManual.value = true;
}

function resetSlug() {
  isSlugManual.value = false;
  generateSlug();
}

async function onSubmit() {
  const errors = validate(state);
  if (errors.length > 0) return;

  loading.value = true;
  try {
    await projectsService.create(state);
    toast.add({
      title: "Успех",
      description: "Проект успешно создан",
      color: "primary",
    });
    navigateTo("/admin/projects");
  } catch (error: any) {
    console.error("Failed to create project:", error);
    toast.add({
      title: "Ошибка",
      description: error.message || "Не удалось создать проект",
      color: "primary",
    });
  } finally {
    loading.value = false;
  }
}
</script>
