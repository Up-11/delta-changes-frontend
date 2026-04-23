<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-bold uppercase tracking-[0.1em] text-neutral-900">
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

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 items-center">
      <UInput
        v-model="filters.search"
        placeholder="Поиск по номеру..."
        icon="i-lucide-search"
        size="sm"
        color="neutral"
        class="w-64"
      />
      <USelect
        v-model="filters.projectId"
        :options="projectOptions"
        placeholder="Проект"
        size="sm"
        color="neutral"
        class="w-48"
      />
      <USelect
        v-model="filters.objectId"
        :options="objectOptions"
        placeholder="Объект (дом)"
        size="sm"
        color="neutral"
        class="w-48"
      />
      <USelect
        v-model="filters.isAvailable"
        :options="availabilityOptions"
        placeholder="Статус"
        size="sm"
        color="neutral"
        class="w-40"
      />
      <UButton
        v-if="hasActiveFilters"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="resetFilters"
      >
        <UIcon name="i-lucide-x" class="w-4 h-4 mr-1" />
        Сбросить
      </UButton>
    </div>

    <!-- Apartments Table -->
    <UCard class="border border-neutral-200 shadow-none">
      <div v-if="loading" class="flex justify-center py-12">
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-neutral-400"
        />
      </div>

      <div
        v-else-if="filteredApartments.length === 0"
        class="text-center py-16 text-neutral-400"
      >
        <UIcon name="i-lucide-door-open" class="w-16 h-16 mx-auto mb-4" />
        <p class="text-sm uppercase tracking-wider">Нет квартир</p>
        <p class="text-xs mt-2 text-neutral-300">
          {{
            hasActiveFilters
              ? "Попробуйте изменить фильтры"
              : "Добавьте первую квартиру"
          }}
        </p>
      </div>

      <UTable
        v-else
        :rows="filteredApartments"
        :columns="columns"
        class="w-full"
      >
        <template #number-data="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-neutral-900">№ {{ row.number }}</span>
            <span v-if="row.building" class="text-xs text-neutral-500">
              Корпус {{ row.building }}
              <span v-if="row.entrance">, подъезд {{ row.entrance }}</span>
            </span>
          </div>
        </template>

        <template #rooms-data="{ row }">
          <span class="text-neutral-600">
            {{ row.rooms ? `${row.rooms}-комн.` : "—" }}
          </span>
        </template>

        <template #area-data="{ row }">
          <span class="text-neutral-600">{{
            row.area ? `${row.area} м²` : "—"
          }}</span>
        </template>

        <template #floor-data="{ row }">
          <span class="text-neutral-600"
            >{{ row.floor }} / {{ row.floorTotal }}</span
          >
        </template>

        <template #price-data="{ row }">
          <span class="font-medium text-neutral-900">
            {{ formatPrice(row.price) }}
          </span>
        </template>

        <template #object-data="{ row }">
          <div class="flex flex-col">
            <span class="text-sm text-neutral-700">{{
              row.object?.name || "—"
            }}</span>
            <span class="text-xs text-neutral-500">{{
              row.project?.name || "—"
            }}</span>
          </div>
        </template>

        <template #isAvailable-data="{ row }">
          <UBadge
            :color="row.isAvailable ? 'green' : 'red'"
            variant="soft"
            size="xs"
            class="uppercase text-[10px] tracking-wider"
          >
            {{ row.isAvailable ? "В продаже" : "Продана" }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              @click="openEditModal(row)"
            >
              <UIcon name="i-lucide-pencil" class="w-4 h-4" />
            </UButton>
            <UButton
              color="red"
              variant="ghost"
              size="xs"
              @click="confirmDelete(row)"
            >
              <UIcon name="i-lucide-trash-2" class="w-4 h-4" />
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Edit Modal -->
    <UModal v-model="isEditModalOpen" :ui="{ width: 'max-w-2xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold uppercase tracking-wider">
              Редактировать квартиру
            </h3>
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              @click="isEditModalOpen = false"
            >
              <UIcon name="i-lucide-x" class="w-5 h-5" />
            </UButton>
          </div>
        </template>

        <UForm :state="editForm" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Номер квартиры" required>
              <UInput
                v-model="editForm.number"
                placeholder="155"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Цена" required>
              <UInput
                v-model.number="editForm.price"
                type="number"
                placeholder="5000000"
                color="neutral"
              />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Проект" required>
              <USelect
                v-model="editForm.projectId"
                :options="projectOptions"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Объект (дом)" required>
              <USelect
                v-model="editForm.objectId"
                :options="objectOptions"
                color="neutral"
              />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <UFormGroup label="Площадь (м²)">
              <UInput
                v-model.number="editForm.area"
                type="number"
                placeholder="45"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Комнат">
              <UInput
                v-model.number="editForm.rooms"
                type="number"
                placeholder="2"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Статус">
              <USelect
                v-model="editForm.isAvailable"
                :options="availabilityOptions"
                color="neutral"
              />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <UFormGroup label="Корпус">
              <UInput
                v-model="editForm.building"
                placeholder="1"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Подъезд">
              <UInput
                v-model="editForm.entrance"
                placeholder="4"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Этаж" required>
              <UInput
                v-model.number="editForm.floor"
                type="number"
                placeholder="3"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Всего этажей" required>
              <UInput
                v-model.number="editForm.floorTotal"
                type="number"
                placeholder="16"
                color="neutral"
              />
            </UFormGroup>
          </div>

          <UFormGroup label="Тип отделки">
            <USelect
              v-model="editForm.finishing"
              :options="finishingOptions"
              color="neutral"
            />
          </UFormGroup>

          <UFormGroup label="Срок сдачи">
            <UInput
              v-model="editForm.completionDate"
              type="date"
              color="neutral"
            />
          </UFormGroup>
        </UForm>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isEditModalOpen = false"
            >
              Отмена
            </UButton>
            <UButton color="neutral" :loading="saving" @click="saveApartment">
              Сохранить
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Delete Confirmation -->
    <UModal v-model="isDeleteModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-sm font-bold uppercase tracking-wider text-red-600">
            Подтверждение удаления
          </h3>
        </template>

        <p class="text-neutral-600">
          Вы уверены, что хотите удалить квартиру
          <strong>№{{ apartmentToDelete?.number }}</strong
          >?
          <br />
          <span class="text-xs text-neutral-400"
            >Это действие нельзя отменить.</span
          >
        </p>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isDeleteModalOpen = false"
            >
              Отмена
            </UButton>
            <UButton color="red" :loading="deleting" @click="deleteApartment">
              Удалить
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from "vue";
import { apartmentsService } from "~/api/apartments.service";
import { objectsService } from "~/api/objects.service";
import { projectsService } from "~/api/projects.service";
import type {
  Apartment,
  ApartmentWithRelations,
  FinishingType,
} from "~/api/types";

definePageMeta({
  layout: "admin",
});

// Data
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const apartmentToDelete = ref<ApartmentWithRelations | null>(null);

const apartments = ref<ApartmentWithRelations[]>([]);
const projects = ref<{ id: string; name: string }[]>([]);
const objects = ref<{ id: string; name: string }[]>([]);

const filters = reactive({
  search: "",
  projectId: null as string | null,
  objectId: null as string | null,
  isAvailable: null as boolean | null,
});

const editForm = reactive<Partial<Apartment>>({
  number: "",
  price: undefined,
  projectId: "",
  objectId: "",
  area: undefined,
  rooms: undefined,
  building: "",
  entrance: "",
  floor: undefined,
  floorTotal: undefined,
  completionDate: "",
  finishing: undefined,
  isAvailable: true,
});

// Options
const availabilityOptions = [
  { value: true, label: "В продаже" },
  { value: false, label: "Продана" },
];

const finishingOptions = [
  { value: "NONE", label: "Без отделки" },
  { value: "ROUGH", label: "Предчистовая" },
  { value: "CLEAN", label: "Чистовая" },
  { value: "TURNKEY", label: "С ремонтом" },
];

const projectOptions = computed(() =>
  projects.value.map((p) => ({ value: p.id, label: p.name })),
);

const objectOptions = computed(() =>
  objects.value.map((o) => ({ value: o.id, label: o.name })),
);

// Table columns
const columns = [
  { id: "number", key: "number", label: "Квартира" },
  { id: "rooms", key: "rooms", label: "Комнат" },
  { id: "area", key: "area", label: "Площадь" },
  { id: "floor", key: "floor", label: "Этаж" },
  { id: "price", key: "price", label: "Цена" },
  { id: "object", key: "object", label: "Объект / Проект" },
  { id: "isAvailable", key: "isAvailable", label: "Статус" },
  { id: "actions", key: "actions", label: "", width: "100px" },
];

// Computed
const hasActiveFilters = computed(() => {
  return (
    filters.search ||
    filters.projectId ||
    filters.objectId ||
    filters.isAvailable !== null
  );
});

const filteredApartments = computed(() => {
  return apartments.value.filter((apt) => {
    const matchesSearch =
      !filters.search ||
      apt.number.toLowerCase().includes(filters.search.toLowerCase());
    const matchesProject =
      !filters.projectId || apt.projectId === filters.projectId;
    const matchesObject =
      !filters.objectId || apt.objectId === filters.objectId;
    const matchesAvailability =
      filters.isAvailable === null || apt.isAvailable === filters.isAvailable;
    return (
      matchesSearch && matchesProject && matchesObject && matchesAvailability
    );
  });
});

// Helpers
function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
}

