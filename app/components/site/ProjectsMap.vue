<script setup lang="ts">
import { nextTick } from 'vue'
import { getFullUrl } from '#imports'
import type { ObjectWithRelations, Project } from '~/api/types'

const props = defineProps<{
	projects: Project[]
	objects: ObjectWithRelations[]
}>()

const mapContainer = ref<HTMLElement | null>(null)
const objectsListRef = ref<HTMLElement | null>(null)
const activeProjectId = ref<string | null>(null)
const activeObjectId = ref<string | null>(null)
const hoveredObjectId = ref<string | null>(null)
const mapLoaded = ref(false)

let map: any = null
let placemarks: Map<string, any> = new Map()
let activePlacemark: any = null

const filteredObjects = computed(() => {
	if (!activeProjectId.value) return props.objects
	return props.objects.filter(o => o.projectId === activeProjectId.value)
})

const activeProjectName = computed(() => {
	if (!activeProjectId.value) return 'Все проекты'
	const project = props.projects.find(p => p.id === activeProjectId.value)
	return project?.name || 'Все проекты'
})

function getAvailableApartmentsCount(object: ObjectWithRelations): number {
	return object.apartments?.filter(a => a.isAvailable).length || 0
}

function initMap() {
	if (!window.ymaps || !mapContainer.value) return

	window.ymaps.ready(() => {
		// Center on Krasnoyarsk
		const center = [56.0184, 92.8672]

		map = new window.ymaps.Map(mapContainer.value, {
			center,
			zoom: 13,
			controls: ['zoomControl'],
		})

		// Hide default map elements (traffic, panoramas, etc.)
		map.controls.remove('trafficControl')
		map.controls.remove('typeSelector')
		map.controls.remove('searchControl')
		map.controls.remove('routeButtonControl')
		map.controls.remove('geolocationControl')
		map.controls.remove('rulerControl')

		// Apply grayscale filter to map for black and white style
		const mapContainerEl = mapContainer.value
		if (mapContainerEl) {
			mapContainerEl.style.filter = 'grayscale(100%) contrast(110%)'
		}

		// Add placemarks for all objects with coordinates
		addPlacemarks()

		mapLoaded.value = true
	})
}

function getProjectColor(projectId: string | null | undefined): string {
	const colors = [
		'#171717',
		'#6B4C4C',
		'#4A7C59',
		'#C17817',
		'#2E5A87',
		'#8B4B8B',
	]
	if (!projectId) return colors[0]
	const index = (projectId.charCodeAt(0) || 0) % colors.length
	return colors[index]
}

