<template>
  <UModal
    v-model:open="isOpen"
    title="Выберите объект"
    description="Выберите дом или корпус, к которому относится квартира"
  >
    <template #body>
      <div v-if="pending" class="flex justify-center py-12">
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-primary"
        />
      </div>

      <div v-else-if="!objects?.length" class="text-center py-12">
        <p class="text-sm text-neutral-500">Объекты не найдены</p>
        <UButton
          color="primary"
          variant="ghost"
          class="mt-4"
          @click="navigateTo('/admin/objects/create')"
        >
          Создать первый объект
        </UButton>
      </div>

      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1"
      >
        <div
          v-for="object in objects"
          :key="object.id"
          class="group cursor-pointer border rounded-xl p-4 transition-all duration-200 hover:border-primary hover:ring-1 hover:ring-primary/50"
          :class="[
            modelValue === object.id
              ? 'border-primary ring-1 ring-primary bg-primary/5'
              : 'border-neutral-200 bg-white shadow-sm',
          ]"
          @click="selectObject(object)"
        >
          <div class="flex flex-col h-full">
            <div class="flex items-start justify-between mb-2">
              <h4
                class="font-bold text-neutral-900 group-hover:text-primary transition-colors line-clamp-1"
              >
                {{ object.name }}
              </h4>
              <UIcon
                v-if="modelValue === object.id"
                name="i-lucide-check-circle-2"
                class="w-5 h-5 text-primary shrink-0"
              />
            </div>

            <p
              v-if="object.address"
              class="text-[10px] text-neutral-400 uppercase tracking-tight line-clamp-1 mb-2"
            >
              {{ object.address }}
            </p>

            <div class="mt-auto pt-2 flex items-center gap-2">
              <UBadge
                size="xs"
                variant="subtle"
                color="neutral"
                class="font-mono"
              >
                {{ object.slug }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton color="neutral" variant="ghost" @click="isOpen = false">
          Отмена
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { objectsService } from "~/api/objects.service";
import type { Object as IObject } from "~/api/types";

const props = defineProps<{
  modelValue: string;
  projectId?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "select", object: IObject): void;
}>();

const isOpen = defineModel<boolean>("open", { default: false });

const {
  data: objects,
  pending,
  refresh,
} = await useAsyncData("modal-objects-list", async () => {
  const allObjects = await objectsService.getAll();
  if (props.projectId) {
    return allObjects.filter((o) => o.projectId === props.projectId);
  }
  return allObjects;
});

// Refresh objects when projectId changes
watch(
  () => props.projectId,
  () => {
    refresh();
  },
);

function selectObject(obj: IObject) {
  emit("update:modelValue", obj.id);
  emit("select", obj);
  isOpen.value = false;
}
</script>
