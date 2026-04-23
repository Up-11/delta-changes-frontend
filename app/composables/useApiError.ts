/**
 * API Error Handler Composable - Shows toast notifications for API errors
 */

import type { FetchError } from "ofetch";

interface ErrorResponse {
  message?: string;
  statusCode?: number;
  statusMessage?: string;
}

export function useApiError() {
  const toast = useToast();

  function handleError(error: unknown, context?: string) {
    const fetchError = error as FetchError<ErrorResponse>;
    const statusCode = fetchError.statusCode || 500;
    const message =
      fetchError.data?.message || fetchError.message || "Неизвестная ошибка";

    // Don't show toast for 401 (handled by auth flow)
    if (statusCode === 401) {
      return;
    }

    const title = context || getErrorTitle(statusCode);
    const color = getErrorColor(statusCode) as
      | "neutral"
      | "primary"
      | undefined;
    const icon = getErrorIcon(statusCode);

    toast.add({
      title,
      description: message,
      color,
      icon,
    });
  }

  function showSuccess(title: string, description?: string) {
    toast.add({
      title,
      description: description || "",
      color: "primary",
      icon: "i-lucide-check-circle",
    });
  }

  function showWarning(title: string, description?: string) {
    toast.add({
      title,
      description: description || "",
      color: "neutral",
      icon: "i-lucide-alert-triangle",
    });
  }

  function showInfo(title: string, description?: string) {
    toast.add({
      title,
      description: description || "",
      color: "primary",
      icon: "i-lucide-info",
    });
  }

  return {
    handleError,
    showSuccess,
    showWarning,
    showInfo,
  };
}

function getErrorTitle(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "Некорректный запрос";
    case 403:
      return "Доступ запрещен";
    case 404:
      return "Не найдено";
    case 409:
      return "Конфликт данных";
    case 422:
      return "Ошибка валидации";
    case 500:
      return "Ошибка сервера";
    case 503:
      return "Сервис недоступен";
    default:
      return "Ошибка";
  }
}

function getErrorColor(statusCode: number): "neutral" | "primary" | undefined {
  if (statusCode >= 500) return "neutral";
  if (statusCode === 422 || statusCode === 400) return "neutral";
  if (statusCode === 403 || statusCode === 404) return "neutral";
  return "neutral";
}

function getErrorIcon(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "i-lucide-alert-circle";
    case 403:
      return "i-lucide-shield-off";
    case 404:
      return "i-lucide-search-x";
    case 422:
      return "i-lucide-file-warning";
    case 500:
      return "i-lucide-server-off";
    case 503:
      return "i-lucide-cloud-off";
    default:
      return "i-lucide-circle-alert";
  }
}
