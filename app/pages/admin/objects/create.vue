<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        @click="navigateTo('/admin/objects')"
      />
      <h2 class="text-sm font-bold uppercase tracking-widest text-neutral-900">
        Создать объект
      </h2>
    </div>

    <UCard class="border border-neutral-200 shadow-none">
      <UForm
        :state="state"
        :validate="validate"
        class="space-y-8"
        @submit="onSubmit"
      >
        <!-- Основная информация -->
        <div class="space-y-6">
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2"
          >
            Основная информация
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField
              label="Проект"
              name="projectId"
              required
              description="Выберите проект, к которому относится объект"
            >
              <div class="flex flex-col gap-2">
                <div
                  v-if="state.projectId"
                  class="flex items-center gap-3 p-3 border border-primary/20 bg-primary/5 rounded-lg group"
                >
                  <div
                    class="bg-white p-2 rounded shadow-sm border border-neutral-100"
                  >
                    <UIcon
                      name="i-lucide-folder"
                      class="w-5 h-5 text-primary"
                    />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-bold text-neutral-900">
                      {{ selectedProjectName }}
                    </p>
                    <p
                      class="text-[10px] text-neutral-400 uppercase tracking-tighter"
                    >
                      ID: {{ state.projectId }}
                    </p>
                  </div>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    icon="i-lucide-x"
                    @click="
                      state.projectId = '';
                      selectedProjectName = '';
                    "
                  />
                </div>

                <UButton
                  v-else
                  color="neutral"
                  variant="outline"
                  size="lg"
                  class="w-full justify-between"
                  @click="isProjectModalOpen = true"
                >
                  <span>Выберите проект...</span>
                  <UIcon
                    name="i-lucide-search"
                    class="w-4 h-4 text-neutral-400"
                  />
                </UButton>
              </div>

              <AdminProjectSelectModal
                v-model:open="isProjectModalOpen"
                v-model="state.projectId"
                @select="onProjectSelect"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField
              label="Название"
              name="name"
              required
              description="Официальное название объекта"
            >
              <UInput
                v-model="state.name"
                size="lg"
                class="w-full"
                placeholder="ЖК Солнечный"
                @update:model-value="generateSlug"
              />
            </UFormField>

            <UFormField
              label="Slug"
              name="slug"
              required
              description="URL-идентификатор"
            >
              <UInput
                v-model="state.slug"
                size="lg"
                class="w-full"
                placeholder="zhk-solnechnyy"
                @input="onSlugInput"
              >
                <template #trailing>
                  <UButton
                    v-if="isSlugManual"
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-refresh-cw"
                    size="xs"
                    title="Включить автогенерацию"
                    @click="resetSlug"
                  />
                </template>
              </UInput>
            </UFormField>
          </div>

          <UFormField
            label="Полное описание"
            name="description"
            description="Подробное описание преимуществ и характеристик"
          >
            <UTextarea
              v-model="state.description"
              size="lg"
              class="w-full"
              placeholder="Введите подробное описание..."
              :rows="6"
            />
          </UFormField>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField
              label="Заголовок концепции"
              name="conceptTitle"
              description="Заголовок для блока философии/концепции"
            >
              <UInput
                v-model="state.conceptTitle"
                size="lg"
                class="w-full"
                placeholder="Философия жизни в балансе"
              />
            </UFormField>
          </div>

          <UFormField
            label="Текст концепции"
            name="conceptText"
            description="Текст описывающий идею и философию проекта (поддерживает HTML)"
          >
            <UTextarea
              v-model="state.conceptText"
              size="lg"
              class="w-full"
              placeholder="Опишите концепцию проекта..."
              :rows="6"
            />
          </UFormField>
        </div>

        <!-- Местоположение -->
        <div class="space-y-6 pt-4">
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2"
          >
            Местоположение
          </h3>
          <UFormField
            label="Адрес"
            name="address"
            description="Полный адрес объекта"
          >
            <UInput
              v-model="state.address"
              size="lg"
              class="w-full"
              placeholder="г. Москва, ул. Примерная, д. 1"
            />
          </UFormField>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="space-y-6">
              <UFormField
                label="Широта (Latitude)"
                name="latitude"
                description="Координата широты"
              >
                <UInput
                  v-model.number="state.latitude"
                  size="lg"
                  class="w-full"
                  type="number"
                  step="0.000001"
                  placeholder="55.7558"
                />
              </UFormField>

              <UFormField
                label="Долгота (Longitude)"
                name="longitude"
                description="Координата долготы"
              >
                <UInput
                  v-model.number="state.longitude"
                  size="lg"
                  class="w-full"
                  type="number"
                  step="0.000001"
                  placeholder="37.6173"
                />
              </UFormField>

              <p class="text-xs text-neutral-400 italic pt-2">
                Вы можете ввести координаты вручную или выбрать точку на карте
                справа.
              </p>
            </div>

            <div class="lg:col-span-2">
              <AdminMapPicker
                ref="mapPicker"
                :lat="state.latitude"
                :lng="state.longitude"
                @update:coords="
                  (c) => {
                    state.latitude = c.lat;
                    state.longitude = c.lng;
                  }
                "
              />
            </div>
          </div>
        </div>

        <!-- Характеристики -->
        <div class="space-y-6 pt-4">
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2"
          >
            Характеристики
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UFormField
              label="Срок сдачи"
              name="completionDate"
              description="Дата завершения строительства (YYYY-MM-DD или текст)"
            >
              <UInput
                v-model="state.completionDate"
                size="lg"
                class="w-full"
                placeholder="2026-12-31 или IV квартал 2028"
              />
            </UFormField>

            <UFormField
              label="Этажность"
              name="floors"
              description="Количество этажей"
            >
              <UInput
                v-model.number="state.floors"
                size="lg"
                class="w-full"
                type="number"
                placeholder="16"
              />
            </UFormField>

            <UFormField
              label="Отделка"
              name="finishing"
              description="Тип отделки"
            >
              <USelect
                v-model="state.finishing"
                :items="[
                  { label: 'Не выбрано', value: undefined },
                  { label: 'Без отделки', value: 'NONE' },
                  { label: 'Предчистовая', value: 'ROUGH' },
                  { label: 'Чистовая', value: 'CLEAN' },
                  { label: 'Белый куб', value: 'WHITE_CUBE' },
                  { label: 'С ремонтом', value: 'TURNKEY' },
                  { label: 'Дизайнерская', value: 'DESIGNER' },
                ]"
                size="lg"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <!-- Настройки -->
        <div class="space-y-6 pt-4">
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2"
          >
            Настройки отображения
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <UFormField
              label="Порядок сортировки"
              name="sortOrder"
              description="Приоритет в списке"
            >
              <UInput
                v-model.number="state.sortOrder"
                size="lg"
                class="w-full"
                type="number"
                placeholder="0"
              />
            </UFormField>

            <div class="flex items-center pt-4">
              <UCheckbox
                v-model="state.isActive"
                label="Объект активен и виден на сайте"
              />
            </div>
          </div>
        </div>

        <!-- Фото -->
        <div class="space-y-6 pt-4">
          <h3
            class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2"
          >
            Медиа материалы
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <UFormField
              label="Баннер (Hero)"
              name="bannerId"
              description="Главное изображение на первом экране"
            >
              <AdminMediaUploader v-model="state.bannerId" />
            </UFormField>

            <UFormField
              label="Главное фото"
              name="mainPhotoId"
              description="Изображение для блока концепции"
            >
              <AdminMediaUploader v-model="state.mediaIds" multiple />
            </UFormField>
          </div>
        </div>

        <!-- Особенности проекта -->
        <div class="space-y-6 pt-8">
          <div
            class="flex items-center justify-between border-b border-neutral-100 pb-2"
          >
            <h3
              class="text-xs font-bold uppercase tracking-wider text-neutral-500"
            >
              Особенности проекта
            </h3>
            <UButton
              color="primary"
              variant="ghost"
              size="xs"
              icon="i-lucide-plus"
              label="Добавить особенность"
              @click="addFeature"
            />
          </div>

          <div
            v-if="state.features.length === 0"
            class="text-center py-8 border-2 border-dashed border-neutral-100 rounded-xl"
          >
            <p class="text-xs text-neutral-400 uppercase tracking-widest">
              Особенности не добавлены
            </p>
          </div>

          <div class="space-y-4">
            <div
              v-for="(feature, index) in state.features"
              :key="index"
              class="p-6 border border-neutral-200 rounded-xl space-y-4 relative group"
            >
              <UButton
                color="red"
                variant="ghost"
                size="xs"
                icon="i-lucide-trash-2"
                class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                @click="removeFeature(index)"
              />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <UFormField label="Заголовок">
                    <UInput
                      v-model="feature.title"
                      placeholder="Твое место силы"
                    />
                  </UFormField>
                  <UFormField label="Описание">
                    <UTextarea
                      v-model="feature.description"
                      placeholder="Краткое описание особенности..."
                      :rows="3"
                    />
                  </UFormField>
                </div>
                <UFormField label="Изображение">
                  <AdminMediaUploader v-model="feature.mediaIds" multiple />
                </UFormField>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <UButton
            color="neutral"
            variant="ghost"
            @click="navigateTo('/admin/objects')"
          >
            Отмена
          </UButton>
          <UButton type="submit" color="primary" :loading="loading">
            Создать объект
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { objectsService } from "~/api/objects.service";
import { projectsService } from "~/api/projects.service";
import type { CreateObjectDto, FinishingType } from "~/api/types";

