const SEEN_KEY = 'avacha-vk-app.start-seen'

export function isStartSeen(): boolean {
  return localStorage.getItem(SEEN_KEY) === '1'
}

export function markStartSeen(): void {
  localStorage.setItem(SEEN_KEY, '1')
}
