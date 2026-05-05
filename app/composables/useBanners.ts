import { getFullUrl } from "#imports";
import { api } from "~/api/client";

export interface BannerMedia {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
}

export interface Banner {
  id: string;
  mainText: string;
  subText: string | null;
  isActive: boolean;
  sortOrder: number;
  media: BannerMedia[];
  createdAt: string;
  updatedAt: string;
}

export function useBanners() {
  const banners = ref<Banner[]>([]);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchBanners() {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.get<Banner[]>("/banners");
      banners.value = response
        .filter((b) => b.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return banners.value;
    } catch (err) {
      error.value = err as Error;
      console.error("Failed to fetch banners:", err);
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  function getBannerMedia(banner: Banner): { type: "IMAGE" | "VIDEO" | null; url: string | null } {
    const media = banner.media?.[0];
    if (!media) return { type: null, url: null };
    return { type: media.type, url: getFullUrl(media.url) };
  }

  return {
    banners,
    isLoading,
    error,
    fetchBanners,
    getBannerMedia,
  };
}