function resetFilters() {
  filters.search = "";
  filters.projectId = null;
  filters.objectId = null;
  filters.isAvailable = null;
}

function resetEditForm() {
  editForm.number = "";
  editForm.price = undefined;
  editForm.projectId = "";
  editForm.objectId = "";
  editForm.area = undefined;
  editForm.rooms = undefined;
  editForm.building = "";
  editForm.entrance = "";
  editForm.floor = undefined;
  editForm.floorTotal = undefined;
  editForm.completionDate = "";
  editForm.finishing = undefined;
  editForm.isAvailable = true;
}

function openEditModal(apt: ApartmentWithRelations) {
  Object.assign(editForm, {
    id: apt.id,
    number: apt.number,
    price: apt.price,
    projectId: apt.projectId,
    objectId: apt.objectId,
    area: apt.area,
    rooms: apt.rooms,
    building: apt.building || "",
    entrance: apt.entrance || "",
    floor: apt.floor,
    floorTotal: apt.floorTotal,
    completionDate: apt.completionDate ? apt.completionDate.split("T")[0] : "",
    finishing: apt.finishing,
    isAvailable: apt.isAvailable,
  });
  isEditModalOpen.value = true;
}

function confirmDelete(apt: ApartmentWithRelations) {
  apartmentToDelete.value = apt;
  isDeleteModalOpen.value = true;
}

