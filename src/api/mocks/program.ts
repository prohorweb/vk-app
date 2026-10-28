export type ProgramDay = {
  id: string
  day: string
  weekday: string
  label: string
}

export type ProgramEvent = {
  id: string
  dayId: string
  time: string
  title: string
  place: string
}

export type ProgramAllDayZone = {
  id: string
  title: string
  icon: 'stage' | 'food' | 'photo' | 'ethno'
}

export type SpectatorArrivalRow = {
  place: number
  participantId: number
  name: string
  region: string
  time: string
  gap: string | null
}

export const programRaceCard = {
  title: 'Гонка «Авача»',
  meta: '6 этапов • 300 км',
  dates: '3 – 15 февраля',
}

export const programDays: ProgramDay[] = [
  { id: '2026-02-03', day: '03', weekday: 'пн', label: '03 пн' },
  { id: '2026-02-04', day: '04', weekday: 'вт', label: '04 вт' },
  { id: '2026-02-05', day: '05', weekday: 'ср', label: '05 ср' },
  { id: '2026-02-06', day: '06', weekday: 'чт', label: '06 чт' },
  { id: '2026-02-07', day: '07', weekday: 'пт', label: '07 пт' },
  { id: '2026-02-08', day: '08', weekday: 'сб', label: '08 сб' },
  { id: '2026-02-09', day: '09', weekday: 'вс', label: '09 вс' },
  { id: '2026-02-10', day: '10', weekday: 'пн', label: '10 пн' },
  { id: '2026-02-11', day: '11', weekday: 'вт', label: '11 вт' },
  { id: '2026-02-12', day: '12', weekday: 'ср', label: '12 ср' },
  { id: '2026-02-13', day: '13', weekday: 'чт', label: '13 чт' },
  { id: '2026-02-14', day: '14', weekday: 'пт', label: '14 пт' },
  { id: '2026-02-15', day: '15', weekday: 'вс', label: '15 вс' },
]

export const programMockTodayId = '2026-02-06'

export const programDayTitles: Record<string, string> = {
  '2026-02-06': 'Четверг, 6 февраля',
}

export function programDayTitle(dayId: string): string {
  return programDayTitles[dayId] ?? 'Расписание дня'
}

const eventsFeb6: ProgramEvent[] = [
  { id: 'e1', dayId: '2026-02-06', time: '12:00', title: 'Старт Этапа 2', place: 'Авачинский' },
  {
    id: 'e2',
    dayId: '2026-02-06',
    time: '13:30',
    title: 'Концерт ансамбля',
    place: 'Главная сцена',
  },
  { id: 'e3', dayId: '2026-02-06', time: '14:00', title: 'Награждение', place: 'Главная сцена' },
  { id: 'e4', dayId: '2026-02-06', time: '15:30', title: 'Мастер-класс', place: 'Этнозона' },
  { id: 'e5', dayId: '2026-02-06', time: '16:00', title: 'Экскурсия', place: 'Фотозона' },
  { id: 'e6', dayId: '2026-02-06', time: '17:00', title: 'Финиш этапа', place: 'Авачинский' },
  {
    id: 'e7',
    dayId: '2026-02-06',
    time: '18:30',
    title: 'Вечерняя программа',
    place: 'Главная сцена',
  },
]

export const programEventsByDay: Record<string, ProgramEvent[]> = {
  '2026-02-06': eventsFeb6,
}

export function programEventsForDay(dayId: string): ProgramEvent[] {
  return programEventsByDay[dayId] ?? []
}

export const programAllDayZones: ProgramAllDayZone[] = [
  { id: 'stage', title: 'Сцена', icon: 'stage' },
  { id: 'food', title: 'Фудкорт', icon: 'food' },
  { id: 'photo', title: 'Фотозона', icon: 'photo' },
  { id: 'ethno', title: 'Этнозона', icon: 'ethno' },
]

export const spectatorArrival = {
  updatedAt: '2027-02-07T14:32:00+03:00',
  rows: [
    {
      place: 1,
      participantId: 1,
      name: 'Иван Петров',
      region: 'Москва',
      time: '13:54:59',
      gap: null,
    },
    {
      place: 2,
      participantId: 2,
      name: 'Мария Соколова',
      region: 'Санкт-Петербург',
      time: '13:57:30',
      gap: '2:31',
    },
    {
      place: 3,
      participantId: 3,
      name: 'Алексей Ким',
      region: 'Камчатский край',
      time: '14:01:12',
      gap: '6:13',
    },
  ] satisfies SpectatorArrivalRow[],
}

export function defaultProgramDayId(): string {
  const today = programMockTodayId
  if (programDays.some((day) => day.id === today)) {
    return today
  }
  return programDays[0]?.id ?? programMockTodayId
}
