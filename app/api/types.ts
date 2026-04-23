/**
 * API Types - Based on Prisma Schema
 * Auto-generated types for backend models
 */

// ==================== ENUMS ====================

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export enum FinishingType {
  NONE = "NONE",
  ROUGH = "ROUGH",
  CLEAN = "CLEAN",
  TURNKEY = "TURNKEY",
}

export enum ApplicationStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ApplicationType {
  APARTMENT = "APARTMENT",
  OBJECT = "OBJECT",
  PROJECT = "PROJECT",
  OTHER = "OTHER",
}

// ==================== CORE MODELS ====================

export interface Media {
  id: string;
  url: string;
  type: MediaType;
  createdAt: string;
  updatedAt: string;
}

export interface MediaWithRelations extends Media {
  objects?: Object[];
  apartments?: Apartment[];
  projects?: Project[];
  galleries?: Gallery[];
  news?: News[];
}

// ==================== BANNER ====================

export interface Banner {
  id: string;
  mainText: string;
  subText?: string | null;
  mediaId?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannerWithRelations extends Banner {
  media?: Media | null;
}

export interface CreateBannerDto {
  mainText: string;
  subText?: string;
  mediaId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateBannerDto = Partial<CreateBannerDto>;

// ==================== PROJECT ====================

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithRelations extends Project {
  media?: Media[];
  objects?: Object[];
}

export interface CreateProjectDto {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateProjectDto = Partial<CreateProjectDto>;

// ==================== OBJECT (КОМПЛЕКС/ДОМ) ====================

export interface Object {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
  sortOrder: number;
  projectId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ObjectWithRelations extends Object {
  project?: Project | null;
  media?: Media[];
  apartments?: Apartment[];
  features?: FeatureItem[];
  galleries?: Gallery[];
}

export interface CreateObjectDto {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  sortOrder?: number;
  projectId?: string;
}

export type UpdateObjectDto = Partial<CreateObjectDto>;

// ==================== FEATURE ITEM (ОСОБЕННОСТИ) ====================

export interface FeatureItem {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  sortOrder: number;
  objectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureItemDto {
  title: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  objectId: string;
}

export type UpdateFeatureItemDto = Partial<CreateFeatureItemDto>;

// ==================== GALLERY ====================

export interface Gallery {
  id: string;
  title?: string | null;
  text?: string | null;
  sortOrder: number;
  objectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryWithRelations extends Gallery {
  media?: Media[];
}

export interface CreateGalleryDto {
  title?: string;
  text?: string;
  sortOrder?: number;
  objectId: string;
}

export type UpdateGalleryDto = Partial<CreateGalleryDto>;

// ==================== APARTMENT ====================

export interface Apartment {
  id: string;
  number: string;
  price: number;
  projectId: string;
  objectId: string;
  area?: number | null;
  rooms?: number | null;
  building?: string | null;
  entrance?: string | null;
  floor: number;
  floorTotal: number;
  completionDate?: string | null;
  finishing?: FinishingType | null;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApartmentWithRelations extends Apartment {
  project?: Project;
  object?: Object;
  layoutPhoto?: Media | null;
  floorPlanPhoto?: Media | null;
  masterPlanPhoto?: Media | null;
}

export interface CreateApartmentDto {
  number: string;
  price: number;
  projectId: string;
  objectId: string;
  area?: number;
  rooms?: number;
  building?: string;
  entrance?: string;
  floor: number;
  floorTotal: number;
  completionDate?: string;
  finishing?: FinishingType;
  isAvailable?: boolean;
  sortOrder?: number;
}

export type UpdateApartmentDto = Partial<CreateApartmentDto>;

// ==================== APPLICATION (ЗАЯВКА) ====================

export interface Application {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  type: ApplicationType;
  status: ApplicationStatus;
  ipAddress?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationDto {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  type: ApplicationType;
}

export interface UpdateApplicationDto {
  status?: ApplicationStatus;
}

// ==================== NEWS ====================

export interface News {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsWithRelations extends News {
  media?: Media[];
}

export interface CreateNewsDto {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  isPublished?: boolean;
  publishedAt?: string;
}

export type UpdateNewsDto = Partial<CreateNewsDto>;

// ==================== UPLOAD / FILE ====================

export interface UploadFile {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

export interface UploadResponse {
  id: string;
  url: string;
}

// ==================== API RESPONSES ====================

export interface ApiListResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode: number;
}
