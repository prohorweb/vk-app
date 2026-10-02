import createClient, { type Middleware } from 'openapi-fetch'
import type { paths } from './schema.d.ts'
import { getAccessToken } from './token.ts'

export class OfflineError extends Error {
  constructor() {
    super('offline')
    this.name = 'OfflineError'
  }
}

export class ApiError extends Error {
  status: number

  constructor(status: number) {
    super('request failed')
    this.name = 'ApiError'
    this.status = status
  }
}

function apiBaseUrl(): string {
  return import.meta.env.VITE_API_URL.replace(/\/$/, '')
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = getAccessToken()
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  },
}

export const api = createClient<paths>({ baseUrl: apiBaseUrl() })

api.use(authMiddleware)

export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.error !== undefined || result.data === undefined) {
    throw new ApiError(result.response.status || 0)
  }
  return result.data
}
