<script setup lang="ts">
import { apartmentsService } from "~/api/apartments.service";
import { projectsService } from "~/api/projects.service";
import { objectsService } from "~/api/objects.service";
import { getFullUrl } from "~/utils/url";
import type {
  ApartmentWithRelations,
  Project,
  ObjectWithRelations,
} from "~/api/types";
import ContactForm from "~/components/site/ContactForm.vue";

definePageMeta({
  layout: "default",
});

const { ensureInitialized } = useFavorites();
onMounted(() => {
  ensureInitialized();
});

// Route and query params
const route = useRoute();
const objectSlug = computed(() => route.query.object as string | undefined);

// Load object data if filtering by object
const { data: filteredObject } = useAsyncData(
  `object-${objectSlug.value}`,
  () =>
    objectSlug.value
      ? objectsService.getBySlug(objectSlug.value)
      : Promise.resolve(null),
  { server: false, default: () => null, watch: [objectSlug] },
);

// Lightbox state
const isLightboxOpen = ref(false);
const lightboxImages = ref<string[]>([]);
const lightboxIndex = ref(0);
const currentLightboxImage = computed(
  () => lightboxImages.value[lightboxIndex.value] || null,
);

function openLightbox(
  initialImage: string,
  apartment?: ApartmentWithRelations,
) {
  // Collect images for lightbox
  const images = filteredApartments.value.map((apt) => getApartmentImage(apt));
  lightboxImages.value = [...new Set(images)]; // Remove duplicates

  // Find index of initial image
  const initialIndex = lightboxImages.value.indexOf(initialImage);
  lightboxIndex.value = initialIndex >= 0 ? initialIndex : 0;

  isLightboxOpen.value = true;
}

function closeLightbox() {
  isLightboxOpen.value = false;
  lightboxIndex.value = 0;
}

function nextImage() {
  if (lightboxIndex.value < lightboxImages.value.length - 1) {
    lightboxIndex.value++;
  }
}

function prevImage() {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value--;
  }
}

// Navigate to apartment detail page
function navigateToApartment(apartment: ApartmentWithRelations) {
  navigateTo(`/real-estate/${apartment.id}`);
}

// Filters
const priceFrom = ref("");
const priceTo = ref("");
const areaFrom = ref("");
const areaTo = ref("");
const floorFrom = ref("");
const floorTo = ref("");
const selectedProject = ref<string>("");
const selectedRooms = ref<number[]>([]);

// Debounced values for smoother filtering
const debouncedPriceFrom = useDebounce(priceFrom, 300);
const debouncedPriceTo = useDebounce(priceTo, 300);
const debouncedAreaFrom = useDebounce(areaFrom, 300);
const debouncedAreaTo = useDebounce(areaTo, 300);
const debouncedFloorFrom = useDebounce(floorFrom, 300);
const debouncedFloorTo = useDebounce(floorTo, 300);

// Check if any filter is active
const hasActiveFilters = computed(() => {
  return (
    priceFrom.value ||
    priceTo.value ||
    areaFrom.value ||
    areaTo.value ||
    floorFrom.value ||
    floorTo.value ||
    selectedProject.value ||
    selectedRooms.value.length > 0
  );
});

// Reset all filters
function resetFilters() {
  priceFrom.value = "";
  priceTo.value = "";
  areaFrom.value = "";
  areaTo.value = "";
  floorFrom.value = "";
  floorTo.value = "";
  selectedProject.value = "";
  selectedRooms.value = [];
}

// Fetch data
const { data: apartments, pending: isLoadingApartments } = await useAsyncData(
  "real-estate-apartments",
  () => apartmentsService.getAll(),
  { server: false, default: () => [] },
);

const { data: projects } = await useAsyncData(
  "projects-list",
  () => projectsService.getAll(),
  { server: false, default: () => [] },
);

// Room options
const roomOptions = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
];

