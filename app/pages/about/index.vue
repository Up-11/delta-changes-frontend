<script setup lang="ts">
import { projectsService } from "~/api/projects.service";
import { objectsService } from "~/api/objects.service";
import { aboutService } from "~/api/about.service";
import { getFullUrl } from "~/utils/url";
import ContactForm from "~/components/site/ContactForm.vue";

// Hardcoded data for stats
const stats = [
  { value: "1 млн м²", label: "объем сданного жилья за 20 лет" },
  { value: "8 побед", label: "в престижном градостроительном конкурсе ТОП-ЖК" },
  { value: "500 тыс. м²", label: "площадь благоустроенных территорий" },
  { value: "500+", label: "событий в год для жителей" },
];

// Hardcoded timeline data
const timelineEvents = [
  {
    year: "2006",
    title: "Начало освоения",
    description:
      "Начало освоения промзоны бывшего судостроительного завода (старт проекта «Южный берег»).",
  },
  {
    year: "2010",
    title: "Первые высотки",
    description:
      "Строительство 20-этажных домов на Капитанской, внедрение пентхаусов и панорамного остекления.",
  },
  {
    year: "2015",
    title: "Ландшафтные инновации",
    description:
      "Создание сада на крыше парковки совместно с учеными Академии наук.",
  },
  {
    year: "2018",
    title: "«Малые кварталы»",
    description:
      "Сотрудничество с голландским бюро KCAP и переход к европейскому формату квартальной застройки.",
  },
  {
    year: "2023",
    title: "Социальные жесты",
    description: "Подарок квартиры миллионному жителю Красноярска.",
  },
  {
    year: "2025",
    title: "Планы на будущее",
    description:
      "Расширение географии присутствия и запуск новых флагманских проектов.",
  },
];

// Hardcoded shareholders data
const shareholders = [
  { id: "1", name: "Александр Коропачинский", position: "Акционер" },
  {
    id: "2",
    name: "Денис Васильев",
    position: "Руководитель ГК «ДЕЛЬТАСТРОЙ»",
  },
  { id: "3", name: "Анатолий Кутыно", position: "Директор по производству" },
  { id: "4", name: "Евгений Ковальский", position: "Директор по девелопменту" },
  { id: "5", name: "Александр Васильев", position: "Директор по маркетингу" },
];

// Load only media from backend
const { data: aboutData } = await useAsyncData("about-page-data", () =>
  aboutService.getAboutData(),
);

const heroVideoUrl = computed(() => {
  const media = aboutData.value?.about?.media?.[0];
  return media
    ? getFullUrl(media.url)
    : "https://cdn.coverr.co/videos/960/thumbnails/960.mp4";
});

const principles = [
  {
    title: "Двор только для жителей",
    desc: "Концепция «двор без машин» и закрытая территория. Зоны отдыха разделены по возрастам и интересам.",
    icon: "i-lucide-shield-check",
  },
  {
    title: "Улучшение городской среды",
    desc: "Проект меняет облик города: фасады, витрины, широкие тротуары, озеленение как «магнит» для трафика.",
    icon: "i-lucide-tree-pine",
  },
  {
    title: "Квартальная застройка",
    desc: "Формат закрытого квартала создает атмосферу «Удобного города» с приватным внутренним пространством.",
    icon: "i-lucide-layout-grid",
  },
  {
    title: "Кирпичное домостроение",
    desc: "Толщина стен 77 см из поризованных блоков и облицовка декоративным кирпичом.",
    icon: "i-lucide-brick-wall",
  },
];

const { data: projects } = await useAsyncData("projects-map", () =>
  projectsService.getAll(),
);
const { data: objects } = await useAsyncData("objects-map", () =>
  objectsService.getAll(),
);

const activeYear = ref("2006");
</script>

