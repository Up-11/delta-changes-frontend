<script setup lang="ts">
import { gsap } from "gsap";

const stats = [
  {
    number: "1",
    unit: "млн м²",
    description: "Сдали за 20 лет существования компании",
  },
  {
    number: "8",
    unit: "",
    description:
      "Побед в российском градостроительном конкурсе новостроек ТОП-ЖК",
  },
  {
    number: "500",
    unit: "тыс.м²",
    description: "Площадь благоустройства в наших сити-проектах",
  },
];

const statsRef = ref<HTMLElement[]>([]);
const contentRef = ref<HTMLElement | null>(null);

onMounted(() => {
  // Animate stats on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Animate stat items
          if (statsRef.value.length) {
            gsap.fromTo(
              statsRef.value,
              { opacity: 0, y: 40 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",
              },
            );
          }
          // Animate content
          if (contentRef.value) {
            gsap.fromTo(
              contentRef.value,
              { opacity: 0, x: 30 },
              {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: "power3.out",
                delay: 0.3,
              },
            );
          }
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );

  const section = document.querySelector(".company-stats");
  if (section) {
    observer.observe(section);
  }
});
</script>

<template>
  <section class="company-stats relative bg-white">
    <div class="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[700px]">
      <!-- Left: Stats -->
      <div class="w-full lg:w-1/2 flex flex-col">
        <div
          v-for="(stat, index) in stats"
          ref="statsRef"
          :key="index"
          class="stat-item flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-8 lg:py-12 border-b border-neutral-200 last:border-b-0 lg:border-r lg:border-b-0 opacity-0"
          :class="{ 'lg:border-b': index < stats.length - 1 }"
        >
          <div class="flex items-baseline gap-2">
            <span
              class="font-condensed text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-neutral-900 tracking-tight"
            >
              {{ stat.number }}
            </span>
            <span
              v-if="stat.unit"
              class="font-condensed text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900"
            >
              {{ stat.unit }}
            </span>
          </div>
          <p
            class="mt-4 text-sm md:text-base text-neutral-500 uppercase tracking-wider max-w-md"
          >
            {{ stat.description }}
          </p>
        </div>
      </div>

      <!-- Right: Content -->
      <div
        ref="contentRef"
        class="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 lg:py-16 opacity-0"
      >
        <span class="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-6">
          Проекты
        </span>
        <h2
          class="font-condensed text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 uppercase tracking-[0.15em] leading-snug mb-6"
        >
          Каждый наш проект во всех районах Красноярска меняет облик города и
          жизнь горожан в лучшую сторону
        </h2>

        <NuxtLink
          to="/about"
          class="inline-flex items-center gap-3 group self-start"
        >
          <span
            class="text-sm uppercase tracking-[0.2em] text-neutral-900 font-medium group-hover:text-neutral-500 transition-colors"
          >
            О компании
          </span>
          <span
            class="w-12 h-12 flex items-center justify-center border border-neutral-900 text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-all duration-300"
          >
            <UIcon
              name="i-lucide-arrow-right"
              class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stat-item {
  transition: background-color 0.3s ease;
}

.stat-item:hover {
  background-color: #fafafa;
}
</style>
