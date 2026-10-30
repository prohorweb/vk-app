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
  /** Глобальный master: push включён. Не меняет отдельные preference. */
  notifications_allowed: boolean
  /** Независимые типы событий гонки. */
  preferences: Record<NotificationEventType, boolean>
  /** Уведомления по избранным участникам: id → включено. */
  participant_notifications: Record<string, boolean>
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
    participant_notifications: {},
  }
}

function parseParticipantNotifications(raw: unknown): Record<string, boolean> {
  if (!raw || typeof raw !== 'object') {
    return {}
  }
  const next: Record<string, boolean> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === true || value === false) {
      next[key] = value
    }
  }
  return next
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
      participant_notifications: parseParticipantNotifications(parsed.participant_notifications),
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

/** Старт: согласие включает push и все типы событий. */
export function applyStartNotificationConsent(enabled: boolean): void {
  writeNotificationSettings(defaultState(enabled))
}

/** Только master push. Отдельные переключатели не трогаем. */
export function setNotificationsAllowed(enabled: boolean): NotificationSettingsState {
  const current = readNotificationSettings()
  const next = {
    ...current,
    notifications_allowed: enabled,
  }
  writeNotificationSettings(next)
  return next
}

/** Один тип события — независимо от остальных. Master не меняем. */
export function setNotificationPreference(
  eventType: NotificationEventType,
  enabled: boolean,
): NotificationSettingsState {
  const current = readNotificationSettings()
  const next = {
    ...current,
    preferences: { ...current.preferences, [eventType]: enabled },
  }
  writeNotificationSettings(next)
  return next
}

/** Переключатель уведомлений по конкретному избранному участнику. */
export function setParticipantNotifications(
  participantId: number,
  enabled: boolean,
): NotificationSettingsState {
  const current = readNotificationSettings()
  const next = {
    ...current,
    participant_notifications: {
      ...current.participant_notifications,
      [String(participantId)]: enabled,
    },
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

/** По умолчанию для избранного — включено, пока пользователь не выключил. */
export function isParticipantNotifyEnabled(
  state: NotificationSettingsState,
  participantId: number,
): boolean {
  if (!state.notifications_allowed) {
    return false
  }
  const stored = state.participant_notifications[String(participantId)]
  return stored !== false
}
