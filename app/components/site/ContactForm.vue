<script setup lang="ts">
import { applicationsService } from "~/api/applications.service";
import { ApplicationType } from "~/api/types";

const props = defineProps<{
  title?: string;
  subtitle?: string;
  showPhone?: boolean;
  showEmail?: boolean;
  showAddress?: boolean;
  compact?: boolean;
}>();

const emit = defineEmits<{
  (e: "success"): void;
}>();

const toast = useToast();

const state = reactive({
  name: "",
  phone: "",
  message: "",
  agreeToTerms: false,
});

const errors = reactive({
  name: false,
  phone: false,
});

const touched = reactive({
  name: false,
  phone: false,
});

const loading = ref(false);

const title = computed(() => props.title ?? "Поможем сделать правильный выбор");

function validateField(field: "name" | "phone") {
  touched[field] = true;
  if (field === "name") {
    errors.name = !state.name || state.name.length < 2;
  }
  if (field === "phone") {
    const phoneRegex = /^[\+\d\s\-\(\)]{10,}$/;
    errors.phone = !state.phone || !phoneRegex.test(state.phone);
  }
}

function validateForm(): boolean {
  validateField("name");
  validateField("phone");
  return !errors.name && !errors.phone && state.agreeToTerms;
}

async function onSubmit() {
  if (!state.agreeToTerms) {
    toast.add({
      title: "Ошибка",
      description: "Необходимо согласие на обработку персональных данных",
      color: "primary",
    });
    return;
  }

  loading.value = true;
  try {
    await applicationsService.create({
      name: state.name,
      phone: state.phone,
      message: state.message || undefined,
      type: ApplicationType.OTHER,
    });

    toast.add({
      title: "Успех",
      description: "Заявка успешно отправлена",
      color: "primary",
    });

    // Reset form
    state.name = "";
    state.phone = "";
    state.message = "";
    state.agreeToTerms = false;

    emit("success");
  } catch (error: any) {
    console.error("Failed to submit application:", error);
    toast.add({
      title: "Ошибка",
      description: error.message || "Не удалось отправить заявку",
      color: "primary",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="bg-neutral-900">
    <div
      class="flex flex-col lg:flex-row"
      :class="{ 'min-h-[600px]': !compact, 'min-h-[400px]': compact }"
    >
      <!-- Left: Info -->
      <div
        class="w-full lg:w-1/2 px-6 md:px-12 lg:px-16 py-12 lg:py-16 flex flex-col justify-center"
        :class="{
          'border-b lg:border-b-0 lg:border-r border-neutral-700':
            showPhone || showEmail || showAddress,
        }"
      >
        <h2
          class="font-condensed text-2xl md:text-3xl lg:text-4xl font-bold text-white uppercase tracking-[0.15em] leading-snug mb-8"
        >
          {{ title }}
        </h2>

        <div class="space-y-6">
          <div v-if="showPhone" class="flex items-center gap-4">
            <span
              class="w-12 h-12 flex items-center justify-center border border-neutral-700 text-white"
            >
              <UIcon name="i-lucide-phone" class="w-5 h-5" />
            </span>
            <div>
              <span
                class="text-xs uppercase tracking-[0.2em] text-neutral-500 block mb-1"
              >
                Телефон
              </span>
              <a
                href="tel:+73912779901"
                class="text-lg md:text-xl text-white font-medium hover:text-neutral-400 transition-colors"
              >
                +7 (391) 277-99-01
              </a>
            </div>
          </div>

          <div v-if="showEmail" class="flex items-center gap-4">
            <span
              class="w-12 h-12 flex items-center justify-center border border-neutral-700 text-white"
            >
              <UIcon name="i-lucide-mail" class="w-5 h-5" />
            </span>
            <div>
              <span
                class="text-xs uppercase tracking-[0.2em] text-neutral-500 block mb-1"
              >
                Email
              </span>
              <a
                href="mailto:info@dm-city.ru"
                class="text-lg md:text-xl text-white font-medium hover:text-neutral-400 transition-colors"
              >
                info@dm-city.ru
              </a>
            </div>
          </div>

          <div v-if="showAddress" class="flex items-center gap-4">
            <span
              class="w-12 h-12 flex items-center justify-center border border-neutral-700 text-white"
            >
              <UIcon name="i-lucide-map-pin" class="w-5 h-5" />
            </span>
            <div>
              <span
                class="text-xs uppercase tracking-[0.2em] text-neutral-500 block mb-1"
              >
                Адрес
              </span>
              <p
                class="text-sm md:text-base text-white uppercase tracking-wider"
              >
                г. Красноярск, ул. Парусная, 8, пр. Мира, 91
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div
        class="w-full lg:w-1/2 px-6 md:px-12 lg:px-16 py-12 lg:py-16 flex flex-col justify-center"
      >
        <UForm :state="state" class="space-y-6" @submit="onSubmit">
          <div class="space-y-6">
            <!-- Name Input -->
            <div class="relative">
              <label
                class="block text-xs uppercase tracking-[0.15em] mb-2"
                :class="
                  errors.name && touched.name
                    ? 'text-red-500'
                    : 'text-neutral-400'
                "
              >
                Ваше имя *
              </label>
              <UInput
                v-model="state.name"
                size="lg"
                variant="none"
                class="w-full bg-transparent border-b rounded-none px-0 py-3 text-white placeholder:text-neutral-600 transition-colors"
                :class="
                  errors.name && touched.name
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-neutral-700 focus:border-white'
                "
                :ui="{
                  base: 'bg-transparent focus:ring-0 text-white',
                }"
                @blur="validateField('name')"
              />
              <span
                v-if="errors.name && touched.name"
                class="text-xs text-red-500 mt-1 block"
              >
                Введите имя (минимум 2 символа)
              </span>
            </div>

            <!-- Phone Input -->
            <div class="relative">
              <label
                class="block text-xs uppercase tracking-[0.15em] mb-2"
                :class="
                  errors.phone && touched.phone
                    ? 'text-red-500'
                    : 'text-neutral-400'
                "
              >
                Телефон *
              </label>
              <UInput
                v-model="state.phone"
                size="lg"
                type="tel"
                variant="none"
                class="w-full bg-transparent border-b rounded-none px-0 py-3 text-white placeholder:text-neutral-600 transition-colors"
                :class="
                  errors.phone && touched.phone
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-neutral-700 focus:border-white'
                "
                :ui="{
                  base: 'bg-transparent focus:ring-0 text-white',
                }"
                @blur="validateField('phone')"
              />
              <span
                v-if="errors.phone && touched.phone"
                class="text-xs text-red-500 mt-1 block"
              >
                Введите корректный номер телефона
              </span>
            </div>

            <!-- Comment Textarea -->
            <div class="relative">
              <label
                class="block text-xs uppercase tracking-[0.15em] text-neutral-400 mb-2"
              >
                Комментарий
              </label>
              <UTextarea
                v-model="state.message"
                size="lg"
                variant="none"
                :rows="2"
                class="w-full bg-transparent border-b border-neutral-700 rounded-none px-0 py-3 text-white placeholder:text-neutral-600 focus:border-white transition-colors resize-none"
                :ui="{
                  base: 'bg-transparent focus:ring-0 text-white resize-none',
                }"
              />
            </div>
          </div>

          <div class="flex items-start gap-3 pt-4">
            <UCheckbox
              v-model="state.agreeToTerms"
              class="mt-1"
              :ui="{
                base: 'border-neutral-600 data-[state=checked]:bg-white data-[state=checked]:text-neutral-900',
              }"
            />
            <span class="text-xs text-neutral-500 leading-relaxed">
              Я подтверждаю ознакомление и даю свое согласие на обработку
              персональных данных в порядке и на условиях, в политике в
              отношении обработки персональных данных
            </span>
          </div>

          <div class="flex justify-end pt-4">
            <UButton
              type="submit"
              color="primary"
              variant="outline"
              size="lg"
              :loading="loading"
              class="border-white text-white hover:bg-white hover:text-neutral-900 uppercase tracking-[0.15em] px-8"
            >
              Оставить заявку
              <template #trailing>
                <UIcon name="i-lucide-send" class="w-4 h-4" />
              </template>
            </UButton>
          </div>
        </UForm>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Custom input styling for dark theme */
:deep(.u-input) {
  background: transparent !important;
}

:deep(.u-input:focus) {
  box-shadow: none !important;
}

:deep(.u-textarea) {
  background: transparent !important;
}

:deep(.u-textarea:focus) {
  box-shadow: none !important;
}
</style>
