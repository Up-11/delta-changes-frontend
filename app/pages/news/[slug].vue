<script setup lang="ts">
import { newsService } from "~/api/news.service";
import { getFullUrl } from "~/utils/url";
import type { NewsWithRelations } from "~/api/types";

const route = useRoute();
const slug = route.params.slug as string;

const news = ref<NewsWithRelations | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const data = await newsService.getBySlug(slug);
    // Only show published news
    if (data.status !== "PUBLISHED") {
      error.value = "Новость не найдена";
    } else {
      news.value = data;
    }
  } catch (err) {
    console.error("Failed to fetch news:", err);
    error.value = "Не удалось загрузить новость";
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

function getMedia(item: NewsWithRelations) {
  return item.media?.[0] || null;
}

function getMediaUrl(url: string): string {
  return getFullUrl(url);
}

useHead(() => ({
  title: news.value?.metaTitle || news.value?.title || "Новость",
  meta: [
    {
      name: "description",
      content: news.value?.metaDesc || news.value?.excerpt || "",
    },
  ],
}));
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Header with Navigation -->
    <div class="border-b border-neutral-200">
      <div class="px-6 md:px-12 lg:px-16 py-6">
        <NuxtLink
          to="/news"
          class="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
          <span>Все новости</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-24">
      <UIcon
        name="i-lucide-loader-2"
        class="w-8 h-8 animate-spin text-neutral-400"
      />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-24">
      <UIcon
        name="i-lucide-file-x"
        class="w-16 h-16 text-neutral-300 mx-auto mb-4"
      />
      <p class="text-neutral-500">{{ error }}</p>
      <NuxtLink
        to="/news"
        class="text-primary hover:underline mt-4 inline-block"
      >
        Вернуться к списку новостей
      </NuxtLink>
    </div>

    <!-- News Content -->
    <article
      v-else-if="news"
      class="max-w-3xl mx-auto px-6 md:px-12 lg:px-16 py-12 lg:py-16"
    >
      <!-- Media (Image or Video) - 16:9 Aspect Ratio -->
      <div v-if="getMedia(news)" class="mb-10 flex justify-center">
        <div class="w-full max-w-2xl">
          <!-- Image -->
          <div
            v-if="getMedia(news)?.type === 'IMAGE'"
            class="relative aspect-video rounded-lg shadow-lg overflow-hidden"
          >
            <img
              :src="getMediaUrl(getMedia(news)!.url)"
              :alt="news.title"
              class="w-full h-full object-cover"
            />
          </div>
          <!-- Video -->
          <div
            v-else-if="getMedia(news)?.type === 'VIDEO'"
            class="relative aspect-video rounded-lg shadow-lg overflow-hidden"
          >
            <video
              :src="getMediaUrl(getMedia(news)!.url)"
              controls
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <!-- Date -->
      <span
        class="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-6 block text-center"
      >
        {{ formatDate(news.publishedAt || news.createdAt) }}
      </span>

      <!-- Title -->
      <h1
        class="font-condensed text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 uppercase tracking-[0.1em] leading-tight mb-8 text-center"
      >
        {{ news.title }}
      </h1>

      <!-- Excerpt -->
      <p
        v-if="news.excerpt"
        class="text-lg text-neutral-600 leading-relaxed mb-10 font-medium text-center max-w-2xl mx-auto"
      >
        {{ news.excerpt }}
      </p>

      <!-- Content -->
      <div
        v-if="news.content"
        class="prose prose-neutral max-w-none text-center"
        v-html="news.content"
      />

      <!-- No Content -->
      <div v-else class="text-neutral-400 italic text-center">
        Полный текст новости в разработке
      </div>
    </article>
  </div>
</template>

<style scoped>
.prose {
  text-align: center;
}

.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #171717;
  text-align: center;
}

.prose :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #171717;
  text-align: center;
}

.prose :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.75;
  color: #404040;
  text-align: center;
}

.prose :deep(ul) {
  list-style-type: none;
  padding-left: 0;
  margin-bottom: 1rem;
  text-align: center;
}

.prose :deep(ol) {
  list-style-type: none;
  padding-left: 0;
  margin-bottom: 1rem;
  text-align: center;
}

.prose :deep(li) {
  margin-bottom: 0.5rem;
}

.prose :deep(a) {
  color: #171717;
  text-decoration: underline;
}

.prose :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1.5rem auto;
  display: block;
}

.prose :deep(blockquote) {
  border-left: none;
  padding-left: 0;
  margin: 1.5rem auto;
  font-style: italic;
  color: #525252;
  text-align: center;
  max-width: 600px;
}
</style>
