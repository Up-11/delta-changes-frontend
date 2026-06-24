export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;

  const { isAuthenticated } = useSiteAuth();
  if (!isAuthenticated.value) {
    return navigateTo("/auth/login");
  }
});
