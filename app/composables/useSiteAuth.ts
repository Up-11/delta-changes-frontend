import { hasAdminAuthToken } from "~/api/client";
import {
  siteLogin,
  siteRegister,
  siteLogout,
  getSiteProfile,
  isSiteAuthenticated,
  SiteAuthBlockedError,
} from "~/api/site-auth.service";
import type { SiteLoginData, SiteRegisterData, SiteUser } from "~/api/site-auth.service";

export function useSiteAuth() {
  const isAuthenticated = useState("site_auth", () => false);
  const user = useState<SiteUser | null>("site_auth_user", () => null);
  const loading = useState("site_auth_loading", () => false);
  const error = useState("site_auth_error", () => "");

  if (import.meta.client && !isAuthenticated.value) {
    isAuthenticated.value = isSiteAuthenticated();
  }

  function blockIfAdminSession(): boolean {
    if (hasAdminAuthToken()) {
      error.value =
        "Вы вошли в админ-панель. Выйдите из неё, чтобы использовать сайт как пользователь.";
      return true;
    }
    return false;
  }

  async function register(data: SiteRegisterData) {
    if (blockIfAdminSession()) return false;

    loading.value = true;
    error.value = "";
    try {
      const response = await siteRegister(data);
      if (response.user.role !== "USER") {
        throw new Error("Неверный тип аккаунта");
      }
      isAuthenticated.value = true;
      user.value = response.user;
      return true;
    } catch (e: any) {
      if (e instanceof SiteAuthBlockedError) {
        error.value = e.message;
        return false;
      }
      const msg = e?.data?.message;
      error.value = Array.isArray(msg)
        ? msg[0]
        : msg || e?.message || "Не удалось зарегистрироваться";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function login(data: SiteLoginData) {
    if (blockIfAdminSession()) return false;

    loading.value = true;
    error.value = "";
    try {
      const response = await siteLogin(data);
      if (response.user.role !== "USER") {
        siteLogout();
        error.value = "Используйте вход в админ-панель для этого аккаунта";
        return false;
      }
      isAuthenticated.value = true;
      user.value = response.user;
      return true;
    } catch (e: any) {
      if (e instanceof SiteAuthBlockedError) {
        error.value = e.message;
        return false;
      }
      const msg = e?.data?.message;
      error.value = Array.isArray(msg)
        ? msg[0]
        : msg || e?.message || "Неверный email или пароль";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    siteLogout();
    isAuthenticated.value = false;
    user.value = null;
    const { clearFavorites } = useFavorites();
    clearFavorites();
  }

  async function fetchProfile() {
    if (!isSiteAuthenticated()) {
      isAuthenticated.value = false;
      user.value = null;
      return null;
    }

    try {
      const profile = await getSiteProfile();
      if (profile?.role === "USER") {
        user.value = profile;
        isAuthenticated.value = true;
        return profile;
      }
      siteLogout();
      isAuthenticated.value = false;
      user.value = null;
      return null;
    } catch {
      isAuthenticated.value = false;
      user.value = null;
      return null;
    }
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    register,
    login,
    logout,
    fetchProfile,
  };
}
