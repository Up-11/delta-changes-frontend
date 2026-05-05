<template>
  <div class="space-y-8">
    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard
        v-for="stat in stats"
        :key="stat.label"
        class="border border-neutral-200 shadow-none"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.15em] text-neutral-500">
              {{ stat.label }}
            </p>
            <p
              class="text-3xl font-bold text-neutral-900 mt-2 tracking-tighter"
            >
              {{ stat.value }}
            </p>
          </div>
          <div
            class="w-10 h-10 flex items-center justify-center bg-neutral-100"
          >
            <UIcon :name="stat.icon" class="w-5 h-5 text-neutral-700" />
          </div>
        </div>
        <div class="flex items-center gap-1 mt-4">
          <UIcon
            :name="
              stat.trend > 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'
            "
            class="w-3 h-3"
            :class="stat.trend > 0 ? 'text-green-600' : 'text-red-600'"
          />
          <span
            class="text-xs font-medium"
            :class="stat.trend > 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ Math.abs(stat.trend) }}%
          </span>
          <span class="text-xs text-neutral-400">vs прошлый месяц</span>
        </div>
      </UCard>
    </div>

    <!-- Recent applications -->
    <UCard class="border border-neutral-200 shadow-none">
      <template #header>
        <div class="flex items-center justify-between py-2">
          <h3
            class="text-sm font-bold uppercase tracking-[0.1em] text-neutral-900"
          >
            Новые заявки
          </h3>
          <UButton
            to="/admin/applications"
            variant="ghost"
            color="neutral"
            size="sm"
            class="text-xs uppercase tracking-widest"
          >
            Все заявки
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-1" />
          </UButton>
        </div>
      </template>

      <div
        v-if="
          !isLoadingApplications && (!applications || applications.length === 0)
        "
        class="py-12 text-center"
      >
        <UIcon
          name="i-lucide-inbox"
          class="w-12 h-12 mx-auto text-neutral-300 mb-3"
        />
        <p class="text-sm text-neutral-500">Нет новых заявок</p>
      </div>

      <UTable
        v-else
        :data="applications || []"
        :columns="applicationColumns"
        :loading="isLoadingApplications"
        :enable-sorting="false"
      >
        <template #name-cell="{ row }">
          <div class="font-medium text-neutral-900">
            {{ row.getValue("name") || "—" }}
          </div>
          <div class="text-sm text-neutral-500">
            {{ row.original.email || "—" }}
          </div>
        </template>

        <template #type-cell="{ row }">
          <span class="text-xs text-neutral-600">
            {{ getApplicationTypeLabel(row.original.type) }}
          </span>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.status === 'NEW' ? 'primary' : 'neutral'"
            variant="subtle"
            size="sm"
            class="text-[10px] uppercase tracking-wider"
          >
            {{ row.original.status === "NEW" ? "Новая" : "Обработана" }}
          </UBadge>
        </template>

        <template #createdAt-cell="{ row }">
          <span class="text-sm text-neutral-500">
            {{ formatDate(row.original.createdAt) }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <UButton
            :to="`/admin/applications?id=${row.original.id}`"
            variant="ghost"
            color="neutral"
            size="xs"
            icon="i-lucide-eye"
          />
        </template>
      </UTable>
    </UCard>

    <!-- Quick actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UCard class="border border-neutral-200 shadow-none">
        <template #header>
          <h3
            class="text-sm font-bold uppercase tracking-[0.1em] text-neutral-900 py-2"
          >
            Быстрые действия
          </h3>
        </template>
        <div class="grid grid-cols-2 gap-3">
          <UButton
            v-for="action in quickActions"
            :key="action.label"
            :to="action.path"
            variant="outline"
            color="neutral"
            class="justify-start gap-2 text-xs uppercase tracking-wider h-10"
          >
            <UIcon :name="action.icon" class="w-4 h-4" />
            {{ action.label }}
          </UButton>
        </div>
      </UCard>

      <UCard class="border border-neutral-200 shadow-none">
        <template #header>
          <h3
            class="text-sm font-bold uppercase tracking-[0.1em] text-neutral-900 py-2"
          >
            Системная информация
          </h3>
        </template>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase tracking-wider text-neutral-500"
              >Версия API</span
            >
            <span class="text-sm font-bold text-neutral-900 tracking-tight"
              >v1.0.0</span
            >
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase tracking-wider text-neutral-500"
              >Обновление</span
            >
            <span class="text-sm font-bold text-neutral-900 tracking-tight">{{
              new Date().toLocaleDateString("ru-RU")
            }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase tracking-wider text-neutral-500"
              >Статус</span
            >
            <UBadge
              color="primary"
              variant="subtle"
              size="sm"
              class="text-[10px] uppercase tracking-wider"
            >
              Работает
            </UBadge>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dashboardService } from "~/api/dashboard.service";

definePageMeta({
  layout: "admin",
});

// Fetch real data from backend
const { data: statsData } = await useAsyncData("dashboard-stats", async () => {
  try {
    const data = await dashboardService.getStats();
    console.log("Stats loaded:", data);
    return data;
  } catch (error) {
    console.error("Failed to load stats:", error);
    return { objects: 0, apartments: 0, applications: 0, news: 0 };
  }
});

const { data: applications, pending: isLoadingApplications } =
  await useAsyncData("dashboard-applications", async () => {
    try {
      const data = await dashboardService.getRecentApplications();
      console.log("Applications loaded:", data);
      return data;
    } catch (error) {
      console.error("Failed to load applications:", error);
      return [];
    }
  });

const stats = computed(() => [
  {
    label: "Всего объектов",
    value: statsData.value?.objects || 0,
    trend: 8,
    icon: "i-lucide-building-2",
    bgClass: "bg-neutral-100",
    iconClass: "text-neutral-700",
  },
  {
    label: "Доступные квартиры",
    value: statsData.value?.apartments || 0,
    trend: 12,
    icon: "i-lucide-door-open",
    bgClass: "bg-neutral-100",
    iconClass: "text-neutral-700",
  },
  {
    label: "Новые заявки",
    value: statsData.value?.applications || 0,
    trend: -2,
    icon: "i-lucide-inbox",
    bgClass: "bg-neutral-100",
    iconClass: "text-neutral-700",
  },
  {
    label: "Публикаций",
    value: statsData.value?.news || 0,
    trend: 4,
    icon: "i-lucide-newspaper",
    bgClass: "bg-neutral-100",
    iconClass: "text-neutral-700",
  },
]);

function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleString("ru-RU");
  } catch {
    return dateString;
  }
}

function getApplicationTypeLabel(type?: string): string {
  const labels: Record<string, string> = {
    BUY: "Покупка",
    SELL: "Продажа",
    RENT: "Аренда",
    CONSULT: "Консультация",
    COMMERCIAL: "Коммерция",
    MORTGAGE: "Ипотека",
    OTHER: "Другое",
  };
  return labels[type || "OTHER"] || "Другое";
}

const applicationColumns = [
  { accessorKey: "name", header: "Клиент" },
  { accessorKey: "type", header: "Тип" },
  { accessorKey: "status", header: "Статус" },
  { accessorKey: "createdAt", header: "Дата" },
  { accessorKey: "actions", header: "" },
];

const quickActions = [
  {
    label: "Добавить объект",
    path: "/admin/objects",
    icon: "i-lucide-building-2",
  },
  {
    label: "Добавить квартиру",
    path: "/admin/apartments",
    icon: "i-lucide-door-open",
  },
  {
    label: "Новая публикация",
    path: "/admin/news",
    icon: "i-lucide-newspaper",
  },
];
</script>
