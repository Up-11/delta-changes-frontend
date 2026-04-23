<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-bold uppercase tracking-[0.1em] text-neutral-900">
        Загрузки
      </h2>
      <UButton color="neutral" class="text-xs uppercase tracking-wider">
        <UIcon name="i-lucide-upload" class="w-4 h-4 mr-1" />
        Загрузить
      </UButton>
    </div>

    <UCard class="border border-neutral-200 shadow-none">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UCard
          v-for="file in files"
          :key="file.id"
          class="border border-neutral-200 p-4"
        >
          <div
            class="aspect-square bg-neutral-100 rounded-lg flex items-center justify-center mb-3"
          >
            <UIcon
              :name="
                file.type === 'image'
                  ? 'i-lucide-file-image'
                  : 'i-lucide-file-video'
              "
              class="w-8 h-8 text-neutral-400"
            />
          </div>
          <p class="text-sm font-medium text-neutral-900 truncate">
            {{ file.name }}
          </p>
          <p class="text-xs text-neutral-500">
            {{ file.size }}
          </p>
        </UCard>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

const files = [
  { id: 1, name: "banner-1.jpg", size: "245 KB", type: "image" },
  { id: 2, name: "banner-2.jpg", size: "189 KB", type: "image" },
  { id: 3, name: "promo.mp4", size: "2.4 MB", type: "video" },
  { id: 4, name: "object-1.jpg", size: "567 KB", type: "image" },
  { id: 5, name: "object-2.jpg", size: "423 KB", type: "image" },
  { id: 6, name: "floor-plan.jpg", size: "1.2 MB", type: "image" },
];
</script>
