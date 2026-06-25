<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'
import { objectsService } from '~/api/objects.service'
import { getFullUrl } from '~/utils/url'
import type {
	ObjectWithRelations,
	InfrastructurePoint,
	ConstructionProgress,
} from '~/api/types'
import { InfrastructureCategory } from '~/api/types'
import ContactForm from '~/components/site/ContactForm.vue'
import ObjectMap from '~/components/site/ObjectMap.vue'

const route = useRoute()
const slug = route.params.slug as string

const {
	data: object,
	pending,
	error,
} = await useAsyncData(`object-${slug}`, () => objectsService.getBySlug(slug))

const features = computed(() => {
	if (!object.value?.media) return []
	// Use non-banner media as features for now, or filter by some criteria
	return object.value.media
		.filter(m => m.type === 'IMAGE' && m.id !== object.value?.banner?.[0]?.id)
		.slice(0, 3)
		.map((m, i) => ({
			id: m.id,
			title: m.title || `Особенность ${i + 1}`,
			description:
				m.description || 'Уникальное преимущество данного жилого комплекса.',
			media: [m],
		}))
})

// Anchor navigation
const navLinks = [
	{ label: 'О проекте', href: '#about' },
	{ label: 'Инфраструктура', href: '#infrastructure' },
]

const scrollTo = (href: string) => {
	const el = document.querySelector(href)
	if (el) {
		el.scrollIntoView({ behavior: 'smooth' })
	}
}

// Map state
const activeInfraCategory = ref<InfrastructureCategory | 'ALL'>('ALL')

// Floating button visibility based on scroll
const showFloatingButton = ref(false)
const heroSectionHeight = ref(0)

onMounted(() => {
	const heroSection = document.querySelector('.h-screen.min-h-175')
	if (heroSection) {
		heroSectionHeight.value = heroSection.clientHeight
	}

	const handleScroll = () => {
		showFloatingButton.value = window.scrollY > heroSectionHeight.value - 100
	}

	window.addEventListener('scroll', handleScroll, { passive: true })
	handleScroll() // Check initial position

	onUnmounted(() => {
		window.removeEventListener('scroll', handleScroll)
	})
})

// Close menu on mount
onMounted(() => {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent('close-objects-menu'))
	}
})
</script>

