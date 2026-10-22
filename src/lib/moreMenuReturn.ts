const RETURN_KEY = 'avacha-vk-app.more-return-path'

export function setMoreMenuReturn(path: string): void {
  sessionStorage.setItem(RETURN_KEY, path)
}

export function consumeMoreMenuReturn(): string | null {
  const value = sessionStorage.getItem(RETURN_KEY)
  if (value) {
    sessionStorage.removeItem(RETURN_KEY)
  }
  return value
}
