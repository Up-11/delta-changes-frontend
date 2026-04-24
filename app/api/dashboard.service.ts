/**
 * Dashboard Service - API для работы с дашбордом
 */

import { api } from './client'
import { API_ENDPOINTS } from '~/config/api.config'

export const dashboardService = {
  /** Получить статистику дашборда */
  async getStats(): Promise<{
    objects: number;
    apartments: number;
    applications: number;
    news: number;
  }> {
    return api.get(API_ENDPOINTS.dashboard.stats.path)
  },

  /** Получить последние заявки */
  async getRecentApplications(): Promise<any[]> {
    return api.get(API_ENDPOINTS.dashboard.recentApplications.path)
  },
}
