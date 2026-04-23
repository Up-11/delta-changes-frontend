<template>
  <UModal v-model:open="isOpen" title="Выберите проект" description="Выберите проект, к которому будет привязан объект">
    <template #body>
      <div v-if="pending" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
      </div>

      <div v-else-if="!projects?.length" class="text-center py-12">
        <p class="text-sm text-neutral-500">Проекты не найдены</p>
        <UButton
          color="primary"
          variant="ghost"
          class="mt-4"
          @click="navigateTo('/admin/projects/create')"
        >
          Создать первый проект
        </UButton>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
        <div
          v-for="project in projects"
          :key="project.id"
          class="group cursor-pointer border rounded-xl p-4 transition-all duration-200 hover:border-primary hover:ring-1 hover:ring-primary/50"
          :class="[
            modelValue === project.id 
              ? 'border-primary ring-1 ring-primary bg-primary/5' 
              : 'border-neutral-200 bg-white shadow-sm'
          ]"
          @click="selectProject(project)"
        >
          <div class="flex flex-col h-full">
            <div class="flex items-start justify-between mb-2">
              <h4 class="font-bold text-neutral-900 group-hover:text-primary transition-colors line-clamp-1">
                {{ project.name }}
              </h4>
              <UIcon 
                v-if="modelValue === project.id" 
                name="i-lucide-check-circle-2" 
                class="w-5 h-5 text-primary shrink-0" 
              />
            </div>
            
            <p v-if="project.shortDescription" class="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
              {{ project.shortDescription }}
            </p>
            
            <div class="mt-auto pt-3 flex items-center gap-2">
              <UBadge size="xs" variant="subtle" color="neutral" class="font-mono uppercase tracking-tighter">
                {{ project.slug }}
              </UBadge>
              <UBadge 
                v-if="project.isActive" 
                size="xs" 
                variant="subtle" 
                color="primary"
              >
                Активен
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
import { projectsService } from "~/api/projects.service";
import type { Project } from "~/api/types";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'select', project: Project): void;
}>();

const isOpen = defineModel<boolean>('open', { default: false });

const { data: projects, pending } = await useAsyncData("modal-projects-list", () =>
  projectsService.getAll(),
);

function selectProject(project: Project) {
  emit('update:modelValue', project.id);
  emit('select', project);
  isOpen.value = false;
}
</script>
