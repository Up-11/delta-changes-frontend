<script setup lang="ts">
useHead({
  title: "Контакты | Дельтастрой",
  meta: [
    {
      name: "description",
      content:
        "Контактная информация компании Дельтастрой в Красноярске. Адреса офисов, телефоны отделов и форма обратной связи.",
    },
  ],
});

// Контакты отделов
const departments = [
  { name: "Отдел продаж", phone: "+7 (391) 211-11-11" },
  { name: "Приемная", phone: "+7 (391) 222-22-22" },
  { name: "Отдел кадров", phone: "+7 (391) 333-33-33", sub: "для соискателей" },
  {
    name: "Отдел снабжения",
    phone: "+7 (391) 444-44-44",
    sub: "для подрядчиков",
  },
  {
    name: "Отдел маркетинга",
    phone: "+7 (391) 555-55-55",
    sub: "для рекламы и СМИ",
  },
  {
    name: "Отдел гарантийных обязательств",
    phone: "+7 (391) 666-66-66",
    link: { text: "Порядок подачи претензии", url: "#" },
  },
];

// Реквизиты офисов
const offices = [
  { address: "г. Красноярск, ул. Парусная, 8", phone: "+7 (391) 211-11-11" },
  { address: "г. Красноярск, пр. Мира, 91", phone: "+7 (391) 222-22-22" },
];

// Менеджеры (загружаем с бэкенда)
import { managersService } from "~/api/managers.service";
import ContactForm from "~/components/site/ContactForm.vue";
import { getFullUrl } from "~/utils/url";
import type { ManagerWithRelations } from "~/api/types";

const { data: allManagers } = await useAsyncData("managers-list", () =>
  managersService.getAll(),
);

const headManager = computed(() => allManagers.value?.find((m) => m.isHead));
const salesManagers = computed(() =>
  allManagers.value?.filter((m) => !m.isHead && m.isActive),
);

function getManagerPhoto(manager: ManagerWithRelations) {
  const media = manager.media?.[0];
  if (media) return getFullUrl(media.url);
  return "/img/manager-placeholder.jpg"; // Заглушка если нет фото
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Header/Breadcrumbs (Standard layout) -->

    <!-- Title Section -->
    <div
      class="px-6 md:px-12 lg:px-16 py-12 lg:py-16 border-b border-neutral-100"
    >
      <div class="max-w-7xl mx-auto">
        <h1
          class="font-condensed text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 uppercase tracking-wider mb-8"
        >
          Контакты
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <!-- Main Contacts -->
          <div>
            <div class="mb-8">
              <span
                class="text-xs uppercase tracking-widest text-neutral-400 mb-2 block"
                >Телефон и E-mail</span
              >
              <div class="text-2xl font-bold text-neutral-900 mb-1">
                +7 (391) 211-11-11
              </div>
              <a
                href="mailto:info@sm-city.ru"
                class="text-neutral-500 hover:text-primary transition-colors"
                >info@sm-city.ru</a
              >
            </div>

            <div class="space-y-6">
              <div v-for="office in offices" :key="office.address">
                <span
                  class="text-xs uppercase tracking-widest text-neutral-400 mb-2 block"
                  >Офис</span
                >
                <div class="font-medium text-neutral-900">
                  {{ office.address }}
                </div>
                <div class="text-sm text-neutral-500">{{ office.phone }}</div>
              </div>
            </div>
          </div>

          <!-- Department Contacts -->
          <div
            class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8"
          >
            <div
              v-for="dept in departments"
              :key="dept.name"
              class="border-l border-neutral-100 pl-6"
            >
              <h3
                class="font-bold text-neutral-900 uppercase tracking-wide text-sm mb-2"
              >
                {{ dept.name }}
              </h3>
              <div class="text-lg font-medium text-neutral-700">
                {{ dept.phone }}
              </div>
              <p
                v-if="dept.sub"
                class="text-xs text-neutral-400 mt-1 uppercase"
              >
                {{ dept.sub }}
              </p>
              <a
                v-if="dept.link"
                :href="dept.link.url"
                class="text-xs text-primary uppercase font-bold mt-2 inline-block hover:underline"
              >
                {{ dept.link.text }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Section -->
    <div class="w-full h-125 relative overflow-hidden">
      <SiteContactsMap class="w-full h-full" />
    </div>

    <!-- Managers Section -->
    <div class="px-6 md:px-12 lg:px-16 py-20 lg:py-24 bg-neutral-50">
      <div class="max-w-7xl mx-auto">
        <h2
          class="font-condensed text-3xl md:text-4xl font-bold text-neutral-900 uppercase tracking-widest mb-16 text-center"
        >
          Отдел продаж
        </h2>

        <!-- Head Manager -->
        <div
          v-if="headManager"
          class="max-w-4xl mx-auto mb-20 bg-white shadow-xl shadow-neutral-200/50 flex flex-col md:flex-row items-stretch overflow-hidden"
        >
          <div class="w-full md:w-1/3 aspect-[3/4] overflow-hidden">
            <img
              :src="getManagerPhoto(headManager)"
              :alt="headManager.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="p-8 md:p-12 flex flex-col justify-center flex-1">
            <span
              class="text-xs uppercase tracking-widest text-primary font-bold mb-4 block"
              >Руководитель управления</span
            >
            <h3 class="text-3xl font-bold text-neutral-900 mb-4">
              {{ headManager.name }}
            </h3>
            <p class="text-neutral-500 text-lg leading-relaxed mb-8">
              {{ headManager.position }}
            </p>
            <div
              v-if="headManager.phone"
              class="text-2xl font-bold text-neutral-900"
            >
              {{ headManager.phone }}
            </div>
          </div>
        </div>

        <!-- Sales Managers Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="manager in salesManagers" :key="manager.id" class="group">
            <div
              class="aspect-[3/4] overflow-hidden mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 shadow-lg"
            >
              <img
                :src="getManagerPhoto(manager)"
                :alt="manager.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <h4 class="font-bold text-neutral-900 text-lg mb-1">
              {{ manager.name }}
            </h4>
            <p class="text-xs text-neutral-400 uppercase tracking-wider mb-4">
              {{ manager.position }}
            </p>
            <div
              v-if="manager.phone"
              class="text-neutral-900 font-bold tracking-tight"
            >
              {{ manager.phone }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <ContactForm
      class="text-left"
      :show-phone="true"
      :show-email="true"
      :show-address="true"
    />
  </div>
</template>

<style scoped>
.font-condensed {
  font-family: "Oswald", sans-serif;
}
</style>