definePageMeta({
  layout: "admin",
});

const loading = ref(false);
const isSlugManual = ref(false);
const mapPicker = ref<any>(null);
const isProjectModalOpen = ref(false);
const selectedProjectName = ref("");
const toast = useToast();

const { data: projects } = await useAsyncData("projects-list", () =>
  projectsService.getAll(),
);

interface MediaItem {
  id: string;
  url: string;
  type: string;
}

const state = reactive<{
  name: string;
  slug: string;
  description: string;
  conceptTitle: string;
  conceptText: string;
  address: string;
  completionDate?: string;
  floors?: number;
  finishing?: FinishingType;
  latitude: number | undefined;
  longitude: number | undefined;
  isActive: boolean;
  sortOrder: number;
  projectId: string;
  bannerId: string | MediaItem | undefined;
  mediaIds: (string | MediaItem)[]; // main photo - can be IDs or full objects
  features: {
    title: string;
    description: string;
    mediaIds: (string | MediaItem)[];
  }[];
}>({
  name: "",
  slug: "",
  description: "",
  conceptTitle: "",
  conceptText: "",
  address: "",
  completionDate: "",
  floors: undefined,
  finishing: undefined,
  latitude: undefined,
  longitude: undefined,
  isActive: true,
  sortOrder: 0,
  projectId: "",
  bannerId: undefined,
  mediaIds: [],
  features: [],
});

