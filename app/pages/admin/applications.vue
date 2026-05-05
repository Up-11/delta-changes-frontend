<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2
          class="text-sm font-bold uppercase tracking-[0.1em] text-neutral-900"
        >
          Заявки
        </h2>
        <p class="text-sm text-neutral-500 mt-1">
          Управление заявками клиентов
        </p>
      </div>
      <div class="flex items-center gap-3">
        <UBadge
          color="primary"
          variant="subtle"
          size="sm"
          class="text-[10px] uppercase tracking-wider"
        >
          {{ newCount }} новых
        </UBadge>
        <UBadge
          color="neutral"
          variant="subtle"
          size="sm"
          class="text-[10px] uppercase tracking-wider"
        >
          Всего: {{ filteredApplications.length }}
        </UBadge>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4">
      <UInput
        v-model="searchQuery"
        placeholder="Поиск по имени, телефону, email..."
        icon="i-lucide-search"
        class="flex-1"
        size="lg"
      />
      <USelectMenu
        v-model="selectedStatus"
        :items="statusOptions"
        value-attribute="value"
        option-attribute="label"
        placeholder="Все статусы"
        size="lg"
        class="w-full sm:w-48"
      />
    </div>

    <!-- Table -->
    <UCard class="border border-neutral-200 shadow-none" :ui="{ body: 'p-0' }">
      <div
        v-if="!isLoading && paginatedApplications.length === 0"
        class="text-center py-12"
      >
        <UIcon
          name="i-lucide-inbox"
          class="w-12 h-12 text-neutral-300 mx-auto mb-4"
        />
        <p class="text-neutral-500">Заявки не найдены</p>
      </div>

      <UTable
        v-else
        :data="paginatedApplications"
        :columns="columns"
        :loading="isLoading"
        :enable-sorting="false"
        class="w-full"
        :row-class="
          (row: any) => {
            const status = row?.original?.status;
            if (status === 'NEW') return 'bg-blue-50/50 hover:bg-blue-100/50';
            if (status === 'IN_PROGRESS')
              return 'bg-amber-50/50 hover:bg-amber-100/50';
            if (status === 'COMPLETED')
              return 'bg-green-50/50 hover:bg-green-100/50';
            if (status === 'CANCELLED')
              return 'bg-red-50/50 hover:bg-red-100/50';
            return '';
          }
        "
      >
        <!-- Client Cell -->
        <template #name-cell="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-neutral-900">{{
              row.original.name
            }}</span>
            <span class="text-sm text-neutral-500">{{
              row.original.phone
            }}</span>
            <span v-if="row.original.email" class="text-xs text-neutral-400">{{
              row.original.email
            }}</span>
          </div>
        </template>

        <!-- Status Cell -->
        <template #status-cell="{ row }">
          <UBadge
            :color="getStatusColor(row.original.status)"
            variant="subtle"
            size="sm"
            class="text-[10px] uppercase tracking-wider"
          >
            {{ getStatusLabel(row.original.status) }}
          </UBadge>
        </template>

        <!-- Apartment Cell -->
        <template #apartment-cell="{ row }">
          <div v-if="row.original.apartment" class="flex flex-col">
            <span class="font-medium text-neutral-900">
              {{ row.original.apartment.project?.name || "—" }}
            </span>
            <span class="text-sm text-neutral-500">
              {{ row.original.apartment.rooms }} комн.,
              {{ row.original.apartment.area }} м²
            </span>
            <span class="text-xs text-neutral-400">
              №{{ row.original.apartment.number }},
              {{ row.original.apartment.floor }} этаж
            </span>
          </div>
          <span v-else class="text-neutral-400 text-sm">—</span>
        </template>

        <!-- Message Cell -->
        <template #message-cell="{ row }">
          <div
            v-if="row.original.message"
            class="max-w-xs truncate text-sm text-neutral-600"
            :title="row.original.message"
          >
            {{ row.original.message }}
          </div>
          <span v-else class="text-neutral-400 text-sm">-</span>
        </template>

        <!-- Date Cell -->
        <template #createdAt-cell="{ row }">
          <div class="flex flex-col">
            <span class="text-sm text-neutral-700">{{
              formatDate(row.original.createdAt)
            }}</span>
            <span class="text-xs text-neutral-400">{{
              formatTime(row.original.createdAt)
            }}</span>
          </div>
        </template>

        <!-- IP Cell -->
        <template #ipAddress-cell="{ row }">
          <span class="text-xs text-neutral-400 font-mono">{{
            row.original.ipAddress || "-"
          }}</span>
        </template>

        <!-- Actions Cell -->
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-lucide-eye"
              @click="viewDetails(row.original)"
            />
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-lucide-trash"
              @click="confirmDelete(row.original)"
            />
          </div>
        </template>
      </UTable>

      <!-- Pagination -->
      <div
        v-if="filteredApplications.length > 0"
        class="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100"
      >
        <span class="text-sm text-neutral-500">
          Показано {{ paginatedApplications.length }} из
          {{ filteredApplications.length }}
        </span>
        <UPagination
          v-model="currentPage"
          :total="filteredApplications.length"
          :page-size="pageSize"
          size="sm"
        />
      </div>
    </UCard>

    <!-- Detail Modal -->
    <UModal v-model:open="isDetailOpen" title="Детали заявки">
      <template #body>
        <div v-if="selectedApplication" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-xs uppercase tracking-wider text-neutral-400"
                >Имя</span
              >
              <p class="font-medium">{{ selectedApplication.name }}</p>
            </div>
            <div>
              <span class="text-xs uppercase tracking-wider text-neutral-400"
                >Телефон</span
              >
              <p class="font-medium">{{ selectedApplication.phone }}</p>
            </div>
            <div v-if="selectedApplication.email">
              <span class="text-xs uppercase tracking-wider text-neutral-400"
                >Email</span
              >
              <p>{{ selectedApplication.email }}</p>
            </div>
            <div>
              <span class="text-xs uppercase tracking-wider text-neutral-400"
                >Статус</span
              >
              <UBadge
                :color="getStatusColor(selectedApplication.status)"
                variant="subtle"
                size="sm"
                class="mt-1"
              >
                {{ getStatusLabel(selectedApplication.status) }}
              </UBadge>
            </div>
          </div>
          <!-- Apartment Info -->
          <div
            v-if="selectedApplication.apartment"
            class="bg-neutral-50 p-4 rounded"
          >
            <span
              class="text-xs uppercase tracking-wider text-neutral-400 block mb-2"
            >
              Квартира
            </span>
            <div class="flex items-start gap-4">
              <div class="flex-1">
                <p class="font-medium text-neutral-900">
                  {{ selectedApplication.apartment.project?.name || "—" }}
                  <span v-if="selectedApplication.apartment.object?.name">
                    — {{ selectedApplication.apartment.object.name }}
                  </span>
                </p>
                <p class="text-sm text-neutral-600 mt-1">
                  {{ selectedApplication.apartment.rooms }} комнатная,
                  {{ selectedApplication.apartment.area }} м²
                </p>
                <p class="text-sm text-neutral-500">
                  Квартира №{{ selectedApplication.apartment.number }},
                  {{ selectedApplication.apartment.floor }} этаж, дом
                  {{ selectedApplication.apartment.building || "—" }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-bold text-neutral-900">
                  {{
                    Number(selectedApplication.apartment.price).toLocaleString(
                      "ru-RU",
                    )
                  }}
                  ₽
                </p>
                <UButton
                  :to="`/real-estate/${selectedApplication.apartment.id}`"
                  target="_blank"
                  variant="ghost"
                  size="xs"
                  class="mt-1"
                >
                  Открыть квартиру
                </UButton>
              </div>
            </div>
          </div>

          <div v-if="selectedApplication.message">
            <span class="text-xs uppercase tracking-wider text-neutral-400"
              >Сообщение</span
            >
            <p class="mt-1 text-neutral-700 bg-neutral-50 p-3 rounded">
              {{ selectedApplication.message }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm text-neutral-500">
            <div>
              <span class="text-xs uppercase tracking-wider">IP адрес</span>
              <p class="font-mono">
                {{ selectedApplication.ipAddress || "-" }}
              </p>
            </div>
            <div>
              <span class="text-xs uppercase tracking-wider">Дата</span>
              <p>{{ formatDateTime(selectedApplication.createdAt) }}</p>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <!-- NEW status: Take to work or Cancel -->
        <template v-if="selectedApplication?.status === ApplicationStatus.NEW">
          <UButton
            variant="ghost"
            color="neutral"
            @click="cancelApplication(selectedApplication.id)"
          >
            Отменить
          </UButton>
          <UButton
            color="primary"
            @click="markAsInProgress(selectedApplication.id)"
          >
            Взять в работу
          </UButton>
        </template>

        <!-- IN_PROGRESS status: Complete or Cancel -->
        <template
          v-else-if="
            selectedApplication?.status === ApplicationStatus.IN_PROGRESS
          "
        >
          <UButton
            variant="ghost"
            color="neutral"
            @click="cancelApplication(selectedApplication.id)"
          >
            Отменить
          </UButton>
          <UButton
            color="primary"
            @click="markAsCompleted(selectedApplication.id)"
          >
            Отработано
          </UButton>
        </template>

        <!-- COMPLETED or CANCELLED: Just close -->
        <template v-else>
          <UButton
            variant="outline"
            color="neutral"
            @click="isDetailOpen = false"
          >
            Закрыть
          </UButton>
        </template>
      </template>
    </UModal>

    <!-- Delete Confirmation -->
    <UModal v-model:open="isDeleteOpen" title="Подтверждение удаления">
      <template #body>
        <p>Вы уверены, что хотите удалить эту заявку?</p>
        <p v-if="applicationToDelete" class="mt-2 text-sm text-neutral-500">
          {{ applicationToDelete.name }} — {{ applicationToDelete.phone }}
        </p>
      </template>
      <template #footer>
        <UButton variant="ghost" color="neutral" @click="isDeleteOpen = false">
          Отмена
        </UButton>
        <UButton color="primary" variant="outline" @click="deleteApplication">
          Удалить
        </UButton>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { applicationsService } from "~/api/applications.service";
import { ApplicationStatus, type Application } from "~/api/types";

definePageMeta({
  layout: "admin",
});

// State
const applications = ref<Application[]>([]);
const isLoading = ref(true);
const searchQuery = ref("");
const selectedStatus = ref<{ label: string; value: string } | null>(null);
const currentPage = ref(1);
const pageSize = 10;

// Modals
const isDetailOpen = ref(false);
const isDeleteOpen = ref(false);
const selectedApplication = ref<Application | null>(null);
const applicationToDelete = ref<Application | null>(null);

// Options
const statusOptions = [
  { label: "Все статусы", value: null },
  { label: "Новые", value: ApplicationStatus.NEW },
  { label: "В работе", value: ApplicationStatus.IN_PROGRESS },
  { label: "Завершены", value: ApplicationStatus.COMPLETED },
  { label: "Отменены", value: ApplicationStatus.CANCELLED },
];

const statusUpdateOptions = [
  { label: "Новая", value: ApplicationStatus.NEW },
  { label: "В работе", value: ApplicationStatus.IN_PROGRESS },
  { label: "Завершена", value: ApplicationStatus.COMPLETED },
  { label: "Отменена", value: ApplicationStatus.CANCELLED },
];

const columns = [
  { accessorKey: "name", header: "Клиент" },
  { accessorKey: "apartment", header: "Квартира" },
  { accessorKey: "status", header: "Статус" },
  { accessorKey: "message", header: "Сообщение" },
  { accessorKey: "createdAt", header: "Дата" },
  { accessorKey: "ipAddress", header: "IP" },
  { id: "actions", header: "" },
];

// Computed
const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedStatus.value?.value;
});

