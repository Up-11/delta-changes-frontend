<script setup lang="ts">
import { newsService } from "~/api/news.service";
import { getFullUrl } from "~/utils/url";
import type { NewsWithRelations } from "~/api/types";

const news = ref<NewsWithRelations[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const data = await newsService.getAll();
    // Filter only published news, sort by date (newest first), and take first 3
    news.value = data
      .filter((item) => item.status === "PUBLISHED")
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt);
        const dateB = new Date(b.publishedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 3);
  } catch (error) {
    console.error("Failed to fetch news:", error);
  } finally {
    isLoading.value = false;
  }
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getNewsImage(item: NewsWithRelations): string {
  const media = item.media?.find((m) => m.type === "IMAGE");
  if (media) {
    return getFullUrl(media.url);
  }
  return "";
}
</script>

<template>
  <section v-if="!isLoading && news.length > 0" class="bg-white">
    <div class="flex flex-col lg:flex-row">
      <!-- Left: Header -->
      <div
        class="w-full lg:w-1/3 px-6 md:px-12 lg:px-16 py-12 lg:py-16 border-b lg:border-b-0 lg:border-r border-neutral-200"
      >
        <span
          class="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-6 block"
        >
          Новости
        </span>
        <h2
          class="font-condensed text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 uppercase tracking-[0.15em] leading-snug mb-6"
        >
          Актуальные события и обновления компании
        </h2>
        <NuxtLink
          to="/news"
          class="inline-flex items-center gap-3 group self-start"
        >
          <span
            class="text-sm uppercase tracking-[0.2em] text-neutral-900 font-medium group-hover:text-neutral-500 transition-colors"
          >
            Все новости
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

      <!-- Right: News Grid -->
      <div class="w-full lg:w-2/3 p-6 md:p-8 lg:p-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="item in news" :key="item.id" class="group flex flex-col">
            <!-- News Image -->
            <NuxtLink
              :to="`/news/${item.slug}`"
              class="block w-full h-56 overflow-hidden mb-4"
            >
              <img
                v-if="getNewsImage(item)"
                :src="getNewsImage(item)"
                :alt="item.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                v-else
                class="w-full h-full bg-neutral-100 flex items-center justify-center"
              >
                <UIcon
                  name="i-lucide-newspaper"
                  class="w-12 h-12 text-neutral-300"
                />
              </div>
            </NuxtLink>

            <!-- News Content -->
            <div class="flex flex-col">
              <span
                class="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2"
              >
                {{ formatDate(item.publishedAt || item.createdAt) }}
              </span>
              <NuxtLink :to="`/news/${item.slug}`">
                <h3
                  class="font-condensed text-base md:text-lg font-bold text-neutral-900 uppercase tracking-[0.1em] leading-tight mb-3 group-hover:text-neutral-600 transition-colors"
                >
                  {{ item.title }}
                </h3>
              </NuxtLink>
              <p
                v-if="item.excerpt"
                class="text-sm text-neutral-500 leading-relaxed line-clamp-3 mb-4"
              >
                {{ item.excerpt }}
              </p>
              <NuxtLink
                :to="`/news/${item.slug}`"
                class="inline-flex items-center gap-2 mt-auto self-start"
              >
                <span
                  class="text-xs uppercase tracking-[0.15em] text-neutral-900 font-medium group-hover:text-neutral-500 transition-colors"
                >
                  Читать далее
                </span>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="w-4 h-4 text-neutral-900 group-hover:translate-x-1 transition-transform"
                />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
