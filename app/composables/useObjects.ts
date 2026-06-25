import { api } from '~/api/client'
import { getFullUrl } from '~/utils/url'
import type { ObjectWithRelations, Object } from '~/api/types'

export function useObjects() {
	const objects = ref<ObjectWithRelations[]>([])
	const isLoading = ref(false)
	const error = ref<Error | null>(null)

	async function fetchObjects(): Promise<ObjectWithRelations[]> {
		isLoading.value = true
		error.value = null

		try {
			const response = await api.get<ObjectWithRelations[]>(
				'/objects?include=project,apartments,media',
			)
			objects.value = response
				.filter(o => o.isActive)
				.sort((a, b) => a.sortOrder - b.sortOrder)
			return objects.value
		} catch (err) {
			error.value = err as Error
			console.error('Failed to fetch objects:', err)
			return []
		} finally {
			isLoading.value = false
		}
	}

	function getObjectsByProjectId(
		projectId: string | null,
	): ObjectWithRelations[] {
		if (!projectId) return objects.value
		return objects.value.filter(o => o.projectId === projectId)
	}

	function getAvailableApartmentsCount(object: ObjectWithRelations): number {
		return object.apartments?.filter(a => a.isAvailable).length || 0
	}

	function getObjectMedia(object: ObjectWithRelations): {
		type: 'IMAGE' | 'VIDEO' | null
		url: string | null
	} {
		const media = object.banner?.[0]
		if (!media) return { type: null, url: null }
		return { type: media.type, url: getFullUrl(media.url) }
	}

	return {
		objects: readonly(objects),
		isLoading: readonly(isLoading),
		error: readonly(error),
		fetchObjects,
		getObjectsByProjectId,
		getAvailableApartmentsCount,
		getObjectMedia,
	}
}