const newCount = computed(() => {
  return applications.value.filter((a) => a.status === ApplicationStatus.NEW)
    .length;
});

const filteredApplications = computed(() => {
  let result = [...applications.value];

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.phone.toLowerCase().includes(query) ||
        a.email?.toLowerCase().includes(query) ||
        a.message?.toLowerCase().includes(query) ||
        a.apartment?.project?.name?.toLowerCase().includes(query) ||
        a.apartment?.number?.toLowerCase().includes(query),
    );
  }

  // Status filter
  if (selectedStatus.value?.value) {
    result = result.filter((a) => a.status === selectedStatus.value.value);
  }

  // Sort by date descending by default
  result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return result;
});

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredApplications.value.slice(start, start + pageSize);
});

// Methods
async function fetchApplications() {
  isLoading.value = true;
  try {
    const data = await applicationsService.getAll();
    applications.value = data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    useToast().add({
      title: "Ошибка",
      description: "Не удалось загрузить заявки",
      color: "primary",
    });
  } finally {
    isLoading.value = false;
  }
}

function resetFilters() {
  searchQuery.value = "";
  selectedStatus.value = null;
  currentPage.value = 1;
}

async function updateStatus(id: string, status: ApplicationStatus) {
  try {
    await applicationsService.update(id, { status });
    const app = applications.value.find((a) => a.id === id);
    if (app) {
      app.status = status;
    }
    // Update selectedApplication if it's the same application
    if (selectedApplication.value && selectedApplication.value.id === id) {
      selectedApplication.value.status = status;
    }
    useToast().add({
      title: "Успех",
      description: "Статус обновлен",
      color: "primary",
    });
  } catch (error) {
    console.error("Failed to update status:", error);
    useToast().add({
      title: "Ошибка",
      description: "Не удалось обновить статус",
      color: "primary",
    });
    fetchApplications();
  }
}

