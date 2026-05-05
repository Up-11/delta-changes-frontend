<script setup lang="ts">
import { apartmentsService } from "~/api/apartments.service";
import { apartmentsService as apartmentsApi } from "~/api/apartments.service";
import { newsService } from "~/api/news.service";
import { applicationsService } from "~/api/applications.service";
import { getFullUrl } from "~/utils/url";
import type { ApartmentWithRelations, News } from "~/api/types";
import ContactForm from "~/components/site/ContactForm.vue";
import NewsSection from "~/components/site/NewsSection.vue";

definePageMeta({
  layout: "default",
});

const route = useRoute();
const apartmentId = computed(() => route.params.id as string);

// Load apartment data
const { data: apartment, pending } = useAsyncData(
  `apartment-${apartmentId.value}`,
  () => apartmentsService.getById(apartmentId.value),
  { server: false },
);

// Toast for notifications
const toast = useToast();

// Load all apartments for "related" section
const { data: allApartments } = useAsyncData(
  "all-apartments",
  () => apartmentsApi.getAll(),
  { server: false },
);

// Load news for news section
const { data: newsList } = useAsyncData(
  "latest-news",
  () => newsService.getAll({ limit: 3 }),
  { server: false },
);

// Get related apartments (same project or similar specs)
const relatedApartments = computed((): ApartmentWithRelations[] => {
  if (!allApartments.value || !apartment.value) return [];
  return allApartments.value
    .filter(
      (apt) =>
        apt.id !== apartment.value!.id &&
        (apt.projectId === apartment.value!.projectId ||
          apt.rooms === apartment.value!.rooms),
    )
    .slice(0, 4);
});

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
  return "https://via.placeholder.com/800x600?text=Нет+фото";
}

// Image gallery
const currentImageIndex = ref(0);

const apartmentImages = computed(() => {
  if (!apartment.value) return [];
  const images: { url: string; label: string }[] = [];
  if (apartment.value.layoutPhoto?.url) {
    images.push({
      url: getFullUrl(apartment.value.layoutPhoto.url),
      label: "Планировка",
    });
  }
  if (apartment.value.floorPlanPhoto?.url) {
    images.push({
      url: getFullUrl(apartment.value.floorPlanPhoto.url),
      label: "На этаже",
    });
  }
  if (apartment.value.masterPlanPhoto?.url) {
    images.push({
      url: getFullUrl(apartment.value.masterPlanPhoto.url),
      label: "Генплан",
    });
  }
  return images;
});

const currentImage = computed(
  () =>
    apartmentImages.value[currentImageIndex.value]?.url ||
    getApartmentImage(apartment.value!),
);

// Format price
function formatPrice(price: number | null): string {
  if (!price) return "—";
  return price.toLocaleString("ru-RU") + " ₽";
}

// Format completion date
function formatCompletionDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const quarter = Math.ceil((date.getMonth() + 1) / 3);
  const year = date.getFullYear();
  return `${quarter} кв. ${year}`;
}

// Format finishing type
function formatFinishing(type: string | null | undefined): string {
  if (!type) return "—";
  const map: Record<string, string> = {
    NONE: "Без отделки",
    BASIC: "Базовая",
    IMPROVED: "Улучшенная",
    TURNKEY: "Под ключ",
    WHITE_CUBE: "Белый куб",
    DESIGNER: "Дизайнерская",
  };
  return map[type] || type;
}

// Get project icon/color
function getProjectColor(apartment: ApartmentWithRelations): string {
  const projectName = apartment.project?.name || "";
  if (projectName.toLowerCase().includes("новый")) return "bg-green-500";
  if (projectName.toLowerCase().includes("берег")) return "bg-orange-500";
  if (projectName.toLowerCase().includes("академ")) return "bg-green-500";
  return "bg-primary";
}

// Booking slideover state
const isBookingOpen = ref(false);
const bookingName = ref("");
const bookingPhone = ref("");
const bookingAgreed = ref(false);
const bookingSubmitting = ref(false);