// Toggle room selection
function toggleRoom(room: number) {
  const index = selectedRooms.value.indexOf(room);
  if (index > -1) {
    selectedRooms.value.splice(index, 1);
  } else {
    selectedRooms.value.push(room);
  }
}

// Filtered and sorted apartments
const filteredApartments = computed((): ApartmentWithRelations[] => {
  let result = apartments.value || [];

  // Filter by price (using debounced values)
  if (debouncedPriceFrom.value) {
    result = result.filter(
      (a) => (a.price || 0) >= parseInt(debouncedPriceFrom.value) * 1000000,
    );
  }
  if (debouncedPriceTo.value) {
    result = result.filter(
      (a) => (a.price || 0) <= parseInt(debouncedPriceTo.value) * 1000000,
    );
  }

  // Filter by area (using debounced values)
  if (debouncedAreaFrom.value) {
    result = result.filter(
      (a) => (a.area || 0) >= parseInt(debouncedAreaFrom.value),
    );
  }
  if (debouncedAreaTo.value) {
    result = result.filter(
      (a) => (a.area || 0) <= parseInt(debouncedAreaTo.value),
    );
  }

  // Filter by floor (using debounced values)
  if (debouncedFloorFrom.value) {
    result = result.filter(
      (a) => (a.floor || 0) >= parseInt(debouncedFloorFrom.value),
    );
  }
  if (debouncedFloorTo.value) {
    result = result.filter(
      (a) => (a.floor || 0) <= parseInt(debouncedFloorTo.value),
    );
  }

  // Filter by project
  if (selectedProject.value) {
    result = result.filter(
      (a) =>
        a.projectId === selectedProject.value ||
        a.project?.id === selectedProject.value,
    );
  }

  // Filter by rooms
  if (selectedRooms.value.length > 0) {
    result = result.filter((a) => selectedRooms.value.includes(a.rooms || 0));
  }

  // Filter by object slug from query params
  if (objectSlug.value) {
    result = result.filter(
      (a) =>
        a.object?.slug === objectSlug.value ||
        a.objectId === filteredObject.value?.id,
    );
  }

  return result;
});

// Format price helper
function formatPrice(price: number | null): string {
  if (!price) return "—";
  return price.toLocaleString("ru-RU") + " ₽";
}

// Get apartment image
function getApartmentImage(apartment: ApartmentWithRelations): string {
  if (apartment.layoutPhoto?.url) {
    return getFullUrl(apartment.layoutPhoto.url);
  }
  if (apartment.floorPlanPhoto?.url) {
    return getFullUrl(apartment.floorPlanPhoto.url);
  }
  if (apartment.masterPlanPhoto?.url) {
    return getFullUrl(apartment.masterPlanPhoto.url);
  }
  if (apartment.project?.media?.[0]?.url) {
    return getFullUrl(apartment.project.media[0].url);
  }
  return "https://via.placeholder.com/600x400?text=Нет+фото";
}

// Get project icon/color
function getProjectColor(apartment: ApartmentWithRelations): string {
  const projectName = apartment.project?.name || "";
  if (projectName.toLowerCase().includes("новый")) return "bg-green-500";
  if (projectName.toLowerCase().includes("берег")) return "bg-orange-500";
  if (projectName.toLowerCase().includes("академ")) return "bg-green-500";
  return "bg-primary";
}

// Select items for dropdowns - using objects directly for proper typing
const projectsSelectItems = computed(() => [
  { value: "", label: "ВСЕ ПРОЕКТЫ" },
  ...(projects.value || []).map((p) => ({ value: p.id, label: p.name })),
]);
</script>