function viewDetails(app: Application) {
  selectedApplication.value = app;
  isDetailOpen.value = true;
}

async function markAsInProgress(id: string) {
  await updateStatus(id, ApplicationStatus.IN_PROGRESS);
  isDetailOpen.value = false;
}

async function markAsCompleted(id: string) {
  await updateStatus(id, ApplicationStatus.COMPLETED);
  isDetailOpen.value = false;
}

async function cancelApplication(id: string) {
  await updateStatus(id, ApplicationStatus.CANCELLED);
  isDetailOpen.value = false;
}

function confirmDelete(app: Application) {
  applicationToDelete.value = app;
  isDeleteOpen.value = true;
}

async function deleteApplication() {
  if (!applicationToDelete.value) return;

  try {
    await applicationsService.delete(applicationToDelete.value.id);
    applications.value = applications.value.filter(
      (a) => a.id !== applicationToDelete.value?.id,
    );
    useToast().add({
      title: "Успех",
      description: "Заявка удалена",
      color: "primary",
    });
  } catch (error) {
    console.error("Failed to delete application:", error);
    useToast().add({
      title: "Ошибка",
      description: "Не удалось удалить заявку",
      color: "primary",
    });
  } finally {
    isDeleteOpen.value = false;
    applicationToDelete.value = null;
  }
}

// Helpers
function getStatusColor(status: ApplicationStatus): string {
  const colors: Record<string, string> = {
    [ApplicationStatus.NEW]: "primary",
    [ApplicationStatus.IN_PROGRESS]: "warning",
    [ApplicationStatus.COMPLETED]: "success",
    [ApplicationStatus.CANCELLED]: "neutral",
  };
  return colors[status] || "neutral";
}

function getStatusLabel(status: ApplicationStatus): string {
  const labels: Record<string, string> = {
    [ApplicationStatus.NEW]: "Новая",
    [ApplicationStatus.IN_PROGRESS]: "В работе",
    [ApplicationStatus.COMPLETED]: "Завершена",
    [ApplicationStatus.CANCELLED]: "Отменена",
  };
  return labels[status] || status;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Lifecycle
onMounted(() => {
  fetchApplications();
});
</script>
