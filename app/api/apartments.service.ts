/**
 * Apartments Service - API для работы с квартирами
 */

import { api } from './client'
import { API_ENDPOINTS } from '~/config/api.config'
import type {
  Apartment,
  ApartmentWithRelations,
  CreateApartmentDto,
  UpdateApartmentDto
} from './types'

export const apartmentsService = {
  /** Получить все доступные квартиры */
  async getAll(): Promise<Apartment[]> {
    return api.get<Apartment[]>(API_ENDPOINTS.apartments.list.path)
  },

  /** Получить квартиру по ID */
  async getById(id: string): Promise<ApartmentWithRelations> {
    const path = API_ENDPOINTS.apartments.getById.path(id)
    return api.get<ApartmentWithRelations>(path)
  },

  /** Создать новую квартиру */
  async create(data: CreateApartmentDto): Promise<Apartment> {
    return api.post<Apartment>(API_ENDPOINTS.apartments.create.path, data)
  },

  /** Обновить квартиру */
  async update(id: string, data: UpdateApartmentDto): Promise<Apartment> {
    const path = API_ENDPOINTS.apartments.update.path(id)
    return api.patch<Apartment>(path, data)
  },

  /** Удалить квартиру */
  async delete(id: string): Promise<void> {
    const path = API_ENDPOINTS.apartments.delete.path(id)
    await api.delete(path)
  }
}
