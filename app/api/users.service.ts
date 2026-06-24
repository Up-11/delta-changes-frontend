import { api } from "./client";

export interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  name: string | null;
  role: "ADMIN" | "USER";
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { favorites: number };
}

export interface UpdateUserDto {
  name?: string;
  isActive?: boolean;
}

export const usersService = {
  getAll(): Promise<AdminUser[]> {
    return api.get<AdminUser[]>("/users");
  },

  getById(id: string): Promise<AdminUser> {
    return api.get<AdminUser>(`/users/${id}`);
  },

  update(id: string, data: UpdateUserDto): Promise<AdminUser> {
    return api.patch<AdminUser>(`/users/${id}`, data);
  },

  delete(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/users/${id}`);
  },
};
