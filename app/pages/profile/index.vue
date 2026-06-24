<script setup lang="ts">
import { favoritesService } from "~/api/favorites.service";
import { getFullUrl } from "~/utils/url";
import type { FavoriteItem } from "~/api/favorites.service";
import type { ApartmentWithRelations } from "~/api/types";

definePageMeta({
  layout: "default",
  middleware: "site-auth",
});

const { user, logout } = useSiteAuth();
const toast = useToast();

const { data: favorites, pending, refresh } = useAsyncData(
  "profile-favorites",
  () => favoritesService.getAll(),
  { server: false },
);

async function handleLogout() {
  await logout();
  toast.add({
    title: "Вы вышли из аккаунта",
    color: "neutral",
  });
  await navigateTo("/");
}

function formatPrice(price: number | null): string {
  if (!price) return "—";
  return price.toLocaleString("ru-RU") + " ₽";
}

function getApartmentImage(apartment: ApartmentWithRelations): string {
  if (apartment.layoutPhoto?.url) return getFullUrl(apartment.layoutPhoto.url);
  if (apartment.floorPlanPhoto?.url)
    return getFullUrl(apartment.floorPlanPhoto.url);
  if (apartment.masterPlanPhoto?.url)
    return getFullUrl(apartment.masterPlanPhoto.url);
  return "https://via.placeholder.com/600x400?text=Нет+фото";
}

async function removeFromFavorites(item: FavoriteItem, event: Event) {
  event.preventDefault();
  event.stopPropagation();
  try {
    await favoritesService.remove(item.apartmentId);
    const { loadFavoriteIds } = useFavorites();
    await loadFavoriteIds();
    await refresh();
    toast.add({ title: "Удалено из избранного", color: "neutral" });
  } catch {
    toast.add({
      title: "Ошибка",
      description: "Не удалось удалить из избранного",
      color: "neutral",
    });
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50">
    <div class="bg-white border-b border-neutral-200">
      <div class="w-full px-6 py-8 max-w-6xl mx-auto">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div>
            <h1
              class="text-4xl font-bold uppercase tracking-widest text-neutral-900"
            >
              Профиль
            </h1>
            <p class="text-neutral-500 mt-2">{{ user?.name || user?.email }}</p>
            <p class="text-sm text-neutral-400">{{ user?.email }}</p>
          </div>
          <UButton
            color="neutral"
            variant="outline"
            class="rounded-none uppercase tracking-wider"
            @click="handleLogout"
          >
            Выйти
          </UButton>
        </div>
      </div>
    </div>

    <div class="w-full px-6 py-10 max-w-6xl mx-auto">
      <h2
        class="text-2xl font-bold uppercase tracking-widest text-neutral-900 mb-8"
      >
        Избранное
      </h2>

      <div v-if="pending" class="flex justify-center py-16">
        <UIcon
          name="i-lucide-loader-2"
          class="w-10 h-10 animate-spin text-neutral-400"
        />
      </div>

      <div
        v-else-if="!favorites?.length"
        class="text-center py-16 bg-white border border-neutral-200"
      >
        <UIcon
          name="i-lucide-heart"
          class="w-14 h-14 mx-auto text-neutral-300 mb-4"
        />
        <p class="text-neutral-500 uppercase tracking-widest mb-6">
          В избранном пока нет квартир
        </p>
        <UButton
          to="/real-estate"
          color="neutral"
          class="rounded-none uppercase tracking-wider bg-neutral-900"
        >
          Смотреть каталог
        </UButton>
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <NuxtLink
          v-for="item in favorites"
          :key="item.id"
          :to="`/real-estate/${item.apartment.id}`"
          class="group bg-white border border-neutral-200 hover:shadow-lg transition-all overflow-hidden"
        >
          <div class="relative h-48 bg-neutral-100">
            <img
              :src="getApartmentImage(item.apartment)"
              :alt="`Квартира ${item.apartment.number}`"
              class="w-full h-full object-contain"
            />
            <button
              type="button"
              class="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow border border-neutral-200 text-primary-600 hover:bg-neutral-50"
              aria-label="Удалить из избранного"
              @click="removeFromFavorites(item, $event)"
            >
              <UIcon name="i-lucide-heart" class="w-4 h-4 fill-current" />
            </button>
          </div>
          <div class="p-5">
            <p class="text-xs uppercase tracking-widest text-neutral-500 mb-1">
              {{ item.apartment.project?.name }}
            </p>
            <p class="font-bold text-neutral-900 uppercase">
              {{ item.apartment.rooms || "—" }} комн. ·
              {{ item.apartment.area || "—" }} м²
            </p>
            <p class="text-xl font-bold text-neutral-900 mt-2">
              {{ formatPrice(item.apartment.price) }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
