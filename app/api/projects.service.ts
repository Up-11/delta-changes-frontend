/**
 * Projects Service - API для работы с проектами
 */

import { api } from './client'
import { API_ENDPOINTS } from '~/config/api.config'
import type {
  Project,
  ProjectWithRelations,
  CreateProjectDto,
  UpdateProjectDto
} from './types'

export const projectsService = {
  /** Получить все активные проекты */
  async getAll(): Promise<Project[]> {
    return api.get<Project[]>(API_ENDPOINTS.projects.list.path)
  },

  /** Получить проект по ID */
  async getById(id: string): Promise<ProjectWithRelations> {
    const path = API_ENDPOINTS.projects.getById.path(id)
    return api.get<ProjectWithRelations>(path)
  },

  /** Получить проект по slug */
  async getBySlug(slug: string): Promise<ProjectWithRelations> {
    const path = API_ENDPOINTS.projects.getBySlug.path(slug)
    return api.get<ProjectWithRelations>(path)
  },

  /** Создать новый проект */
  async create(data: CreateProjectDto): Promise<Project> {
    return api.post<Project>(API_ENDPOINTS.projects.create.path, data)
  },

  /** Обновить проект */
  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    const path = API_ENDPOINTS.projects.update.path(id)
    return api.patch<Project>(path, data)
  },

  /** Удалить проект */
  async delete(id: string): Promise<void> {
    const path = API_ENDPOINTS.projects.delete.path(id)
    await api.delete(path)
  }
}
