<script setup lang="ts">
import { gsap } from "gsap";

const { banners, isLoading, fetchBanners, getBannerMedia } = useBanners();

const currentIndex = ref(0);
const isAnimating = ref(false);
const autoplayInterval = ref<ReturnType<typeof setInterval> | null>(null);

// Fetch banners on mount
onMounted(async () => {
  console.log("HeroBanner: Fetching banners...");
  const result = await fetchBanners();
  console.log("HeroBanner: Fetched", result.length, "banners");
  console.log("HeroBanner: Banners data:", banners.value);
  if (banners.value.length > 0) {
    console.log("HeroBanner: First banner media:", banners.value[0]?.media);
  }
  startAutoplay();
});

onUnmounted(() => {
  stopAutoplay();
});

const currentBanner = computed(() =>
  banners.value.length > 0 ? banners.value[currentIndex.value] : null,
);

function nextSlide() {
  if (isAnimating.value || banners.value.length <= 1) return;
  isAnimating.value = true;
  currentIndex.value = (currentIndex.value + 1) % banners.value.length;
  setTimeout(() => {
    isAnimating.value = false;
  }, 700);
  resetAutoplay();
}

function prevSlide() {
  if (isAnimating.value || banners.value.length <= 1) return;
  isAnimating.value = true;
  currentIndex.value =
    (currentIndex.value - 1 + banners.value.length) % banners.value.length;
  setTimeout(() => {
    isAnimating.value = false;
  }, 700);
  resetAutoplay();
}

function goToSlide(index: number) {
  if (isAnimating.value || index === currentIndex.value) return;
  isAnimating.value = true;
  currentIndex.value = index;
  setTimeout(() => {
    isAnimating.value = false;
  }, 700);
  resetAutoplay();
}

function startAutoplay() {
  if (banners.value.length <= 1) return;
  autoplayInterval.value = setInterval(() => {
    nextSlide();
  }, 6000);
}

function stopAutoplay() {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value);
    autoplayInterval.value = null;
  }
}

function resetAutoplay() {
  stopAutoplay();
  startAutoplay();
}

// Pause autoplay on hover
function onMouseEnter() {
  stopAutoplay();
}

function onMouseLeave() {
  startAutoplay();
}
</script>

<template>
  <section
    class="relative w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-hidden bg-neutral-900"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Media Carousel -->
    <TransitionGroup
      enter-active-class="transition-all duration-700 ease-out"
      enter-from-class="opacity-0 scale-105"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-700 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-for="(banner, index) in banners"
        v-show="index === currentIndex"
        :key="banner.id"
        class="absolute inset-0"
      >
        <!-- Video -->
        <video
          v-if="getBannerMedia(banner).type === 'VIDEO'"
          :src="getBannerMedia(banner).url!"
          class="w-full h-full object-cover"
          autoplay
          muted
          loop
          playsinline
        />
        <!-- Image -->
        <NuxtImg
          v-else-if="getBannerMedia(banner).type === 'IMAGE'"
          :src="getBannerMedia(banner).url!"
          :alt="banner.mainText"
          class="w-full h-full object-cover"
          width="1920"
          height="1080"
        />
        <!-- Fallback -->
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-neutral-800"
        >
          <UIcon name="i-lucide-image" class="w-24 h-24 text-neutral-600" />
        </div>

        <!-- Gradient Overlay -->
        <div
          class="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"
        />
      </div>
    </TransitionGroup>

    <!-- Empty State -->
    <div
      v-if="banners.length === 0 && !isLoading"
      class="absolute inset-0 flex items-center justify-center bg-neutral-100"
    >
      <div class="text-center space-y-4">
        <UIcon
          name="i-lucide-image"
          class="w-16 h-16 text-neutral-300 mx-auto"
        />
        <p class="text-neutral-400 tracking-widest uppercase text-sm">
          Баннеры не найдены
        </p>
      </div>
    </div>

    <!-- Content & Controls - Bottom Right -->
    <div
      class="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
    >
      <!-- Text Content -->
      <Transition
        mode="out-in"
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="currentBanner" :key="currentBanner.id" class="max-w-xl">
          <h2
            class="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-widest uppercase mb-3"
          >
            {{ currentBanner.mainText }}
          </h2>
          <p
            v-if="currentBanner.subText"
            class="text-sm md:text-base text-white/80 tracking-[0.2em] uppercase"
          >
            {{ currentBanner.subText }}
          </p>
        </div>
      </Transition>

      <!-- Controls -->
      <div class="flex items-center gap-4">
        <!-- Prev/Next Buttons -->
        <div class="flex items-center gap-2">
          <button
            class="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center border border-white/30 text-white hover:bg-white hover:text-neutral-900 transition-all duration-300 group"
            @click="prevSlide"
          >
            <UIcon
              name="i-lucide-arrow-left"
              class="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:-translate-x-1"
            />
          </button>
          <button
            class="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center border border-white/30 text-white hover:bg-white hover:text-neutral-900 transition-all duration-300 group"
            @click="nextSlide"
          >
            <UIcon
              name="i-lucide-arrow-right"
              class="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>

        <!-- Slide Indicators -->
        <div
          v-if="banners.length > 1"
          class="hidden md:flex items-center gap-2 ml-4"
        >
          <button
            v-for="(_, index) in banners"
            :key="index"
            class="h-1 transition-all duration-300"
            :class="
              index === currentIndex
                ? 'w-8 bg-white'
                : 'w-4 bg-white/40 hover:bg-white/60'
            "
            @click="goToSlide(index)"
          />
        </div>

        <!-- Counter -->
        <div
          v-if="banners.length > 0"
          class="text-white/60 text-xs tracking-[0.2em] ml-2 hidden lg:block"
        >
          <span class="text-white">{{
            String(currentIndex + 1).padStart(2, "0")
          }}</span>
          <span class="mx-2">/</span>
          <span>{{ String(banners.length).padStart(2, "0") }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
