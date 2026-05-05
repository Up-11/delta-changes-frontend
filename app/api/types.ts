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
  WHITE_CUBE = "WHITE_CUBE",
  TURNKEY = "TURNKEY",
  DESIGNER = "DESIGNER",
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
  media?: Media[] | null;
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
  mediaId?: string;
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
  mediaId?: string;
}

export type UpdateProjectDto = Partial<CreateProjectDto>;

// ==================== OBJECT (КОМПЛЕКС/ДОМ) ====================

export interface Object {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  conceptTitle?: string | null;
  conceptText?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  completionDate?: string | null;
  floors?: number | null;
  finishing?: FinishingType | null;
  isActive: boolean;
  sortOrder: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ObjectWithRelations extends Object {
  project?: Project | null;
  banner?: Media[];
  masterPlan?: Media | null;
  media?: Media[];
  apartments?: Apartment[];
  features?: FeatureItemWithRelations[];
  galleries?: GalleryWithRelations[];
  constructionProgress?: ConstructionProgress[];
  infrastructure?: InfrastructurePoint[];
}

export interface FeatureItemWithRelations extends FeatureItem {
  media?: Media[];
}

export interface ConstructionProgress {
  id: string;
  month: number;
  year: number;
  title?: string | null;
  description?: string | null;
  media?: Media[];
  createdAt: string;
  updatedAt: string;
}

export interface InfrastructurePoint {
  id: string;
  title: string;
  category: InfrastructureCategory;
  latitude: number;
  longitude: number;
  address?: string | null;
}

export enum InfrastructureCategory {
  EDUCATION = "EDUCATION",
  SHOPPING = "SHOPPING",
  HEALTH = "HEALTH",
  SPORT = "SPORT",
  LEISURE = "LEISURE",
  TRANSPORT = "TRANSPORT",
}

export interface CreateObjectDto {
  name: string;
  slug: string;
  description?: string;
  conceptTitle?: string;
  conceptText?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  sortOrder?: number;
  projectId?: string;
  bannerId?: string;
  mediaIds?: string[];
  features?: { title: string; description?: string; mediaIds?: string[] }[];
  galleries?: { title?: string; mediaIds?: string[] }[];
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
  layoutPhotoId?: string | null;
  floorPlanPhotoId?: string | null;
  masterPlanPhotoId?: string | null;
}

export type UpdateApartmentDto = Partial<CreateApartmentDto>;

// ==================== APPLICATION (ЗАЯВКА) ====================

export interface Application {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  status: ApplicationStatus;
  apartmentId?: string | null;
  apartment?: Apartment | null;
  source?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationDto {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  apartmentId?: string;
  source?: string;
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
  publishedAt?: string | null;
  status: string;
  metaTitle?: string | null;
  metaDesc?: string | null;
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
  publishedAt?: string;
  status?: string;
  metaTitle?: string;
  metaDesc?: string;
  mediaIds?: string[];
}

export type UpdateNewsDto = Partial<CreateNewsDto>;

// ==================== MANAGER (ОТДЕЛ ПРОДАЖ) ====================

export interface Manager {
  id: string;
  name: string;
  position: string;
  phone?: string | null;
  isHead: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ManagerWithRelations extends Manager {
  media?: Media[];
}

export interface CreateManagerDto {
  name: string;
  position: string;
  phone?: string;
  isHead?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  mediaIds?: string[];
}

export type UpdateManagerDto = Partial<CreateManagerDto>;

// ==================== ABOUT PAGE ====================

export interface AboutPage {
  id: string;
  title: string;
  subtitle: string;
  announcement: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  stat4Value: string;
  stat4Label: string;
  pdfUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AboutPageWithRelations extends AboutPage {
  media?: Media[];
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Shareholder {
  id: string;
  name: string;
  position: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShareholderWithRelations extends Shareholder {
  media?: Media[];
}

export interface UpdateAboutPageDto {
  title?: string;
  subtitle?: string;
  announcement?: string;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
  stat4Value?: string;
  stat4Label?: string;
  mediaIds?: string[];
}

export interface CreateTimelineEventDto {
  year: string;
  title: string;
  description: string;
  sortOrder?: number;
}

export interface CreateShareholderDto {
  name: string;
  position: string;
  sortOrder?: number;
}

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