// API Actions
async function loadData() {
  loading.value = true;
  try {
    const [apartmentsData, projectsData, objectsData] = await Promise.all([
      apartmentsService.getAll(),
      projectsService.getAll(),
      objectsService.getAll(),
    ]);
    apartments.value = apartmentsData as ApartmentWithRelations[];
    projects.value = projectsData;
    objects.value = objectsData;
  } catch (error) {
    const toast = useToast();
    toast.add({
      title: "Ошибка загрузки",
      description: "Не удалось загрузить данные",
      color: "red",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    loading.value = false;
  }
}

async function saveApartment() {
  if (
    !editForm.number ||
    !editForm.price ||
    !editForm.projectId ||
    !editForm.objectId
  ) {
    const toast = useToast();
    toast.add({
      title: "Ошибка",
      description: "Заполните обязательные поля",
      color: "red",
      icon: "i-lucide-alert-circle",
    });
    return;
  }

  saving.value = true;
  try {
    const dto = {
      number: editForm.number,
      price: editForm.price,
      projectId: editForm.projectId,
      objectId: editForm.objectId,
      area: editForm.area,
      rooms: editForm.rooms,
      building: editForm.building,
      entrance: editForm.entrance,
      floor: editForm.floor,
      floorTotal: editForm.floorTotal,
      completionDate: editForm.completionDate,
      finishing: editForm.finishing as FinishingType,
      isAvailable: editForm.isAvailable,
    };

    await apartmentsService.update((editForm as Apartment).id, dto);

    const toast = useToast();
    toast.add({
      title: "Квартира обновлена",
      description: `№${editForm.number}`,
      color: "primary",
      icon: "i-lucide-check-circle",
    });

    await loadData();
    isEditModalOpen.value = false;
  } catch (error) {
    const toast = useToast();
    toast.add({
      title: "Ошибка сохранения",
      description: "Не удалось обновить квартиру",
      color: "red",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    saving.value = false;
  }
}

async function deleteApartment() {
  if (!apartmentToDelete.value) return;

  deleting.value = true;
  try {
    await apartmentsService.delete(apartmentToDelete.value.id);

    const toast = useToast();
    toast.add({
      title: "Квартира удалена",
      description: `№${apartmentToDelete.value.number}`,
      color: "neutral",
      icon: "i-lucide-trash-2",
    });

    await loadData();
    isDeleteModalOpen.value = false;
    apartmentToDelete.value = null;
  } catch (error) {
    const toast = useToast();
    toast.add({
      title: "Ошибка удаления",
      description: "Не удалось удалить квартиру",
      color: "red",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    deleting.value = false;
  }
}

// Load data on mount
onMounted(() => {
  loadData();
});
</script>
