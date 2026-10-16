const SEEN_KEY = 'avacha-vk-app.start-seen'
const PUSH_KEY = 'avacha-vk-app.push-consent'

export function isStartSeen(): boolean {
  return localStorage.getItem(SEEN_KEY) === '1'
}

export function markStartSeen(pushConsent: boolean): void {
  localStorage.setItem(SEEN_KEY, '1')
  localStorage.setItem(PUSH_KEY, pushConsent ? '1' : '0')
}
