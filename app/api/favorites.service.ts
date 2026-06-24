import { siteApi } from "./site-client";
import type { ApartmentWithRelations } from "./types";

export interface FavoriteItem {
  id: string;
  apartmentId: string;
  createdAt: string;
  apartment: ApartmentWithRelations;
}

export const favoritesService = {
  getIds(): Promise<string[]> {
    return siteApi.get<string[]>("/favorites/ids");
  },

  getAll(): Promise<FavoriteItem[]> {
    return siteApi.get<FavoriteItem[]>("/favorites");
  },

  add(apartmentId: string): Promise<FavoriteItem> {
    return siteApi.post<FavoriteItem>(`/favorites/${apartmentId}`, {});
  },

  remove(apartmentId: string): Promise<{ message: string }> {
    return siteApi.delete<{ message: string }>(`/favorites/${apartmentId}`);
  },
};
