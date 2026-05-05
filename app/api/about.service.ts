import { api } from "./client";
import type {
  AboutPage,
  TimelineEvent,
  Shareholder,
  UpdateAboutPageDto,
  CreateTimelineEventDto,
  CreateShareholderDto,
} from "./types";

export const aboutService = {
  /** Получить все данные страницы О компании */
  async getAboutData(): Promise<{
    about: AboutPage;
    timeline: TimelineEvent[];
    shareholders: Shareholder[];
  }> {
    return api.get("/about");
  },

  /** Обновить настройки страницы О компании */
  async updateAbout(data: UpdateAboutPageDto): Promise<AboutPage> {
    return api.patch("/about", data);
  },

  /** Создать событие таймлайна */
  async createTimelineEvent(
    data: CreateTimelineEventDto,
  ): Promise<TimelineEvent> {
    return api.post("/about/timeline", data);
  },

  /** Обновить событие таймлайна */
  async updateTimelineEvent(
    id: string,
    data: Partial<CreateTimelineEventDto>,
  ): Promise<TimelineEvent> {
    return api.patch(`/about/timeline/${id}`, data);
  },

  /** Удалить событие таймлайна */
  async deleteTimelineEvent(id: string): Promise<void> {
    return api.delete(`/about/timeline/${id}`);
  },

  /** Создать акционера/сотрудника */
  async createShareholder(data: CreateShareholderDto): Promise<Shareholder> {
    return api.post("/about/shareholders", data);
  },

  /** Обновить акционера/сотрудника */
  async updateShareholder(
    id: string,
    data: Partial<CreateShareholderDto>,
  ): Promise<Shareholder> {
    return api.patch(`/about/shareholders/${id}`, data);
  },

  /** Удалить акционера/сотрудника */
  async deleteShareholder(id: string): Promise<void> {
    return api.delete(`/about/shareholders/${id}`);
  },
};
