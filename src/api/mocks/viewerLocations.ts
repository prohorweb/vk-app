import type { ViewerLocationKind } from '../../types/index.ts'

export type SpectatorLocation = {
  id: string
  name: string
  kind: ViewerLocationKind
  lng: number
  lat: number
  address: string | null
  description: string | null
  directions: string | null
  travelTimeMinutes: number | null
  parkingInfo: string | null
  facilities: string[]
  photoUrl: string | null
  firstArrivalAt: string | null
  safetyNotes: string | null
  source: 'api' | 'mock'
}

/**
 * Fallback для карты зрительских локаций, когда API недоступен.
 * Координаты привязаны к трассе «Авачи» на Камчатке.
 */
export const mockSpectatorLocations: SpectatorLocation[] = [
  {
    id: 'mock-start',
    name: 'Старт гонки, Петропавловск-Камчатский',
    kind: 'start',
    lng: 158.637403,
    lat: 53.09619,
    address: 'Камчатский край, б/к им. В. Фатьянова',
    description: 'Зрительская площадка на старте гонки.',
    directions: 'От центра города 10 минут на такси или автобусе № 24 до ост. «Гонка».',
    travelTimeMinutes: 30,
    parkingInfo: 'Бесплатная парковка у площадки.',
    facilities: ['Парковка', 'Пункт обогрева', 'Кафе'],
    photoUrl: null,
    firstArrivalAt: null,
    safetyNotes: 'Держитесь за ограждения, собак на старте кормить запрещено.',
    source: 'mock',
  },
  {
    id: 'mock-finish',
    name: 'Финиш этапа 1, Пиначево',
    kind: 'finish',
    lng: 158.391665,
    lat: 53.349125,
    address: 'Камчатский край, Пиначево',
    description: 'Зрительская площадка на финише первого этапа.',
    directions: 'Из города — экскурсионный автобус раз в час, в пути около 1,5 часов.',
    travelTimeMinutes: 90,
    parkingInfo: 'Бесплатная парковка у площадки.',
    facilities: ['Парковка', 'Пункт обогрева', 'Кафе'],
    photoUrl: null,
    firstArrivalAt: null,
    safetyNotes: 'Соблюдайте дистанцию до финишного створа, не выходите на лёд реки.',
    source: 'mock',
  },
  {
    id: 'mock-viewpoint',
    name: 'Смотровая площадка «Перевал Двойной»',
    kind: 'viewpoint',
    lng: 158.57592,
    lat: 53.331542,
    address: 'Камчатский край, перевал Двойной',
    description: 'Смотровая площадка на пути гонки.',
    directions: 'На перевал ведёт грунтовая дорога, доступна только на полноприводном автомобиле.',
    travelTimeMinutes: 45,
    parkingInfo: 'Бесплатная парковка у площадки.',
    facilities: ['Парковка', 'Пункт обогрева'],
    photoUrl: null,
    firstArrivalAt: null,
    safetyNotes: 'Край обрыва не огорожен — не подходите близко к кромке.',
    source: 'mock',
  },
  {
    id: 'mock-festival',
    name: 'Фестивальная площадка «Авача»',
    kind: 'festival',
    lng: 158.643,
    lat: 53.019,
    address: 'Петропавловск-Камчатский, центр города',
    description: 'Фестивальная площадка гонки.',
    directions: 'Площадка у центрального стадиона, пешком 5 минут от остановки «Стадион».',
    travelTimeMinutes: 20,
    parkingInfo: 'Бесплатная парковка у площадки.',
    facilities: ['Пункт обогрева', 'Кафе'],
    photoUrl: null,
    firstArrivalAt: null,
    safetyNotes: 'Работают пункты обогрева и горячее питание.',
    source: 'mock',
  },
]
