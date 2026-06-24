<script setup lang="ts">
const model = defineModel<string>({ required: true });

withDefaults(
  defineProps<{
    label: string;
    type?: string;
    placeholder?: string;
    autocomplete?: string;
    required?: boolean;
  }>(),
  {
    type: "text",
    required: false,
  },
);
</script>

<template>
  <div>
    <label class="block text-xs uppercase tracking-[0.15em] mb-2 text-neutral-500">
      {{ label }}
    </label>
    <UInput
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :required="required"
      size="lg"
      variant="none"
      class="w-full bg-transparent border-b rounded-none px-0 py-3 text-neutral-900 placeholder:text-neutral-400 border-neutral-300 focus:border-neutral-900 transition-colors"
      :ui="{
        base: 'bg-transparent focus:ring-0',
      }"
    />
  </div>
</template>
