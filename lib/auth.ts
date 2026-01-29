/**
 * Authentication utility functions for managing access tokens and refresh tokens
 */

export interface LoginResponse {
  status: boolean
  message: string
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: {
    id: number
    name: string
    lastname: string
    email: string
    email_verified_at: string | null
    phone: string | null
    address: string | null
    address2: string | null
    city: string | null
    state: string | null
    country: string | null
    zip: string | null
    active: string
    created_at: string
  }
}

export interface RefreshResponse {
  status: boolean
  message: string
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

const ACCESS_TOKEN_KEY = "hymo_access_token"
const REFRESH_TOKEN_KEY = "hymo_refresh_token"
const USER_KEY = "hymo_user"
const TOKEN_EXPIRY_KEY = "hymo_token_expiry"

let refreshInFlight: Promise<RefreshResponse> | null = null

/**
 * Store authentication tokens and user data
 */
export function storeAuthData(data: LoginResponse): void {
  if (typeof window === "undefined") return

  // Calculate expiry timestamp (current time + expires_in seconds)
  const expiryTimestamp = Date.now() + data.expires_in * 1000

  localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token)
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)
  localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTimestamp.toString())
}

/**
 * Store new tokens (refresh flow).
 * Keeps existing user info in storage.
 */
export function storeRefreshedTokens(data: RefreshResponse): void {
  if (typeof window === "undefined") return
  const expiryTimestamp = Date.now() + data.expires_in * 1000
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token)
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTimestamp.toString())
}

/**
 * Get the access token from storage
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Get the refresh token from storage
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Get the stored user data
 */
export function getUser(): LoginResponse["user"] | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

/**
 * Check if the access token is expired
 */
export function isTokenExpired(): boolean {
  if (typeof window === "undefined") return true
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!expiryStr) return true
  const expiry = parseInt(expiryStr, 10)
  return Date.now() >= expiry
}

/**
 * Returns true if we have any session material stored (access or refresh token).
 * (Useful for UI like Navbar; access token may be expired but refresh can restore it.)
 */
export function hasSession(): boolean {
  return getAccessToken() !== null || getRefreshToken() !== null
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken()
  return token !== null && !isTokenExpired()
}

/**
 * Refresh access token using refresh_token.
 * POST https://www.hymosetups.com/api/v1/refresh
 * body: { refresh_token }
 */
export async function refreshAccessToken(): Promise<RefreshResponse> {
  if (typeof window === "undefined") {
    throw new Error("refreshAccessToken can only run in the browser")
  }

  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error("Missing refresh token")
  }

  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    const res = await fetch("https://www.hymosetups.com/api/v1/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    const contentType = res.headers.get("content-type") || ""
    const payload = contentType.includes("application/json") ? await res.json().catch(() => null) : await res.text().catch(() => "")

    if (!res.ok) {
      const message =
        (typeof payload === "object" &&
          payload &&
          "message" in payload &&
          typeof (payload as any).message === "string" &&
          (payload as any).message) ||
        (typeof payload === "string" && payload) ||
        "Failed to refresh session"
      throw new Error(message)
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      !("access_token" in payload) ||
      !("refresh_token" in payload) ||
      !("expires_in" in payload)
    ) {
      throw new Error("Invalid refresh response")
    }

    const data = payload as RefreshResponse
    storeRefreshedTokens(data)
    return data
  })()

  try {
    return await refreshInFlight
  } finally {
    refreshInFlight = null
  }
}

/**
 * Fetch helper that automatically:
 * - adds Authorization header (if available)
 * - refreshes token if expired
 * - retries once on 401 after refresh
 */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  if (typeof window === "undefined") {
    // On server we don't have localStorage tokens
    return fetch(input, init)
  }

  const doFetch = async (): Promise<Response> => {
    const headers = new Headers(init.headers)
    const auth = getAuthHeader()
    if (auth && !headers.has("Authorization")) {
      headers.set("Authorization", auth)
    }
    return fetch(input, { ...init, headers })
  }

  // If token is expired but we have refresh token, try refreshing first
  if (isTokenExpired() && getRefreshToken()) {
    try {
      await refreshAccessToken()
    } catch {
      clearAuthData()
    }
  }

  let res = await doFetch()
  if (res.status === 401 && getRefreshToken()) {
    try {
      await refreshAccessToken()
      res = await doFetch()
    } catch {
      clearAuthData()
    }
  }
  return res
}

/**
 * Clear all authentication data (logout)
 */
export function clearAuthData(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_EXPIRY_KEY)
}

/**
 * Logout: call API with email (body) and Bearer refresh_token, then clear localStorage.
 * POST https://www.hymosetups.com/api/v1/logout
 * Always clears local auth data even if the API call fails.
 */
export async function logout(): Promise<void> {
  if (typeof window === "undefined") return

  const refreshToken = getRefreshToken()
  const user = getUser()
  const email = user?.email

  try {
    if (refreshToken && email) {
      await fetch("https://www.hymosetups.com/api/v1/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ email }),
      })
    }
  } finally {
    clearAuthData()
  }
}

/**
 * Get authorization header value for API requests
 */
export function getAuthHeader(): string | null {
  const token = getAccessToken()
  if (!token) return null
  return `Bearer ${token}`
}
