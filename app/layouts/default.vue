<template>
  <div class="min-h-screen bg-white flex flex-col">
    <SiteHeader />
    <main class="pt-20 flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts"></script>
