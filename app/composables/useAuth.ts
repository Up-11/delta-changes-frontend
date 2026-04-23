/**
 * Auth composable - Real backend authentication
 */

import {
  login as apiLogin,
  logout as apiLogout,
  getProfile,
  isAuthenticated as checkAuth,
} from "~/api/auth.service";
import type { LoginCredentials } from "~/api/auth.service";

export function useAuth() {
  const isAuthenticated = useState("auth", () => false);
  const user = useState(
    "auth_user",
    () => null as { id: string; username: string; role: string } | null,
  );
  const loading = useState("auth_loading", () => false);
  const error = useState("auth_error", () => "");

  // Check auth on client only
  if (import.meta.client) {
    isAuthenticated.value = checkAuth();
  }

  async function login(credentials: LoginCredentials) {
    loading.value = true;
    error.value = "";

    try {
      const response = await apiLogin(credentials);
      isAuthenticated.value = true;
      user.value = response.user;
      return true;
    } catch (e: any) {
      error.value = e?.message || "Неверный логин или пароль";
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    await apiLogout();
    isAuthenticated.value = false;
    user.value = null;
  }

  async function fetchProfile() {
    if (!checkAuth()) return null;

    try {
      const profile = await getProfile();
      if (profile) {
        user.value = profile;
        isAuthenticated.value = true;
      } else {
        isAuthenticated.value = false;
        user.value = null;
      }
      return profile;
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
    login,
    logout,
    fetchProfile,
  };
}
