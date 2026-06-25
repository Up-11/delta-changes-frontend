<template>
	<div class="space-y-6 text-neutral-900">
		<div class="flex items-center gap-4">
			<UButton
				color="neutral"
				variant="ghost"
				icon="i-lucide-arrow-left"
				@click="navigateTo('/admin/apartments')"
			/>
			<h2 class="text-sm font-bold uppercase tracking-widest text-neutral-900">
				Создать квартиру
			</h2>
		</div>

		<UCard class="border border-neutral-200 shadow-none">
			<UForm
				:state="state"
				:validate="validate"
				class="space-y-8"
				@submit="onSubmit"
			>
				<!-- Привязки -->
				<div class="space-y-6">
					<h3
						class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2"
					>
						Привязка к проекту и объекту
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<UFormField
							label="Проект"
							name="projectId"
							required
							description="Выберите проект"
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
									</div>
									<UButton
										color="neutral"
										variant="ghost"
										size="xs"
										icon="i-lucide-x"
										@click="clearObjectSelection"
									/>
								</div>

								<UButton
									v-else
									color="neutral"
									variant="outline"
									size="lg"
									class="w-full justify-between font-normal text-neutral-500"
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
								@select="
									p => {
										selectedProjectName = p.name
									}
								"
							/>
						</UFormField>

						<UFormField
							label="Объект (Дом/Корпус)"
							name="objectId"
							required
							description="Выберите объект"
						>
							<div class="flex flex-col gap-2">
								<div
									v-if="state.objectId"
									class="flex items-center gap-3 p-3 border border-primary/20 bg-primary/5 rounded-lg group"
								>
									<div
										class="bg-white p-2 rounded shadow-sm border border-neutral-100"
									>
										<UIcon
											name="i-lucide-building"
											class="w-5 h-5 text-primary"
										/>
									</div>
									<div class="flex-1">
										<p class="text-sm font-bold text-neutral-900">
											{{ selectedObjectName }}
										</p>
									</div>
									<UButton
										color="neutral"
										variant="ghost"
										size="xs"
										icon="i-lucide-x"
										@click="clearProjectSelection"
									/>
								</div>

								<UButton
									v-else
									color="neutral"
									variant="outline"
									size="lg"
									class="w-full justify-between font-normal text-neutral-500"
									:disabled="!state.projectId"
									@click="isObjectModalOpen = true"
								>
									<span>{{
										state.projectId
											? 'Выберите объект...'
											: 'Сначала выберите проект'
									}}</span>
									<UIcon
										name="i-lucide-search"
										class="w-4 h-4 text-neutral-400"
									/>
								</UButton>
							</div>

							<AdminObjectSelectModal
								v-model:open="isObjectModalOpen"
								v-model="state.objectId"
								:project-id="state.projectId"
								@select="
									o => {
										selectedObjectName = o.name
									}
								"
							/>
						</UFormField>
					</div>
				</div>

				<!-- Характеристики -->
				<div class="space-y-6 pt-4">
					<h3
						class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2"
					>
						Характеристики квартиры
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
						<UFormField label="Номер квартиры" name="number" required>
							<UInput
								v-model="state.number"
								size="lg"
								placeholder="Например: 101"
							/>
						</UFormField>

						<UFormField label="Цена (₽)" name="price" required>
							<UInput
								v-model.number="state.price"
								type="number"
								size="lg"
								placeholder="0"
							/>
						</UFormField>

						<UFormField label="Площадь (м²)" name="area">
							<UInput
								v-model.number="state.area"
								type="number"
								step="0.1"
								size="lg"
								placeholder="0.0"
							/>
						</UFormField>
					</div>

					<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
						<UFormField label="Кол-во комнат" name="rooms">
							<UInput
								v-model.number="state.rooms"
								type="number"
								size="lg"
								placeholder="1"
							/>
						</UFormField>

						<UFormField label="Этаж" name="floor" required>
							<UInput
								v-model.number="state.floor"
								type="number"
								size="lg"
								placeholder="1"
							/>
						</UFormField>

						<UFormField label="Этажность дома" name="floorTotal" required>
							<UInput
								v-model.number="state.floorTotal"
								type="number"
								size="lg"
								placeholder="1"
							/>
						</UFormField>

						<UFormField label="Корпус/Секция" name="building">
							<UInput v-model="state.building" size="lg" placeholder="А" />
						</UFormField>

						<UFormField label="Подъезд" name="entrance">
							<UInput v-model="state.entrance" size="lg" placeholder="1" />
						</UFormField>

						<UFormField
							label="Срок сдачи"
							name="completionDate"
							description="Формат: YYYY-MM-DD (например: 2027-12-31)"
						>
							<UInput
								v-model="state.completionDate"
								size="lg"
								placeholder="2027-12-31"
								type="date"
							/>
						</UFormField>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<UFormField label="Тип отделки" name="finishing">
							<USelectMenu
								v-model="selectedFinishing"
								:items="finishingOptions"
								value-attribute="value"
								option-attribute="label"
								size="lg"
								class="w-full"
							/>
						</UFormField>

						<div class="flex items-center pt-4">
							<UCheckbox
								v-model="state.isAvailable"
								label="Квартира доступна для продажи"
							/>
						</div>
					</div>
				</div>

				<!-- Медиа -->
				<div class="space-y-6 pt-4">
					<h3
						class="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2"
					>
						Медиа материалы
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
						<UFormField label="Планировка" name="layoutPhotoId">
							<AdminImageUploader
								v-model="state.layoutPhotoId"
								label="Загрузить планировку"
								icon="i-lucide-layout"
							/>
						</UFormField>

						<UFormField label="План этажа" name="floorPlanPhotoId">
							<AdminImageUploader
								v-model="state.floorPlanPhotoId"
								label="Загрузить план этажа"
								icon="i-lucide-layers"
							/>
						</UFormField>

						<UFormField label="Генплан" name="masterPlanPhotoId">
							<AdminImageUploader
								v-model="state.masterPlanPhotoId"
								label="Загрузить генплан"
								icon="i-lucide-map"
							/>
						</UFormField>
					</div>
				</div>

				<div class="flex justify-end gap-3 pt-4 border-t border-neutral-100">
					<UButton
						color="neutral"
						variant="ghost"
						@click="navigateTo('/admin/apartments')"
					>
						Отмена
					</UButton>
					<UButton type="submit" color="primary" :loading="loading">
						Создать квартиру
					</UButton>
				</div>
			</UForm>
		</UCard>
	</div>
