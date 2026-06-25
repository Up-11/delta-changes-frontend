/**
 * Objects Service - API для работы с объектами недвижимости
 */

import { api } from './client'
import { API_ENDPOINTS } from '~/config/api.config'
import type {
	Object,
	ObjectWithRelations,
	CreateObjectDto,
	UpdateObjectDto,
} from './types'

export const objectsService = {
	/** Получить все активные объекты */
	async getAll(): Promise<ObjectWithRelations[]> {
		return api.get<ObjectWithRelations[]>(API_ENDPOINTS.objects.list.path)
	},

	/** Получить объект по ID */
	async getById(id: string): Promise<ObjectWithRelations> {
		const path = API_ENDPOINTS.objects.getById.path(id)
		return api.get<ObjectWithRelations>(path)
	},

	/** Получить объект по slug */
	async getBySlug(slug: string): Promise<ObjectWithRelations> {
		const path = API_ENDPOINTS.objects.getBySlug.path(slug)
		return api.get<ObjectWithRelations>(path)
	},

	/** Создать новый объект */
	async create(data: CreateObjectDto): Promise<Object> {
		return api.post<Object>(API_ENDPOINTS.objects.create.path, data)
	},

	/** Обновить объект */
	async update(id: string, data: UpdateObjectDto): Promise<Object> {
		const path = API_ENDPOINTS.objects.update.path(id)
		return api.patch<Object>(path, data)
	},

	/** Удалить объект */
	async delete(id: string): Promise<void> {
		const path = API_ENDPOINTS.objects.delete.path(id)
		await api.delete(path)
	},
}
