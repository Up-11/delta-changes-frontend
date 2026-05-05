<script setup lang="ts">
import { newsService } from "~/api/news.service";
import { getFullUrl } from "~/utils/url";
import type { NewsWithRelations } from "~/api/types";

const news = ref<NewsWithRelations[]>([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const data = await newsService.getAll();
    // Filter only published news and sort by publishedAt date (newest first)
    news.value = data
      .filter((item) => item.status === "PUBLISHED")
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt);
        const dateB = new Date(b.publishedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
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
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <div class="border-b border-neutral-200">
      <div class="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
        <span class="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-4 block">
          Новости
        </span>
        <h1
          class="font-condensed text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 uppercase tracking-[0.15em] leading-snug"
        >
          Все новости компании
        </h1>
      </div>
    </div>

    <!-- News Grid -->
    <div class="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-neutral-400"
        />
      </div>

      <div
        v-else-if="news.length === 0"
        class="text-center py-20"
      >
        <UIcon
          name="i-lucide-newspaper"
          class="w-16 h-16 text-neutral-300 mx-auto mb-4"
        />
        <p class="text-neutral-500 uppercase tracking-wider">
          Новости пока не опубликованы
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="item in news"
          :key="item.id"
          class="group flex flex-col"
        >
          <!-- News Image -->
          <NuxtLink
            :to="`/news/${item.slug}`"
            class="block w-full h-64 overflow-hidden mb-5"
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
              <h2
                class="font-condensed text-lg md:text-xl font-bold text-neutral-900 uppercase tracking-[0.1em] leading-tight mb-3 group-hover:text-neutral-600 transition-colors"
              >
                {{ item.title }}
              </h2>
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

    <!-- Back to Home -->
    <div class="px-6 md:px-12 lg:px-16 pb-16">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-3 group"
      >
        <span
          class="w-12 h-12 flex items-center justify-center border border-neutral-900 text-neutral-900 group-hover:bg-neutral-900 group-hover:text-white transition-all duration-300"
        >
          <UIcon
            name="i-lucide-arrow-left"
            class="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1"
          />
        </span>
        <span
          class="text-sm uppercase tracking-[0.2em] text-neutral-900 font-medium group-hover:text-neutral-500 transition-colors"
        >
          На главную
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
/* Ensure proper line clamping */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
