<script setup lang="ts">
import { nextTick } from "vue";

const mapContainer = ref<HTMLElement | null>(null);
const mapLoaded = ref(false);

let map: any = null;

// Координаты офисов в Красноярске
const offices = [
  {
    name: "Офис на Парусной",
    address: "ул. Парусная, 8",
    coords: [56.0151, 92.8934] as [number, number],
  },
  {
    name: "Офис на Мира",
    address: "пр. Мира, 91",
    coords: [56.0097, 92.8521] as [number, number],
  },
];

function initMap() {
  if (!window.ymaps || !mapContainer.value) return;

  window.ymaps.ready(() => {
    // Центр на Красноярске между двумя точками
    const center = [56.0124, 92.8728];

    map = new window.ymaps.Map(mapContainer.value, {
      center,
      zoom: 14,
      controls: ["zoomControl"],
    });

    // Скрываем лишние элементы
    map.controls.remove("trafficControl");
    map.controls.remove("typeSelector");
    map.controls.remove("searchControl");
    map.controls.remove("routeButtonControl");
    map.controls.remove("geolocationControl");
    map.controls.remove("rulerControl");

    // Добавляем метки офисов
    offices.forEach((office) => {
      const placemark = new window.ymaps.Placemark(
        office.coords,
        {
          balloonContent: `<strong>${office.name}</strong><br>${office.address}`,
          hintContent: office.name,
        },
        {
          preset: "islands#circleDotIcon",
          iconColor: "#171717",
        },
      );
      map.geoObjects.add(placemark);
    });

    // Границы для показа всех меток
    const bounds = map.geoObjects.getBounds();
    if (bounds) {
      map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 });
    }

    mapLoaded.value = true;
  });
}

onMounted(() => {
  if (typeof window === "undefined") return;

  // Load Yandex Maps
  if (window.ymaps) {
    nextTick(initMap);
  } else {
    const script = document.createElement("script");
    script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
    script.type = "text/javascript";
    script.onload = () => nextTick(initMap);
    document.head.appendChild(script);
  }
});
</script>

<template>
  <div ref="mapContainer" class="w-full h-full min-h-[400px] bg-neutral-100">
    <div
      v-if="!mapLoaded"
      class="absolute inset-0 flex items-center justify-center text-neutral-400 uppercase tracking-widest text-sm"
    >
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin mr-3" />
      Загрузка карты...
    </div>
  </div>
</template>

<style scoped>
/* Стили для Яндекс Карт - чёрно-белый режим */
:deep(.ymaps-2-1-79-ground-pane) {
  filter: grayscale(100%) contrast(110%);
}
</style>
