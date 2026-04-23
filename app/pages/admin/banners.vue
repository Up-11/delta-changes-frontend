<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-bold uppercase tracking-[0.1em] text-neutral-900">
        Баннеры
      </h2>
      <UButton color="neutral" class="text-xs uppercase tracking-wider">
        <UIcon name="i-lucide-plus" class="w-4 h-4 mr-1" />
        Добавить
      </UButton>
    </div>

    <UCard class="border border-neutral-200 shadow-none">
      <div class="text-center py-16 text-neutral-400">
        <UIcon name="i-lucide-image" class="w-16 h-16 mx-auto mb-4" />
        <p class="text-sm uppercase tracking-wider">Нет баннеров</p>
        <p class="text-xs mt-2 text-neutral-300">
          Данные будут загружаться из API
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
});
</script>
