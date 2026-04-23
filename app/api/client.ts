/**
 * API Client - Base HTTP client for backend communication
 * TEMP: Auth disabled
 */

import { getApiBaseUrl, API_ENDPOINTS } from "~/config/api.config";
import type { ApiErrorResponse } from "./types";

const TOKEN_KEY = "auth_token";

/** Get auth token from localStorage */
function getAuthToken(): string | null {
  if (import.meta.client) {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/** Set auth token in localStorage */
export function setAuthToken(token: string): void {
  if (import.meta.client) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/** Remove auth token from localStorage */
export function removeAuthToken(): void {
  if (import.meta.client) {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/** Base fetch options */
interface FetchOptions extends RequestInit {
  /** Skip adding auth token */
  skipAuth?: boolean;
  /** Request body as object (will be JSON.stringify'd) */
  body?: unknown;
}

/**
 * Base API client function
 * Wraps $fetch with auth, error handling, and type safety
 */
export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth = false, body, ...fetchOptions } = options;

  const url = `${getApiBaseUrl()}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  // Add auth token for protected endpoints
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    return await $fetch<T>(url, {
      ...fetchOptions,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error: unknown) {
    // Handle API errors
    const apiError = error as ApiErrorResponse;

    // Auto-logout on 401
    if (apiError.statusCode === 401) {
      removeAuthToken();
      if (typeof window !== "undefined") {
        navigateTo("/admin");
      }
    }

    throw error;
  }
}

/** Convenience methods for common HTTP verbs */
export const api = {
  /** GET request */
  get: <T>(endpoint: string, options?: Omit<FetchOptions, "method">) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  /** POST request */
  post: <T>(
    endpoint: string,
    body: unknown,
    options?: Omit<FetchOptions, "method" | "body">,
  ) => apiClient<T>(endpoint, { ...options, method: "POST", body }),

  /** PATCH request */
  patch: <T>(
    endpoint: string,
    body: unknown,
    options?: Omit<FetchOptions, "method" | "body">,
  ) => apiClient<T>(endpoint, { ...options, method: "PATCH", body }),

  /** DELETE request */
  delete: <T>(endpoint: string, options?: Omit<FetchOptions, "method">) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),

  /** Upload file with multipart/form-data */
  upload: <T>(
    endpoint: string,
    formData: FormData,
    options?: Omit<FetchOptions, "method" | "body">,
  ) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
      headers: {}, // Let browser set Content-Type with boundary
    }),
};

/** Health check - verify API is running */
export async function checkApiHealth(): Promise<boolean> {
  try {
    await api.get(API_ENDPOINTS.root.health.path);
    return true;
  } catch {
    return false;
  }
}

/** Auth API - for login/logout */
export const authApi = {
  /** Admin login */
  async login(username: string, password: string): Promise<{ token: string }> {
    const response = await apiClient<{ token: string }>("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: { username, password },
    });
    setAuthToken(response.token);
    return response;
  },

  /** Logout - clear token */
  logout(): void {
    removeAuthToken();
  },

  /** Check if authenticated */
  isAuthenticated(): boolean {
    return !!getAuthToken();
  },
};
