/**
 * Uploads Service - API для работы с загрузкой файлов
 */

import { api } from "./client";
import { API_ENDPOINTS, DEFAULT_API_BASE_URL } from "~/config/api.config";
import type { UploadFile, UploadResponse } from "./types";

export const uploadsService = {
  /** Получить все загруженные файлы */
  async getAll(): Promise<UploadFile[]> {
    return api.get<UploadFile[]>(API_ENDPOINTS.uploads.list.path);
  },

  /** Загрузить одно изображение */
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return api.upload<UploadResponse>(
      API_ENDPOINTS.uploads.uploadImage.path,
      formData,
    );
  },

  /** Загрузить одно видео */
  async uploadVideo(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return api.upload<UploadResponse>(
      API_ENDPOINTS.uploads.uploadVideo.path,
      formData,
    );
  },

  /** Загрузить несколько изображений */
  async uploadMultipleImages(files: File[]): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return api.upload<UploadResponse[]>(
      API_ENDPOINTS.uploads.uploadMultipleImages.path,
      formData,
    );
  },

  /** Загрузить несколько видео */
  async uploadMultipleVideos(files: File[]): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return api.upload<UploadResponse[]>(
      API_ENDPOINTS.uploads.uploadMultipleVideos.path,
      formData,
    );
  },

  /** Удалить загруженный файл */
  async delete(id: string): Promise<void> {
    const path = API_ENDPOINTS.uploads.delete.path(id);
    await api.delete(path);
  },

  /** Получить полный URL файла */
  getFileUrl(filename: string): string {
    return `${DEFAULT_API_BASE_URL}${filename}`;
  },
};