async function submitBooking() {
  if (
    !bookingName.value ||
    !bookingPhone.value ||
    !bookingAgreed.value ||
    !apartment.value
  ) {
    toast.add({
      title: "Ошибка",
      description: "Заполните все поля и дайте согласие",
      color: "neutral",
    });
    return;
  }

  bookingSubmitting.value = true;
  try {
    await applicationsService.create({
      name: bookingName.value,
      phone: bookingPhone.value,
      apartmentId: apartment.value.id,
      source: "website",
    });

    toast.add({
      title: "Успех",
      description: "Заявка отправлена. Менеджер свяжется с вами",
      color: "neutral",
    });

    isBookingOpen.value = false;
    bookingName.value = "";
    bookingPhone.value = "";
    bookingAgreed.value = false;
  } catch (error) {
    toast.add({
      title: "Ошибка",
      description: "Не удалось отправить заявку",
      color: "neutral",
    });
  } finally {
    bookingSubmitting.value = false;
  }
}

function openBookingForm() {
  isBookingOpen.value = true;
}

// Benefits list
const benefits = [
  { icon: "i-lucide-file-text", text: "Онлайн-заключение договора" },
  { icon: "i-lucide-shield-check", text: "Онлайн-регистрация права" },
  { icon: "i-lucide-calculator", text: "Ипотека от 4,5%" },
  { icon: "i-lucide-percent", text: "Скидка при 100% оплате" },
  { icon: "i-lucide-truck", text: "Бесплатное такси на показ" },
  { icon: "i-lucide-headphones", text: "Персональный менеджер" },
];

// Mortgage calculation (mock)
const mortgageRate = ref(4.5);
const mortgagePayment = computed(() => {
  if (!apartment.value?.price) return 0;
  const price = apartment.value.price * 0.8; // 20% down payment
  const rate = mortgageRate.value / 100 / 12;
  const months = 20 * 12; // 20 years
  const payment =
    (price * rate * Math.pow(1 + rate, months)) /
    (Math.pow(1 + rate, months) - 1);
  return Math.round(payment);
});

// Download PDF
function downloadPDF() {
  if (!apartment.value) return;
  // In real implementation, this would call an API to generate PDF
  toast.add({
    title: "Загрузка",
    description: "PDF планировки загружается...",
    color: "neutral",
  });
}

function openApplicationForm() {
  // Scroll to contact form
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.scrollIntoView({ behavior: "smooth" });
  }
}

