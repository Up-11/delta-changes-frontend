<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-bold uppercase tracking-widest text-neutral-900">
        Объекты
      </h2>
      <UButton
        color="neutral"
        class="text-xs uppercase tracking-wider"
        @click="navigateTo('/admin/objects/create')"
      >
        <UIcon name="i-lucide-plus" class="w-4 h-4 mr-1" />
        Добавить объект
      </UButton>
    </div>

    <UCard class="border border-neutral-200 shadow-none" :ui="{ body: 'p-0' }">
      <div
        v-if="!objects?.length"
        class="text-center py-24 flex flex-col items-center justify-center bg-neutral-50/30"
      >
        <div
          class="bg-white p-4 rounded-full shadow-sm border border-neutral-100 mb-4"
        >
          <UIcon
            name="i-lucide-building-2"
            class="w-12 h-12 text-neutral-300"
          />
        </div>
        <p class="text-sm font-bold uppercase tracking-wider text-neutral-900">
          Список объектов пуст
        </p>
        <p class="text-xs mt-2 text-neutral-400 max-w-[240px] leading-relaxed">
          У вас пока нет созданных объектов. Добавьте первый объект, чтобы
          начать работу.
        </p>
        <UButton
          color="primary"
          class="mt-6 text-xs uppercase tracking-wider px-6"
          @click="navigateTo('/admin/objects/create')"
        >
          Создать объект
        </UButton>
      </div>

      <UTable v-else :data="objects" :columns="columns" class="w-full">
        <template #name-cell="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-neutral-900">{{
              row.original.name
            }}</span>
            <span
              v-if="row.original.shortDescription"
              class="text-xs text-neutral-500"
            >
              {{ row.original.shortDescription }}
            </span>
          </div>
        </template>
        <!-- ... остальное содержимое слотов остается без изменений ... -->
        <template #slug-cell="{ row }">
          <span class="text-neutral-600 text-sm font-mono">{{
            row.original.slug
          }}</span>
        </template>

        <template #address-cell="{ row }">
          <span class="text-neutral-600 text-sm">
            {{ row.original.address || "—" }}
          </span>
        </template>

        <template #coordinates-cell="{ row }">
          <span
            v-if="row.original.latitude && row.original.longitude"
            class="text-neutral-600 text-sm"
          >
            {{ row.original.latitude.toFixed(4) }},
            {{ row.original.longitude.toFixed(4) }}
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
              @click="navigateTo(`/admin/objects/${row.original.id}`)"
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
    <!-- ... модальное окно удалено для краткости, оно остается ... -->

    <UModal
      v-model:open="isDeleteModalOpen"
      title="Подтверждение удаления"
      description="Это действие нельзя отменить."
    >
      <template #body>
        <p class="text-neutral-600">
          Вы уверены, что хотите удалить объект
          <strong>{{ objectToDelete?.name }}</strong
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
          <UButton color="primary" @click="deleteObject"> Удалить </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { objectsService } from "~/api/objects.service";
import type { Object as IObject } from "~/api/types";

definePageMeta({
  layout: "admin",
});

const toast = useToast();
const columns = [
  { id: "name", accessorKey: "name", header: "Название" },
  { id: "slug", accessorKey: "slug", header: "Slug" },
  { id: "address", accessorKey: "address", header: "Адрес" },
  { id: "coordinates", accessorKey: "coordinates", header: "Координаты" },
  { id: "actions", accessorKey: "actions", header: "", width: "100px" },
];

const { data: objects, refresh } = await useAsyncData("objects", () =>
  objectsService.getAll(),
);

const isDeleteModalOpen = ref(false);
const objectToDelete = ref<IObject | null>(null);
const isDeleting = ref(false);

function confirmDelete(obj: IObject) {
  objectToDelete.value = obj;
  isDeleteModalOpen.value = true;
}

async function deleteObject() {
  if (!objectToDelete.value) return;

  isDeleting.value = true;
  try {
    await objectsService.delete(objectToDelete.value.id);
    toast.add({
      title: "Успех",
      description: "Объект успешно удален",
      color: "primary",
    });
    await refresh();
  } catch (error: any) {
    console.error("Failed to delete object:", error);
    toast.add({
      title: "Ошибка",
      description: error.message || "Не удалось удалить объект",
      color: "primary",
    });
  } finally {
    isDeleting.value = false;
    isDeleteModalOpen.value = false;
    objectToDelete.value = null;
  }
}
</script>
