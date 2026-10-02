import type { NewsSource, ParticipantStatus, ScheduleKind } from '../types/index.ts'

const participantStatusLabels: Record<ParticipantStatus, string> = {
  registered: 'заявлен',
  active: 'на дистанции',
  finished: 'финишировал',
  withdrawn: 'снят',
  disqualified: 'дисквалифицирован',
}

const scheduleKindLabels: Record<ScheduleKind, string> = {
  race: 'Гонка',
  cultural: 'Культура',
  other: 'Другое',
}

const newsSourceLabels: Record<NewsSource, string> = {
  manual: 'Редакция',
  vk: 'ВКонтакте',
}

export function participantStatusLabel(status: ParticipantStatus): string {
  return participantStatusLabels[status]
}

export function scheduleKindLabel(kind: ScheduleKind): string {
  return scheduleKindLabels[kind]
}

export function newsSourceLabel(source: NewsSource): string {
  return newsSourceLabels[source]
}

export function formatClock(timestamp: number): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

export function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
