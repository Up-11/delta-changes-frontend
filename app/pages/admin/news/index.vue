<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-bold uppercase tracking-widest text-neutral-900">
        Новости
      </h2>
      <UButton
        color="neutral"
        class="text-xs uppercase tracking-wider"
        @click="navigateTo('/admin/news/create')"
      >
        <UIcon name="i-lucide-plus" class="w-4 h-4 mr-1" />
        Добавить новость
      </UButton>
    </div>

    <!-- Фильтры -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <UInput
          v-model="search"
          placeholder="Поиск по заголовку..."
          icon="i-lucide-search"
          class="flex-1"
          size="lg"
        />
        <USelectMenu
          v-model="filterStatus"
          :items="statusOptions"
          placeholder="Все статусы"
          size="lg"
          class="w-full sm:w-48"
          option-attribute="label"
          value-attribute="value"
        />
      </div>
    </div>

    <UCard class="border border-neutral-200 shadow-none" :ui="{ body: 'p-0' }">
      <div
        v-if="!filteredNews?.length"
        class="text-center py-24 flex flex-col items-center justify-center bg-neutral-50/30"
      >
        <div
          class="bg-white p-4 rounded-full shadow-sm border border-neutral-100 mb-4"
        >
          <UIcon name="i-lucide-newspaper" class="w-12 h-12 text-neutral-300" />
        </div>
        <p class="text-sm font-bold uppercase tracking-wider text-neutral-900">
          {{
            isAnyFilterActive ? "Новости не найдены" : "Список новостей пуст"
          }}
        </p>
        <p
          class="text-xs mt-2 text-neutral-400 max-w-60 leading-relaxed uppercase"
        >
          {{
            isAnyFilterActive
              ? "Попробуйте изменить параметры фильтрации"
              : "Добавьте первую новость для отображения на сайте."
          }}
        </p>
        <UButton
          v-if="!isAnyFilterActive"
          color="primary"
          class="mt-6 text-xs uppercase tracking-wider px-6"
          @click="navigateTo('/admin/news/create')"
        >
          Создать новость
        </UButton>
      </div>

      <UTable v-else :data="filteredNews" :columns="columns" class="w-full">
        <template #media-cell="{ row }">
          <div
            class="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200"
          >
            <img
              v-if="
                row.original.media?.[0]?.url &&
                row.original.media[0]?.type === 'IMAGE'
              "
              :src="`http://localhost:4200${row.original.media[0].url}`"
              :alt="row.original.title"
              class="w-full h-full object-cover"
            />
            <div
              v-else-if="
                row.original.media?.[0]?.url &&
                row.original.media[0]?.type === 'VIDEO'
              "
              class="w-full h-full flex items-center justify-center bg-neutral-900"
            >
              <UIcon name="i-lucide-file-video" class="w-6 h-6 text-white" />
            </div>
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-neutral-300"
            >
              <UIcon name="i-lucide-file-video" class="w-6 h-6" />
            </div>
          </div>
        </template>

        <template #title-cell="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-neutral-900">{{
              row.original.title
            }}</span>
            <span v-if="row.original.excerpt" class="text-xs text-neutral-500">
              {{ row.original.excerpt }}
            </span>
          </div>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.status === 'PUBLISHED' ? 'primary' : 'neutral'"
            variant="subtle"
            size="xs"
          >
            {{
              row.original.status === "PUBLISHED" ? "Опубликовано" : "Черновик"
            }}
          </UBadge>
        </template>

        <template #publishedAt-cell="{ row }">
          <span
            v-if="row.original.publishedAt"
            class="text-neutral-600 text-sm"
          >
            {{ new Date(row.original.publishedAt).toLocaleDateString("ru-RU") }}
          </span>
          <span v-else class="text-neutral-400 text-sm">—</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
              size="xs"
              @click="navigateTo(`/admin/news/${row.original.id}`)"
            />
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-trash-2"
              size="xs"
              @click="confirmDelete(row.original)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal
      v-model:open="isDeleteModalOpen"
      title="Подтверждение удаления"
      description="Это действие нельзя отменить."
    >
      <template #body>
        <p class="text-neutral-600">
          Вы уверены, что хотите удалить новость
          <strong>{{ newsToDelete?.title }}</strong
          >?
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            @click="isDeleteModalOpen = false"
          >
            Отмена
          </UButton>
          <UButton color="primary" :loading="isDeleting" @click="deleteNews">
            Удалить
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { newsService } from "~/api/news.service";
import type { NewsWithRelations as INews } from "~/api/types";

definePageMeta({
  layout: "admin",
});

const toast = useToast();
const search = ref("");

const statusOptions = [
  { label: "Все статусы", value: "ALL" },
  { label: "Опубликовано", value: "PUBLISHED" },
  { label: "Черновик", value: "DRAFT" },
];

const filterStatus = ref(statusOptions[0]);

const columns = [
  { id: "media", accessorKey: "media", header: "Медиа" },
  { id: "title", accessorKey: "title", header: "Заголовок" },
  { id: "status", accessorKey: "status", header: "Статус" },
  { id: "publishedAt", accessorKey: "publishedAt", header: "Дата публикации" },
  { id: "actions", accessorKey: "actions", header: "", width: "100px" },
];

const { data: news, refresh } = await useAsyncData("news", () =>
  newsService.getAll(),
);

const filteredNews = computed(() => {
  if (!news.value) return [];

  return news.value.filter((item: INews) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.value.toLowerCase());
    const matchesStatus =
      filterStatus.value?.value === "ALL" ||
      item.status === filterStatus.value?.value;

    return matchesSearch && matchesStatus;
  });
});

const isAnyFilterActive = computed(() => {
  return search.value !== "" || filterStatus.value?.value !== "ALL";
});

const isDeleteModalOpen = ref(false);
const newsToDelete = ref<INews | null>(null);
const isDeleting = ref(false);

function confirmDelete(newsItem: INews) {
  newsToDelete.value = newsItem;
  isDeleteModalOpen.value = true;
}

async function deleteNews() {
  if (!newsToDelete.value) return;

  isDeleting.value = true;
  try {
    await newsService.delete(newsToDelete.value.id);
    toast.add({
      title: "Успех",
      description: "Новость успешно удалена",
      color: "primary",
    });
    await refresh();
  } catch (error: any) {
    console.error("Failed to delete news:", error);
    toast.add({
      title: "Ошибка",
      description: error.message || "Не удалось удалить новость",
      color: "primary",
    });
  } finally {
    isDeleting.value = false;
    isDeleteModalOpen.value = false;
    newsToDelete.value = null;
  }
}
</script>