<template>
  <div class="bg-white">
    <!-- 1. Hero Section -->
    <section
      class="relative h-screen flex items-center overflow-hidden bg-neutral-900"
    >
      <div class="absolute inset-0 z-0">
        <!-- Video Background -->
        <video
          class="w-full h-full object-cover opacity-60"
          autoplay
          muted
          loop
          playsinline
          :src="heroVideoUrl"
        ></video>
      </div>

      <div class="container mx-auto px-6 relative z-10 text-white">
        <div class="max-w-3xl">
          <h1
            class="text-5xl md:text-7xl font-condensed font-bold uppercase tracking-tighter mb-6 leading-none"
          >
            Крупнейший девелопер <br />
            <span class="text-primary">Красноярска</span>
          </h1>
          <p
            class="text-xl md:text-2xl font-light text-neutral-300 mb-8 border-l-4 border-primary pl-6"
          >
            ДЕЛЬТАСТРОЙ — эксперт в области создания качественной городской
            среды.
          </p>
          <p class="text-lg text-neutral-400 max-w-xl">
            20-летний опыт работы и достижение отметки в 1 млн м² построенного
            комфортного жилья.
          </p>
        </div>
      </div>

      <div
        class="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce text-white/50"
      >
        <UIcon name="i-lucide-chevron-down" class="w-8 h-8" />
      </div>
    </section>

    <!-- 2. Stats Section -->
    <section class="py-24 bg-neutral-50 border-y border-neutral-100">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="flex flex-col items-center text-center group"
          >
            <span
              class="text-5xl md:text-6xl font-condensed font-bold text-neutral-900 mb-4 group-hover:text-primary transition-colors"
            >
              {{ stat.value }}
            </span>
            <div class="w-12 h-1 bg-primary mb-4"></div>
            <p
              class="text-sm uppercase tracking-widest text-neutral-500 font-bold leading-relaxed px-4"
            >
              {{ stat.label }}
            </p>
          </div>
        </div>

        <div
          class="mt-20 pt-12 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div class="flex items-center gap-6">
            <div class="text-4xl font-condensed font-bold text-primary">
              5/5
            </div>
            <div class="text-sm uppercase tracking-wider font-bold">
              Рейтинг ЕРЗ по соблюдению <br />
              сроков ввода жилья
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Principles Section -->
    <section class="py-32 overflow-hidden">
      <div class="container mx-auto px-6">
        <div class="flex flex-col md:flex-row gap-16 items-start">
          <div class="md:w-1/3 sticky top-32">
            <h2
              class="text-4xl md:text-5xl font-condensed font-bold uppercase tracking-tight mb-8"
            >
              Принципы <br />
              <span class="text-primary">ДЕЛЬТАСТРОЙ</span>
            </h2>
            <p class="text-neutral-500 text-lg leading-relaxed">
              Мы не просто строим дома, мы создаем философию современной
              городской жизни, основанную на комфорте, безопасности и эстетике.
            </p>
          </div>

          <div class="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div
              v-for="principle in principles"
              :key="principle.title"
              class="bg-neutral-50 p-10 rounded-2xl hover:bg-neutral-100 transition-colors border border-neutral-100"
            >
              <div
                class="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm"
              >
                <UIcon :name="principle.icon" class="w-8 h-8 text-primary" />
              </div>
              <h3 class="text-xl font-bold mb-4 uppercase tracking-wide">
                {{ principle.title }}
              </h3>
              <p class="text-neutral-600 leading-relaxed">
                {{ principle.desc }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Timeline Section -->
    <section class="py-32 bg-neutral-900 text-white overflow-hidden">
      <div class="container mx-auto px-6">
        <h2
          class="text-4xl md:text-5xl font-condensed font-bold uppercase tracking-tight mb-20 text-center"
        >
          История развития
        </h2>

        <div class="relative">
          <!-- Timeline line -->
          <div
            class="absolute top-0 left-0 w-full h-px bg-neutral-800 mt-8 hidden md:block"
          ></div>

          <div class="grid grid-cols-1 md:grid-cols-6 gap-8">
            <div
              v-for="event in timelineEvents"
              :key="event.year"
              class="relative pt-12 group cursor-pointer"
              @mouseenter="activeYear = event.year"
            >
              <!-- Dot -->
              <div
                class="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-primary transition-all duration-300"
                :class="
                  activeYear === event.year
                    ? 'bg-primary scale-150 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-neutral-900'
                "
              ></div>

              <div
                class="text-center transition-all duration-300"
                :class="
                  activeYear === event.year ? 'opacity-100' : 'opacity-40'
                "
              >
                <div class="text-3xl font-condensed font-bold mb-4">
                  {{ event.year }}
                </div>
                <h4
                  class="font-bold text-sm uppercase tracking-widest mb-4 h-12"
                >
                  {{ event.title }}
                </h4>
                <p class="text-xs text-neutral-400 leading-relaxed">
                  {{ event.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Shareholders Section -->
    <section class="py-32">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2
            class="text-4xl md:text-5xl font-condensed font-bold uppercase tracking-tight"
          >
            Акционеры и руководство
          </h2>
        </div>

        <div class="max-w-5xl mx-auto">
          <!-- Partner Badge -->
          <div class="flex items-center justify-center gap-3 mb-16">
            <div class="h-px bg-neutral-200 w-24"></div>
            <span
              class="text-sm uppercase tracking-[0.2em] text-neutral-400 font-bold"
              >Партнер — ООО «Сбер Инвест»</span
            >
            <div class="h-px bg-neutral-200 w-24"></div>
          </div>

          <!-- Names List -->
          <div class="space-y-8">
            <div
              v-for="(person, index) in shareholders"
              :key="person.id"
              class="group flex items-baseline gap-6 border-b border-neutral-100 pb-8 last:border-0 hover:border-primary transition-colors"
            >
              <span
                class="text-4xl md:text-5xl font-condensed font-bold text-neutral-200 group-hover:text-primary transition-colors w-16"
              >
                {{ String(index + 1).padStart(2, "0") }}
              </span>
              <div class="flex-1">
                <h4
                  class="text-2xl md:text-3xl font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors"
                >
                  {{ person.name }}
                </h4>
                <p
                  class="text-sm uppercase tracking-widest text-neutral-500 font-bold"
                >
                  {{ person.position }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Projects Map -->
    <section class="h-175 relative mb-77">
      <SiteProjectsMap
        v-if="projects && (objects as any)"
        :projects="projects"
        :objects="objects as any"
      />
    </section>

    <ContactForm :show-phone="true" :show-email="true" :show-address="true" />
  </div>
</template>

<style scoped>
.font-condensed {
  font-family: "Oswald", sans-serif;
}
</style>