const addFeature = () => {
  state.features.push({ title: "", description: "", mediaIds: [] });
};

const removeFeature = (index: number) => {
  state.features.splice(index, 1);
};

// Helper to extract ID from media object or string
function extractMediaId(
  value: string | MediaItem | undefined,
): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value.id;
}

// Helper to extract IDs from media array
function extractMediaIds(values: (string | MediaItem)[] | undefined): string[] {
  if (!values || !Array.isArray(values)) return [];
  return values.map((v) => (typeof v === "string" ? v : v.id)).filter(Boolean);
}

function onProjectSelect(project: any) {
  selectedProjectName.value = project.name;
  state.projectId = project.id;
}

const validate = (state: any) => {
  const errors: any[] = [];
  if (!state.name)
    errors.push({ path: "name", message: "Название обязательно" });
  if (!state.slug) errors.push({ path: "slug", message: "Slug обязателен" });
  if (!state.projectId)
    errors.push({ path: "projectId", message: "Необходимо выбрать проект" });
  if (state.slug && !/^[a-z0-9-]+$/.test(state.slug)) {
    errors.push({
      path: "slug",
      message: "Slug может содержать только латиницу, цифры и дефисы",
    });
  }

  const lat = Number(state.latitude);
  const lng = Number(state.longitude);

  if (
    state.latitude !== undefined &&
    state.latitude !== "" &&
    (isNaN(lat) || lat < -90 || lat > 90)
  ) {
    errors.push({
      path: "latitude",
      message: "Широта должна быть числом от -90 до 90",
    });
  }
  if (
    state.longitude !== undefined &&
    state.longitude !== "" &&
    (isNaN(lng) || lng < -180 || lng > 180)
  ) {
    errors.push({
      path: "longitude",
      message: "Долгота должна быть числом от -180 до 180",
    });
  }
  return errors;
};

function cyrillicToSlug(text: string) {
  const dictionary: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ь: "",
    ы: "y",
    ъ: "",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return text
    .toLowerCase()
    .split("")
    .map((char) => dictionary[char] || char)
    .join("")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function generateSlug() {
  if (!isSlugManual.value && state.name) {
    state.slug = cyrillicToSlug(state.name);
  }
}

function onSlugInput() {
  isSlugManual.value = true;
}

function resetSlug() {
  isSlugManual.value = false;
  generateSlug();
}

async function onSubmit() {
  const errors = validate(state);
  if (errors.length > 0) {
    console.error("Validation errors:", errors);
    return;
  }

  loading.value = true;
  try {
    // Build DTO with extracted IDs from media objects
    const dto: CreateObjectDto = {
      name: state.name,
      slug: state.slug,
      description: state.description,
      conceptTitle: state.conceptTitle,
      conceptText: state.conceptText,
      address: state.address,
      completionDate: state.completionDate,
      floors: state.floors,
      finishing: state.finishing,
      latitude: state.latitude,
      longitude: state.longitude,
      isActive: state.isActive,
      sortOrder: state.sortOrder,
      projectId: state.projectId,
      bannerId: extractMediaId(state.bannerId),
      mediaIds: extractMediaIds(state.mediaIds),
      features: state.features.map((f) => ({
        title: f.title,
        description: f.description,
        mediaIds: extractMediaIds(f.mediaIds as (string | MediaItem)[]),
      })),
    };

    // DEBUG: Log DTO being sent to server
    console.log(
      "[ObjectCreate] DTO being sent to server:",
      JSON.parse(JSON.stringify(dto)),
    );

    await objectsService.create(dto);

    toast.add({
      title: "Успех",
      description: "Объект успешно создан",
      color: "primary",
    });

    // После успеха возвращаемся к списку
    navigateTo("/admin/objects");
  } catch (error: any) {
    console.error("Failed to create object:", error);
    toast.add({
      title: "Ошибка",
      description: error.message || "Не удалось создать объект",
      color: "primary",
    });
  } finally {
    loading.value = false;
  }
}
</script>
