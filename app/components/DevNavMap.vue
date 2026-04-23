<template>
  <div
    v-if="isDev"
    class="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800"
  >
    <div class="max-w-7xl mx-auto px-4 py-2">
      <div class="flex items-center gap-2">
        <UButton
          size="xs"
          color="primary"
          variant="soft"
          icon="i-lucide-map"
          label="Dev Nav"
          @click="isOpen = !isOpen"
        />

        <div class="flex-1 overflow-x-auto no-scrollbar">
          <div class="flex items-center gap-1">
            <UButton
              v-for="r in quickRoutes"
              :key="r.path"
              :to="r.path"
              size="xs"
              color="neutral"
              variant="ghost"
              class="whitespace-nowrap"
            >
              {{ r.label }}
            </UButton>
          </div>
        </div>

        <UBadge
          size="xs"
          color="neutral"
          variant="subtle"
        >
          {{ currentRouteName }}
        </UBadge>
      </div>

      <div
        v-if="isOpen"
        class="mt-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 pb-2 border-t border-gray-200 dark:border-gray-800 pt-2"
      >
        <div
          v-for="section in routeSections"
          :key="section.title"
          class="space-y-1"
        >
          <h4
            class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2"
          >
            {{ section.title }}
          </h4>
          <UButton
            v-for="r in section.routes"
            :key="r.path"
            :to="r.path"
            size="xs"
            color="neutral"
            variant="ghost"
            class="w-full justify-start"
            :class="{ 'bg-primary/10 text-primary': isActiveRoute(r.path) }"
          >
            <UIcon
              v-if="r.icon"
              :name="r.icon"
              class="w-3 h-3 mr-1"
            />
            {{ r.label }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  SITE_ROUTES,
  ADMIN_ROUTES,
  FLAT_SITE_ROUTES
} from '~/config/routes.config'

const isDev = import.meta.dev
const isOpen = ref(false)
const route = useRoute()

const currentRouteName = computed(() => {
  const matched = FLAT_SITE_ROUTES.find(
    r =>
      route.path === r.path
      || route.path.startsWith(r.path.replace('/:id', '').replace('/:slug', ''))
  )
  return matched?.label || route.name || route.path
})

const quickRoutes = computed(() => {
  return SITE_ROUTES.slice(0, 6)
})

const routeSections = computed(() => {
  return [
    {
      title: 'Основные',
      routes: SITE_ROUTES.slice(0, 4)
    },
    {
      title: 'Инфо',
      routes: SITE_ROUTES.slice(4)
    },
    {
      title: 'Админ',
      routes: ADMIN_ROUTES.slice(0, 4)
    },
    {
      title: 'Управление',
      routes: ADMIN_ROUTES.slice(4)
    }
  ]
})

function isActiveRoute(path: string): boolean {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path.replace('/:id', '').replace('/:slug', ''))
}

// Add padding to body when in dev mode
onMounted(() => {
  if (isDev) {
    document.body.style.paddingBottom = '48px'
  }
})

onUnmounted(() => {
  document.body.style.paddingBottom = ''
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
