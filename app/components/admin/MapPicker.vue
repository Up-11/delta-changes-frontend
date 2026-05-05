<template>
  <div class="space-y-2">
    <div
      ref="mapContainer"
      class="w-full h-[400px] rounded-lg border border-neutral-200 overflow-hidden relative"
    >
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-neutral-50/50 z-10"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-primary"
        />
      </div>
    </div>
    <p class="text-[10px] text-neutral-400 uppercase tracking-widest">
      Кликните по карте, чтобы установить маркер
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  lat?: number | null;
  lng?: number | null;
}>();

const emit = defineEmits<{
  (e: "update:coords", payload: { lat: number; lng: number }): void;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const loading = ref(true);
let map: any = null;
let placemark: any = null;

const initMap = () => {
  if (!window.ymaps) return;

  window.ymaps.ready(() => {
    const center = [props.lat || 56.0184, props.lng || 92.8672];

    map = new window.ymaps.Map(mapContainer.value, {
      center,
      zoom: 12,
      controls: ["zoomControl", "fullscreenControl"],
    });

    // Создаем маркер
    placemark = new window.ymaps.Placemark(
      center,
      {
        hintContent: "Местоположение объекта",
      },
      {
        draggable: true,
        preset: "islands#blueHomeIcon",
      },
    );

    map.geoObjects.add(placemark);

    // Слушаем клик по карте
    map.events.add("click", (e: any) => {
      const coords = e.get("coords");
      updatePosition(coords[0], coords[1]);
    });

    // Слушаем перетаскивание маркера
    placemark.events.add("dragend", () => {
      const coords = placemark.geometry.getCoordinates();
      updatePosition(coords[0], coords[1]);
    });

    loading.value = false;
  });
};

const updatePosition = (lat: number, lng: number) => {
  if (placemark) {
    placemark.geometry.setCoordinates([lat, lng]);
  }
  emit("update:coords", { lat, lng });
};

const searchAddress = async (address: string) => {
  if (!window.ymaps || !map) return;

  try {
    const res = await window.ymaps.geocode(address);
    const firstGeoObject = res.geoObjects.get(0);

    if (firstGeoObject) {
      const coords = firstGeoObject.geometry.getCoordinates();
      const lat = coords[0];
      const lng = coords[1];

      map.setCenter(coords, 15, {
        duration: 300,
      });
      updatePosition(lat, lng);
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
};

defineExpose({
  searchAddress,
});

// Следим за внешними изменениями координат (например, при вводе вручную)
watch(
  () => [props.lat, props.lng],
  ([newLat, newLng]) => {
    if (map && placemark && newLat && newLng) {
      const coords = [newLat, newLng];
      placemark.geometry.setCoordinates(coords);
      // map.setCenter(coords); // Опционально: центрировать карту при изменении
    }
  },
);

onMounted(() => {
  if (typeof window === "undefined") return;

  // Если скрипт уже загружен
  if (window.ymaps) {
    initMap();
    return;
  }

  // Загружаем API Яндекс.Карт динамически
  const script = document.createElement("script");
  script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
  script.type = "text/javascript";
  script.onload = initMap;
  document.head.appendChild(script);
});

onUnmounted(() => {
  if (map) {
    map.destroy();
  }
});

declare global {
  interface Window {
    ymaps: any;
  }
}
</script>
