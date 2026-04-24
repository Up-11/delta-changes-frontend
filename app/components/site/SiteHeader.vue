<script setup lang="ts">
import { gsap } from "gsap";
import type { Project } from "~/composables/useProjects";

const isMenuOpen = ref(false);
const isProjectsOpen = ref(false);
const activeProject = ref<string | null>(null);
const headerRef = ref<HTMLElement | null>(null);
const logoRef = ref<HTMLElement | null>(null);
const menuItemsRef = ref<HTMLElement[]>([]);
const menuBtnRef = ref<HTMLElement | null>(null);
const phoneRef = ref<HTMLElement | null>(null);
const slideoverNavRef = ref<HTMLElement | null>(null);
const projectsMenuTimer = ref<NodeJS.Timeout | null>(null);

const { projects, fetchProjects, getProjectMedia } = useProjects();

// Page load animations
onMounted(() => {
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
        ease: "power3.out",
        delay: 0.2,
      },
    );
    // Fallback: ensure logo is visible after animation
    setTimeout(() => {
      if (logoRef.value) {
        logoRef.value.style.opacity = "1";
      }
    }, 1200);
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
        ease: "power3.out",
        delay: 0.4,
      },
    );
    // Fallback: ensure items are visible after animation
    setTimeout(() => {
      menuItemsRef.value.forEach((el) => {
        if (el) el.style.opacity = "1";
      });
    }, 1400);
  }
});

// Fetch projects on mount
onMounted(async () => {
  await fetchProjects();
  // If projects loaded, set first as active
  if (projects.value.length > 0) {
    activeProject.value = projects.value[0].id;
  }
});

const menuItems = [
  { label: "О компании", path: "/about" },
  { label: "Контакты", path: "/contacts" },
  { label: "Проекты", path: "/projects", hasDropdown: true },
];

function handleProjectHover(projectId: string) {
  activeProject.value = projectId;
}

// Get image for project (fallback if no image)
function getProjectImageOrFallback(project: Project): string {
  const image = getProjectImage(project);
  return image || "/images/placeholder-project.jpg";
}

function openProjectsMenu() {
  // Clear any pending close timer
  if (projectsMenuTimer.value) {
    clearTimeout(projectsMenuTimer.value);
    projectsMenuTimer.value = null;
  }
  isProjectsOpen.value = true;
  if (projects.value.length > 0 && !activeProject.value) {
    activeProject.value = projects.value[0]!.id;
  }
  // Animate projects list entrance
  nextTick(() => {
    const projectItems = document.querySelectorAll(".project-item");
    if (projectItems.length) {
      gsap.fromTo(
        projectItems,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" },
      );
    }
  });
}

function closeProjectsMenu() {
  // Delay closing to allow mouse to move between trigger and menu
  projectsMenuTimer.value = setTimeout(() => {
    isProjectsOpen.value = false;
    activeProject.value = null;
  }, 150);
}

// Watch for menu open to animate slideover content
watch(isMenuOpen, (val) => {
  if (val) {
    nextTick(() => {
      // Animate nav items
      const navLinks = slideoverNavRef.value?.querySelectorAll(".nav-link");
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
            ease: "power3.out",
            delay: 0.2,
          },
        );
      }
    });
  }
});

// Magnetic button effect
function onMouseMove(e: MouseEvent, el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;

  gsap.to(el, {
    x: x * 0.3,
    y: y * 0.3,
    duration: 0.3,
    ease: "power2.out",
  });
}

