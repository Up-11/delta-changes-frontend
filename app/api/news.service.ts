/**
 * News Service - API для работы с новостями
 */

import { api } from "./client";
import { API_ENDPOINTS } from "~/config/api.config";
import type {
  News,
  NewsWithRelations,
  CreateNewsDto,
  UpdateNewsDto,
} from "./types";

export const newsService = {
  /** Получить все опубликованные новости */
  async getAll(): Promise<NewsWithRelations[]> {
    return api.get<NewsWithRelations[]>(API_ENDPOINTS.news.list.path);
  },

  /** Получить новость по ID */
  async getById(id: string): Promise<NewsWithRelations> {
    const path = API_ENDPOINTS.news.getById.path(id);
    return api.get<NewsWithRelations>(path);
  },

  /** Получить новость по slug */
  async getBySlug(slug: string): Promise<NewsWithRelations> {
    const path = API_ENDPOINTS.news.getBySlug.path(slug);
    return api.get<NewsWithRelations>(path);
  },

  /** Создать новую новость */
  async create(data: CreateNewsDto): Promise<News> {
    return api.post<News>(API_ENDPOINTS.news.create.path, data);
  },

  /** Обновить новость */
  async update(id: string, data: UpdateNewsDto): Promise<News> {
    const path = API_ENDPOINTS.news.update.path(id);
    return api.patch<News>(path, data);
  },

  /** Удалить новость */
  async delete(id: string): Promise<void> {
    const path = API_ENDPOINTS.news.delete.path(id);
    await api.delete(path);
  },
};
