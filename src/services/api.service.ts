import axios, { type AxiosInstance } from 'axios'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api'

// Read persisted token from zustand storage
export function getPersistedToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-store')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const token = parsed?.state?.token || parsed?.token || null
    return token ? String(token) : null
  } catch {
    return null
  }
}

export function attachAuthInterceptor(instance: AxiosInstance) {
  instance.interceptors.request.use((config) => {
    // Normalize headers type
    const headers: Record<string, any> = (config.headers as any) || {}
    const hasAuth = !!headers.Authorization
    if (!hasAuth) {
      const token = getPersistedToken()
      if (token) {
        const t = String(token).replace(/^Bearer\s+/i, '')
        headers.Authorization = `Bearer ${t}`
      }
    }
    config.headers = headers as any
    return config
  })
}

// Default API instance with interceptor (optional for services to reuse)
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

attachAuthInterceptor(api)
