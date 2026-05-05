/**
 * Managers Service - API для работы с менеджерами отдела продаж
 */

import { api } from "./client";
import { API_ENDPOINTS } from "~/config/api.config";
import type {
  Manager,
  ManagerWithRelations,
  CreateManagerDto,
  UpdateManagerDto,
} from "./types";

export const managersService = {
  /** Получить всех менеджеров */
  async getAll(): Promise<ManagerWithRelations[]> {
    return api.get<ManagerWithRelations[]>(API_ENDPOINTS.managers.list.path);
  },

  /** Получить менеджера по ID */
  async getById(id: string): Promise<ManagerWithRelations> {
    const path = API_ENDPOINTS.managers.getById.path(id);
    return api.get<ManagerWithRelations>(path);
  },

  /** Создать нового менеджера */
  async create(data: CreateManagerDto): Promise<Manager> {
    return api.post<Manager>(API_ENDPOINTS.managers.create.path, data);
  },

  /** Обновить менеджера */
  async update(id: string, data: UpdateManagerDto): Promise<Manager> {
    const path = API_ENDPOINTS.managers.update.path(id);
    return api.patch<Manager>(path, data);
  },

  /** Удалить менеджера */
  async delete(id: string): Promise<void> {
    const path = API_ENDPOINTS.managers.delete.path(id);
    await api.delete(path);
  },
};
