import { hasAdminAuthToken } from "./client";
import { siteApi, setSiteAuthToken, removeSiteAuthToken } from "./site-client";

export class SiteAuthBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SiteAuthBlockedError";
  }
}

function assertSiteAuthAllowed() {
  if (import.meta.client && hasAdminAuthToken()) {
    throw new SiteAuthBlockedError(
      "Вы вошли в админ-панель. Выйдите из неё, чтобы использовать сайт как пользователь.",
    );
  }
}

export interface SiteRegisterData {
  email: string;
  password: string;
  name: string;
}

export interface SiteLoginData {
  email: string;
  password: string;
}

export interface SiteUser {
  id: string;
  username: string;
  email: string | null;
  name: string | null;
  role: string;
}

export interface SiteAuthResponse {
  access_token: string;
  user: SiteUser;
}

export async function siteRegister(
  data: SiteRegisterData,
): Promise<SiteAuthResponse> {
  assertSiteAuthAllowed();

  const response = await siteApi.post<SiteAuthResponse>(
    "/auth/register",
    data,
    { skipAuth: true },
  );
  if (response.access_token) {
    setSiteAuthToken(response.access_token);
  }
  return response;
}

export async function siteLogin(data: SiteLoginData): Promise<SiteAuthResponse> {
  assertSiteAuthAllowed();

  const response = await siteApi.post<SiteAuthResponse>(
    "/auth/login",
    { username: data.email, password: data.password, client: "site" },
    { skipAuth: true },
  );
  if (response.access_token) {
    setSiteAuthToken(response.access_token);
  }
  return response;
}

export function siteLogout(): void {
  removeSiteAuthToken();
}

export async function getSiteProfile(): Promise<SiteUser | null> {
  if (
    !import.meta.client ||
    !localStorage.getItem("site_auth_token") ||
    hasAdminAuthToken()
  ) {
    return null;
  }

  try {
    return await siteApi.get<SiteUser>("/auth/profile");
  } catch {
    removeSiteAuthToken();
    return null;
  }
}

export function isSiteAuthenticated(): boolean {
  if (import.meta.client) {
    return !!localStorage.getItem("site_auth_token") && !hasAdminAuthToken();
  }
  return false;
}
