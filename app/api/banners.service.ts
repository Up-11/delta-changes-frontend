/**
 * Banners Service - API для работы с баннерами
 */

import { api } from "./client";
import { API_ENDPOINTS } from "~/config/api.config";
import type {
  Banner,
  BannerWithRelations,
  CreateBannerDto,
  UpdateBannerDto,
} from "./types";

export const bannersService = {
  /** Получить все активные баннеры */
  async getAll(): Promise<Banner[]> {
    return api.get<Banner[]>(API_ENDPOINTS.banners.list.path);
  },

  /** Получить баннер по ID */
  async getById(id: string): Promise<BannerWithRelations> {
    const path = API_ENDPOINTS.banners.getById.path(id);
    return api.get<BannerWithRelations>(path);
  },

  /** Создать новый баннер */
  async create(data: CreateBannerDto): Promise<Banner> {
    return api.post<Banner>(API_ENDPOINTS.banners.create.path, data);
  },

  /** Обновить баннер */
  async update(id: string, data: UpdateBannerDto): Promise<Banner> {
    const path = API_ENDPOINTS.banners.update.path(id);
    return api.patch<Banner>(path, data);
  },

  /** Удалить баннер */
  async delete(id: string): Promise<void> {
    const path = API_ENDPOINTS.banners.delete.path(id);
    await api.delete(path);
  },
};
