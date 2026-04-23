<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        @click="navigateTo('/admin/apartments')"
      >
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-1" />
        Назад
      </UButton>
      <h2 class="text-sm font-bold uppercase tracking-[0.1em] text-neutral-900">
        Новая квартира
      </h2>
    </div>

    <!-- Form -->
    <UCard class="border border-neutral-200 shadow-none max-w-4xl">
      <UForm :state="form" class="space-y-6">
        <!-- Basic Info -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Основная информация
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Номер квартиры" required>
              <UInput
                v-model="form.number"
                placeholder="155"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Цена" required>
              <UInput
                v-model.number="form.price"
                type="number"
                placeholder="5000000"
                color="neutral"
              />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Проект" required>
              <USelect
                v-model="form.projectId"
                :options="projectOptions"
                placeholder="Выберите проект"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Объект (дом)" required>
              <USelect
                v-model="form.objectId"
                :options="filteredObjectOptions"
                placeholder="Выберите объект"
                color="neutral"
                :disabled="!form.projectId"
              />
            </UFormGroup>
          </div>
        </div>

        <UDivider />

        <!-- Characteristics -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Характеристики
          </h3>

          <div class="grid grid-cols-3 gap-4">
            <UFormGroup label="Площадь (м²)">
              <UInput
                v-model.number="form.area"
                type="number"
                placeholder="45"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Количество комнат">
              <UInput
                v-model.number="form.rooms"
                type="number"
                placeholder="2"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Статус">
              <USelect
                v-model="form.isAvailable"
                :options="availabilityOptions"
                color="neutral"
              />
            </UFormGroup>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <UFormGroup label="Корпус">
              <UInput
                v-model="form.building"
                placeholder="1"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Подъезд">
              <UInput
                v-model="form.entrance"
                placeholder="4"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Этаж" required>
              <UInput
                v-model.number="form.floor"
                type="number"
                placeholder="3"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Всего этажей" required>
              <UInput
                v-model.number="form.floorTotal"
                type="number"
                placeholder="16"
                color="neutral"
              />
            </UFormGroup>
          </div>
        </div>

        <UDivider />

        <!-- Additional Info -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Дополнительная информация
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Тип отделки">
              <USelect
                v-model="form.finishing"
                :options="finishingOptions"
                placeholder="Выберите тип отделки"
                color="neutral"
              />
            </UFormGroup>

            <UFormGroup label="Срок сдачи">
              <UInput
                v-model="form.completionDate"
                type="date"
                color="neutral"
              />
            </UFormGroup>
          </div>

          <UFormGroup label="Порядок сортировки">
            <UInput
              v-model.number="form.sortOrder"
              type="number"
              placeholder="0"
              color="neutral"
            />
          </UFormGroup>
        </div>
      </UForm>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            @click="navigateTo('/admin/apartments')"
          >
            Отмена
          </UButton>
          <UButton color="neutral" :loading="saving" @click="createApartment">
            Создать квартиру
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { apartmentsService } from '~/api/apartments.service'
import { objectsService } from '~/api/objects.service'
import { projectsService } from '~/api/projects.service'
import type { CreateApartmentDto, FinishingType } from '~/api/types'

definePageMeta({
  layout: 'admin',
})

// Data
const saving = ref(false)
const projects = ref<{ id: string; name: string; isActive: boolean }[]>([])
const objects = ref<{ id: string; name: string; projectId: string; isActive: boolean }[]>([])

const form = reactive<CreateApartmentDto>({
  number: '',
  price: 0,
  projectId: '',
  objectId: '',
  area: undefined,
  rooms: undefined,
  building: '',
  entrance: '',
  floor: 1,
  floorTotal: 1,
  completionDate: '',
  finishing: undefined,
  isAvailable: true,
  sortOrder: 0,
})

// Options
const availabilityOptions = [
  { value: true, label: 'В продаже' },
  { value: false, label: 'Продана' },
]

const finishingOptions = [
  { value: 'NONE', label: 'Без отделки' },
  { value: 'ROUGH', label: 'Предчистовая' },
  { value: 'CLEAN', label: 'Чистовая' },
  { value: 'TURNKEY', label: 'С ремонтом' },
]

const projectOptions = computed(() =>
  projects.value
    .filter((p) => p.isActive)
    .map((p) => ({ value: p.id, label: p.name })),
)

const filteredObjectOptions = computed(() => {
  if (!form.projectId) return []
  return objects.value
    .filter((o) => o.projectId === form.projectId && o.isActive)
    .map((o) => ({ value: o.id, label: o.name }))
})

// Watch for project change to reset object
watch(() => form.projectId, () => {
  form.objectId = ''
})

// Load data on mount
async function loadData() {
  try {
    const [projectsData, objectsData] = await Promise.all([
      projectsService.getAll(),
      objectsService.getAll(),
    ])
    projects.value = projectsData
    objects.value = objectsData as { id: string; name: string; projectId: string; isActive: boolean }[]
  } catch (error) {
    const toast = useToast()
    toast.add({
      title: 'Ошибка загрузки',
      description: 'Не удалось загрузить справочники',
      color: 'red',
      icon: 'i-lucide-alert-circle',
    })
  }
}

async function createApartment() {
  // Validation
  if (!form.number || !form.price || !form.projectId || !form.objectId) {
    const toast = useToast()
    toast.add({
      title: 'Ошибка',
      description: 'Заполните обязательные поля: номер квартиры, цена, проект, объект',
      color: 'red',
      icon: 'i-lucide-alert-circle',
    })
    return
  }

  saving.value = true
  try {
    const dto: CreateApartmentDto = {
      number: form.number,
      price: form.price,
      projectId: form.projectId,
      objectId: form.objectId,
      area: form.area,
      rooms: form.rooms,
      building: form.building || undefined,
      entrance: form.entrance || undefined,
      floor: form.floor,
      floorTotal: form.floorTotal,
      completionDate: form.completionDate || undefined,
      finishing: form.finishing as FinishingType,
      isAvailable: form.isAvailable,
      sortOrder: form.sortOrder,
    }

    await apartmentsService.create(dto)

    const toast = useToast()
    toast.add({
      title: 'Квартира создана',
      description: `№${form.number}`,
      color: 'primary',
      icon: 'i-lucide-check-circle',
    })

    navigateTo('/admin/apartments')
  } catch (error) {
    const toast = useToast()
    toast.add({
      title: 'Ошибка создания',
      description: 'Не удалось создать квартиру',
      color: 'red',
      icon: 'i-lucide-alert-circle',
    })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