<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Header Section -->
    <div class="bg-white border-b border-neutral-200">
      <div class="w-full px-6 py-6">
        <h1
          class="text-5xl md:text-6xl font-bold text-neutral-900 uppercase tracking-widest"
        >
          {{
            objectSlug && filteredObject
              ? `Недвижимость в ${filteredObject.name}`
              : "КВАРТИРЫ"
          }}
        </h1>

        <!-- Filters -->
        <div class="mt-8 space-y-4">
          <!-- Main Filters Row -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Price Range -->
            <div
              class="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-4 py-2.5 shadow-sm hover:border-neutral-300 transition-colors"
              :class="{
                'border-neutral-900 ring-1 ring-neutral-900':
                  priceFrom || priceTo,
              }"
            >
              <UIcon name="i-lucide-wallet" class="w-4 h-4 text-neutral-400" />
              <span
                class="text-[10px] font-medium text-neutral-400 uppercase tracking-wider"
                >ЦЕНА</span
              >
              <div class="w-px h-4 bg-neutral-200 mx-1"></div>
              <input
                v-model="priceFrom"
                type="number"
                placeholder="От"
                class="w-20 text-sm outline-none bg-transparent uppercase tracking-wide placeholder:text-neutral-300"
              />
              <span class="text-neutral-300">—</span>
              <input
                v-model="priceTo"
                type="number"
                placeholder="До"
                class="w-20 text-sm outline-none bg-transparent uppercase tracking-wide placeholder:text-neutral-300"
              />
              <span class="text-[10px] text-neutral-400 uppercase">млн ₽</span>
            </div>

            <!-- Area Range -->
            <div
              class="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-4 py-2.5 shadow-sm hover:border-neutral-300 transition-colors"
              :class="{
                'border-neutral-900 ring-1 ring-neutral-900':
                  areaFrom || areaTo,
              }"
            >
              <UIcon
                name="i-lucide-maximize"
                class="w-4 h-4 text-neutral-400"
              />
              <span
                class="text-[10px] font-medium text-neutral-400 uppercase tracking-wider"
                >ПЛОЩАДЬ</span
              >
              <div class="w-px h-4 bg-neutral-200 mx-1"></div>
              <input
                v-model="areaFrom"
                type="number"
                placeholder="От"
                class="w-14 text-sm outline-none bg-transparent uppercase tracking-wide placeholder:text-neutral-300"
              />
              <span class="text-neutral-300">—</span>
              <input
                v-model="areaTo"
                type="number"
                placeholder="До"
                class="w-14 text-sm outline-none bg-transparent uppercase tracking-wide placeholder:text-neutral-300"
              />
              <span class="text-[10px] text-neutral-400 uppercase">м²</span>
            </div>

            <!-- Floor Range -->
            <div
              class="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-4 py-2.5 shadow-sm hover:border-neutral-300 transition-colors"
              :class="{
                'border-neutral-900 ring-1 ring-neutral-900':
                  floorFrom || floorTo,
              }"
            >
              <UIcon
                name="i-lucide-building-2"
                class="w-4 h-4 text-neutral-400"
              />
              <span
                class="text-[10px] font-medium text-neutral-400 uppercase tracking-wider"
                >ЭТАЖ</span
              >
              <div class="w-px h-4 bg-neutral-200 mx-1"></div>
              <input
                v-model="floorFrom"
                type="number"
                placeholder="От"
                class="w-12 text-sm outline-none bg-transparent uppercase tracking-wide placeholder:text-neutral-300"
              />
              <span class="text-neutral-300">—</span>
              <input
                v-model="floorTo"
                type="number"
                placeholder="До"
                class="w-12 text-sm outline-none bg-transparent uppercase tracking-wide placeholder:text-neutral-300"
              />
            </div>

            <!-- Project -->
            <div
              class="relative w-48"
              :class="{ 'ring-1 ring-neutral-900 rounded-lg': selectedProject }"
            >
              <select
                v-model="selectedProject"
                class="w-full appearance-none bg-white border border-neutral-200 rounded-lg px-4 py-2.5 pr-10 text-sm uppercase tracking-wide focus:outline-none focus:border-neutral-900 cursor-pointer"
                :class="{ 'border-neutral-900': selectedProject }"
              >
                <option
                  v-for="item in projectsSelectItems"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </option>
              </select>
              <UIcon
                name="i-lucide-chevron-down"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
              />
            </div>

            <!-- Rooms -->
            <div
              class="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg px-2 py-1.5 shadow-sm"
              :class="{
                'border-neutral-900 ring-1 ring-neutral-900':
                  selectedRooms.length > 0,
              }"
            >
              <span
                v-for="room in roomOptions"
                :key="room.value"
                class="w-9 h-9 flex items-center justify-center text-sm cursor-pointer rounded-md transition-all uppercase tracking-wide font-medium"
                :class="
                  selectedRooms.includes(room.value)
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'hover:bg-neutral-100 text-neutral-500'
                "
                @click="toggleRoom(room.value)"
              >
                {{ room.label }}
              </span>
            </div>

            <!-- Reset Button -->
            <button
              v-if="hasActiveFilters"
              class="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              @click="resetFilters"
            >
              <UIcon name="i-lucide-rotate-ccw" class="w-4 h-4" />
              <span class="uppercase tracking-wide">Сбросить</span>
            </button>
          </div>

          <!-- Active Filters Chips -->
          <div
            v-if="hasActiveFilters"
            class="flex flex-wrap items-center gap-2"
          >
            <span class="text-xs text-neutral-400 uppercase tracking-wider mr-2"
              >Активные фильтры:</span
            >

            <span
              v-if="priceFrom || priceTo"
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-full"
            >
              Цена: {{ priceFrom || "0" }} — {{ priceTo || "∞" }} млн ₽
              <button
                @click="
                  priceFrom = '';
                  priceTo = '';
                "
                class="hover:text-neutral-300"
              >
                <UIcon name="i-lucide-x" class="w-3 h-3" />
              </button>
            </span>

            <span
              v-if="areaFrom || areaTo"
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-full"
            >
              Площадь: {{ areaFrom || "0" }} — {{ areaTo || "∞" }} м²
              <button
                @click="
                  areaFrom = '';
                  areaTo = '';
                "
                class="hover:text-neutral-300"
              >
                <UIcon name="i-lucide-x" class="w-3 h-3" />
              </button>
            </span>

            <span
              v-if="floorFrom || floorTo"
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-full"
            >
              Этаж: {{ floorFrom || "1" }} — {{ floorTo || "∞" }}
              <button
                @click="
                  floorFrom = '';
                  floorTo = '';
                "
                class="hover:text-neutral-300"
              >
                <UIcon name="i-lucide-x" class="w-3 h-3" />
              </button>
            </span>

            <span
              v-if="selectedProject"
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-full"
            >
              {{
                projectsSelectItems.find((p) => p.value === selectedProject)
                  ?.label || "Проект"
              }}
              <button
                @click="selectedProject = ''"
                class="hover:text-neutral-300"
              >
                <UIcon name="i-lucide-x" class="w-3 h-3" />
              </button>
            </span>

            <span
              v-for="room in selectedRooms"
              :key="room"
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-full"
            >
              {{ room }}
              {{ room === 1 ? "комната" : room < 5 ? "комнаты" : "комнат" }}
              <button @click="toggleRoom(room)" class="hover:text-neutral-300">
                <UIcon name="i-lucide-x" class="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>

        <!-- View Toggle & Counter -->
        <div
          class="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100"
        >
          <span class="text-sm text-neutral-500">
            <span class="font-bold text-neutral-900 text-lg">{{
              filteredApartments.length
            }}</span>
            {{
              filteredApartments.length === 1
                ? " квартира"
                : filteredApartments.length < 5
                  ? " квартиры"
                  : " квартир"
            }}
            <span v-if="hasActiveFilters" class="text-neutral-400 ml-1"
              >(по фильтрам)</span
            >
          </span>
        </div>
      </div>
    </div>

    <!-- GRID VIEW -->
    <div class="w-full px-6 py-8">
      <!-- Loading Skeleton -->
      <div
        v-if="isLoadingApartments"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="bg-white border border-neutral-200 animate-pulse"
        >
          <div class="h-56 bg-neutral-200"></div>
          <div class="p-6 space-y-4">
            <div class="h-4 bg-neutral-200 rounded w-3/4"></div>
            <div class="h-6 bg-neutral-200 rounded w-1/2"></div>
            <div class="flex gap-2">
              <div class="h-8 bg-neutral-200 rounded w-16"></div>
              <div class="h-8 bg-neutral-200 rounded w-16"></div>
              <div class="h-8 bg-neutral-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="filteredApartments.length === 0"
        class="text-center py-12"
      >
        <UIcon
          name="i-lucide-building-2"
          class="w-16 h-16 mx-auto text-neutral-300 mb-4"
        />
        <p class="text-neutral-500 uppercase tracking-widest">
          Нет квартир по выбранным фильтрам
        </p>
      </div>

      <!-- Grid - Wider cards with fewer columns -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <div
          v-for="apt in filteredApartments"
          :key="apt.id"
          class="group bg-white border border-neutral-200 hover:shadow-2xl hover:-translate-y-2 hover:border-neutral-400 transition-all duration-300 cursor-pointer"
          @click="navigateToApartment(apt)"
        >
          <!-- Project & Object Badge - More padding -->
          <div
            class="flex items-center gap-3 px-6 py-5 border-b border-neutral-100"
          >
            <div
              class="w-8 h-8 rounded flex items-center justify-center"
              :class="getProjectColor(apt)"
            >
              <UIcon name="i-lucide-map-pin" class="w-5 h-5 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-2">
                <span
                  class="text-[10px] uppercase tracking-widest text-neutral-500 truncate"
                >
                  {{ apt.project?.name || "ПРОЕКТ" }}
                </span>
                <span class="text-neutral-300">|</span>
                <span
                  class="text-[10px] uppercase tracking-widest text-neutral-900 font-bold truncate"
                >
                  {{ apt.object?.name || "ОБЪЕКТ" }}
                </span>
              </div>
            </div>
          </div>

          <!-- Image with zoom - Larger height -->
          <div
            class="relative h-56 bg-neutral-100 overflow-hidden group/image"
            @click.stop="openLightbox(getApartmentImage(apt), apt)"
          >
            <div class="absolute top-3 right-3 z-10">
              <SiteFavoriteButton :apartment-id="apt.id" size="sm" />
            </div>
            <img
              :src="getApartmentImage(apt)"
              class="w-full h-full object-contain group-hover/image:scale-105 transition-transform duration-300"
              :alt="`КВАРТИРА ${apt.number}`"
            />
            <div
              class="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center"
            >
              <div
                class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/image:opacity-100 transition-opacity"
              >
                <UIcon
                  name="i-lucide-maximize-2"
                  class="w-5 h-5 text-neutral-700"
                />
              </div>
            </div>
          </div>

          <!-- Info - More padding -->
          <div class="p-6">
            <!-- Rooms and Area -->
            <div class="flex items-baseline gap-3 mb-5">
              <span
                class="text-xl font-bold text-neutral-900 uppercase tracking-wider"
                >{{ apt.rooms || "—" }} КОМН.</span
              >
              <span class="text-base text-neutral-400 uppercase tracking-wide"
                >{{ apt.area || "—" }} М²</span
              >
            </div>

            <!-- Price -->
            <div
              class="text-2xl font-bold text-neutral-900 mb-6 uppercase tracking-wider"
            >
              {{ formatPrice(apt.price) }}
            </div>

            <!-- Details Row -->
            <div
              class="flex items-center justify-between text-center border-t border-neutral-100 pt-5"
            >
              <div class="flex-1">
                <div
                  class="text-[10px] uppercase tracking-widest text-neutral-400 mb-2"
                >
                  СРОК СДАЧИ
                </div>
                <div
                  class="text-sm font-semibold text-neutral-900 uppercase tracking-wide"
                >
                  {{
                    apt.completionDate
                      ? new Date(apt.completionDate)
                          .toLocaleDateString("ru-RU", {
                            month: "short",
                            year: "2-digit",
                          })
                          .replace(".", "")
                      : "—"
                  }}
                </div>
              </div>
              <div class="w-px h-10 bg-neutral-200"></div>
              <div class="flex-1">
                <div
                  class="text-[10px] uppercase tracking-widest text-neutral-400 mb-2"
                >
                  ДОМ
                </div>
                <div
                  class="text-sm font-semibold text-neutral-900 uppercase tracking-wide"
                >
                  {{ apt.building || "—" }}
                </div>
              </div>
              <div class="w-px h-10 bg-neutral-200"></div>
              <div class="flex-1">
                <div
                  class="text-[10px] uppercase tracking-widest text-neutral-400 mb-2"
                >
                  ПОД.
                </div>
                <div
                  class="text-sm font-semibold text-neutral-900 uppercase tracking-wide"
                >
                  {{ apt.entrance || "—" }}
                </div>
              </div>
              <div class="w-px h-10 bg-neutral-200"></div>
              <div class="flex-1">
                <div
                  class="text-[10px] uppercase tracking-widest text-neutral-400 mb-2"
                >
                  ЭТАЖ
                </div>
                <div
                  class="text-sm font-semibold text-neutral-900 uppercase tracking-wide"
                >
                  {{ apt.floor || "—" }}/{{ apt.floorTotal || "—" }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Overlay -->
    <Teleport to="body">
      <div
        v-if="isLightboxOpen"
        class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        @click.self="closeLightbox"
      >
        <!-- Close button -->
        <button
          class="absolute top-6 right-6 z-[110] w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center transition-colors"
          @click="closeLightbox"
        >
          <UIcon name="i-lucide-x" class="w-7 h-7 text-white" />
        </button>

        <!-- Navigation arrows -->
        <button
          v-if="lightboxIndex > 0"
          class="absolute left-6 top-1/2 -translate-y-1/2 z-[110] w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center transition-colors"
          @click="prevImage"
        >
          <UIcon name="i-lucide-chevron-left" class="w-8 h-8 text-white" />
        </button>
        <button
          v-if="lightboxIndex < lightboxImages.length - 1"
          class="absolute right-6 top-1/2 -translate-y-1/2 z-[110] w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center transition-colors"
          @click="nextImage"
        >
          <UIcon name="i-lucide-chevron-right" class="w-8 h-8 text-white" />
        </button>

        <!-- Main image -->
        <div class="max-w-[90vw] max-h-[85vh]">
          <img
            v-if="currentLightboxImage"
            :src="currentLightboxImage"
            class="max-w-full max-h-[85vh] object-contain"
            alt="ПЛАНИРОВКА"
            @click.stop
          />
        </div>

        <!-- Thumbnail strip -->
        <div
          class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-[110]"
        >
          <button
            v-for="(img, idx) in lightboxImages.slice(0, 8)"
            :key="idx"
            class="w-16 h-16 rounded overflow-hidden border-2 transition-colors"
            :class="
              idx === lightboxIndex
                ? 'border-white'
                : 'border-transparent hover:border-white/50'
            "
            @click="lightboxIndex = idx"
          >
            <img :src="img" class="w-full h-full object-cover" />
          </button>
        </div>

        <!-- Image counter -->
        <div
          class="absolute top-6 left-6 text-white/80 text-sm uppercase tracking-widest z-[110]"
        >
          {{ lightboxIndex + 1 }} / {{ lightboxImages.length }}
        </div>
      </div>
    </Teleport>
  </div>
  <ContactForm :show-phone="true" :show-email="true" :show-address="true" />
</template>
