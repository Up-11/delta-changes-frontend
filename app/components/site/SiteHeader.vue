<script setup lang="ts">
import { gsap } from 'gsap'
import { useRoute } from 'vue-router'

const isMenuOpen = ref(false)
const isObjectsOpen = ref(false)
const activeObject = ref<string | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const logoRef = ref<HTMLElement | null>(null)
const menuItemsRef = ref<HTMLElement[]>([])
const menuBtnRef = ref<HTMLElement | null>(null)
const phoneRef = ref<HTMLElement | null>(null)
const slideoverNavRef = ref<HTMLElement | null>(null)
const objectsContainerRef = ref<HTMLElement | null>(null)
const objectsTriggerRef = ref<HTMLElement | null>(null)
const objectsMenuTimer = ref<NodeJS.Timeout | null>(null)
const isTouch = ref(false)
const isHeaderVisible = ref(true)
const lastScrollY = ref(0)
const scrollThreshold = 50

const { objects, fetchObjects, getObjectMedia } = useObjects()
const { isAuthenticated, user, logout } = useSiteAuth()
const isAdminSession = computed(
	() => import.meta.client && !!localStorage.getItem('auth_token'),
)
const showSiteUser = computed(
	() => isAuthenticated.value && !isAdminSession.value,
)
const route = useRoute()

async function handleSiteLogout() {
	await logout()
	if (route.path.startsWith('/profile')) {
		await navigateTo('/')
	}
}

// Detect touch device on mount
onMounted(() => {
	isTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
})

// Reset trigger ref on update to prevent stale references
onBeforeUpdate(() => {
	// Only clear the trigger ref if objects menu is closed
	if (!isObjectsOpen.value) {
		objectsTriggerRef.value = null
	}
})

// Scroll hide/show header
function handleScroll() {
	if (!headerRef.value) return
	const currentScrollY = window.scrollY

	// Always show header at top of page
	if (currentScrollY < scrollThreshold) {
		isHeaderVisible.value = true
		lastScrollY.value = currentScrollY
		return
	}

	// Scrolling down - hide header
	if (currentScrollY > lastScrollY.value && currentScrollY > scrollThreshold) {
		isHeaderVisible.value = false
	}
	// Scrolling up - show header
	else if (currentScrollY < lastScrollY.value) {
		isHeaderVisible.value = true
	}

	lastScrollY.value = currentScrollY
}

onMounted(() => {
	window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
	window.removeEventListener('scroll', handleScroll)
})

const ctx = ref<any>(null)

// Page load animations
onMounted(() => {
	ctx.value = gsap.context(() => {
		// Logo entrance animation
		if (logoRef.value) {
			gsap.fromTo(
				logoRef.value,
				{ opacity: 0, y: -20, scale: 0.95 },
				{
					opacity: 1,
					y: 0,
					scale: 1,
					duration: 0.8,
					ease: 'power3.out',
					delay: 0.2,
				},
			)
		}

		// Menu items stagger animation
		if (menuItemsRef.value.length) {
			gsap.fromTo(
				menuItemsRef.value,
				{ opacity: 0, y: -15 },
				{
					opacity: 1,
					y: 0,
					duration: 0.6,
					stagger: 0.1,
					ease: 'power3.out',
					delay: 0.4,
				},
			)
		}
	})
})

onUnmounted(() => {
	if (ctx.value) {
		ctx.value.revert()
	}
})

// Fetch objects on mount
onMounted(async () => {
	await fetchObjects()
	// If objects loaded, set first as active
	if (objects.value.length > 0) {
		activeObject.value = objects.value[0].id
	}
})

const menuItems = [
	{ label: 'О компании', path: '/about' },
	{ label: 'Недвижимость', path: '/real-estate' },
	{ label: 'Контакты', path: '/contacts' },
	{ label: 'Объекты', path: '/objects', hasDropdown: true },
]

function handleMenuLinkClick(item: any, event: MouseEvent) {
	if (item.hasDropdown) {
		event.preventDefault()
		event.stopPropagation()
		toggleObjectsMenu()
	} else {
		// Для обычных ссылок закрываем все меню немедленно
		isObjectsOpen.value = false
		isMenuOpen.value = false
	}
}