<template>
	<div v-if="object" class="bg-white">
		<!-- 1. Hero Section -->
		<section class="relative h-screen min-h-175 flex flex-col">
			<!-- Background Media (Image or Video) -->
			<div class="absolute inset-0 z-0">
				<template v-if="object.banner?.[0]">
					<video
						v-if="
							object.banner[0].type === 'VIDEO' ||
							object.banner[0].url?.match(/\.(mp4|webm|ogg|mov)$/i)
						"
						:src="getFullUrl(object.banner[0].url)"
						class="w-full h-full object-cover"
						autoplay
						muted
						loop
						playsinline
					/>
					<img
						v-else
						:src="getFullUrl(object.banner[0].url)"
						class="w-full h-full object-cover"
						alt="Hero background"
					/>
				</template>
				<div class="absolute inset-0 bg-black/30"></div>
			</div>

			<!-- Header Nav -->
			<div
				class="relative z-10 w-full px-6 py-6 flex items-center justify-between border-b border-white/20 backdrop-blur-sm"
			>
				<div class="text-white text-2xl font-bold uppercase tracking-tighter">
					{{ object.name }}
				</div>
				<nav class="hidden md:flex items-center gap-8">
					<a
						v-for="link in navLinks.filter(l => l.href !== '#construction')"
						:key="link.href"
						:href="link.href"
						@click.prevent="scrollTo(link.href)"
						class="text-white/80 hover:text-white text-xs uppercase tracking-widest transition-colors font-medium"
					>
						{{ link.label }}
					</a>
				</nav>
				<UButton
					:to="`/real-estate?object=${slug}`"
					color="neutral"
					variant="solid"
					class="rounded-none px-8 py-3 uppercase tracking-widest text-xs font-bold bg-white text-black hover:bg-neutral-200 border-none"
				>
					Выбрать квартиру
				</UButton>
			</div>

			<!-- Hero Content -->
			<div
				class="relative z-10 flex-1 flex flex-col justify-end pb-20 px-6 max-w-7xl mx-auto w-full"
			>
				<div class="max-w-2xl">
					<h1
						class="text-6xl md:text-8xl font-bold text-white uppercase tracking-tighter leading-[0.9] mb-8"
					>
						{{ object.name }}
					</h1>

					<!-- Characteristics Grid -->
					<div
						class="grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-white/30 pt-8"
					>
						<div>
							<div
								class="text-white/50 text-[10px] uppercase tracking-widest mb-1"
							>
								Адрес
							</div>
							<div class="text-white text-sm font-medium uppercase">
								{{ object.address || '—' }}
							</div>
						</div>
						<div>
							<div
								class="text-white/50 text-[10px] uppercase tracking-widest mb-1"
							>
								Срок сдачи
							</div>
							<div class="text-white text-sm font-medium uppercase">
								{{
									object.completionDate
										? new Date(object.completionDate).getFullYear() + ' год'
										: '—'
								}}
							</div>
						</div>
						<div>
							<div
								class="text-white/50 text-[10px] uppercase tracking-widest mb-1"
							>
								Этажность
							</div>
							<div class="text-white text-sm font-medium uppercase">
								{{ object.floors || '—' }} этажей
							</div>
						</div>
						<div>
							<div
								class="text-white/50 text-[10px] uppercase tracking-widest mb-1"
							>
								Квартир в наличии
							</div>
							<div class="text-white text-sm font-medium uppercase">
								{{ object.apartments?.length || 0 }}
							</div>
						</div>
						<div>
							<div
								class="text-white/50 text-[10px] uppercase tracking-widest mb-1"
							>
								Отделка
							</div>
							<div class="text-white text-sm font-medium uppercase">
								Белый куб
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Floating Button (appears when header is out of view) -->
		<Transition
			enter-active-class="transition duration-300 ease-out"
			enter-from-class="translate-y-full opacity-0"
			enter-to-class="translate-y-0 opacity-100"
			leave-active-class="transition duration-200 ease-in"
			leave-from-class="translate-y-0 opacity-100"
			leave-to-class="translate-y-full opacity-0"
		>
			<div
				v-if="showFloatingButton"
				class="fixed bottom-6 left-0 right-0 z-50 px-6 flex justify-center pointer-events-none"
			>
				<UButton
					:to="`/real-estate?object=${slug}`"
					color="neutral"
					variant="solid"
					size="lg"
					class="rounded-none px-12 py-4 uppercase tracking-widest text-sm font-bold bg-neutral-900 text-white hover:bg-neutral-800 shadow-2xl pointer-events-auto"
				>
					Выбрать квартиру
				</UButton>
			</div>
		</Transition>

		<!-- 2. Philosophy & Concept -->
		<section id="about" class="py-24 px-6 overflow-hidden">
			<!-- <div
        class="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center mb-24"
      >
        <div class="space-y-8">
          <h2
            class="text-5xl font-bold text-neutral-900 uppercase tracking-tighter leading-none"
          >
            {{ object.conceptTitle || "Философия жизни в балансе" }}
          </h2>
          <div
            class="text-lg text-neutral-600 leading-relaxed font-light"
            v-html="object.conceptText"
          ></div>
        </div>
        <div class="relative aspect-4/5 bg-neutral-100 overflow-hidden">
          <template v-if="object.media?.[0]">
            <video
              v-if="
                object.media[0].type === 'VIDEO' ||
                object.media[0].url?.match(/\.(mp4|webm|ogg|mov)$/i)
              "
              :src="getFullUrl(object.media[0].url)"
              class="w-full h-full object-cover"
              autoplay
              muted
              loop
              playsinline
            />
            <img
              v-else
              :src="getFullUrl(object.media[0].url)"
              class="w-full h-full object-cover"
              alt="Concept image"
            />
          </template>
        </div>
      </div> -->

			<!-- Features Slider -->
			<div class="max-w-7xl mx-auto">
				<div class="flex items-end justify-between mb-12">
					<div
						class="text-xs uppercase tracking-[0.2em] text-neutral-400 font-bold"
					>
						Особенности проекта
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div
						v-for="(feature, idx) in features"
						:key="feature.id"
						class="group relative aspect-3/4 bg-neutral-900 overflow-hidden cursor-pointer"
					>
						<img
							v-if="feature.media?.[0]"
							:src="getFullUrl(feature.media[0].url)"
							class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
							alt="Feature"
						/>
						<div
							class="absolute inset-0 p-8 flex flex-col justify-end bg-linear-to-t from-black/80 to-transparent"
						>
							<div class="text-white/50 text-xs font-bold mb-2">
								0{{ idx + 1 }}
							</div>
							<h3
								class="text-2xl font-bold text-white uppercase tracking-tighter mb-4"
							>
								{{ feature.title }}
							</h3>
							<p
								class="text-white/70 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300"
							>
								{{ feature.description }}
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 4. Infrastructure Map -->
		<section id="infrastructure" class="py-24">
			<div class="max-w-7xl mx-auto px-6">
				<div
					class="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12"
				>
					<h2
						class="text-5xl font-bold text-neutral-900 uppercase tracking-tighter"
					>
						Инфраструктура
					</h2>
				</div>

				<div
					class="relative h-150 bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200"
				>
					<!-- Real Map Integration using reusable component -->
					<ObjectMap v-if="object" :key="slug" :object="object" />

					<!-- Map Overlay for object address -->
					<div
						class="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-6 shadow-2xl max-w-sm z-10 border border-neutral-100"
					>
						<div
							class="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-2"
						>
							Адрес проекта
						</div>
						<div
							class="text-lg font-bold text-neutral-900 uppercase tracking-tight mb-1"
						>
							{{ object.name }}
						</div>
						<div class="text-sm text-neutral-600 uppercase">
							{{ object.address }}
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- 6. Feedback & Contact -->
		<ContactForm
			class="text-left"
			:show-phone="true"
			:show-email="true"
			:show-address="true"
		/>
	</div>

	<!-- Loading state -->
	<div
		v-else-if="pending"
		class="h-screen flex items-center justify-center bg-white"
	>
		<div class="flex flex-col items-center">
			<UIcon
				name="i-lucide-loader-2"
				class="w-12 h-12 animate-spin text-neutral-300 mb-4"
			/>
			<span
				class="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400"
				>Загрузка проекта</span
			>
		</div>
	</div>

	<!-- Error state -->
	<div v-else class="h-screen flex items-center justify-center bg-white">
		<div class="text-center">
			<h1
				class="text-4xl font-bold text-neutral-900 mb-4 uppercase tracking-tighter"
			>
				Проект не найден
			</h1>
			<UButton
				to="/real-estate"
				color="neutral"
				variant="solid"
				class="rounded-none px-8 py-3 uppercase tracking-widest text-xs font-bold bg-black text-white hover:bg-neutral-800 border-none"
			>
				Вернуться к списку
			</UButton>
		</div>
	</div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
	display: none;
}
.no-scrollbar {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
</style>
