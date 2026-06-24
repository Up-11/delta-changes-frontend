/**
 * API Configuration - Backend Endpoints
 * Auto-generated from delta-changes-backend analysis
 *
 * Base URL: http://localhost:3000 (or from env NUXT_PUBLIC_API_BASE_URL)
 * Swagger Docs: /api
 */

import { useRuntimeConfig } from "#app";

/** Get API base URL from runtime config */
export function getApiBaseUrl(): string {
  const config = useRuntimeConfig();
  return config.public.apiBaseUrl as string;
}

/** Default fallback base URL */
export const DEFAULT_API_BASE_URL = "https://jvzp9vk6-4000.euw.devtunnels.ms";

/** Helper to build full URL */
export function buildApiUrl(endpoint: string): string {
  return `${getApiBaseUrl()}${endpoint}`;
}

export const API_ENDPOINTS = {
  /** Auth module - Authentication */
  auth: {
    base: "/auth",
    register: {
      method: "POST" as const,
      path: "/auth/register",
      access: "public" as const,
      description: "Register site user",
    },
    login: {
      method: "POST" as const,
      path: "/auth/login",
      access: "public" as const,
      description: "Login (email for users, username for admin)",
    },
    logout: {
      method: "POST" as const,
      path: "/auth/logout",
      access: "admin" as const,
      description: "Logout and invalidate token",
    },
    profile: {
      method: "GET" as const,
      path: "/auth/profile",
      access: "admin" as const,
      description: "Get current admin profile",
    },
  },

  /** Root endpoint - Health check */
  root: {
    base: "/",
    health: {
      method: "GET" as const,
      path: "/",
      access: "public" as const,
      description: "Get API greeting/health status",
    },
  },

  /** Objects module - Real estate objects */
  objects: {
    base: "/objects",
    list: {
      method: "GET" as const,
      path: "/objects",
      access: "public" as const,
      description: "Get all active objects",
    },
    getById: {
      method: "GET" as const,
      path: (id: string) => `/objects/${id}`,
      access: "public" as const,
      description: "Get object by id",
    },
    getBySlug: {
      method: "GET" as const,
      path: (slug: string) => `/objects/slug/${slug}`,
      access: "public" as const,
      description: "Get object by slug",
    },
    create: {
      method: "POST" as const,
      path: "/objects",
      access: "admin" as const,
      description: "Create new object",
    },
    update: {
      method: "PATCH" as const,
      path: (id: string) => `/objects/${id}`,
      access: "admin" as const,
      description: "Update object by id",
    },
    delete: {
      method: "DELETE" as const,
      path: (id: string) => `/objects/${id}`,
      access: "admin" as const,
      description: "Delete object by id",
    },
  },

  /** Apartments module - Individual apartments */
  apartments: {
    base: "/apartments",
    list: {
      method: "GET" as const,
      path: "/apartments",
      access: "public" as const,
      description: "Get all available apartments",
    },
    getById: {
      method: "GET" as const,
      path: (id: string) => `/apartments/${id}`,
      access: "public" as const,
      description: "Get apartment by id",
    },
    create: {
      method: "POST" as const,
      path: "/apartments",
      access: "admin" as const,
      description: "Create new apartment",
    },
    update: {
      method: "PATCH" as const,
      path: (id: string) => `/apartments/${id}`,
      access: "admin" as const,
      description: "Update apartment by id",
    },
    delete: {
      method: "DELETE" as const,
      path: (id: string) => `/apartments/${id}`,
      access: "admin" as const,
      description: "Delete apartment by id",
    },
  },

  /** Projects module - Building projects */
  projects: {
    base: "/projects",
    list: {
      method: "GET" as const,
      path: "/projects",
      access: "public" as const,
      description: "Get all active projects",
    },
    getById: {
      method: "GET" as const,
      path: (id: string) => `/projects/${id}`,
      access: "public" as const,
      description: "Get project by id",
    },
    getBySlug: {
      method: "GET" as const,
      path: (slug: string) => `/projects/slug/${slug}`,
      access: "public" as const,
      description: "Get project by slug",
    },
    create: {
      method: "POST" as const,
      path: "/projects",
      access: "admin" as const,
      description: "Create new project",
    },
    update: {
      method: "PATCH" as const,
      path: (id: string) => `/projects/${id}`,
      access: "admin" as const,
      description: "Update project by id",
    },
    delete: {
      method: "DELETE" as const,
      path: (id: string) => `/projects/${id}`,
      access: "admin" as const,
      description: "Delete project by id",
    },
  },

  /** Banners module - Hero/slider banners */
  banners: {
    base: "/banners",
    list: {
      method: "GET" as const,
      path: "/banners",
      access: "public" as const,
      description: "Get all active banners",
    },
    getById: {
      method: "GET" as const,
      path: (id: string) => `/banners/${id}`,
      access: "public" as const,
      description: "Get banner by id",
    },
    create: {
      method: "POST" as const,
      path: "/banners",
      access: "admin" as const,
      description: "Create new banner",
    },
    update: {
      method: "PATCH" as const,
      path: (id: string) => `/banners/${id}`,
      access: "admin" as const,
      description: "Update banner by id",
    },
    delete: {
      method: "DELETE" as const,
      path: (id: string) => `/banners/${id}`,
      access: "admin" as const,
      description: "Delete banner by id",
    },
  },

  /** News module - News/articles */
  news: {
    base: "/news",
    list: {
      method: "GET" as const,
      path: "/news",
      access: "public" as const,
      description: "Get all published news",
    },
    getById: {
      method: "GET" as const,
      path: (id: string) => `/news/${id}`,
      access: "public" as const,
      description: "Get news by id",
    },
    getBySlug: {
      method: "GET" as const,
      path: (slug: string) => `/news/slug/${slug}`,
      access: "public" as const,
      description: "Get news by slug",
    },
    create: {
      method: "POST" as const,
      path: "/news",
      access: "admin" as const,
      description: "Create new news article",
    },
    update: {
      method: "PATCH" as const,
      path: (id: string) => `/news/${id}`,
      access: "admin" as const,
      description: "Update news by id",
    },
    delete: {
      method: "DELETE" as const,
      path: (id: string) => `/news/${id}`,
      access: "admin" as const,
      description: "Delete news by id",
    },
  },

  /** Applications module - User applications/requests */
  applications: {
    base: "/applications",
    list: {
      method: "GET" as const,
      path: "/applications",
      access: "admin" as const,
      description: "Get all applications",
    },
    getById: {
      method: "GET" as const,
      path: (id: string) => `/applications/${id}`,
      access: "admin" as const,
      description: "Get application by id",
    },
    create: {
      method: "POST" as const,
      path: "/applications",
      access: "public" as const,
      description: "Create new application (stores IP address)",
    },
    update: {
      method: "PATCH" as const,
      path: (id: string) => `/applications/${id}`,
      access: "admin" as const,
      description: "Update application by id",
    },
    delete: {
      method: "DELETE" as const,
      path: (id: string) => `/applications/${id}`,
      access: "admin" as const,
      description: "Delete application by id",
    },
  },

  /** Dashboard module - Admin dashboard stats */
  dashboard: {
    base: "/dashboard",
    stats: {
      method: "GET" as const,
      path: "/dashboard/stats",
      access: "admin" as const,
      description: "Get dashboard statistics",
    },
    recentApplications: {
      method: "GET" as const,
      path: "/dashboard/recent-applications",
      access: "admin" as const,
      description: "Get recent applications",
    },
  },

  /** Uploads module - File upload/management */
  uploads: {
    base: "/uploads",
    list: {
      method: "GET" as const,
      path: "/uploads",
      access: "admin" as const,
      description: "Get all uploaded files",
    },
    uploadImage: {
      method: "POST" as const,
      path: "/uploads/image",
      access: "admin" as const,
      description: "Upload single image (jpg, png, gif, webp, max 10MB)",
      contentType: "multipart/form-data",
    },
    uploadVideo: {
      method: "POST" as const,
      path: "/uploads/video",
      access: "admin" as const,
      description: "Upload single video (mp4, mov, avi, webm, max 100MB)",
      contentType: "multipart/form-data",
    },
    uploadMultipleImages: {
      method: "POST" as const,
      path: "/uploads/images",
      access: "admin" as const,
      description: "Upload multiple images (max 10 files)",
      contentType: "multipart/form-data",
    },
    uploadMultipleVideos: {
      method: "POST" as const,
      path: "/uploads/videos",
      access: "admin" as const,
      description: "Upload multiple videos (max 5 files)",
      contentType: "multipart/form-data",
    },
    delete: {
      method: "DELETE" as const,
      path: (id: string) => `/uploads/${id}`,
      access: "admin" as const,
      description: "Delete uploaded file by id",
    },
  },

  /** Managers module - Sales department managers */
  managers: {
    base: "/managers",
    list: {
      method: "GET" as const,
      path: "/managers",
      access: "public" as const,
      description: "Get all managers",
    },
    getById: {
      method: "GET" as const,
      path: (id: string) => `/managers/${id}`,
      access: "public" as const,
      description: "Get manager by id",
    },
    create: {
      method: "POST" as const,
      path: "/managers",
      access: "admin" as const,
      description: "Create new manager",
    },
    update: {
      method: "PATCH" as const,
      path: (id: string) => `/managers/${id}`,
      access: "admin" as const,
      description: "Update manager by id",
    },
    delete: {
      method: "DELETE" as const,
      path: (id: string) => `/managers/${id}`,
      access: "admin" as const,
      description: "Delete manager by id",
    },
  },

  /** Favorites - User favorite apartments */
  favorites: {
    base: "/favorites",
    ids: {
      method: "GET" as const,
      path: "/favorites/ids",
      access: "user" as const,
      description: "Get favorite apartment IDs",
    },
    list: {
      method: "GET" as const,
      path: "/favorites",
      access: "user" as const,
      description: "Get favorites with apartments",
    },
    add: {
      method: "POST" as const,
      path: (apartmentId: string) => `/favorites/${apartmentId}`,
      access: "user" as const,
      description: "Add apartment to favorites",
    },
    remove: {
      method: "DELETE" as const,
      path: (apartmentId: string) => `/favorites/${apartmentId}`,
      access: "user" as const,
      description: "Remove apartment from favorites",
    },
  },

  /** Static files - Served directly from uploads folder */
  static: {
    uploads: {
      base: "/uploads",
      access: "public" as const,
      description: "Static file serving from uploads folder",
    },
  },
} as const;

