export default defineNuxtPlugin(async () => {
  if (import.meta.client && localStorage.getItem("auth_token")) {
    return;
  }

  const { fetchProfile } = useSiteAuth();
  const { loadFavoriteIds } = useFavorites();

  const profile = await fetchProfile();
  if (profile) {
    await loadFavoriteIds();
  }
});
