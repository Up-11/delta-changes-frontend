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

      <UTable :rows="recentApplications" :columns="applicationColumns">
        <template #name-cell="{ row }">
          <div class="font-medium text-neutral-900">
            {{ row.name }}
          </div>
          <div class="text-sm text-neutral-500">
            {{ row.email }}
          </div>
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
          <span class="text-sm text-neutral-500">
            {{ row.date }}
          </span>
        </template>

        <template #actions-cell>
          <UButton
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
definePageMeta({
  layout: "admin",
});

const stats = [
  {
    label: "Всего объектов",
    value: "12",
    trend: 8,
    icon: "i-lucide-building-2",
    bgClass: "bg-neutral-100",
    iconClass: "text-neutral-700",
  },
  {
    label: "Доступные квартиры",
    value: "48",
    trend: 12,
    icon: "i-lucide-door-open",
    bgClass: "bg-neutral-100",
    iconClass: "text-neutral-700",
  },
  {
    label: "Новые заявки",
    value: "5",
    trend: -2,
    icon: "i-lucide-inbox",
    bgClass: "bg-neutral-100",
    iconClass: "text-neutral-700",
  },
  {
    label: "Публикаций",
    value: "24",
    trend: 4,
    icon: "i-lucide-newspaper",
    bgClass: "bg-neutral-100",
    iconClass: "text-neutral-700",
  },
];

const recentApplications = [
  {
    id: 1,
    name: "Иван Петров",
    email: "ivan.petrov@mail.ru",
    phone: "+7 (999) 123-45-67",
    type: "Квартира",
    object: "ЖК Северный",
    message: "Интересует 2-комнатная квартира с видом на парк",
    status: "new",
    date: "2024-01-15 14:30",
    ip: "192.168.1.105",
  },
  {
    id: 2,
    name: "Мария Сидорова",
    email: "maria.s@yandex.ru",
    phone: "+7 (999) 987-65-43",
    type: "Объект",
    object: "Торговый центр Восток",
    message: "Хочу арендовать помещение 50м² для магазина",
    status: "processed",
    date: "2024-01-15 10:15",
    ip: "192.168.1.88",
  },
  {
    id: 3,
    name: "Алексей Иванов",
    email: "alex.ivanov@gmail.com",
    phone: "+7 (999) 456-78-90",
    type: "Квартира",
    object: "ЖК Западный",
    message: "Подбор квартиры для семьи с детьми, бюджет до 15 млн",
    status: "new",
    date: "2024-01-14 16:45",
    ip: "192.168.1.132",
  },
  {
    id: 4,
    name: "Елена Козлова",
    email: "elena.k@outlook.com",
    phone: "+7 (999) 111-22-33",
    type: "Проект",
    object: "ЖК Южный квартал",
    message: "Инвестиции в строительство, рассматриваю опции",
    status: "processed",
    date: "2024-01-14 09:20",
    ip: "192.168.1.77",
  },
  {
    id: 5,
    name: "Дмитрий Новиков",
    email: "dmitry.novikov@mail.ru",
    phone: "+7 (999) 444-55-66",
    type: "Квартира",
    object: "ЖК Центральный",
    message: "Продажа текущей квартиры и покупка новой",
    status: "new",
    date: "2024-01-13 11:30",
    ip: "192.168.1.201",
  },
  {
    id: 6,
    name: "Анна Смирнова",
    email: "anna.smirnova@yandex.ru",
    phone: "+7 (999) 777-88-99",
    type: "Квартира",
    object: "ЖК Северный",
    message: "Ипотека, первоначальный взнос 30%",
    status: "new",
    date: "2024-01-13 08:45",
    ip: "192.168.1.156",
  },
  {
    id: 7,
    name: "Сергей Волков",
    email: "sergey.volkov@gmail.com",
    phone: "+7 (999) 222-33-44",
    type: "Объект",
    object: "Складской комплекс Логистик",
    message: "Аренда склада 200м² с офисом",
    status: "processed",
    date: "2024-01-12 15:20",
    ip: "192.168.1.43",
  },
];

const applicationColumns = [
  { id: "name", key: "name", label: "Клиент" },
  { id: "type", key: "type", label: "Тип" },
  { id: "status", key: "status", label: "Статус" },
  { id: "date", key: "date", label: "Дата" },
  { id: "actions", key: "actions", label: "" },
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
  { label: "Загрузить файл", path: "/admin/uploads", icon: "i-lucide-upload" },
];
</script>
