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
      <template v-if="hasMediaContent">
        <img
          v-if="
            fileType === 'image' ||
            (fileType === null && checkIsImageByUrl(getResolvedUrl()))
          "
          :src="previewUrl || getResolvedUrl()"
          class="absolute inset-0 w-full h-full object-cover"
          alt="Preview"
        />
        <video
          v-else-if="fileType === 'video' || hasMediaContent"
          :src="previewUrl || getResolvedUrl()"
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
import { computed } from "vue";
import { uploadsService } from "~/api/uploads.service";

const props = defineProps<{
  modelValue?: string | string[] | any | any[] | null;
  label?: string;
  icon?: string;
  multiple?: boolean;
}>();

console.log(props.modelValue);

const emit = defineEmits<{
  (e: "update:modelValue", value: string | string[] | null): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const error = ref("");
const previewUrl = ref("");
const isDragging = ref(false);
const isImage = ref(false);
const fileType = ref<"image" | "video" | null>(null);

// Debug logging
watch(
  () => props.modelValue,
  (val) => {
    console.log("[MediaUploader] modelValue changed:", val);
  },
  { immediate: true, deep: true },
);

// Computed property to check if there's actual media to display
const hasMediaContent = computed(() => {
  console.log("[MediaUploader] hasMediaContent check:", props.modelValue);
  if (previewUrl.value) return true;
  if (!props.modelValue) return false;
  // Handle arrays - check if array has content
  if (Array.isArray(props.modelValue)) {
    const result =
      props.modelValue.length > 0 &&
      props.modelValue[0] !== null &&
      props.modelValue[0] !== undefined &&
      props.modelValue[0] !== "";
    console.log(
      "[MediaUploader] Array check result:",
      result,
      "first item:",
      props.modelValue[0],
    );
    return result;
  }
  // Handle objects - check if it has a url or id
  if (typeof props.modelValue === "object") {
    const result =
      props.modelValue !== null &&
      (props.modelValue.url || props.modelValue.id);
    console.log(
      "[MediaUploader] Object check result:",
      result,
      "url:",
      props.modelValue?.url,
    );
    return result;
  }
  // Handle strings - check if not empty
  return typeof props.modelValue === "string" && props.modelValue.length > 0;
});

function getResolvedUrl() {
  if (previewUrl.value) return previewUrl.value;
  const value = Array.isArray(props.modelValue)
    ? props.modelValue[0]
    : props.modelValue;

  if (!value) return "";

  // If it's an object with url property (from API include)
  if (typeof value === "object" && value !== null) {
    const obj = value as any;
    if (obj.url) return getFullUrl(obj.url);
  }

  // If it's a string (likely ID or URL)
  if (typeof value === "string") {
    return getFullUrl(value);
  }

  return "";
}

function getFullUrl(url: string | null | undefined) {
  if (!url) return "";

  const urlStr = String(url);

  // If it's already a full URL or data URL
  if (
    urlStr.startsWith("http://") ||
    urlStr.startsWith("https://") ||
    urlStr.startsWith("data:")
  ) {
    return urlStr;
  }

  // If it's a UUID (36 chars, with hyphens) - we can't resolve it sync,
  // but let's try to see if it's a filename first
  if (urlStr.includes(".") && !urlStr.includes("/")) {
    return uploadsService.getFileUrl(urlStr);
  }

  // If it starts with /uploads or similar (relative path from API)
  if (urlStr.startsWith("/")) {
    return uploadsService.getFileUrl(urlStr);
  }

  // Otherwise, assume it's a filename that needs prepending
  // or return as is if we're not sure
  return uploadsService.getFileUrl(urlStr);
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
  isImage.value = checkIsImage(file);
  fileType.value = isImage.value ? "image" : "video";

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

    if (props.multiple) {
      // Append to array - emit only media ID
      const current = Array.isArray(props.modelValue) ? props.modelValue : [];
      emit("update:modelValue", [...current, res.id]);
    } else {
      // Single mode - emit only media ID
      emit("update:modelValue", res.id);
    }
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
  fileType.value = null;
  isImage.value = false;
  // For multiple mode, emit empty array; for single mode, emit null
  if (props.multiple) {
    emit("update:modelValue", []);
  } else {
    emit("update:modelValue", null);
  }
  if (fileInput.value) fileInput.value.value = "";
}

function checkIsImage(file: File): boolean {
  return file.type.startsWith("image/");
}

function checkIsImageByUrl(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".avif",
    ".bmp",
    ".svg",
    ".heic",
    ".heif",
  ];
  return imageExtensions.some((ext) => lowerUrl.endsWith(ext));
}
</script>
