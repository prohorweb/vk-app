const TOKEN_KEY = 'avacha-vk-app.access-token'
const EXPIRES_KEY = 'avacha-vk-app.access-token-expires-at'

let accessToken: string | null = null
let expiresAt: number | null = null

function readStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // sessionStorage может быть недоступен, токен остаётся в памяти.
  }
}

function removeStorage(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch {
    // Нет доступа к sessionStorage.
  }
}

function isExpired(expires: number | null): boolean {
  return expires !== null && Date.now() >= expires
}

function restoreToken(): void {
  const storedToken = readStorage(TOKEN_KEY)
  const rawExpires = readStorage(EXPIRES_KEY)
  const storedExpires = rawExpires === null ? null : Number(rawExpires)
  const expires = storedExpires !== null && Number.isFinite(storedExpires) ? storedExpires : null

  if (!storedToken || isExpired(expires)) {
    removeStorage(TOKEN_KEY)
    removeStorage(EXPIRES_KEY)
    return
  }

  accessToken = storedToken
  expiresAt = expires
}

restoreToken()

export function getAccessToken(): string | null {
  if (isExpired(expiresAt)) {
    clearToken()
    return null
  }
  return accessToken
}

export function setAccessToken(token: string, expiresIn?: number): void {
  accessToken = token
  expiresAt =
    typeof expiresIn === 'number' && Number.isFinite(expiresIn) && expiresIn > 0
      ? Date.now() + expiresIn * 1000
      : null
  writeStorage(TOKEN_KEY, token)
  if (expiresAt === null) {
    removeStorage(EXPIRES_KEY)
    return
  }
  writeStorage(EXPIRES_KEY, String(expiresAt))
}

export function clearToken(): void {
  accessToken = null
  expiresAt = null
  removeStorage(TOKEN_KEY)
  removeStorage(EXPIRES_KEY)
}
