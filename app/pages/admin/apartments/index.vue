<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-bold uppercase tracking-widest text-neutral-900">
        Квартиры
      </h2>
      <UButton
        color="neutral"
        class="text-xs uppercase tracking-wider"
        @click="navigateTo('/admin/apartments/create')"
      >
        <UIcon name="i-lucide-plus" class="w-4 h-4 mr-1" />
        Добавить квартиру
      </UButton>
    </div>

    <!-- Фильтры -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <UInput
          v-model="search"
          placeholder="Поиск по номеру..."
          icon="i-lucide-search"
          class="flex-1"
          size="lg"
        />
        <USelectMenu
          v-model="filterProject"
          :items="projectOptions"
          placeholder="Без фильтра по проекту"
          size="lg"
          class="w-full sm:w-64"
          option-attribute="label"
          value-attribute="value"
        />
        <USelectMenu
          v-model="filterObject"
          :items="objectOptions"
          :disabled="filterProject.value?.value === 'ALL'"
          placeholder="Без фильтра по объекту"
          size="lg"
          class="w-full sm:w-64"
          option-attribute="label"
          value-attribute="value"
        />
      </div>
      <div class="flex flex-wrap gap-4">
        <USelectMenu
          v-model="filterRooms"
          :items="roomsOptions"
          placeholder="Любое кол-во комнат"
          size="lg"
          class="w-full sm:w-48"
          option-attribute="label"
          value-attribute="value"
        />
        <USelectMenu
          v-model="filterAvailability"
          :items="availabilityOptions"
          placeholder="Любой статус"
          size="lg"
          class="w-full sm:w-48"
          option-attribute="label"
          value-attribute="value"
        />
      </div>
    </div>

    <UCard class="border border-neutral-200 shadow-none" :ui="{ body: 'p-0' }">
      <div
        v-if="!filteredApartments?.length"
        class="text-center py-24 flex flex-col items-center justify-center bg-neutral-50/30"
      >
        <div
          class="bg-white p-4 rounded-full shadow-sm border border-neutral-100 mb-4"
        >
          <UIcon name="i-lucide-home" class="w-12 h-12 text-neutral-300" />
        </div>
        <p class="text-sm font-bold uppercase tracking-wider text-neutral-900">
          {{
            isAnyFilterActive ? "Квартиры не найдены" : "Список квартир пуст"
          }}
        </p>
        <p
          class="text-xs mt-2 text-neutral-400 max-w-60 leading-relaxed uppercase"
        >
          {{
            isAnyFilterActive
              ? "Попробуйте изменить параметры фильтрации"
              : "Добавьте первую квартиру, чтобы начать продажи."
          }}
        </p>
        <UButton
          v-if="!isAnyFilterActive"
          color="primary"
          class="mt-6 text-xs uppercase tracking-wider px-6"
          @click="navigateTo('/admin/apartments/create')"
        >
          Создать квартиру
        </UButton>
      </div>

      <UTable
        v-else
        :data="filteredApartments"
        :columns="columns"
        class="w-full"
      >
        <template #photos-cell="{ row }">
          <div class="flex gap-1">
            <div
              class="w-12 h-12 rounded overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0"
            >
              <img
                v-if="row.original.layoutPhoto?.url"
                :src="`http://localhost:4200${row.original.layoutPhoto.url}`"
                alt="Layout"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-neutral-300"
              >
                <UIcon name="i-lucide-image" class="w-4 h-4" />
              </div>
            </div>
            <div
              class="w-12 h-12 rounded overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0"
            >
              <img
                v-if="row.original.floorPlanPhoto?.url"
                :src="`http://localhost:4200${row.original.floorPlanPhoto.url}`"
                alt="Floor plan"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-neutral-300"
              >
                <UIcon name="i-lucide-image" class="w-4 h-4" />
              </div>
            </div>
            <div
              class="w-12 h-12 rounded overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0"
            >
              <img
                v-if="row.original.masterPlanPhoto?.url"
                :src="`http://localhost:4200${row.original.masterPlanPhoto.url}`"
                alt="Master plan"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-neutral-300"
              >
                <UIcon name="i-lucide-image" class="w-4 h-4" />
              </div>
            </div>
          </div>
        </template>

        <template #number-cell="{ row }">
          <span class="font-bold text-neutral-900"
            >№ {{ row.original.number }}</span
          >
        </template>

        <template #projectName-cell="{ row }">
          <span class="text-neutral-600 text-sm">
            {{ (row.original as any).project?.name || "—" }}
          </span>
        </template>

        <template #objectName-cell="{ row }">
          <span class="text-neutral-600 text-sm">
            {{ (row.original as any).object?.name || "—" }}
          </span>
        </template>

        <template #price-cell="{ row }">
          <span class="font-medium text-neutral-900">{{
            formatPrice(row.original.price)
          }}</span>
        </template>

        <template #area-cell="{ row }">
          <span class="text-neutral-600">{{ row.original.area }} м²</span>
        </template>

        <template #rooms-cell="{ row }">
          <span class="text-neutral-600">{{ row.original.rooms }}-к</span>
        </template>

        <template #floor-cell="{ row }">
          <span class="text-neutral-600"
            >{{ row.original.floor }} / {{ row.original.floorTotal }}</span
          >
        </template>

        <template #isAvailable-cell="{ row }">
          <UBadge
            :color="row.original.isAvailable ? 'primary' : 'neutral'"
            variant="subtle"
            size="xs"
          >
            {{ row.original.isAvailable ? "В продаже" : "Бронь/Продано" }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
              size="xs"
              @click="navigateTo(`/admin/apartments/${row.original.id}`)"
            />
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-trash-2"
              size="xs"
              @click="confirmDelete(row.original)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal
      v-model:open="isDeleteModalOpen"
      title="Подтверждение удаления"
      description="Это действие нельзя отменить."
    >
      <template #body>
        <p class="text-neutral-600">
          Вы уверены, что хотите удалить квартиру
          <strong>№ {{ apartmentToDelete?.number }}</strong
          >?
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            @click="isDeleteModalOpen = false"
          >
            Отмена
          </UButton>
          <UButton
            color="primary"
            :loading="isDeleting"
            @click="deleteApartment"
          >
            Удалить
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { apartmentsService } from "~/api/apartments.service";
import { projectsService } from "~/api/projects.service";
import { objectsService } from "~/api/objects.service";
import type { Apartment as IApartment } from "~/api/types";

definePageMeta({
  layout: "admin",
});

const toast = useToast();
const search = ref("");

const { data: projectsData } = await useAsyncData("projects-list", () =>
  projectsService.getAll(),
);

const { data: objectsData } = await useAsyncData("objects-list", () =>
  objectsService.getAll(),
);

const projectOptions = computed(() => {
  const options = [{ label: "Все проекты", value: "ALL" }];
  if (projectsData.value) {
    projectsData.value.forEach((p) => {
      options.push({ label: p.name, value: p.id });
    });
  }
  return options;
});

const objectOptions = computed(() => {
  const options = [{ label: "Все объекты", value: "ALL" }];
  if (objectsData.value) {
    let filtered = objectsData.value;
    if (filterProject.value?.value !== "ALL") {
      filtered = (filtered as any[]).filter(
        (o) => o.projectId === filterProject.value?.value,
      );
    }
    filtered.forEach((o) => {
      options.push({ label: o.name, value: o.id });
    });
  }
  return options;
});

const roomsOptions = [
  { label: "Все комнаты", value: "ALL" },
  { label: "Студия", value: 0 },
  { label: "1-комнатная", value: 1 },
  { label: "2-комнатная", value: 2 },
  { label: "3-комнатная", value: 3 },
  { label: "4+ комнат", value: 4 },
];

const availabilityOptions = [
  { label: "Все статусы", value: "ALL" },
  { label: "В продаже", value: "AVAILABLE" },
  { label: "Забронировано/Продано", value: "UNAVAILABLE" },
];

const filterProject = ref(projectOptions.value[0]);
const filterObject = ref(objectOptions.value[0]);
const filterRooms = ref(roomsOptions[0]);
const filterAvailability = ref(availabilityOptions[0]);

const columns = [
  { id: "photos", accessorKey: "photos", header: "Фото" },
  { id: "number", accessorKey: "number", header: "Номер" },
  { id: "projectName", accessorKey: "projectName", header: "Проект" },
  { id: "objectName", accessorKey: "objectName", header: "Объект" },
  { id: "rooms", accessorKey: "rooms", header: "Комнат" },
  { id: "area", accessorKey: "area", header: "Площадь" },
  { id: "floor", accessorKey: "floor", header: "Этаж" },
  { id: "price", accessorKey: "price", header: "Цена" },
  { id: "isAvailable", accessorKey: "isAvailable", header: "Статус" },
  { id: "actions", accessorKey: "actions", header: "", width: "100px" },
];

const { data: apartments, refresh } = await useAsyncData("apartments", () =>
  apartmentsService.getAll(),
);

const filteredApartments = computed(() => {
  if (!apartments.value) return [];

  const apartmentsWithRelations = apartments.value.map((apt) => {
    const project = projectsData.value?.find((p) => p.id === apt.projectId);
    const object = objectsData.value?.find((o) => o.id === apt.objectId);
    return { ...apt, project, object };
  });

  return apartmentsWithRelations.filter((apt) => {
    const matchesSearch = apt.number
      .toLowerCase()
      .includes(search.value.toLowerCase());
    const matchesProject =
      filterProject.value?.value === "ALL" ||
      apt.projectId === filterProject.value?.value;
    const matchesObject =
      filterObject.value?.value === "ALL" ||
      apt.objectId === filterObject.value?.value;

    let matchesRooms = true;
    if (filterRooms.value?.value !== "ALL") {
      const roomValue = Number(filterRooms.value?.value);
      if (roomValue === 4) {
        matchesRooms = (apt.rooms || 0) >= 4;
      } else {
        matchesRooms = apt.rooms === roomValue;
      }
    }

    const matchesAvailability =
      filterAvailability.value?.value === "ALL" ||
      (filterAvailability.value?.value === "AVAILABLE" && apt.isAvailable) ||
      (filterAvailability.value?.value === "UNAVAILABLE" && !apt.isAvailable);

    return (
      matchesSearch &&
      matchesProject &&
      matchesObject &&
      matchesRooms &&
      matchesAvailability
    );
  });
});

const isAnyFilterActive = computed(() => {
  return (
    search.value !== "" ||
    filterProject.value?.value !== "ALL" ||
    filterObject.value?.value !== "ALL" ||
    filterRooms.value?.value !== "ALL" ||
    filterAvailability.value?.value !== "ALL"
  );
});

// Watch for project change to reset object filter
watch(filterProject, () => {
  filterObject.value = objectOptions.value[0];
});

const isDeleteModalOpen = ref(false);
const apartmentToDelete = ref<IApartment | null>(null);
const isDeleting = ref(false);

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
}

function confirmDelete(apt: IApartment) {
  apartmentToDelete.value = apt;
  isDeleteModalOpen.value = true;
}

async function deleteApartment() {
  if (!apartmentToDelete.value) return;

  isDeleting.value = true;
  try {
    await apartmentsService.delete(apartmentToDelete.value.id);
    toast.add({
      title: "Успех",
      description: "Квартира успешно удалена",
      color: "primary",
    });
    await refresh();
  } catch (error: any) {
    console.error("Failed to delete apartment:", error);
    toast.add({
      title: "Ошибка",
      description: error.message || "Не удалось удалить квартиру",
      color: "primary",
    });
  } finally {
    isDeleting.value = false;
    isDeleteModalOpen.value = false;
    apartmentToDelete.value = null;
  }
}
</script>
