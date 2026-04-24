<template>
  <div class="space-y-6 text-neutral-900">
    <div class="flex items-center gap-4">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        @click="navigateTo('/admin/news')"
      />
      <h2 class="text-sm font-bold uppercase tracking-widest text-neutral-900">
        Редактировать новость
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
            <UFormField label="Заголовок" name="title" required>
              <UInput
                v-model="state.title"
                size="lg"
                placeholder="Заголовок новости"
                class="w-full"
                @update:model-value="generateSlug"
              />
            </UFormField>

            <UFormField label="Slug" name="slug" required>
              <UInput
                v-model="state.slug"
                size="lg"
                placeholder="url-slug"
                class="w-full"
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

          <UFormField label="Краткое описание" name="excerpt">
            <UInput
              v-model="state.excerpt"
              size="lg"
              placeholder="Краткое описание для карточки"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Содержание" name="content" required>
            <UTextarea
              v-model="state.content"
              size="lg"
              placeholder="Полный текст новости"
              :rows="10"
              class="w-full"
            />
          </UFormField>
        </div>

        <div class="space-y-6 pt-4">
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2"
          >
            Медиа
          </h3>
          <UFormField label="Медиа" name="mediaId">
            <AdminMediaUploader
              v-model="mediaUrl"
              label="Загрузить медиа"
              icon="i-lucide-file-video"
              @update:model-value="
                state.mediaIds = $event ? [$event] : undefined
              "
            />
          </UFormField>
        </div>

        <div class="space-y-6 pt-4">
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2"
          >
            Настройки публикации
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField label="Дата публикации" name="publishedAt">
              <UInput
                v-model="state.publishedAt"
                size="lg"
                type="datetime-local"
              />
            </UFormField>

            <UFormField label="Статус" name="status">
              <USelectMenu
                v-model="state.status"
                :items="statusOptions"
                size="lg"
                class="w-full"
                value-attribute="value"
                option-attribute="label"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField label="SEO заголовок" name="metaTitle">
              <UInput
                v-model="state.metaTitle"
                size="lg"
                placeholder="Мета заголовок"
                class="w-full"
              />
            </UFormField>

            <UFormField label="SEO описание" name="metaDesc">
              <UInput
                v-model="state.metaDesc"
                size="lg"
                placeholder="Мета описание"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <UButton
            color="neutral"
            variant="ghost"
            @click="navigateTo('/admin/news')"
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
import { newsService } from "~/api/news.service";
import type { UpdateNewsDto } from "~/api/types";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const id = route.params.id as string;

const loading = ref(false);
const isSlugManual = ref(true);
const isDataLoaded = ref(false);
const toast = useToast();

const state = reactive<{
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  publishedAt?: string;
  status?: { label: string; value: string };
  metaTitle?: string;
  metaDesc?: string;
  mediaIds?: string[];
}>({
  title: "",
  slug: "",
  content: "",
  excerpt: undefined,
  publishedAt: undefined,
  status: { label: "Черновик", value: "DRAFT" },
  metaTitle: undefined,
  metaDesc: undefined,
  mediaIds: undefined,
});

// Separate ref for URL display (ImageUploader needs URLs for preview)
const mediaUrl = ref<string | null>(null);

const statusOptions = [
  { label: "Черновик", value: "DRAFT" },
  { label: "Опубликовано", value: "PUBLISHED" },
];

onMounted(async () => {
  try {
    const data = await newsService.getById(id);

    Object.assign(state, {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt ?? undefined,
      publishedAt: data.publishedAt
        ? new Date(data.publishedAt).toISOString().slice(0, 16)
        : undefined,
      status: {
        label:
          statusOptions.find((s) => s.value === data.status)?.label ||
          "Черновик",
        value: data.status,
      },
      metaTitle: data.metaTitle ?? undefined,
      metaDesc: data.metaDesc ?? undefined,
      mediaIds: data.media?.map((m) => m.id) ?? undefined,
    });

    // Set URLs for preview
    mediaUrl.value = data.media?.[0]?.url ?? null;

    isDataLoaded.value = true;
  } catch (error: any) {
    console.error("Failed to load news:", error);
    toast.add({
      title: "Ошибка",
      description: "Не удалось загрузить данные новости",
      color: "primary",
    });
  }
});

const validate = (state: any) => {
  const errors: any[] = [];
  if (!state.title)
    errors.push({ path: "title", message: "Заголовок обязателен" });
  if (!state.slug) errors.push({ path: "slug", message: "Slug обязателен" });
  if (!state.content)
    errors.push({ path: "content", message: "Содержание обязательно" });
  return errors;
};

function cyrillicToSlug(text: string) {
  const dictionary: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ь: "",
    ы: "y",
    ъ: "",
    э: "e",
    ю: "yu",
    я: "ya",
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
  if (!isSlugManual.value && state.title) {
    state.slug = cyrillicToSlug(state.title);
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
  if (errors.length > 0) {
    console.error("Validation errors:", errors);
    return;
  }

  loading.value = true;
  try {
    await newsService.update(id, {
      title: state.title,
      slug: state.slug,
      content: state.content,
      excerpt: state.excerpt,
      publishedAt: state.publishedAt,
      status: state.status!.value!,
      metaTitle: state.metaTitle,
      metaDesc: state.metaDesc,
      mediaIds: state.mediaIds,
    });

    toast.add({
      title: "Успех",
      description: "Новость успешно обновлена",
      color: "primary",
    });

    navigateTo("/admin/news");
  } catch (error: any) {
    console.error("Failed to update news:", error);
    toast.add({
      title: "Ошибка",
      description: error.message || "Не удалось обновить новость",
      color: "primary",
    });
  } finally {
    loading.value = false;
  }
}
</script>
