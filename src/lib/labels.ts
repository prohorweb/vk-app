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

/** Сокращённая запись больших чисел: 1240 → «1,2 тыс.». */
export function formatCompactCount(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/** «68 фотографий», «42 фотографии», «1 фотография». */
export function formatPhotoCount(count: number): string {
  const modulo10 = count % 10
  const modulo100 = count % 100
  if (modulo10 === 1 && modulo100 !== 11) {
    return `${count} фотография`
  }
  if (modulo10 >= 2 && modulo10 <= 4 && (modulo100 < 12 || modulo100 > 14)) {
    return `${count} фотографии`
  }
  return `${count} фотографий`
}

const relativeTimeUnits: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
]

/** «6 месяцев назад», «2 месяца назад», «через 1 час». */
export function formatRelativeTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  const diffMs = date.getTime() - Date.now()
  const formatter = new Intl.RelativeTimeFormat('ru', { numeric: 'always' })
  for (const [unit, unitMs] of relativeTimeUnits) {
    if (Math.abs(diffMs) >= unitMs) {
      return formatter.format(Math.round(diffMs / unitMs), unit)
    }
  }
  return formatter.format(0, 'minute')
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
