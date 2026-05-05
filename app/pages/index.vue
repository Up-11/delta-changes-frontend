<script setup lang="ts">
import HeroBanner from "~/components/site/HeroBanner.vue";
import CompanyStats from "~/components/site/CompanyStats.vue";
import ProjectsMap from "~/components/site/ProjectsMap.vue";
import NewsSection from "~/components/site/NewsSection.vue";
import ContactForm from "~/components/site/ContactForm.vue";

const { projects, fetchProjects } = useProjects();
const { objects, fetchObjects } = useObjects();

onMounted(async () => {
  await Promise.all([fetchProjects(), fetchObjects()]);
});

definePageMeta({
  layout: "default",
});
</script>

<template>
  <div class="min-h-screen">
    <HeroBanner />
    <CompanyStats />
    <ProjectsMap :projects="projects" :objects="objects" />
    <NewsSection />
    <ContactForm :show-phone="true" :show-email="true" :show-address="true" />
  </div>
</template>