// Watch for route changes to ensure everything is closed
watch(
	() => route.fullPath,
	() => {
		isObjectsOpen.value = false
		isMenuOpen.value = false
	},
)

function handleObjectHover(objectId: string) {
	activeObject.value = objectId
}

function toggleObjectsMenu() {
	isObjectsOpen.value = !isObjectsOpen.value
	if (isObjectsOpen.value && objects.value.length > 0 && !activeObject.value) {
		activeObject.value = objects.value[0]!.id
	}
}

function closeObjectsMenu() {
	if (!isObjectsOpen.value) return
	isObjectsOpen.value = false
}

// Close objects menu on click outside
function handleClickOutside(event: MouseEvent) {
	if (!isObjectsOpen.value) return

	const target = event.target as HTMLElement
	const isClickInsideContainer = objectsContainerRef.value?.contains(target)
	const isClickInsideTrigger = objectsTriggerRef.value?.contains(target)

	if (!isClickInsideContainer && !isClickInsideTrigger) {
		closeObjectsMenu()
	}
}

// Listen for custom close event from pages
function handleCloseMenuEvent() {
	closeObjectsMenu()
}

onMounted(() => {
	document.addEventListener('click', handleClickOutside)
	window.addEventListener('close-objects-menu', handleCloseMenuEvent)
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
	window.removeEventListener('close-objects-menu', handleCloseMenuEvent)
})

// Watch for menu open to animate slideover content
watch(isMenuOpen, val => {
	if (val) {
		nextTick(() => {
			// Animate nav items
			const navLinks = slideoverNavRef.value?.querySelectorAll('.nav-link')
			if (navLinks?.length) {
				gsap.fromTo(
					navLinks,
					{ opacity: 0, y: 60, rotateX: -15 },
					{
						opacity: 1,
						y: 0,
						rotateX: 0,
						duration: 0.7,
						stagger: 0.1,
						ease: 'power3.out',
						delay: 0.2,
					},
				)
			}
		})
	}
})

// Magnetic button effect (disabled on touch devices)
function onMouseMove(e: MouseEvent, el: HTMLElement) {
	if (isTouch.value) return
	const rect = el.getBoundingClientRect()
	const x = e.clientX - rect.left - rect.width / 2
	const y = e.clientY - rect.top - rect.height / 2

	gsap.to(el, {
		x: x * 0.3,
		y: y * 0.3,
		duration: 0.3,
		ease: 'power2.out',
	})
}

function onMouseLeave(el: HTMLElement) {
	if (isTouch.value) return
	gsap.to(el, {
		x: 0,
		y: 0,
		duration: 0.5,
		ease: 'elastic.out(1, 0.3)',
	})
}
</script>