function onMouseLeave(el: HTMLElement) {
  gsap.to(el, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: "elastic.out(1, 0.3)",
  });
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-white">
    <div class="h-20 px-8 flex items-center justify-between">
      <!-- Left: Navigation -->
      <nav class="flex items-center gap-8">
        <template v-for="(item, index) in menuItems" :key="item.path">
          <div
            ref="menuItemsRef"
            class="relative opacity-0"
            @mouseenter="item.hasDropdown ? openProjectsMenu() : null"
            @mouseleave="item.hasDropdown ? closeProjectsMenu() : null"
          >
            <NuxtLink
              :to="item.hasDropdown ? undefined : item.path"
              class="header-link relative overflow-hidden py-2 px-3 -mx-3 text-xs uppercase tracking-[0.3em] text-neutral-900 font-medium magnetic-hover"
              :class="{ 'cursor-pointer': item.hasDropdown }"
              @mousemove="
                (e) => onMouseMove(e as MouseEvent, $el as HTMLElement)
              "
              @mouseleave="() => onMouseLeave($el as HTMLElement)"
            >
              <span class="link-text relative z-10 block">{{
                item.label
              }}</span>
              <span
                class="link-hover absolute inset-0 z-20 flex items-center justify-center text-white bg-neutral-900 translate-y-full transition-transform duration-300 ease-out"
              >
                {{ item.label }}
              </span>
            </NuxtLink>
          </div>
        </template>
      </nav>

      <!-- Center: Logo -->
      <div ref="logoRef" class="absolute left-1/2 -translate-x-1/2 opacity-0">
        <NuxtLink
          to="/"
          class="flex flex-col items-center group cursor-pointer"
        >
          <span
            class="text-2xl font-bold tracking-[0.4em] uppercase text-neutral-900 transition-all duration-300 group-hover:tracking-[0.5em]"
          >
            ДЕЛЬТА
          </span>
          <span
            class="text-[10px] tracking-[0.5em] uppercase text-neutral-500 -mt-1"
          >
            строй
          </span>
        </NuxtLink>
      </div>

      <!-- Right: Phone & Menu -->
      <div class="flex items-center gap-6">
        <a
          ref="phoneRef"
          href="tel:+79999999999"
          class="header-link relative overflow-hidden py-2 px-3 -mx-3 text-xs uppercase tracking-[0.25em] text-neutral-900 font-medium hidden md:block magnetic-hover"
          @mousemove="(e) => onMouseMove(e as MouseEvent, $el as HTMLElement)"
          @mouseleave="() => onMouseLeave($el as HTMLElement)"
        >
          <span class="link-text relative z-10 block">+7 (999) 999-99-99</span>
          <span
            class="link-hover absolute inset-0 z-20 flex items-center justify-center text-white bg-neutral-900 translate-y-full transition-transform duration-300 ease-out"
          >
            +7 (999) 999-99-99
          </span>
        </a>

        <button
          ref="menuBtnRef"
          class="menu-btn relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 group magnetic-hover"
          @click="isMenuOpen = true"
          @mousemove="(e) => onMouseMove(e as MouseEvent, $el as HTMLElement)"
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

    <!-- Projects Mega Menu -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="isProjectsOpen"
        class="absolute top-20 left-0 right-0 bg-white border-b border-neutral-200"
        @mouseenter="openProjectsMenu"
        @mouseleave="closeProjectsMenu"
      >
        <div class="flex">
          <!-- Left: Project List -->
          <div class="w-1/3 py-8 px-8 border-r border-neutral-200">
            <ul class="space-y-4">
              <li
                v-for="project in projects"
                :key="project.id"
                class="project-item group opacity-0"
                @mouseenter="handleProjectHover(project.id)"
              >
                <NuxtLink
                  :to="`/projects/${project.slug}`"
                  class="flex items-center justify-between py-3 px-3 -mx-3 border-b border-neutral-100 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-900 group/link"
                >
                  <span
                    class="text-sm uppercase tracking-[0.2em] text-neutral-900 transition-all duration-300 group-hover/link:tracking-[0.3em] group-hover/link:text-white"
                  >
                    {{ project.name }}
                  </span>
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="w-4 h-4 text-neutral-400 transition-all duration-300 group-hover/link:text-white group-hover/link:translate-x-1"
                  />
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Right: Project Image -->
          <div class="w-2/3 relative overflow-hidden bg-neutral-100">
            <TransitionGroup
              enter-active-class="transition-all duration-700 ease-out"
              enter-from-class="opacity-0 scale-105"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-500 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-for="project in projects"
                v-show="activeProject === project.id"
                :key="project.id"
                class="absolute inset-0"
              >
                <!-- Video -->
                <video
                  v-if="getProjectMedia(project).type === 'VIDEO'"
                  :src="getProjectMedia(project).url!"
                  class="w-full h-full object-cover"
                  autoplay
                  muted
                  loop
                  playsinline
                />
                <!-- Image -->
                <NuxtImg
                  v-else-if="getProjectMedia(project).type === 'IMAGE'"
                  :src="getProjectMedia(project).url!"
                  :alt="project.name"
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
                      >{{ project.name }}</span
                    >
                  </div>
                </div>
              </div>
            </TransitionGroup>

            <!-- View All Projects Link -->
            <NuxtLink
              to="/projects"
              class="absolute bottom-8 right-8 flex items-center gap-3 group bg-neutral-900 text-white px-4 py-2 transition-all duration-300 hover:bg-neutral-700"
            >
              <span class="text-xs uppercase tracking-[0.25em]"
                >Все проекты</span
              >
              <UIcon
                name="i-lucide-arrow-right"
                class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </header>

  <!-- Full Screen Menu Slideover -->
  <USlideover
    v-model:open="isMenuOpen"
    side="right"
    class="w-full max-w-full sm:max-w-full"
  >
    <template #content>
      <div class="h-full w-full bg-white flex flex-col">
        <!-- Close Button -->
        <div
          class="h-20 px-8 flex items-center justify-end border-b border-neutral-200"
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
        <div class="flex-1 flex">
          <!-- Navigation -->
          <nav
            ref="slideoverNavRef"
            class="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center"
          >
            <ul class="space-y-6">
              <li
                v-for="(item, index) in [
                  { label: 'Главная', path: '/' },
                  { label: 'О компании', path: '/about' },
                  { label: 'Проекты', path: '/projects' },
                  { label: 'Контакты', path: '/contacts' },
                ]"
                :key="item.path"
                class="overflow-hidden"
              >
                <NuxtLink
                  :to="item.path"
                  class="nav-link block text-4xl lg:text-6xl font-light tracking-widest uppercase text-neutral-900 transition-all duration-500 hover:tracking-[0.2em] hover:translate-x-4 hover:text-neutral-500 opacity-0"
                  style="transform-origin: left center"
                  @click="isMenuOpen = false"
                >
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>

          <!-- Contact Info -->
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
                  href="tel:+79999999999"
                  class="text-lg tracking-widest text-neutral-900 hover:text-neutral-600 transition-colors"
                >
                  +7 (999) 999-99-99
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

.header-link:hover .link-text {
  transform: translateY(-100%);
  opacity: 0;
}

.header-link:hover .link-hover {
  transform: translateY(0);
}

.link-text {
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s ease;
  will-change: transform, opacity;
}

.link-hover {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
  pointer-events: none;
  background-color: #171717;
  color: #ffffff;
}

.menu-btn:hover span:first-child {
  transform: translateX(4px);
}

.menu-btn:hover span:last-child {
  transform: translateX(-2px);
}
</style>
