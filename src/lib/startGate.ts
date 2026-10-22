const SEEN_KEY = 'avacha-vk-app.start-seen'
const CONSENT_KEY = 'avacha-vk-app.start-consent'

export function isStartSeen(): boolean {
  return localStorage.getItem(SEEN_KEY) === '1'
}

export function markStartSeen(): void {
  localStorage.setItem(SEEN_KEY, '1')
}

export function hasStartConsent(): boolean {
  return localStorage.getItem(CONSENT_KEY) === '1'
}

export function markStartConsent(): void {
  localStorage.setItem(CONSENT_KEY, '1')
}
