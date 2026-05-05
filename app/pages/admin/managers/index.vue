<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-bold uppercase tracking-widest text-neutral-900">
        Менеджеры отдела продаж
      </h2>
      <UButton
        color="neutral"
        class="text-xs uppercase tracking-wider"
        @click="openCreateModal"
      >
        <UIcon name="i-lucide-plus" class="w-4 h-4 mr-1" />
        Добавить менеджера
      </UButton>
    </div>

    <!-- Фильтры -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <UInput
          v-model="search"
          placeholder="Поиск по имени или должности..."
          icon="i-lucide-search"
          class="flex-1"
          size="lg"
        />
      </div>
    </div>

    <UCard class="border border-neutral-200 shadow-none" :ui="{ body: 'p-0' }">
      <div
        v-if="!filteredManagers?.length"
        class="text-center py-24 flex flex-col items-center justify-center bg-neutral-50/30"
      >
        <div
          class="bg-white p-4 rounded-full shadow-sm border border-neutral-100 mb-4"
        >
          <UIcon name="i-lucide-users" class="w-12 h-12 text-neutral-300" />
        </div>
        <p class="text-sm font-bold uppercase tracking-wider text-neutral-900">
          {{ search ? "Менеджеры не найдены" : "Список менеджеров пуст" }}
        </p>
        <UButton
          v-if="!search"
          color="primary"
          class="mt-6 text-xs uppercase tracking-wider px-6"
          @click="openCreateModal"
        >
          Добавить менеджера
        </UButton>
      </div>

      <UTable v-else :data="filteredManagers" :columns="columns" class="w-full">
        <template #photo-cell="{ row }">
          <div
            class="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200"
          >
            <img
              v-if="row.original.media?.[0]?.url"
              :src="getFullUrl(row.original.media[0].url)"
              :alt="row.original.name"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-neutral-300"
            >
              <UIcon name="i-lucide-user" class="w-6 h-6" />
            </div>
          </div>
        </template>

        <template #name-cell="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-neutral-900">
              {{ row.original.name }}
              <UBadge
                v-if="row.original.isHead"
                color="primary"
                variant="subtle"
                size="xs"
                class="ml-1"
              >
                Руководитель
              </UBadge>
            </span>
            <span class="text-xs text-neutral-500">
              {{ row.original.position }}
            </span>
          </div>
        </template>

        <template #phone-cell="{ row }">
          <span class="text-neutral-600 text-sm">
            {{ row.original.phone || "—" }}
          </span>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.isActive ? 'primary' : 'neutral'"
            variant="subtle"
            size="xs"
          >
            {{ row.original.isActive ? "Активен" : "Неактивен" }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
              size="xs"
              @click="openEditModal(row.original)"
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

    <!-- Modal for Create/Edit -->
    <UModal
      v-model:open="isModalOpen"
      :title="isEditing ? 'Редактировать менеджера' : 'Добавить менеджера'"
    >
      <template #body>
        <UForm :state="state" class="space-y-4" @submit="handleSubmit">
          <UFormField label="Имя" name="name" required>
            <UInput v-model="state.name" placeholder="Имя Фамилия" />
          </UFormField>
          <UFormField label="Должность" name="position" required>
            <UInput
              v-model="state.position"
              placeholder="Напр. Менеджер по продажам"
            />
          </UFormField>
          <UFormField label="Телефон" name="phone">
            <UInput v-model="state.phone" placeholder="+7 (999) 000-00-00" />
          </UFormField>

          <div class="flex gap-4">
            <UFormField label="Руководитель" name="isHead">
              <UCheckbox v-model="state.isHead" />
            </UFormField>
            <UFormField label="Активен" name="isActive">
              <UCheckbox v-model="state.isActive" />
            </UFormField>
          </div>

          <UFormField label="Фотография" name="media">
            <AdminMediaUploader
              v-model="currentMediaId"
              label="Загрузить фото"
              icon="i-lucide-user"
            />
          </UFormField>

          <div class="flex justify-end gap-3 mt-6">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isModalOpen = false"
              >Отмена</UButton
            >
            <UButton type="submit" color="primary" :loading="isSubmitting">
              {{ isEditing ? "Сохранить" : "Создать" }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <!-- Delete Confirmation -->
    <UModal
      v-model:open="isDeleteModalOpen"
      title="Подтверждение удаления"
      description="Это действие нельзя отменить."
    >
      <template #body>
        <p class="text-neutral-600">
          Вы уверены, что хотите удалить менеджера
          <strong>{{ managerToDelete?.name }}</strong
          >?
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            @click="isDeleteModalOpen = false"
            >Отмена</UButton
          >
          <UButton color="primary" :loading="isDeleting" @click="deleteManager"
            >Удалить</UButton
          >
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { managersService } from "~/api/managers.service";
import { uploadsService } from "~/api/uploads.service";
import type { ManagerWithRelations as IManager } from "~/api/types";
import { getFullUrl } from "~/utils/url";

definePageMeta({
  layout: "admin",
});

const toast = useToast();
const search = ref("");

const columns = [
  { id: "photo", accessorKey: "media", header: "Фото" },
  { id: "name", accessorKey: "name", header: "Менеджер" },
  { id: "phone", accessorKey: "phone", header: "Телефон" },
  { id: "status", accessorKey: "isActive", header: "Статус" },
  { id: "actions", accessorKey: "actions", header: "", width: "100px" },
];

const { data: managers, refresh } = await useAsyncData("managers", () =>
  managersService.getAll(),
);

const filteredManagers = computed(() => {
  if (!managers.value) return [];
  return managers.value.filter((m: IManager) => {
    const term = search.value.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.position.toLowerCase().includes(term)
    );
  });
});

// Modal state
const isModalOpen = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const editId = ref<string | null>(null);

const state = reactive({
  name: "",
  position: "",
  phone: "",
  isHead: false,
  isActive: true,
  mediaIds: [] as string[],
});

// Media handling
const currentMediaId = computed({
  get: () => state.mediaIds[0] || null,
  set: (val: string | null) => (state.mediaIds = val ? [val] : []),
});

function openCreateModal() {
  isEditing.value = false;
  editId.value = null;
  state.name = "";
  state.position = "";
  state.phone = "";
  state.isHead = false;
  state.isActive = true;
  state.mediaIds = [];
  isModalOpen.value = true;
}

function openEditModal(manager: IManager) {
  isEditing.value = true;
  editId.value = manager.id;
  state.name = manager.name;
  state.position = manager.position;
  state.phone = manager.phone || "";
  state.isHead = manager.isHead;
  state.isActive = manager.isActive;
  state.mediaIds = manager.media?.map((m) => m.id) || [];
  isModalOpen.value = true;
}

async function handleSubmit() {
  isSubmitting.value = true;
  try {
    if (isEditing.value && editId.value) {
      await managersService.update(editId.value, state);
      toast.add({
        title: "Успех",
        description: "Менеджер обновлен",
        color: "primary",
      });
    } else {
      await managersService.create(state);
      toast.add({
        title: "Успех",
        description: "Менеджер создан",
        color: "primary",
      });
    }
    await refresh();
    isModalOpen.value = false;
  } catch (e: any) {
    toast.add({
      title: "Ошибка",
      description: e.message || "Не удалось сохранить",
      color: "primary",
    });
  } finally {
    isSubmitting.value = false;
  }
}

// Delete logic
const isDeleteModalOpen = ref(false);
const managerToDelete = ref<IManager | null>(null);
const isDeleting = ref(false);

function confirmDelete(manager: IManager) {
  managerToDelete.value = manager;
  isDeleteModalOpen.value = true;
}

async function deleteManager() {
  if (!managerToDelete.value) return;
  isDeleting.value = true;
  try {
    await managersService.delete(managerToDelete.value.id);
    toast.add({
      title: "Успех",
      description: "Менеджер удален",
      color: "primary",
    });
    await refresh();
    isDeleteModalOpen.value = false;
  } catch (e: any) {
    toast.add({
      title: "Ошибка",
      description: e.message || "Не удалось удалить",
      color: "primary",
    });
  } finally {
    isDeleting.value = false;
  }
}
</script>
