import { favoritesService } from "~/api/favorites.service";

export function useFavorites() {
  const favoriteIds = useState<string[]>("favorite_ids", () => []);
  const loading = useState("favorites_loading", () => false);
  const initialized = useState("favorites_initialized", () => false);

  const { isAuthenticated, fetchProfile } = useSiteAuth();

  async function loadFavoriteIds() {
    if (!isAuthenticated.value) {
      favoriteIds.value = [];
      initialized.value = true;
      return;
    }

    loading.value = true;
    try {
      favoriteIds.value = await favoritesService.getIds();
    } catch {
      favoriteIds.value = [];
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  }

  function isFavorite(apartmentId: string): boolean {
    return favoriteIds.value.includes(apartmentId);
  }

  async function toggleFavorite(
    apartmentId: string,
  ): Promise<"added" | "removed" | null> {
    if (!isAuthenticated.value) {
      return null;
    }

    if (isFavorite(apartmentId)) {
      await favoritesService.remove(apartmentId);
      favoriteIds.value = favoriteIds.value.filter((id) => id !== apartmentId);
      return "removed";
    }

    await favoritesService.add(apartmentId);
    favoriteIds.value = [...favoriteIds.value, apartmentId];
    return "added";
  }

  function clearFavorites() {
    favoriteIds.value = [];
    initialized.value = false;
  }

  async function ensureInitialized() {
    if (!initialized.value) {
      if (!isAuthenticated.value) {
        await fetchProfile();
      }
      await loadFavoriteIds();
    }
  }

  if (import.meta.client) {
    watch(isAuthenticated, (authenticated) => {
      if (authenticated) {
        initialized.value = false;
        loadFavoriteIds();
      } else {
        clearFavorites();
      }
    });
  }

  return {
    favoriteIds: readonly(favoriteIds),
    loading: readonly(loading),
    initialized: readonly(initialized),
    isFavorite,
    toggleFavorite,
    loadFavoriteIds,
    clearFavorites,
    ensureInitialized,
  };
}