/** Public endpoints list (no auth required) */
export const PUBLIC_ENDPOINTS = [
  "/",
  "/objects",
  "/objects/:id",
  "/objects/slug/:slug",
  "/apartments",
  "/apartments/:id",
  "/projects",
  "/projects/:id",
  "/projects/slug/:slug",
  "/banners",
  "/banners/:id",
  "/news",
  "/news/:id",
  "/news/slug/:slug",
  "/applications",
  "/managers",
  "/managers/:id",
  "/uploads/:path*",
];

/** Admin-only endpoints list (Bearer auth required) */
export const ADMIN_ENDPOINTS = [
  "/objects",
  "/objects/:id",
  "/apartments",
  "/apartments/:id",
  "/projects",
  "/projects/:id",
  "/banners",
  "/banners/:id",
  "/news",
  "/news/:id",
  "/applications",
  "/applications/:id",
  "/managers",
  "/managers/:id",
  "/uploads",
  "/uploads/image",
  "/uploads/video",
  "/uploads/images",
  "/uploads/videos",
  "/uploads/:id",
];

export type ApiAccess = "public" | "admin" | "user";
export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

export interface EndpointConfig {
  method: HttpMethod;
  path: string | ((...args: string[]) => string);
  access: ApiAccess;
  description: string;
  contentType?: string;
}
