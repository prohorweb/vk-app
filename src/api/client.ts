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

  constructor(status: number, message = 'Ошибка запроса') {
    super(status ? `${message} (${status})` : message)
    this.name = 'ApiError'
    this.status = status
  }
}

function readApiBaseUrl(): string | undefined {
  const value = import.meta.env.VITE_API_URL
  if (!value) {
    return undefined
  }
  return value.replace(/\/$/, '')
}

export const apiBaseUrl = readApiBaseUrl()

export const hasApiUrl = apiBaseUrl !== undefined

const AUTH_PATH = '/api/v1/auth/vk'
const RETRY_HEADER = 'x-auth-retry'

let onUnauthorized: (() => Promise<boolean>) | null = null

export function setUnauthorizedHandler(handler: () => Promise<boolean>): void {
  onUnauthorized = handler
}

async function apiFetch(input: Request): Promise<Response> {
  if (!hasApiUrl) {
    throw new ApiError(0, 'Не задан VITE_API_URL')
  }
  return fetch(input)
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = getAccessToken()
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    return request
  },
  async onResponse({ response, request, schemaPath }) {
    if (response.status !== 401 || schemaPath === AUTH_PATH) {
      return response
    }
    if (request.headers.get(RETRY_HEADER) === '1') {
      return response
    }

    if (!onUnauthorized) {
      return response
    }

    const signedIn = await onUnauthorized()
    const token = getAccessToken()
    if (!signedIn || !token) {
      return response
    }

    const headers = new Headers(request.headers)
    headers.set('Authorization', `Bearer ${token}`)
    headers.set(RETRY_HEADER, '1')
    return fetch(new Request(request, { headers }))
  },
}

export const api = createClient<paths>({
  baseUrl: apiBaseUrl ?? 'http://127.0.0.1',
  fetch: apiFetch,
})

api.use(authMiddleware)

export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.error !== undefined || result.data === undefined) {
    throw new ApiError(result.response.status || 0)
  }
  return result.data
}
