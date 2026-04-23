/**
 * Applications Service - API для работы с заявками
 */

import { api } from './client'
import { API_ENDPOINTS } from '~/config/api.config'
import type {
  Application,
  CreateApplicationDto,
  UpdateApplicationDto
} from './types'

export const applicationsService = {
  /** Получить все заявки (admin only) */
  async getAll(): Promise<Application[]> {
    return api.get<Application[]>(API_ENDPOINTS.applications.list.path)
  },

  /** Получить заявку по ID */
  async getById(id: string): Promise<Application> {
    const path = API_ENDPOINTS.applications.getById.path(id)
    return api.get<Application>(path)
  },

  /** Создать новую заявку (public - для клиентов) */
  async create(data: CreateApplicationDto): Promise<Application> {
    return api.post<Application>(API_ENDPOINTS.applications.create.path, data)
  },

  /** Обновить заявку (admin only) */
  async update(id: string, data: UpdateApplicationDto): Promise<Application> {
    const path = API_ENDPOINTS.applications.update.path(id)
    return api.patch<Application>(path, data)
  },

  /** Удалить заявку (admin only) */
  async delete(id: string): Promise<void> {
    const path = API_ENDPOINTS.applications.delete.path(id)
    await api.delete(path)
  }
}
