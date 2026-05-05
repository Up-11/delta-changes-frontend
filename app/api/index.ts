/**
 * API Services - Barrel export
 * Centralized API layer for backend communication
 */

// Base client & types
export {
  api,
  apiClient,
  setAuthToken,
  removeAuthToken,
  checkApiHealth,
} from "./client";
export type * from "./types";

// Auth
export { login, logout, getProfile, isAuthenticated } from "./auth.service";
export type {
  LoginCredentials,
  LoginResponse,
  UserProfile,
} from "./auth.service";

// Services
export { objectsService } from "./objects.service";
export { apartmentsService } from "./apartments.service";
export { projectsService } from "./projects.service";
export { bannersService } from "./banners.service";
export { newsService } from "./news.service";
export { applicationsService } from "./applications.service";
export * from "./managers.service";
export * from "./uploads.service";
export * as authService from "./auth.service";

// Config re-export
export { API_ENDPOINTS, buildApiUrl, getApiBaseUrl } from "~/config/api.config";
