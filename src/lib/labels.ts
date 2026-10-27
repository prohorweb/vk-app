import type {
  DisciplinePublic,
  NewsSource,
  ParticipantStatus,
  PublicationStatus,
  ScheduleKind,
} from '../types/index.ts'
import { guessGender, type PersonGender } from './gender.ts'

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

/**
 * Названия дисциплин по макету. Справочник пока отдаёт прежние формулировки,
 * поэтому подписи живут на слое отображения и снимаются после его обновления.
 */
const disciplineLabels: Record<string, string> = {
  long: 'Лыжи – 2 собаки',
  middle: 'Нарта – 8 собак',
  sprint: 'Нарта – более 8 собак',
}

export function disciplineLabel(discipline: DisciplinePublic): string {
  return disciplineLabels[discipline.code] ?? discipline.name
}

/**
 * Полная подпись дисциплины в карточке участника. Реестровый номер есть
 * только у длинной дистанции — у остальных его не придумываем.
 */
const disciplineCardLabels: Record<string, string> = {
  long: 'Лыжи – длинная дистанция 2 собаки (0710153811Л)',
  middle: 'Нарта – 8 собак',
  sprint: 'Нарта – более 8 собак',
}

export function disciplineCardLabel(
  discipline: DisciplinePublic | undefined,
  fallback: string | null | undefined,
): string {
  if (discipline) {
    return disciplineCardLabels[discipline.code] ?? discipline.name
  }
  return fallback ?? '—'
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

function formatDatePart(value: string | number, year: 'numeric' | '2-digit'): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year,
  }).format(date)
}

function formatTimePart(value: string | number): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** «07.02.27 в 15:32» — для подписи «обновлено». */
export function formatShortDateTime(value: string | number): string {
  return `${formatDatePart(value, '2-digit')} в ${formatTimePart(value)}`
}

/** «07.02.2027 в 15:32» — для уведомления о последнем обновлении. */
export function formatFullDateTime(value: string | number): string {
  return `${formatDatePart(value, 'numeric')} в ${formatTimePart(value)}`
}

/** «07.02.27 в 14:00» — дата и время старта этапа. */
export function formatStageStart(value: string): string {
  return formatShortDateTime(value)
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

const feminineSurnameEnd = /(ова|ева|ёва|ина|ына)$/i
const masculineSurnameEnd = /(ов|ев|ёв|ин|ын)$/i
const consonantEnd = /[бвгджзклмнпрстфхцчшщ]$/i

function declineGivenName(name: string, gender: PersonGender): string {
  if (gender === 'female') {
    if (/а$/i.test(name)) {
      return `${name.slice(0, -1)}у`
    }
    if (/я$/i.test(name)) {
      return `${name.slice(0, -1)}ю`
    }
    return name
  }
  if (/[йь]$/i.test(name)) {
    return `${name.slice(0, -1)}я`
  }
  if (consonantEnd.test(name)) {
    return `${name}а`
  }
  return name
}

function declinePatronymic(name: string, gender: PersonGender): string {
  if (gender === 'female' && /а$/i.test(name)) {
    return `${name.slice(0, -1)}у`
  }
  if (gender === 'male' && consonantEnd.test(name)) {
    return `${name}а`
  }
  return name
}

function declineSurname(name: string, gender: PersonGender): string {
  if (gender === 'female') {
    if (/ая$/i.test(name)) {
      return `${name.slice(0, -2)}ую`
    }
    if (feminineSurnameEnd.test(name)) {
      return `${name.slice(0, -1)}у`
    }
    if (/я$/i.test(name)) {
      return `${name.slice(0, -1)}ю`
    }
    return name
  }
  if (masculineSurnameEnd.test(name)) {
    return `${name}а`
  }
  if (/(ий|ый|ой)$/i.test(name)) {
    return `${name.slice(0, -2)}ого`
  }
  if (/ь$/i.test(name)) {
    return `${name.slice(0, -1)}я`
  }
  return name
}

/** Только имя в винительном падеже — для кнопки «Болею за …», без фамилии. */
export function participantFirstNameAccusative(name: string): string {
  const given = name.trim().split(/\s+/).filter(Boolean)[0]
  if (!given) {
    return name
  }
  return declineGivenName(given, guessGender(name))
}

/**
 * Имя в винительном падеже для поста «Болею за …».
 * Правила простые: в справочнике только имя и фамилия, отчества почти нет.
 */
export function participantAccusative(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return name
  }

  const gender = guessGender(name)
  const given = declineGivenName(words[0], gender)
  if (words.length === 1) {
    return given
  }

  const surname = declineSurname(words[words.length - 1], gender)
  if (words.length === 2) {
    return `${given} ${surname}`
  }

  const patronymic = declinePatronymic(words[1], gender)
  return `${given} ${patronymic} ${surname}`
}
