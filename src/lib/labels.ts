import type {
  NewsSource,
  ParticipantStatus,
  PublicationStatus,
  ScheduleKind,
} from '../types/index.ts'

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

const publicationLabels: Record<PublicationStatus, string> = {
  draft: 'черновик',
  provisional: 'предварительно',
  official: 'официально',
}

export function publicationLabel(status: PublicationStatus): string {
  return publicationLabels[status]
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value)
}

export function formatRaceClock(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null) {
    return '—'
  }
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  return [hours, minutes, rest].map((part) => String(part).padStart(2, '0')).join(':')
}

export function formatStageStart(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  const day = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(date)
  const time = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
  return `${day} г. в ${time}`
}

export function formatDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null) {
    return '—'
  }
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(rest).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`
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