function createPlacemarkLayout(
	obj: ObjectWithRelations,
	isActive: boolean,
	isHovered: boolean = false,
): string {
	const displayText = obj.name
	const bgColor = getProjectColor(obj.projectId)
	const dotSize = isActive ? '40px' : isHovered ? '36px' : '32px'
	const shadow = isActive
		? '0 8px 24px rgba(0,0,0,0.4)'
		: isHovered
			? '0 6px 16px rgba(0,0,0,0.3)'
			: '0 4px 12px rgba(0,0,0,0.25)'
	const zIndex = isActive ? '1000' : isHovered ? '500' : '1'

	// Location pin SVG
	const pinIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>`

	// When active or hovered - show icon + text, when inactive - only colored square with pin
	if (isActive || isHovered) {
		return `
      <div style="
        display: flex;
        align-items: center;
        gap: 0;
        z-index: ${zIndex};
        animation: markerAppear 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        <div style="
          width: ${dotSize};
          height: ${dotSize};
          border-radius: 4px;
          background: ${bgColor};
          box-shadow: ${shadow};
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        ">${pinIcon}</div>
        <div style="
          background: ${bgColor};
          color: #ffffff;
          padding: 0 16px;
          height: ${dotSize};
          display: flex;
          align-items: center;
          border-radius: 0 4px 4px 0;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
          font-family: Arial, sans-serif;
          box-shadow: ${shadow};
          animation: textSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-left: -2px;
        ">${displayText}</div>
      </div>
      <style>
        @keyframes markerAppear {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes textSlideIn {
          from { transform: translateX(-8px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `
	} else {
		// Inactive - colored square with location pin icon
		return `
      <div style="
        width: ${dotSize};
        height: ${dotSize};
        border-radius: 4px;
        background: ${bgColor};
        box-shadow: ${shadow};
        z-index: ${zIndex};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      ">${pinIcon}</div>
    `
	}
}

function addPlacemarks() {
	if (!map) return

	// Clear existing placemarks
	placemarks.forEach(pm => {
		map.geoObjects.remove(pm)
	})
	placemarks.clear()

	filteredObjects.value.forEach(obj => {
		if (obj.latitude && obj.longitude) {
			const isActive = activeObjectId.value === obj.id
			const isHovered = hoveredObjectId.value === obj.id

			const layout = window.ymaps.templateLayoutFactory.createClass(
				createPlacemarkLayout(obj, isActive, isHovered),
			)

			const placemark = new window.ymaps.Placemark(
				[obj.latitude, obj.longitude],
				{
					hintContent: obj.name,
				},
				{
					iconLayout: layout,
					iconShape: {
						type: 'Circle',
						coordinates: [0, 0],
						radius: 40,
					},
					balloonCloseButton: false,
					hideIconOnBalloonOpen: false,
				},
			)

			// Click on marker to highlight in list (prevent balloon from opening)
			placemark.events.add('click', (e: any) => {
				e.preventDefault()
				e.stopPropagation()
				highlightObjectInList(obj.id)
				return false
			})

			// Hover events for markers
			placemark.events.add('mouseenter', () => {
				hoveredObjectId.value = obj.id
				updateMarkerLayout(obj.id)
			})

			placemark.events.add('mouseleave', () => {
				hoveredObjectId.value = null
				updateMarkerLayout(obj.id)
			})

			map.geoObjects.add(placemark)
			placemarks.set(obj.id, placemark)
		}
	})
}

function updateMarkerLayout(objectId: string) {
	const placemark = placemarks.get(objectId)
	const obj = props.objects.find(o => o.id === objectId)
	if (placemark && obj) {
		const isActive = activeObjectId.value === objectId
		const isHovered = hoveredObjectId.value === objectId
		const layout = window.ymaps.templateLayoutFactory.createClass(
			createPlacemarkLayout(obj, isActive, isHovered),
		)
		placemark.options.set('iconLayout', layout)
		placemark.options.set('zIndex', isActive ? 1000 : isHovered ? 500 : 1)
	}
}

function highlightObjectInList(objectId: string) {
	// Set active object
	activeObjectId.value = objectId

	// Update map markers
	placemarks.forEach((pm, id) => {
		const obj = props.objects.find(o => o.id === id)
		if (obj) {
			const isActive = id === objectId
			const isHovered = hoveredObjectId.value === id
			const layout = window.ymaps.templateLayoutFactory.createClass(
				createPlacemarkLayout(obj, isActive, isHovered),
			)
			pm.options.set('iconLayout', layout)
			pm.options.set('zIndex', isActive ? 1000 : isHovered ? 500 : 1)
		}
	})

	// Scroll to object card in the list
	nextTick(() => {
		const card = objectsListRef.value?.querySelector(
			`[data-object-id="${objectId}"]`,
		)
		if (card) {
			card.scrollIntoView({ behavior: 'smooth', block: 'center' })
		}
	})
}
function getObjectImage(object: ObjectWithRelations): string {
	const media = object.banner?.find(m => m.type === 'IMAGE')
	if (media) {
		return getFullUrl(media.url)
	}
	return ''
}

function highlightObjectOnMap(objectId: string) {
	if (!map) return

	const prevObjectId = activeObjectId.value
	activeObjectId.value = objectId

	// Update all placemarks with new layouts
	placemarks.forEach((pm, id) => {
		const obj = props.objects.find(o => o.id === id)
		if (obj) {
			const isActive = id === objectId
			const isHovered = hoveredObjectId.value === id
			const layout = window.ymaps.templateLayoutFactory.createClass(
				createPlacemarkLayout(obj, isActive, isHovered),
			)

			pm.options.set('iconLayout', layout)
			pm.options.set('zIndex', isActive ? 1000 : isHovered ? 500 : 1)
		}
	})

	// Pan map to active object without changing zoom
	const obj = props.objects.find(o => o.id === objectId)
	if (obj?.latitude && obj?.longitude) {
		map.panTo([obj.latitude, obj.longitude], {
			duration: 400,
			timingFunction: 'ease-in-out',
		})
	}
}

// Watch for filter changes
watch(activeProjectId, () => {
	if (mapLoaded.value) {
		addPlacemarks()
	}
})

// Watch for objects data
watch(
	() => props.objects,
	() => {
		if (mapLoaded.value) {
			addPlacemarks()
		}
	},
	{ deep: true },
)

// Intersection Observer for scroll detection
onMounted(() => {
	if (typeof window === 'undefined') return

	// Load Yandex Maps
	if (window.ymaps) {
		initMap()
	} else {
		const script = document.createElement('script')
		script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU'
		script.type = 'text/javascript'
		script.onload = initMap
		document.head.appendChild(script)
	}

	// Setup intersection observer for object cards
	nextTick(() => {
		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						const objectId = entry.target.getAttribute('data-object-id')
						if (objectId) {
							highlightObjectOnMap(objectId)
						}
					}
				})
			},
			{
				root: objectsListRef.value,
				threshold: 0.6,
			},
		)

		// Observe all object cards
		const cards = objectsListRef.value?.querySelectorAll('[data-object-id]')
		cards?.forEach(card => observer.observe(card))
	})
})

onUnmounted(() => {
	if (map) {
		map.destroy()
	}
})

declare global {
	interface Window {
		ymaps: any
	}
}
</script>

<template>
	<section class="projects-map-section min-h-screen bg-white">
		<div class="flex flex-col lg:flex-row min-h-screen">
			<!-- Left: Map -->
			<div class="w-full lg:w-3/5 h-[50vh] lg:h-screen relative">
				<div ref="mapContainer" class="w-full h-full" />

				<!-- Project Filter Badges -->
				<div class="absolute top-6 left-6 right-6 flex flex-wrap gap-2 z-10">
					<button
						class="px-4 py-2 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 border"
						:class="
							activeProjectId === null
								? 'bg-neutral-900 text-white border-neutral-900'
								: 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-900'
						"
						@click="activeProjectId = null"
					>
						Все проекты
					</button>
					<button
						v-for="project in projects"
						:key="project.id"
						class="px-4 py-2 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 border"
						:class="
							activeProjectId === project.id
								? 'bg-neutral-900 text-white border-neutral-900'
								: 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-900'
						"
						@click="activeProjectId = project.id"
					>
						{{ project.name }}
					</button>
				</div>

				<!-- Active Project Indicator -->
				<div class="absolute bottom-6 left-6 z-10">
					<span
						class="px-4 py-2 bg-white border border-neutral-200 text-xs uppercase tracking-[0.2em] text-neutral-900"
					>
						{{ activeProjectName }}
					</span>
				</div>
			</div>

			<!-- Right: Objects List -->
			<div
				ref="objectsListRef"
				class="w-full lg:w-2/5 h-[50vh] lg:h-screen overflow-y-auto bg-neutral-50 border-l border-neutral-200"
			>
				<div class="p-6 lg:p-8 space-y-6">
					<h3 class="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-8">
						Объекты
					</h3>

					<div
						v-for="object in filteredObjects"
						:key="object.id"
						:data-object-id="object.id"
						class="object-card overflow-hidden bg-transparent border-b border-neutral-200 transition-all duration-300 cursor-pointer"
						:class="{
							'border-neutral-900 ': activeObjectId === object.id,
						}"
						@click="highlightObjectOnMap(object.id)"
					>
						<!-- Object Photo -->
						<div
							v-if="getObjectImage(object)"
							class="w-full h-64 overflow-hidden"
						>
							<img
								:src="getObjectImage(object)"
								:alt="object.name"
								class="w-full h-full object-cover"
							/>
						</div>
						<div
							v-else
							class="w-full h-48 bg-neutral-100 flex items-center justify-center"
						>
							<UIcon
								name="i-lucide-building-2"
								class="w-12 h-12 text-neutral-300"
							/>
						</div>

						<div class="p-6">
							<!-- Project Name -->
							<p
								v-if="object.project"
								class="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-2"
							>
								{{ object.project.name }}
							</p>

							<!-- Object Name -->
							<h4
								class="text-lg lg:text-xl font-bold uppercase tracking-[0.05em] text-neutral-900 mb-4"
							>
								{{ object.name }}
							</h4>

							<!-- Apartments Count -->
							<div class="flex items-baseline gap-3 mb-3">
								<span class="text-3xl lg:text-4xl font-bold text-neutral-900">
									{{ object.apartments?.length || 0 }}
								</span>
								<span
									class="text-xs uppercase tracking-[0.15em] text-neutral-500"
								>
									квартир в продаже
								</span>
							</div>

							<!-- Address -->
							<p
								v-if="object.address"
								class="text-sm text-neutral-500 uppercase tracking-wider mb-4"
							>
								{{ object.address }}
							</p>

							<!-- Link to Object Page -->
							<NuxtLink
								v-if="object.slug"
								:to="`/objects/${object.slug}`"
								class="group/link flex items-center justify-center gap-2 w-full py-3 px-4 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:bg-neutral-800"
							>
								<span>Подробнее</span>
								<UIcon
									name="i-lucide-arrow-right"
									class="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1"
								/>
							</NuxtLink>
						</div>
					</div>

					<!-- Empty State -->
					<div v-if="filteredObjects.length === 0" class="text-center py-12">
						<UIcon
							name="i-lucide-map-pin"
							class="w-12 h-12 text-neutral-300 mx-auto mb-4"
						/>
						<p class="text-sm uppercase tracking-wider text-neutral-400">
							Нет объектов в этом проекте
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style scoped>
.object-card {
	transition: all 0.3s ease;
}

.object-card:hover {
	border-color: #171717;
}

/* Custom scrollbar for objects list */
::-webkit-scrollbar {
	width: 6px;
}

::-webkit-scrollbar-track {
	background: #f5f5f5;
}

::-webkit-scrollbar-thumb {
	background: #d4d4d4;
}

::-webkit-scrollbar-thumb:hover {
	background: #a3a3a3;
}
</style>
