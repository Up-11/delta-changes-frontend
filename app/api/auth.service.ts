/**
 * Auth API Service - Real backend authentication
 */

import { API_ENDPOINTS, buildApiUrl } from '~/config/api.config'
import { api, setAuthToken, removeAuthToken } from './client'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: string
    username: string
    role: string
  }
}

export interface UserProfile {
  id: string
  username: string
  role: string
  createdAt: string
}

/**
 * Login with username and password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const endpoint = API_ENDPOINTS.auth.login
  const url = buildApiUrl(endpoint.path)

  const response = await $fetch<LoginResponse>(url, {
    method: endpoint.method,
    body: { ...credentials, client: "admin" },
  })

  // Store token
  if (response.access_token) {
    setAuthToken(response.access_token)
  }

  return response
}

/**
 * Logout and invalidate token
 */
export async function logout(): Promise<void> {
  const token = localStorage.getItem('auth_token')

  if (token) {
    try {
      const endpoint = API_ENDPOINTS.auth.logout
      const url = buildApiUrl(endpoint.path)

      await $fetch(url, {
        method: endpoint.method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch {
      // Ignore errors - still clear local token
    }
  }

  removeAuthToken()
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<UserProfile | null> {
  const token = localStorage.getItem('auth_token')

  if (!token) {
    return null
  }

  try {
    const endpoint = API_ENDPOINTS.auth.profile
    const url = buildApiUrl(endpoint.path)

    const profile = await $fetch<UserProfile>(url, {
      method: endpoint.method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return profile
  } catch {
    // Token invalid or expired
    removeAuthToken()
    return null
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (import.meta.client) {
    return !!localStorage.getItem('auth_token')
  }
  return false
}