<template>
	<header
		ref="headerRef"
		class="fixed top-0 left-0 right-0 z-50 bg-white transition-transform duration-500 ease-in-out"
		:class="{ '-translate-y-full': !isHeaderVisible }"
	>
		<div class="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between">
			<!-- Left: Navigation (Desktop only, hidden on lg and below when space is tight) -->
			<nav class="hidden xl:flex items-center gap-6">
				<template v-for="(item, index) in menuItems" :key="item.path">
					<div
						:ref="
							el => {
								if (el) {
									menuItemsRef[index] = el as HTMLElement
									if (item.hasDropdown) objectsTriggerRef = el as HTMLElement
								}
							}
						"
						class="relative opacity-0"
						:class="{ 'objects-trigger': item.hasDropdown }"
					>
						<NuxtLink
							:to="item.hasDropdown ? undefined : item.path"
							class="header-link group relative py-2 px-3 -mx-3 text-xs uppercase tracking-[0.2em] text-neutral-900 font-medium magnetic-hover transition-all duration-300 hover:text-neutral-500"
							:class="{
								'cursor-pointer': item.hasDropdown,
								'text-neutral-500': item.hasDropdown && isObjectsOpen,
							}"
							@click="handleMenuLinkClick(item, $event)"
							@mousemove="e => onMouseMove(e as MouseEvent, $el as HTMLElement)"
							@mouseleave="() => onMouseLeave($el as HTMLElement)"
						>
							<span class="relative z-10">{{ item.label }}</span>
							<span
								class="absolute bottom-1 left-3 right-3 h-px bg-neutral-900 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
							/>
						</NuxtLink>
					</div>
				</template>
			</nav>

			<!-- Tablet Navigation (md to lg, more compact) -->
			<nav class="hidden md:flex xl:hidden items-center gap-4">
				<div
					v-for="item in menuItems.slice(0, 2)"
					:key="item.path"
					class="relative opacity-0"
				>
					<NuxtLink
						:to="item.path"
						class="header-link group relative py-2 text-[10px] uppercase tracking-[0.15em] text-neutral-900 font-medium transition-all duration-300 hover:text-neutral-500"
					>
						{{ item.label }}
					</NuxtLink>
				</div>
				<button
					class="header-link group relative py-2 text-[10px] uppercase tracking-[0.15em] text-neutral-900 font-medium transition-all duration-300 hover:text-neutral-500"
					@click="isObjectsOpen = true"
				>
					Объекты
				</button>
			</nav>

			<!-- Center: Logo (absolute centered on md+, relative left on mobile) -->
			<div
				ref="logoRef"
				class="relative md:absolute md:left-1/2 md:-translate-x-1/2 opacity-0 z-10 flex-1 md:flex-none flex justify-start md:justify-center pl-0 pr-12 md:px-0"
			>
				<NuxtLink
					to="/"
					class="flex flex-col items-start md:items-center group cursor-pointer"
				>
					<span
						class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] lg:tracking-[0.4em] uppercase text-neutral-900"
					>
						ДЕЛЬТА
					</span>
					<span
						class="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] lg:tracking-[0.5em] uppercase text-neutral-500 -mt-1"
					>
						строй
					</span>
				</NuxtLink>
			</div>

			<!-- Right: Auth, Phone & Menu -->
			<div class="flex items-center gap-2 md:gap-4">
				<template v-if="showSiteUser">
					<NuxtLink
						to="/profile"
						class="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-neutral-900 font-medium hover:text-neutral-500 transition-colors"
					>
						<UIcon name="i-lucide-user" class="w-4 h-4" />
						<span class="max-w-[120px] truncate">{{
							user?.name || 'Профиль'
						}}</span>
					</NuxtLink>
					<button
						type="button"
						class="hidden md:block text-[10px] uppercase tracking-[0.15em] text-neutral-400 hover:text-neutral-900"
						@click="handleSiteLogout"
					>
						Выйти
					</button>
				</template>
				<template v-else>
					<NuxtLink
						to="/auth/login"
						class="hidden md:block text-[10px] uppercase tracking-[0.15em] text-neutral-900 font-medium hover:text-neutral-500"
					>
						Войти
					</NuxtLink>
				</template>

				<!-- Mobile: Phone Icon -->
				<a
					href="tel:+73912889239"
					class="md:hidden w-10 h-10 flex items-center justify-center"
				>
					<UIcon name="i-lucide-phone" class="w-5 h-5 text-neutral-900" />
				</a>

				<a
					ref="phoneRef"
					href="tel:+73912889239"
					class="header-link relative py-2 px-3 -mx-3 text-[10px] uppercase tracking-[0.25em] text-neutral-900 font-medium hidden xl:block magnetic-hover transition-all duration-300 hover:text-neutral-500"
					@mousemove="e => onMouseMove(e as MouseEvent, $el as HTMLElement)"
					@mouseleave="() => onMouseLeave($el as HTMLElement)"
				>
					<span class="relative z-10">+7 (391) 288-92-39</span>
					<span
						class="absolute bottom-1 left-3 right-3 h-px bg-neutral-900 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
					/>
				</a>

				<button
					ref="menuBtnRef"
					class="menu-btn relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 group magnetic-hover touch-manipulation"
					@click="isMenuOpen = true"
					@mousemove="e => onMouseMove(e as MouseEvent, $el as HTMLElement)"
					@mouseleave="() => onMouseLeave($el as HTMLElement)"
				>
					<span
						class="w-6 h-px bg-neutral-900 transition-all duration-300 group-hover:w-4 group-hover:translate-x-1"
					/>
					<span
						class="w-6 h-px bg-neutral-900 transition-all duration-300 group-hover:w-5"
					/>
				</button>
			</div>
		</div>

		<!-- Objects Mega Menu -->
		<Transition
			enter-active-class="transition-all duration-500 ease-out"
			enter-from-class="opacity-0 -translate-y-4"
			enter-to-class="opacity-100 translate-y-0"
			leave-active-class="transition-all duration-300 ease-in"
			leave-from-class="opacity-100 translate-y-0"
			leave-to-class="opacity-0 -translate-y-4"
		>
			<div
				v-if="isObjectsOpen"
				ref="objectsContainerRef"
				class="objects-container absolute top-16 md:top-20 left-0 right-0 bg-white border-b border-neutral-200 max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5rem)] overflow-y-auto"
			>
				<div class="flex flex-col md:flex-row">
					<!-- Left: Object List -->
					<div
						class="w-full md:w-1/3 py-6 px-4 md:py-8 md:px-8 md:border-r border-neutral-200"
					>
						<ul class="space-y-3 md:space-y-4">
							<li
								v-for="object in objects"
								:key="object.id"
								class="object-item group"
								@mouseenter="handleObjectHover(object.id)"
							>
								<NuxtLink
									:to="`/objects/${object.slug}`"
									class="flex items-center justify-between py-3 px-3 -mx-3 border-b border-neutral-100 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-900 group/link"
									@click="isObjectsOpen = false"
								>
									<span
										class="text-sm uppercase tracking-[0.2em] text-neutral-900 transition-all duration-300 group-hover/link:tracking-[0.3em] group-hover/link:text-white"
									>
										{{ object.name }}
									</span>
									<UIcon
										name="i-lucide-arrow-right"
										class="w-4 h-4 text-neutral-400 transition-all duration-300 group-hover/link:text-white group-hover/link:translate-x-1"
									/>
								</NuxtLink>
							</li>
						</ul>
					</div>

					<!-- Right: Object Image (Hidden on mobile, visible on tablet+) -->
					<div
						class="hidden md:block md:w-2/3 relative overflow-hidden bg-neutral-100 min-h-75 lg:min-h-100"
					>
						<TransitionGroup
							enter-active-class="transition-all duration-700 ease-out"
							enter-from-class="opacity-0 scale-105"
							enter-to-class="opacity-100 scale-100"
							leave-active-class="transition-all duration-500 ease-in"
							leave-from-class="opacity-100 scale-100"
							leave-to-class="opacity-0 scale-95"
						>
							<div
								v-for="object in objects"
								v-show="activeObject === object.id"
								:key="object.id"
								class="absolute inset-0"
							>
								<!-- Video -->
								<video
									v-if="getObjectMedia(object).type === 'VIDEO'"
									:src="getObjectMedia(object).url!"
									class="w-full h-full object-cover"
									autoplay
									muted
									loop
									playsinline
								/>
								<!-- Image -->
								<NuxtImg
									v-else-if="getObjectMedia(object).type === 'IMAGE'"
									:src="getObjectMedia(object).url!"
									:alt="object.name"
									class="w-full h-full object-cover"
									width="800"
									height="600"
								/>
								<!-- Fallback -->
								<div
									v-else
									class="w-full h-full flex items-center justify-center bg-neutral-200"
								>
									<div class="text-center">
										<UIcon
											name="i-lucide-image"
											class="w-16 h-16 text-neutral-400 mx-auto mb-4"
										/>
										<span
											class="text-xs uppercase tracking-[0.3em] text-neutral-500"
											>{{ object.name }}</span
										>
									</div>
								</div>
							</div>
						</TransitionGroup>
					</div>
				</div>
			</div>
		</Transition>
	</header>

	<!-- Full Screen Menu Slideover -->
	<USlideover v-model:open="isMenuOpen" side="right" class="w-full max-w-full">
		<template #content>
			<div class="h-full w-full bg-white flex flex-col">
				<!-- Close Button -->
				<div
					class="h-16 md:h-20 px-4 md:px-8 flex items-center justify-end border-b border-neutral-200"
				>
					<button
						class="relative w-10 h-10 flex items-center justify-center group"
						@click="isMenuOpen = false"
					>
						<span
							class="absolute w-6 h-px bg-neutral-900 rotate-45 transition-transform duration-300 group-hover:rotate-225"
						/>
						<span
							class="absolute w-6 h-px bg-neutral-900 -rotate-45 transition-transform duration-300 group-hover:-rotate-225"
						/>
					</button>
				</div>

				<!-- Menu Content -->
				<div class="flex-1 flex flex-col lg:flex-row overflow-y-auto">
					<!-- Navigation -->
					<nav
						ref="slideoverNavRef"
						class="w-full lg:w-1/2 p-6 md:p-8 lg:p-16 flex flex-col justify-center"
					>
						<ul class="space-y-3 md:space-y-4">
							<li
								v-for="item in [
									{ label: 'Главная', path: '/' },
									{ label: 'О компании', path: '/about' },
									{ label: 'Недвижимость', path: '/real-estate' },
									{ label: 'Контакты', path: '/contacts' },
									...(showSiteUser
										? [{ label: 'Профиль', path: '/profile' }]
										: isAdminSession
											? []
											: [
													{ label: 'Войти', path: '/auth/login' },
													{ label: 'Регистрация', path: '/auth/register' },
												]),
								]"
								:key="item.path"
								class="overflow-hidden"
							>
								<NuxtLink
									:to="item.path"
									class="nav-link block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-widest uppercase text-neutral-900 transition-all duration-500 hover:tracking-[0.2em] hover:translate-x-4 hover:text-neutral-500 opacity-0"
									style="transform-origin: left center"
									@click="isMenuOpen = false"
								>
									{{ item.label }}
								</NuxtLink>
							</li>
						</ul>

						<!-- Tablet-only: Quick Objects List -->
						<div class="hidden md:block lg:hidden mt-8">
							<p
								class="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-3"
							>
								Объекты
							</p>
							<div class="flex flex-wrap gap-2">
								<NuxtLink
									v-for="obj in objects.slice(0, 4)"
									:key="obj.id"
									:to="`/objects/${obj.slug}`"
									class="px-3 py-1.5 bg-neutral-100 text-xs uppercase tracking-wider text-neutral-700 hover:bg-neutral-900 hover:text-white transition-colors"
									@click="isMenuOpen = false"
								>
									{{ obj.name }}
								</NuxtLink>
							</div>
						</div>

						<!-- Mobile Contact Info (visible only on small screens) -->
						<div class="lg:hidden mt-12 space-y-6">
							<a
								href="tel:+73912889239"
								class="flex items-center gap-3 text-neutral-900"
							>
								<UIcon name="i-lucide-phone" class="w-5 h-5" />
								<span class="text-sm tracking-wider"> +7 (391) 288-92-39</span>
							</a>
							<a
								href="mailto:info@deltastroi.ru"
								class="flex items-center gap-3 text-neutral-900"
							>
								<UIcon name="i-lucide-mail" class="w-5 h-5" />
								<span class="text-sm tracking-wider">info@deltastroi.ru</span>
							</a>
						</div>
					</nav>

					<!-- Contact Info (Desktop) -->
					<div
						class="hidden lg:flex w-1/2 bg-neutral-50 p-16 flex-col justify-end"
					>
						<div class="space-y-8">
							<div>
								<span
									class="text-xs uppercase tracking-[0.3em] text-neutral-500 block mb-2"
									>Телефон</span
								>
								<a
									href="tel:+73912889239"
									class="text-lg tracking-widest text-neutral-900 hover:text-neutral-600 transition-colors"
								>
									+7 (391) 288-92-39
								</a>
							</div>
							<div>
								<span
									class="text-xs uppercase tracking-[0.3em] text-neutral-500 block mb-2"
									>Email</span
								>
								<a
									href="mailto:info@deltastroi.ru"
									class="text-lg tracking-widest text-neutral-900 hover:text-neutral-600 transition-colors"
								>
									info@deltastroi.ru
								</a>
							</div>
							<div>
								<span
									class="text-xs uppercase tracking-[0.3em] text-neutral-500 block mb-2"
									>Адрес</span
								>
								<p class="text-lg tracking-wider text-neutral-900">
									г. Москва, ул. Строителей, 25
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</USlideover>
</template>

<style scoped>
.header-link {
	display: inline-block;
}

.header-link:hover {
	color: #525252;
}

.header-link span:last-child {
	transform: scaleX(0);
	transition: transform 0.3s ease;
}

.header-link:hover span:last-child {
	transform: scaleX(1);
}

.menu-btn:hover span:first-child {
	transform: translateX(4px);
}

.menu-btn:hover span:last-child {
	transform: translateX(-2px);
}
</style>
