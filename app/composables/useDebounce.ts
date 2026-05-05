import { ref, watch, type Ref } from 'vue';

export function useDebounce<T>(source: Ref<T>, delay: number = 300): Ref<T> {
  const debouncedValue = ref(source.value) as Ref<T>;
  let timeout: ReturnType<typeof setTimeout>;

  watch(
    source,
    (newValue) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        debouncedValue.value = newValue;
      }, delay);
    },
    { immediate: true }
  );

  return debouncedValue;
}
