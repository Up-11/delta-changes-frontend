<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-bold uppercase tracking-widest text-neutral-900">
        Проекты
      </h2>
      <UButton
        color="neutral"
        class="text-xs uppercase tracking-wider"
        @click="navigateTo('/admin/projects/create')"
      >
        <UIcon name="i-lucide-plus" class="w-4 h-4 mr-1" />
        Добавить проект
      </UButton>
    </div>

    <UCard class="border border-neutral-200 shadow-none" :ui="{ body: 'p-0' }">
      <div
        v-if="!projects?.length"
        class="text-center py-24 flex flex-col items-center justify-center bg-neutral-50/30"
      >
        <div class="bg-white p-4 rounded-full shadow-sm border border-neutral-100 mb-4">
          <UIcon name="i-lucide-folder" class="w-12 h-12 text-neutral-300" />
        </div>
        <p class="text-sm font-bold uppercase tracking-wider text-neutral-900">Список проектов пуст</p>
        <p class="text-xs mt-2 text-neutral-400 max-w-60 leading-relaxed">
          Создайте первый проект, чтобы начать добавлять объекты.
        </p>
        <UButton
          color="primary"
          class="mt-6 text-xs uppercase tracking-wider px-6"
          @click="navigateTo('/admin/projects/create')"
        >
          Создать проект
        </UButton>
      </div>

      <UTable v-else :data="projects" :columns="columns" class="w-full">
        <template #name-cell="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-neutral-900">{{ row.original.name }}</span>
            <span v-if="row.original.shortDescription" class="text-xs text-neutral-500">
              {{ row.original.shortDescription }}
            </span>
          </div>
        </template>

        <template #slug-cell="{ row }">
          <span class="text-neutral-600 text-sm font-mono">{{ row.original.slug }}</span>
        </template>

        <template #isActive-cell="{ row }">
          <UBadge :color="row.original.isActive ? 'primary' : 'neutral'" variant="subtle" size="xs">
            {{ row.original.isActive ? 'Активен' : 'Черновик' }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
              size="xs"
              @click="navigateTo(`/admin/projects/${row.original.id}`)"
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
      description="Это действие нельзя отменить. Все объекты этого проекта также могут пострадать."
    >
      <template #body>
        <p class="text-neutral-600">
          Вы уверены, что хотите удалить проект
          <strong>{{ projectToDelete?.name }}</strong>?
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
          <UButton color="primary" :loading="isDeleting" @click="deleteProject"> Удалить </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { projectsService } from "~/api/projects.service";
import type { Project as IProject } from "~/api/types";

definePageMeta({
  layout: "admin",
});

const toast = useToast();
const columns = [
  { id: "name", accessorKey: "name", header: "Название" },
  { id: "slug", accessorKey: "slug", header: "Slug" },
  { id: "isActive", accessorKey: "isActive", header: "Статус" },
  { id: "actions", accessorKey: "actions", header: "", width: "100px" },
];

const { data: projects, refresh } = await useAsyncData("projects", () =>
  projectsService.getAll(),
);

const isDeleteModalOpen = ref(false);
const projectToDelete = ref<IProject | null>(null);
const isDeleting = ref(false);

function confirmDelete(proj: IProject) {
  projectToDelete.value = proj;
  isDeleteModalOpen.value = true;
}

async function deleteProject() {
  if (!projectToDelete.value) return;

  isDeleting.value = true;
  try {
    await projectsService.delete(projectToDelete.value.id);
    toast.add({
      title: "Успех",
      description: "Проект успешно удален",
      color: "primary",
    });
    await refresh();
  } catch (error: any) {
    console.error("Failed to delete project:", error);
    toast.add({
      title: "Ошибка",
      description: error.message || "Не удалось удалить проект",
      color: "primary",
    });
  } finally {
    isDeleting.value = false;
    isDeleteModalOpen.value = false;
    projectToDelete.value = null;
  }
}
</script>
