<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-bold uppercase tracking-widest text-neutral-900">
        Баннеры
      </h2>
      <UButton
        color="neutral"
        class="text-xs uppercase tracking-wider"
        @click="navigateTo('/admin/banners/create')"
      >
        <UIcon name="i-lucide-plus" class="w-4 h-4 mr-1" />
        Добавить баннер
      </UButton>
    </div>

    <UCard class="border border-neutral-200 shadow-none" :ui="{ body: 'p-0' }">
      <div
        v-if="!banners?.length"
        class="text-center py-24 flex flex-col items-center justify-center bg-neutral-50/30"
      >
        <div
          class="bg-white p-4 rounded-full shadow-sm border border-neutral-100 mb-4"
        >
          <UIcon name="i-lucide-image" class="w-12 h-12 text-neutral-300" />
        </div>
        <p class="text-sm font-bold uppercase tracking-wider text-neutral-900">
          Список баннеров пуст
        </p>
        <p
          class="text-xs mt-2 text-neutral-400 max-w-60 leading-relaxed uppercase"
        >
          Добавьте первый баннер для отображения на главной странице.
        </p>
        <UButton
          color="primary"
          class="mt-6 text-xs uppercase tracking-wider px-6"
          @click="navigateTo('/admin/banners/create')"
        >
          Создать баннер
        </UButton>
      </div>

      <UTable v-else :data="banners" :columns="columns" class="w-full">
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
              :alt="row.original.mainText"
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
              <UIcon name="i-lucide-image" class="w-6 h-6" />
            </div>
          </div>
        </template>

        <template #mainText-cell="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-neutral-900">{{
              row.original.mainText
            }}</span>
            <span v-if="row.original.subText" class="text-xs text-neutral-500">
              {{ row.original.subText }}
            </span>
          </div>
        </template>

        <template #isActive-cell="{ row }">
          <UBadge
            :color="row.original.isActive ? 'primary' : 'neutral'"
            variant="subtle"
            size="xs"
          >
            {{ row.original.isActive ? "Активен" : "Скрыт" }}
          </UBadge>
        </template>

        <template #sortOrder-cell="{ row }">
          <span class="text-neutral-600 text-sm">{{
            row.original.sortOrder
          }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
              size="xs"
              @click="navigateTo(`/admin/banners/${row.original.id}`)"
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
          Вы уверены, что хотите удалить баннер
          <strong>{{ bannerToDelete?.mainText }}</strong
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
          <UButton color="primary" :loading="isDeleting" @click="deleteBanner">
            Удалить
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { bannersService } from "~/api/banners.service";
import type { Banner as IBanner } from "~/api/types";

definePageMeta({
  layout: "admin",
});

const toast = useToast();

const columns = [
  { id: "media", accessorKey: "media", header: "Изображение" },
  { id: "mainText", accessorKey: "mainText", header: "Текст" },
  { id: "sortOrder", accessorKey: "sortOrder", header: "Порядок" },
  { id: "isActive", accessorKey: "isActive", header: "Статус" },
  { id: "actions", accessorKey: "actions", header: "", width: "100px" },
];

const { data: banners, refresh } = await useAsyncData("banners", () =>
  bannersService.getAll(),
);

const isDeleteModalOpen = ref(false);
const bannerToDelete = ref<IBanner | null>(null);
const isDeleting = ref(false);

function confirmDelete(banner: IBanner) {
  bannerToDelete.value = banner;
  isDeleteModalOpen.value = true;
}

async function deleteBanner() {
  if (!bannerToDelete.value) return;

  isDeleting.value = true;
  try {
    await bannersService.delete(bannerToDelete.value.id);
    toast.add({
      title: "Успех",
      description: "Баннер успешно удален",
      color: "primary",
    });
    await refresh();
  } catch (error: any) {
    console.error("Failed to delete banner:", error);
    toast.add({
      title: "Ошибка",
      description: error.message || "Не удалось удалить баннер",
      color: "primary",
    });
  } finally {
    isDeleting.value = false;
    isDeleteModalOpen.value = false;
    bannerToDelete.value = null;
  }
}
</script>
