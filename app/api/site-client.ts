/**
 * Site user API client (separate token from admin panel)
 */

import { getApiBaseUrl } from "~/config/api.config";
import type { ApiErrorResponse } from "./types";

export const SITE_TOKEN_KEY = "site_auth_token";

export function getSiteAuthToken(): string | null {
  if (import.meta.client) {
    return localStorage.getItem(SITE_TOKEN_KEY);
  }
  return null;
}

export function setSiteAuthToken(token: string): void {
  if (import.meta.client) {
    localStorage.setItem(SITE_TOKEN_KEY, token);
  }
}

export function removeSiteAuthToken(): void {
  if (import.meta.client) {
    localStorage.removeItem(SITE_TOKEN_KEY);
  }
}

interface SiteFetchOptions extends RequestInit {
  skipAuth?: boolean;
  body?: unknown;
}

export async function siteApiClient<T>(
  endpoint: string,
  options: SiteFetchOptions = {},
): Promise<T> {
  const { skipAuth = false, body, ...fetchOptions } = options;
  const url = `${getApiBaseUrl()}${endpoint}`;

  const headers: Record<string, string> = {
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (!skipAuth) {
    const token = getSiteAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    return await $fetch<T>(url, {
      ...fetchOptions,
      headers,
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    } as any);
  } catch (error: unknown) {
    const apiError = error as ApiErrorResponse;
    if (apiError.statusCode === 401) {
      removeSiteAuthToken();
    }
    throw error;
  }
}

export const siteApi = {
  get: <T>(endpoint: string, options?: Omit<SiteFetchOptions, "method">) =>
    siteApiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(
    endpoint: string,
    body: unknown,
    options?: Omit<SiteFetchOptions, "method" | "body">,
  ) => siteApiClient<T>(endpoint, { ...options, method: "POST", body }),

  delete: <T>(endpoint: string, options?: Omit<SiteFetchOptions, "method">) =>
    siteApiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
