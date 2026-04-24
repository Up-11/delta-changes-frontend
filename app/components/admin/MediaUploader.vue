<template>
  <div class="space-y-2">
    <div
      class="relative group aspect-video rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center overflow-hidden bg-neutral-50/50"
      :class="[
        error
          ? 'border-primary-500/50 bg-primary-50/10'
          : 'border-neutral-200 hover:border-primary-500/50 hover:bg-primary-50/5',
        isDragging
          ? 'border-primary-500 bg-primary-50/20 ring-4 ring-primary-500/10'
          : '',
      ]"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <!-- Preview -->
      <template v-if="previewUrl || modelValue">
        <img
          v-if="isImage"
          :src="previewUrl || getFullUrl(modelValue)"
          class="absolute inset-0 w-full h-full object-cover"
          alt="Preview"
        />
        <video
          v-else
          :src="previewUrl || getFullUrl(modelValue)"
          class="absolute inset-0 w-full h-full object-cover"
          muted
          autoplay
          loop
        />
        <div
          class="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
        >
          <UButton
            color="neutral"
            variant="solid"
            icon="i-lucide-refresh-cw"
            size="xs"
            @click.stop="triggerFileInput"
          >
            Заменить
          </UButton>
          <UButton
            color="neutral"
            variant="solid"
            icon="i-lucide-trash-2"
            size="xs"
            @click.stop="removeMedia"
          >
            Удалить
          </UButton>
        </div>
      </template>

      <!-- Placeholder -->
      <template v-else>
        <div v-if="loading" class="flex flex-col items-center gap-2">
          <UIcon
            name="i-lucide-loader-2"
            class="w-8 h-8 animate-spin text-primary-500"
          />
          <span
            class="text-[10px] uppercase font-bold tracking-widest text-neutral-400"
            >Загрузка...</span
          >
        </div>
        <div v-else class="flex flex-col items-center gap-2 text-center p-4">
          <div
            class="bg-white p-3 rounded-full shadow-sm border border-neutral-100 group-hover:scale-110 transition-transform duration-200"
          >
            <UIcon
              :name="icon || 'i-lucide-file-video'"
              class="w-6 h-6 text-neutral-400 group-hover:text-primary-500"
            />
          </div>
          <div>
            <p class="text-xs font-bold text-neutral-900">
              {{ label || "Загрузить медиа" }}
            </p>
            <p
              class="text-[10px] text-neutral-400 mt-1 uppercase tracking-tighter"
            >
              PNG, JPG, MP4 до 50MB
            </p>
          </div>
        </div>
      </template>

      <input
        ref="fileInput"
        type="file"
        class="hidden"
        accept="image/*,video/*"
        @change="onFileChange"
      />
    </div>

    <p
      v-if="error"
      class="text-[10px] text-primary-500 font-medium uppercase tracking-tight"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { uploadsService } from "~/api/uploads.service";

const props = defineProps<{
  modelValue?: string | null;
  label?: string;
  icon?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const error = ref("");
const previewUrl = ref("");
const isDragging = ref(false);
const isImage = ref(
  props.modelValue?.endsWith(".jpg") ||
    props.modelValue?.endsWith(".png") ||
    props.modelValue?.endsWith(".jpeg"),
);

function getFullUrl(url: string | null | undefined) {
  if (!url) return "";
  // Если это уже полный URL (начинается с http), используем его напрямую
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // Иначе считаем это ID и получаем URL через сервис
  const fileUrl = uploadsService.getFileUrl(url);
  console.log(fileUrl);
  return fileUrl;
}

function triggerFileInput() {
  fileInput.value?.click();
}

async function handleFileUpload(file: File) {
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    error.value = "Только изображения или видео";
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    error.value = "Файл слишком большой (max 50MB)";
    return;
  }

  loading.value = true;
  error.value = "";
  isImage.value = file.type.startsWith("image/");

  // Создаем локальное превью
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  try {
    let res;
    if (isImage.value) {
      res = await uploadsService.uploadImage(file);
    } else {
      res = await uploadsService.uploadVideo(file);
    }
    // Предполагаем, что бэкенд возвращает ID или URL, который мы сохраняем в модель
    emit("update:modelValue", res.id);
  } catch (err: any) {
    console.error("Upload error:", err);
    error.value = "Ошибка загрузки";
    previewUrl.value = "";
  } finally {
    loading.value = false;
  }
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    handleFileUpload(file);
  }
}

function onDragOver() {
  isDragging.value = true;
}

function onDragLeave() {
  isDragging.value = false;
}

function onDrop(e: DragEvent) {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    handleFileUpload(file);
  }
}

function removeMedia() {
  previewUrl.value = "";
  emit("update:modelValue", null);
  if (fileInput.value) fileInput.value.value = "";
}
</script>
