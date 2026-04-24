import { getFullUrl } from "#imports";
import { api } from "~/api/client";

export interface ProjectMedia {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  media: ProjectMedia[];
  createdAt: string;
  updatedAt: string;
}

export function useProjects() {
  const projects = ref<Project[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchProjects() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<Project[]>("/projects");
      projects.value = response
        .filter((p) => p.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return projects.value;
    } catch (err) {
      error.value = err as Error;
      console.error("Failed to fetch projects:", err);
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  function getProjectImage(project: Project): string | null {
    const image = project.media?.find((m) => m.type === "IMAGE");
    return getFullUrl(image?.url || "");
  }

  function getProjectMedia(project: Project): {
    type: "IMAGE" | "VIDEO" | null;
    url: string | null;
  } {
    const media = project.media?.[0];
    if (!media) return { type: null, url: null };
    return { type: media.type, url: getFullUrl(media.url) };
  }

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    getProjectImage,
    getProjectMedia,
  };
}
