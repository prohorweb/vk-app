const STORAGE_KEY = 'vk-app.access-token'

function readStoredToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

let accessToken: string | null = readStoredToken()

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string): void {
  accessToken = token
  try {
    sessionStorage.setItem(STORAGE_KEY, token)
  } catch {
    // sessionStorage может быть недоступен, токен остаётся в памяти.
  }
}
