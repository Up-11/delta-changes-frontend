<script setup lang="ts">
import type { ObjectWithRelations } from "~/api/types";
import { loadYmapsScript } from "~/utils/maps";

const props = defineProps<{
  object: ObjectWithRelations;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const mapInstance = shallowRef<any>(null);
const isReady = ref(false);

async function waitForContainer(maxAttempts = 50): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    if (mapContainer.value) return true;
    await new Promise((r) => setTimeout(r, 10));
  }
  return false;
}

async function initMap() {
  isReady.value = false;

  // Wait for container with timeout
  const hasContainer = await waitForContainer();
  if (!hasContainer) {
    console.warn("Map container not found after waiting");
    return;
  }

  try {
    const ymaps = await loadYmapsScript();

    // Small delay to ensure DOM is stable
    await new Promise((r) => setTimeout(r, 50));

    if (!mapContainer.value) return;

    const center: [number, number] = [
      Number(props.object.latitude) || 56.01,
      Number(props.object.longitude) || 92.86,
    ];

    // Clean destroy of previous instance
    if (mapInstance.value) {
      try {
        mapInstance.value.destroy();
      } catch (e) {}
      mapInstance.value = null;
    }

    // Create new map
    mapInstance.value = new ymaps.Map(mapContainer.value, {
      center: center,
      zoom: 15,
      controls: ["zoomControl"],
    });

    // Wait for map to be ready
    await new Promise((r) => setTimeout(r, 50));

    // Add Object Marker
    const objectPlacemark = new ymaps.Placemark(
      center,
      {
        balloonContent: props.object.name,
        hintContent: props.object.address,
      },
      {
        preset: "islands#nightDotIcon",
        iconColor: "#000000",
      },
    );
    mapInstance.value.geoObjects.add(objectPlacemark);

    // Add Infrastructure Markers
    if (props.object.infrastructure?.length) {
      props.object.infrastructure.forEach((point) => {
        const placemark = new ymaps.Placemark(
          [Number(point.latitude), Number(point.longitude)],
          {
            balloonContent: point.title,
            hintContent: point.category,
          },
          {
            preset: "islands#blueDotIconWithCaption",
          },
        );
        mapInstance.value.geoObjects.add(placemark);
      });
    }

    isReady.value = true;
  } catch (err) {
    console.error("Map initialization error:", err);
    // Retry once after error
    setTimeout(() => {
      if (!isReady.value) initMap();
    }, 500);
  }
}

onMounted(() => {
  // Use setTimeout to ensure we're after all Vue updates
  setTimeout(() => {
    initMap();
  }, 0);
});

onUnmounted(() => {
  if (mapInstance.value) {
    try {
      mapInstance.value.destroy();
    } catch (e) {}
    mapInstance.value = null;
  }
});

// Watch for object changes with flush: 'post' to ensure DOM is updated
watch(
  () => props.object.id,
  () => {
    nextTick(() => {
      setTimeout(() => {
        initMap();
      }, 0);
    });
  },
  { flush: "post" },
);
</script>

<template>
  <div ref="mapContainer" class="w-full h-full"></div>
</template>
