import { DEFAULT_API_BASE_URL } from "~/config/api.config";

export function getFullUrl(url: string): string {
  return `${DEFAULT_API_BASE_URL}${url}`;
}