</template>

<script setup lang="ts">
import { apartmentsService } from '~/api/apartments.service'
import { FinishingType } from '~/api/types'
import type { CreateApartmentDto } from '~/api/types'

definePageMeta({
	layout: 'admin',
})

const loading = ref(false)
const toast = useToast()

const isProjectModalOpen = ref(false)
const selectedProjectName = ref('')
const isObjectModalOpen = ref(false)
const selectedObjectName = ref('')

const finishingOptions = [
	{ label: 'Без отделки', value: FinishingType.NONE },
	{ label: 'Черновая', value: FinishingType.ROUGH },
	{ label: 'Предчистовая', value: FinishingType.CLEAN },
	{ label: 'Под ключ', value: FinishingType.TURNKEY },
]

const selectedFinishing = ref(finishingOptions[0])

const state = reactive<CreateApartmentDto>({
	number: '',
	price: 0,
	projectId: '',
	objectId: '',
	area: 0,
	rooms: 1,
	building: '',
	entrance: '',
	completionDate: '',
	floor: 1,
	floorTotal: 1,
	finishing: FinishingType.NONE,
	isAvailable: true,
	sortOrder: 0,
	layoutPhotoId: null,
	floorPlanPhotoId: null,
	masterPlanPhotoId: null,
})

// Helper functions for clearing selections
function clearProjectSelection() {
	state.projectId = ''
	selectedProjectName = ''
	state.objectId = ''
	selectedObjectName = ''
}

function clearObjectSelection() {
	state.objectId = ''
	selectedObjectName = ''
}

const validate = (state: any) => {
	const errors: any[] = []
	if (!state.projectId)
		errors.push({ path: 'projectId', message: 'Необходимо выбрать проект' })
	if (!state.objectId)
		errors.push({ path: 'objectId', message: 'Необходимо выбрать объект' })
	if (!state.number)
		errors.push({ path: 'number', message: 'Номер квартиры обязателен' })
	if (!state.price || state.price <= 0)
		errors.push({ path: 'price', message: 'Введите корректную цену' })
	if (!state.floor) errors.push({ path: 'floor', message: 'Укажите этаж' })
	if (!state.floorTotal)
		errors.push({ path: 'floorTotal', message: 'Укажите общую этажность' })

	return errors
}

async function onSubmit() {
	const errors = validate(state)
	if (errors.length > 0) {
		console.error('Validation errors:', errors)
		return
	}

	loading.value = true
	try {
		const submitData = {
			...state,
			finishing: selectedFinishing.value?.value || FinishingType.NONE,
			completionDate: state.completionDate
				? `${state.completionDate}T00:00:00.000Z`
				: undefined,
		}
		await apartmentsService.create(submitData)

		toast.add({
			title: 'Успех',
			description: 'Квартира успешно создана',
			color: 'primary',
		})

		navigateTo('/admin/apartments')
	} catch (error: any) {
		console.error('Failed to create apartment:', error)
		toast.add({
			title: 'Ошибка',
			description: error.message || 'Не удалось создать квартиру',
			color: 'primary',
		})
	} finally {
		loading.value = false
	}
}

const resetProjectSelection = () => {
	state.projectId = ''
	selectedProjectName.value = ''
	state.objectId = ''
	selectedObjectName.value = ''
}

const resetObjectSelection = () => {
	state.objectId = ''
	selectedObjectName.value = ''
}
</script>
