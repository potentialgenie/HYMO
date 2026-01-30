/**
 * API base URL and helpers for HTTP calls.
 * Use apiUrl(route) so only the route is specified when calling APIs.
 */
export const API_BASE = "https://www.hymosetups.com"

export function apiUrl(route: string): string {
  const path = route.startsWith("/") ? route : `/${route}`
  return `${API_BASE}${path}`
}

export const IMAGE_BASE = apiUrl("/storage/")
