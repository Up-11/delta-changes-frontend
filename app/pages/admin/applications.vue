<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-bold uppercase tracking-[0.1em] text-neutral-900">
        Заявки
      </h2>
      <UBadge
        color="primary"
        size="sm"
        class="text-[10px] uppercase tracking-wider"
      >
        {{ applications.length }} новых
      </UBadge>
    </div>

    <UCard class="border border-neutral-200 shadow-none">
      <UTable :rows="applications" :columns="columns">
        <template #name-cell="{ row }">
          <div class="font-medium text-neutral-900">
            {{ row.name }}
          </div>
          <div class="text-sm text-neutral-500">
            {{ row.email }}
          </div>
        </template>

        <template #type-cell="{ row }">
          <span class="text-sm text-neutral-700">{{ row.type }}</span>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="row.status === 'new' ? 'primary' : 'neutral'"
            variant="subtle"
            size="sm"
            class="text-[10px] uppercase tracking-wider"
          >
            {{ row.status === "new" ? "Новая" : "Обработана" }}
          </UBadge>
        </template>

        <template #date-cell="{ row }">
          <span class="text-sm text-neutral-500">{{ row.date }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-1">
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-lucide-eye"
            />
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-lucide-check"
              @click="markAsProcessed(row)"
            />
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

const applications = ref([
  {
    id: 1,
    name: "Иван Петров",
    email: "ivan@example.com",
    type: "Квартира",
    status: "new",
    date: "2024-01-15",
  },
  {
    id: 2,
    name: "Мария Сидорова",
    email: "maria@example.com",
    type: "Объект",
    status: "processed",
    date: "2024-01-14",
  },
  {
    id: 3,
    name: "Алексей Иванов",
    email: "alex@example.com",
    type: "Квартира",
    status: "new",
    date: "2024-01-14",
  },
  {
    id: 4,
    name: "Елена Козлова",
    email: "elena@example.com",
    type: "Проект",
    status: "processed",
    date: "2024-01-13",
  },
]);

const columns = [
  { id: "name", key: "name", label: "Клиент" },
  { id: "type", key: "type", label: "Тип заявки" },
  { id: "status", key: "status", label: "Статус" },
  { id: "date", key: "date", label: "Дата" },
  { id: "actions", key: "actions", label: "" },
];

function markAsProcessed(row: { status: string }) {
  row.status = "processed";
}
</script>
