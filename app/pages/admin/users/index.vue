<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-sm font-bold uppercase tracking-widest text-neutral-900">
          Пользователи
        </h2>
        <p class="text-sm text-neutral-500 mt-1">
          Учётные записи сайта и администраторы
        </p>
      </div>
      <UBadge color="neutral" variant="subtle" size="sm" class="text-[10px] uppercase tracking-wider">
        Всего: {{ filteredUsers.length }}
      </UBadge>
    </div>

    <div class="flex flex-col sm:flex-row gap-4">
      <UInput
        v-model="search"
        placeholder="Поиск по имени, email, логину..."
        icon="i-lucide-search"
        class="flex-1"
        size="lg"
      />
      <USelectMenu
        v-model="roleFilter"
        :items="roleOptions"
        value-attribute="value"
        option-attribute="label"
        placeholder="Все роли"
        size="lg"
        class="w-full sm:w-48"
      />
    </div>

    <UCard class="border border-neutral-200 shadow-none" :ui="{ body: 'p-0' }">
      <div v-if="pending" class="flex justify-center py-16">
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-neutral-400"
        />
      </div>

      <div
        v-else-if="loadError"
        class="text-center py-16 px-6"
      >
        <p class="text-sm text-neutral-600 mb-4">{{ loadError }}</p>
        <UButton color="primary" size="sm" @click="reloadUsers">
          Повторить
        </UButton>
      </div>

      <div
        v-else-if="!filteredUsers.length"
        class="text-center py-24 flex flex-col items-center justify-center bg-neutral-50/30"
      >
        <UIcon name="i-lucide-users" class="w-12 h-12 text-neutral-300 mb-4" />
        <p class="text-sm font-bold uppercase tracking-wider text-neutral-900">
          {{ search || roleFilter?.value ? "Пользователи не найдены" : "Список пуст" }}
        </p>
      </div>

      <UTable v-else :data="filteredUsers" :columns="columns" class="w-full">
        <template #user-cell="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-neutral-900">
              {{ row.original.name || row.original.email || row.original.username }}
            </span>
            <span class="text-xs text-neutral-500">{{ row.original.email || row.original.username }}</span>
          </div>
        </template>

        <template #role-cell="{ row }">
          <UBadge
            :color="row.original.role === 'ADMIN' ? 'primary' : 'neutral'"
            variant="subtle"
            size="xs"
          >
            {{ row.original.role === "ADMIN" ? "Админ" : "Пользователь" }}
          </UBadge>
        </template>

        <template #favorites-cell="{ row }">
          <span class="text-sm text-neutral-600">
            {{ row.original._count?.favorites ?? 0 }}
          </span>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.isActive ? 'primary' : 'neutral'"
            variant="subtle"
            size="xs"
          >
            {{ row.original.isActive ? "Активен" : "Заблокирован" }}
          </UBadge>
        </template>

        <template #lastLogin-cell="{ row }">
          <span class="text-sm text-neutral-600">
            {{ formatDate(row.original.lastLogin) }}
          </span>
        </template>

        <template #createdAt-cell="{ row }">
          <span class="text-sm text-neutral-600">
            {{ formatDate(row.original.createdAt) }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              v-if="row.original.role !== 'ADMIN'"
              color="neutral"
              variant="ghost"
              :icon="row.original.isActive ? 'i-lucide-user-x' : 'i-lucide-user-check'"
              size="xs"
              :title="row.original.isActive ? 'Заблокировать' : 'Активировать'"
              :loading="togglingId === row.original.id"
              @click="toggleActive(row.original)"
            />
            <UButton
              v-if="row.original.role !== 'ADMIN'"
              color="neutral"
              variant="ghost"
              icon="i-lucide-trash-2"
              size="xs"
              @click="confirmDelete(row.original)"
            />
            <span v-else class="text-xs text-neutral-400">—</span>
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal
      v-model:open="isDeleteModalOpen"
      title="Удаление пользователя"
      description="Это действие нельзя отменить."
    >
      <template #body>
        <p class="text-neutral-600">
          Удалить пользователя
          <strong>{{ userToDelete?.name || userToDelete?.email }}</strong>?
          Избранное и связанные данные будут удалены.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="neutral" variant="ghost" @click="isDeleteModalOpen = false">
            Отмена
          </UButton>
          <UButton color="primary" :loading="isDeleting" @click="deleteUser">
            Удалить
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { usersService } from "~/api/users.service";
import type { AdminUser } from "~/api/users.service";

definePageMeta({
  layout: "admin",
});

const toast = useToast();
const search = ref("");
const roleFilter = ref<{ label: string; value: string } | null>(null);
const togglingId = ref<string | null>(null);

const roleOptions = [
  { label: "Все роли", value: "" },
  { label: "Пользователи", value: "USER" },
  { label: "Администраторы", value: "ADMIN" },
];

const columns = [
  { id: "user", accessorKey: "name", header: "Пользователь" },
  { id: "role", accessorKey: "role", header: "Роль" },
  { id: "favorites", accessorKey: "_count", header: "Избранное" },
  { id: "status", accessorKey: "isActive", header: "Статус" },
  { id: "lastLogin", accessorKey: "lastLogin", header: "Последний вход" },
  { id: "createdAt", accessorKey: "createdAt", header: "Регистрация" },
  { id: "actions", accessorKey: "actions", header: "" },
];

const users = ref<AdminUser[]>([]);
const pending = ref(true);
const loadError = ref("");

onMounted(() => {
  reloadUsers();
});

async function reloadUsers() {
  pending.value = true;
  try {
    loadError.value = "";
    users.value = await usersService.getAll();
  } catch (e: any) {
    users.value = [];
    const msg = e?.data?.message;
    loadError.value = Array.isArray(msg)
      ? msg[0]
      : msg || e?.message || "Не удалось загрузить пользователей";
    toast.add({
      title: "Ошибка",
      description: loadError.value,
      color: "primary",
    });
  } finally {
    pending.value = false;
  }
}

const filteredUsers = computed(() => {
  if (!users.value.length) return [];
  const term = search.value.toLowerCase().trim();

  return users.value.filter((user: AdminUser) => {
    if (roleFilter.value?.value && user.role !== roleFilter.value.value) {
      return false;
    }

    if (!term) return true;

    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term)
    );
  });
});

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function toggleActive(user: AdminUser) {
  togglingId.value = user.id;
  try {
    await usersService.update(user.id, { isActive: !user.isActive });
    toast.add({
      title: "Успех",
      description: user.isActive ? "Пользователь заблокирован" : "Пользователь активирован",
      color: "primary",
    });
    await reloadUsers();
  } catch (e: any) {
    toast.add({
      title: "Ошибка",
      description: e?.data?.message || e?.message || "Не удалось обновить",
      color: "primary",
    });
  } finally {
    togglingId.value = null;
  }
}

const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);
const userToDelete = ref<AdminUser | null>(null);

function confirmDelete(user: AdminUser) {
  userToDelete.value = user;
  isDeleteModalOpen.value = true;
}

async function deleteUser() {
  if (!userToDelete.value) return;

  isDeleting.value = true;
  try {
    await usersService.delete(userToDelete.value.id);
    toast.add({
      title: "Успех",
      description: "Пользователь удалён",
      color: "primary",
    });
    isDeleteModalOpen.value = false;
    userToDelete.value = null;
    await reloadUsers();
  } catch (e: any) {
    toast.add({
      title: "Ошибка",
      description: e?.data?.message || e?.message || "Не удалось удалить",
      color: "primary",
    });
  } finally {
    isDeleting.value = false;
  }
}
</script>
