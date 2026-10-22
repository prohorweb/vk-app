import type { NotificationEventType } from '../types/index.ts'

const STORAGE_KEY = 'avacha-vk-app.notification-settings'

export const NOTIFICATION_PREFERENCES: ReadonlyArray<{
  event_type: NotificationEventType
  title: string
}> = [
  { event_type: 'stage_start', title: 'Старт этапа' },
  { event_type: 'stage_finish', title: 'Финиш этапа' },
  { event_type: 'checkpoint_passed', title: 'Прохождение контрольного пункта' },
  { event_type: 'leader_changed', title: 'Смена лидера' },
  { event_type: 'participant_finished', title: 'Финиш участника' },
  { event_type: 'broadcast', title: 'Общие объявления' },
  { event_type: 'favorite_update', title: 'Обновления по избранным' },
]

export type NotificationSettingsState = {
  notifications_allowed: boolean
  preferences: Record<NotificationEventType, boolean>
}

function defaultPreferences(enabled: boolean): Record<NotificationEventType, boolean> {
  return Object.fromEntries(
    NOTIFICATION_PREFERENCES.map((item) => [item.event_type, enabled]),
  ) as Record<NotificationEventType, boolean>
}

function defaultState(enabled: boolean): NotificationSettingsState {
  return {
    notifications_allowed: enabled,
    preferences: defaultPreferences(enabled),
  }
}

function parseStored(raw: string | null): NotificationSettingsState | null {
  if (!raw) {
    return null
  }
  try {
    const parsed = JSON.parse(raw) as Partial<NotificationSettingsState>
    if (typeof parsed.notifications_allowed !== 'boolean' || !parsed.preferences) {
      return null
    }
    const preferences = defaultPreferences(false)
    for (const item of NOTIFICATION_PREFERENCES) {
      const value = parsed.preferences[item.event_type]
      preferences[item.event_type] = value === true
    }
    return {
      notifications_allowed: parsed.notifications_allowed,
      preferences,
    }
  } catch {
    return null
  }
}

export function readNotificationSettings(): NotificationSettingsState {
  return parseStored(localStorage.getItem(STORAGE_KEY)) ?? defaultState(false)
}

function writeNotificationSettings(state: NotificationSettingsState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function applyStartNotificationConsent(enabled: boolean): void {
  writeNotificationSettings(defaultState(enabled))
}

export function setNotificationsAllowed(enabled: boolean): NotificationSettingsState {
  const next = defaultState(enabled)
  writeNotificationSettings(next)
  return next
}

export function setNotificationPreference(
  eventType: NotificationEventType,
  enabled: boolean,
): NotificationSettingsState {
  const current = readNotificationSettings()
  if (!current.notifications_allowed && !enabled) {
    return current
  }
  const preferences = { ...current.preferences, [eventType]: enabled }
  const notifications_allowed = Object.values(preferences).some((value) => value === true)
  const next = {
    notifications_allowed,
    preferences: notifications_allowed ? preferences : defaultPreferences(false),
  }
  writeNotificationSettings(next)
  return next
}

export function isPreferenceEnabled(
  state: NotificationSettingsState,
  eventType: NotificationEventType,
): boolean {
  return state.notifications_allowed && state.preferences[eventType] === true
}
