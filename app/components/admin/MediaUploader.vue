<template>
  <div class="space-y-2">
    <div
      class="relative group aspect-video rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center overflow-hidden bg-neutral-50/50"
      :class="[
        error
          ? 'border-primary-500/50 bg-primary-50/10'
          : 'border-neutral-200 hover:border-primary-500/50 hover:bg-primary-50/5',
        isDragging && !loading
          ? 'border-primary-500 bg-primary-50/20 ring-4 ring-primary-500/10'
          : '',
        loading ? 'pointer-events-none cursor-wait' : 'cursor-pointer',
      ]"
      :aria-busy="loading"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <template v-if="hasMediaContent">
        <video
          v-if="
            fileType === 'video' ||
            (fileType === null && checkIsVideoByUrl(getResolvedUrl()))
          "
          :src="previewUrl || getResolvedUrl()"
          class="absolute inset-0 w-full h-full object-cover"
          muted
          autoplay
          loop
        />
        <img
          v-else
          :src="previewUrl || getResolvedUrl()"
          class="absolute inset-0 w-full h-full object-cover"
          alt="Preview"
        />

        <div
          v-if="!loading"
          class="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
        >
          <UButton
            color="neutral"
            variant="solid"
            icon="i-lucide-refresh-cw"
            size="xs"
            :disabled="loading"
            @click.stop="triggerFileInput"
          >
            Заменить
          </UButton>
          <UButton
            color="neutral"
            variant="solid"
            icon="i-lucide-trash-2"
            size="xs"
            :disabled="loading"
            @click.stop="removeMedia"
          >
            Удалить
          </UButton>
        </div>
      </template>

      <template v-else>
        <div class="flex flex-col items-center gap-2 text-center p-4">
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
        :disabled="loading"
        @change="onFileChange"
      />

      <div
        v-if="loading"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-neutral-900/55 backdrop-blur-[2px]"
        aria-live="polite"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-white"
        />
        <span
          class="text-[10px] uppercase font-bold tracking-widest text-white/90"
        >
          Загрузка...
        </span>
      </div>
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
import { computed, ref, watch } from "vue";
import { uploadsService } from "~/api/uploads.service";

const props = defineProps<{
  modelValue?: string | string[] | any | any[] | null;
  label?: string;
  icon?: string;
  multiple?: boolean;
}>();

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

// Computed property to check if there's actual media to display
const hasMediaContent = computed(() => {
  if (previewUrl.value) return true;
  if (!props.modelValue) return false;

  if (Array.isArray(props.modelValue)) {
    return props.modelValue.length > 0 && !!props.modelValue[0];
  }

  if (typeof props.modelValue === "object") {
    return (
      props.modelValue !== null &&
      !!(props.modelValue.url || props.modelValue.id)
    );
  }

  return typeof props.modelValue === "string" && props.modelValue.length > 0;
});

function getResolvedUrl() {
  if (previewUrl.value) return previewUrl.value;
  const value = Array.isArray(props.modelValue)
    ? props.modelValue[0]
    : props.modelValue;

  if (!value) return "";

  if (typeof value === "object" && value !== null) {
    const obj = value as any;
    if (obj.url) return getFullUrl(obj.url);
  }

  if (typeof value === "string") {
    return getFullUrl(value);
  }

  return "";
}

function getFullUrl(url: string | null | undefined) {
  if (!url) return "";
  const urlStr = String(url);

  if (
    urlStr.startsWith("http://") ||
    urlStr.startsWith("https://") ||
    urlStr.startsWith("data:")
  ) {
    return urlStr;
  }

  if (urlStr.startsWith("/")) {
    return uploadsService.getFileUrl(urlStr);
  }

  // Fallback
  return uploadsService.getFileUrl(`/uploads/${urlStr}`);
}

function triggerFileInput() {
  if (loading.value) return;
  fileInput.value?.click();
}

async function handleFileUpload(file: File) {
  if (loading.value) return;

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

    // БЕЗОПАСНОЕ ИЗВЛЕЧЕНИЕ ID
    // Проверяем разные варианты ответов от API (Axios / Fetch / нестандартные обертки)
    const mediaId =
      res?.id || res?.data?.id || (typeof res === "string" ? res : null);

    if (!mediaId) {
      throw new Error("Не удалось получить ID из ответа сервера");
    }

    if (props.multiple) {
      const current = Array.isArray(props.modelValue) ? props.modelValue : [];
      emit("update:modelValue", [...current, mediaId]);
    } else {
      emit("update:modelValue", mediaId);
    }
  } catch (err: any) {
    console.error("Upload error:", err);
    error.value = "Ошибка загрузки";
    previewUrl.value = "";
    fileType.value = null;
  } finally {
    loading.value = false;
  }
}

function onFileChange(e: Event) {
  if (loading.value) return;
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) handleFileUpload(file);
  // Очищаем input, чтобы можно было загрузить тот же файл еще раз
  if (target) target.value = "";
}

function onDragOver() {
  if (loading.value) return;
  isDragging.value = true;
}

function onDragLeave() {
  if (loading.value) return;
  isDragging.value = false;
}

function onDrop(e: DragEvent) {
  if (loading.value) return;
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) handleFileUpload(file);
}

function removeMedia() {
  if (loading.value) return;
  previewUrl.value = "";
  fileType.value = null;
  isImage.value = false;
  if (props.multiple) {
    emit("update:modelValue", []);
  } else {
    emit("update:modelValue", null);
  }
}

function checkIsImage(file: File): boolean {
  return file.type.startsWith("image/");
}

function checkIsVideoByUrl(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.endsWith(".mp4") ||
    lowerUrl.endsWith(".webm") ||
    lowerUrl.endsWith(".mkv") ||
    lowerUrl.endsWith(".mov") ||
    lowerUrl.endsWith(".avi")
  );
}
</script>