// Navigate to related apartment
function navigateToApartment(apt: ApartmentWithRelations) {
  navigateTo(`/real-estate/${apt.id}`);
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Loading State -->
    <div v-if="pending" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <UIcon
          name="i-lucide-loader-2"
          class="w-12 h-12 animate-spin text-neutral-400 mx-auto mb-4"
        />
        <p class="text-neutral-500 uppercase tracking-widest">Загрузка...</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="!apartment"
      class="min-h-screen flex items-center justify-center"
    >
      <div class="text-center">
        <UIcon
          name="i-lucide-home"
          class="w-16 h-16 text-neutral-300 mx-auto mb-4"
        />
        <p class="text-neutral-500 uppercase tracking-widest mb-4">
          Квартира не найдена
        </p>
        <UButton to="/real-estate" color="neutral" variant="outline">
          Вернуться к списку
        </UButton>
      </div>
    </div>

    <!-- Main Content - Sticky Layout -->
    <div v-else class="flex flex-col lg:flex-row min-h-screen">
      <!-- Left: Sticky Image (60% width) -->
      <div
        class="lg:w-[60%] lg:sticky lg:top-0 lg:h-[calc(100vh-80px)] bg-neutral-50 flex flex-col"
      >
        <!-- Top Bar -->

        <UButton
          to="/real-estate"
          color="neutral"
          variant="ghost"
          size="sm"
          class="gap-2 absolute top-2 left-2"
        >
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
          <span class="uppercase text-xs tracking-wider">В каталог</span>
        </UButton>

        <!-- Image Container - constrained to viewport -->
        <div
          class="flex-1 flex items-center justify-center p-4 lg:p-8 min-h-0 overflow-hidden"
        >
          <img
            :src="currentImage"
            :alt="`Квартира ${apartment.number}`"
            class="max-w-full max-h-[calc(100vh-240px)] object-contain"
          />
        </div>

        <!-- Image Switcher Tabs -->
        <div v-if="apartmentImages.length > 1" class="px-4 lg:px-8 pb-4">
          <div class="flex gap-2 justify-center">
            <button
              v-for="(img, idx) in apartmentImages"
              :key="idx"
              class="px-4 py-2 text-xs uppercase tracking-wider transition-all"
              :class="
                currentImageIndex === idx
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-500 hover:text-neutral-900 border border-neutral-200'
              "
              @click="currentImageIndex = idx"
            >
              {{ img.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Scrolling Content (40% width) -->
      <div class="lg:w-[40%] border-l border-neutral-200">
        <!-- Breadcrumbs -->
        <div class="px-6 py-4 border-b border-neutral-200">
          <ol
            class="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500"
          >
            <li class="text-neutral-900 font-medium">
              {{ apartment.project?.name || "ПРОЕКТ" }}
            </li>
            <li>/</li>
            <li class="text-neutral-900 font-medium">
              {{ apartment.object?.name || "ОБЪЕКТ" }}
            </li>
          </ol>
        </div>

        <!-- Main Info -->
        <div class="px-8 py-10 border-b border-neutral-200 bg-neutral-50">
          <!-- Room count large -->
          <div class="mb-2">
            <span
              class="text-6xl lg:text-7xl font-bold text-neutral-900 uppercase tracking-tight"
            >
              {{ apartment.rooms || "—" }}
            </span>
            <span
              class="text-2xl lg:text-3xl font-medium text-neutral-400 uppercase ml-2"
            >
              комн.
            </span>
          </div>
          <!-- Area -->
          <div class="text-4xl lg:text-5xl font-light text-neutral-400 mb-6">
            {{ apartment.area || "—" }} м²
          </div>
          <!-- Price -->
          <div
            class="text-3xl lg:text-4xl font-bold text-neutral-900 mb-8 tracking-tight"
          >
            {{ formatPrice(apartment.price) }}
          </div>

          <UButton
            color="neutral"
            size="xl"
            class="w-full rounded-none py-5 uppercase tracking-widest text-sm font-bold bg-neutral-900 hover:bg-neutral-800 text-white border-0 shadow-lg"
            @click="openBookingForm"
          >
            <UIcon name="i-lucide-phone" class="w-5 h-5 mr-3" />
            Забронировать
          </UButton>
        </div>

        <!-- Specifications List -->
        <div class="px-8 py-6">
          <div class="grid grid-cols-2 gap-y-6 gap-x-4">
            <div class="py-3 border-b border-neutral-200">
              <div
                class="text-[10px] uppercase tracking-widest text-neutral-400 mb-1"
              >
                Срок сдачи
              </div>
              <div class="text-lg font-semibold text-neutral-900">
                {{ formatCompletionDate(apartment.completionDate) }}
              </div>
            </div>
            <div class="py-3 border-b border-neutral-200">
              <div
                class="text-[10px] uppercase tracking-widest text-neutral-400 mb-1"
              >
                Дом
              </div>
              <div class="text-lg font-semibold text-neutral-900">
                {{ apartment.building || "—" }}
              </div>
            </div>
            <div class="py-3 border-b border-neutral-200">
              <div
                class="text-[10px] uppercase tracking-widest text-neutral-400 mb-1"
              >
                Подъезд
              </div>
              <div class="text-lg font-semibold text-neutral-900">
                {{ apartment.entrance || "—" }}
              </div>
            </div>
            <div class="py-3 border-b border-neutral-200">
              <div
                class="text-[10px] uppercase tracking-widest text-neutral-400 mb-1"
              >
                Этаж
              </div>
              <div class="text-lg font-semibold text-neutral-900">
                {{ apartment.floor || "—" }} / {{ apartment.floorTotal || "—" }}
              </div>
            </div>
            <div class="py-3 border-b border-neutral-200">
              <div
                class="text-[10px] uppercase tracking-widest text-neutral-400 mb-1"
              >
                Квартира №
              </div>
              <div class="text-lg font-semibold text-neutral-900">
                {{ apartment.number }}
              </div>
            </div>
            <div class="py-3 border-b border-neutral-200">
              <div
                class="text-[10px] uppercase tracking-widest text-neutral-400 mb-1"
              >
                Отделка
              </div>
              <div class="text-lg font-semibold text-neutral-900">
                {{ formatFinishing(apartment.finishing) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Download PDF -->

        <!-- Mortgage Section -->
        <div class="px-8 py-8 border-b border-neutral-200 bg-neutral-50">
          <h2
            class="text-2xl font-bold text-neutral-900 uppercase tracking-tight mb-6"
          >
            Ипотека
          </h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm uppercase tracking-wider text-neutral-500"
                >Ежемесячный платеж</span
              >
              <span class="text-xl font-bold text-neutral-900"
                >от {{ formatPrice(mortgagePayment) }} ₽/мес</span
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm uppercase tracking-wider text-neutral-500"
                >Ставка</span
              >
              <span class="text-xl font-bold text-neutral-900"
                >от {{ mortgageRate }}%</span
              >
            </div>
          </div>

          <p class="text-xs text-neutral-400 mt-6 leading-relaxed">
            Расчет является предварительным. Первоначальный взнос — от 20%, срок
            кредита — до 20 лет.
          </p>
        </div>

        <!-- Benefits -->
        <div class="px-8 py-8 border-b border-neutral-200">
          <h2
            class="text-xl font-bold text-neutral-900 uppercase tracking-tight mb-6"
          >
            Преимущества
          </h2>
          <div class="grid grid-cols-1 gap-4">
            <div
              v-for="benefit in benefits.slice(0, 4)"
              :key="benefit.text"
              class="flex items-center gap-4"
            >
              <div
                class="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center"
              >
                <UIcon :name="benefit.icon" class="w-5 h-5 text-neutral-700" />
              </div>
              <span class="text-base font-medium text-neutral-900">{{
                benefit.text
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Full-width sections below sticky layout - no padding -->
    <!-- Related Apartments -->
    <section
      v-if="relatedApartments.length > 0"
      class="w-full bg-neutral-100 py-16 px-6"
    >
      <div class="mx-auto">
        <!-- Large Title -->
        <h2
          class="text-5xl lg:text-7xl font-bold text-neutral-900 uppercase tracking-tight mb-12"
        >
          Похожие квартиры
        </h2>

        <!-- 3 Columns Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="apt in relatedApartments.slice(0, 3)"
            :key="apt.id"
            class="group bg-white border border-neutral-200 hover:shadow-2xl hover:-translate-y-2 hover:border-neutral-400 transition-all duration-300 cursor-pointer"
            @click="navigateToApartment(apt)"
          >
            <!-- Project & Object Badge -->
            <div
              class="flex items-center gap-3 px-4 py-3 border-b border-neutral-100"
            >
              <div
                class="w-8 h-8 rounded flex items-center justify-center"
                :class="getProjectColor(apt)"
              >
                <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-white" />
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

            <!-- Image with zoom -->
            <div
              class="relative h-56 bg-neutral-100 overflow-hidden group/image"
            >
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

            <!-- Info -->
            <div class="p-4">
              <!-- Rooms and Area -->
              <div class="flex items-baseline gap-2 mb-3">
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
                class="text-2xl font-bold text-neutral-900 mb-4 uppercase tracking-wider"
              >
                {{ formatPrice(apt.price) }}
              </div>

              <!-- Details Row -->
              <div
                class="flex items-center justify-between text-center border-t border-neutral-100 pt-3"
              >
                <div class="flex-1">
                  <div
                    class="text-[10px] uppercase tracking-widest text-neutral-400 mb-1"
                  >
                    СРОК СДАЧИ
                  </div>
                  <div
                    class="text-xs font-semibold text-neutral-900 uppercase tracking-wide"
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
                <div class="w-px h-8 bg-neutral-200"></div>
                <div class="flex-1">
                  <div
                    class="text-[10px] uppercase tracking-widest text-neutral-400 mb-1"
                  >
                    ДОМ
                  </div>
                  <div
                    class="text-xs font-semibold text-neutral-900 uppercase tracking-wide"
                  >
                    {{ apt.building || "—" }}
                  </div>
                </div>
                <div class="w-px h-8 bg-neutral-200"></div>
                <div class="flex-1">
                  <div
                    class="text-[10px] uppercase tracking-widest text-neutral-400 mb-1"
                  >
                    ПОД.
                  </div>
                  <div
                    class="text-xs font-semibold text-neutral-900 uppercase tracking-wide"
                  >
                    {{ apt.entrance || "—" }}
                  </div>
                </div>
                <div class="w-px h-8 bg-neutral-200"></div>
                <div class="flex-1">
                  <div
                    class="text-[10px] uppercase tracking-widest text-neutral-400 mb-1"
                  >
                    ЭТАЖ
                  </div>
                  <div
                    class="text-xs font-semibold text-neutral-900 uppercase tracking-wide"
                  >
                    {{ apt.floor || "—" }}/{{ apt.floorTotal || "—" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- News Section - using component -->
    <NewsSection />

    <!-- Footer Contact - minimal -->
    <ContactForm
      class="text-left"
      :show-phone="true"
      :show-email="true"
      :show-address="true"
    />

    <!-- Booking Slideover -->
    <USlideover
      v-model:open="isBookingOpen"
      :ui="{ width: 'max-w-md' }"
      class="bg-white"
    >
      <template #content>
        <div v-if="apartment" class="h-full flex flex-col bg-white">
          <!-- Header - Dark -->
          <div class="flex items-center justify-between p-6 bg-neutral-900">
            <h2 class="text-xl font-bold text-white uppercase tracking-widest">
              Бронирование
            </h2>
            <button
              class="w-10 h-10 flex items-center justify-center text-white hover:text-neutral-300 transition-colors"
              @click="isBookingOpen = false"
            >
              <UIcon name="i-lucide-x" class="w-6 h-6" />
            </button>
          </div>

          <!-- Apartment Mini Card -->
          <div class="p-6 border-b border-neutral-200 bg-neutral-50">
            <div class="flex gap-4">
              <div
                class="w-24 h-24 bg-white border border-neutral-200 flex items-center justify-center"
              >
                <img
                  :src="getApartmentImage(apartment)"
                  class="max-w-full max-h-full object-contain"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div
                  class="text-[10px] uppercase tracking-widest text-neutral-400 mb-1"
                >
                  {{ apartment.project?.name || "ПРОЕКТ" }}
                </div>
                <div class="flex items-baseline gap-2 mb-1">
                  <span class="text-2xl font-bold text-neutral-900 uppercase">
                    {{ apartment.rooms || "—" }}
                  </span>
                  <span class="text-sm text-neutral-400 uppercase">комн.</span>
                  <span class="text-sm text-neutral-400"
                    >{{ apartment.area || "—" }} м²</span
                  >
                </div>
                <div class="text-xl font-bold text-neutral-900 mb-3">
                  {{ formatPrice(apartment.price) }}
                </div>
                <div
                  class="flex gap-4 text-[10px] uppercase tracking-wider text-neutral-400"
                >
                  <span>{{
                    formatCompletionDate(apartment.completionDate)
                  }}</span>
                  <span>Дом {{ apartment.building || "—" }}</span>
                  <span>Под. {{ apartment.entrance || "—" }}</span>
                  <span
                    >Этаж {{ apartment.floor || "—" }}/{{
                      apartment.floorTotal || "—"
                    }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Form -->
          <div class="flex-1 p-6 space-y-6">
            <div>
              <label
                class="block text-[10px] uppercase tracking-widest text-neutral-400 mb-3"
              >
                Ваше имя
              </label>
              <UInput
                v-model="bookingName"
                size="lg"
                placeholder="Иван Иванов"
                class="w-full rounded-none border-neutral-300 focus:border-neutral-900"
                :ui="{ rounded: 'rounded-none' }"
              />
            </div>

            <div>
              <label
                class="block text-[10px] uppercase tracking-widest text-neutral-400 mb-3"
              >
                Телефон
              </label>
              <UInput
                v-model="bookingPhone"
                size="lg"
                placeholder="+7 (999) 999-99-99"
                class="w-full rounded-none border-neutral-300 focus:border-neutral-900"
                :ui="{ rounded: 'rounded-none' }"
              />
            </div>

            <div class="flex items-start gap-3 pt-2">
              <UCheckbox v-model="bookingAgreed" class="mt-0.5" />
              <p class="text-xs text-neutral-500 leading-relaxed">
                Я подтверждаю ознакомление и даю свое согласие на обработку
                персональных данных
              </p>
            </div>

            <UButton
              color="neutral"
              size="lg"
              class="w-full rounded-none py-4 uppercase tracking-widest text-sm font-bold bg-neutral-900 hover:bg-neutral-800 text-white border-0"
              :loading="bookingSubmitting"
              @click="submitBooking"
            >
              Отправить заявку
            </UButton>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
