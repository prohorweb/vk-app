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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function resolveApiUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL
  if (!base) {
    return ''
  }

  const normalized = base.endsWith('/') ? base : `${base}/`
  const relative = path.startsWith('/') ? path.slice(1) : path
  return new URL(relative, normalized).toString()
}

/**
 * Собирает адрес из VITE_API_URL. Пока сервера нет, возвращает mock
 * и не ходит в сеть, чтобы заготовка открывалась без бэкенда.
 */
export async function fetchJson<T>(path: string, mock: T): Promise<T> {
  if (!navigator.onLine) {
    throw new OfflineError()
  }

  const endpoint = resolveApiUrl(path)
  if (!endpoint) {
    throw new ApiError(0)
  }

  await delay(280)
  return structuredClone(mock)
}
