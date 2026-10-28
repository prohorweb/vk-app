import type { ViewerLocationKind } from '../../types/index.ts'

/** Зоны фестиваля из макета «Карта зрительских локаций». */
export type SpectatorZone = 'stage' | 'food' | 'photo' | 'ethno' | 'kids' | 'tent'

export type SpectatorLocation = {
  id: string
  name: string
  /** Вид из контракта: зоны фестиваля появятся в `ViewerLocationKind` вместе с issue 08. */
  kind: ViewerLocationKind
  /** Зона фестиваля; null — точка трассы, которой на карте зон нет. */
  zone: SpectatorZone | null
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
 * Fallback для карты зрительских локаций, когда API недоступен или ещё не
 * отдаёт зоны фестиваля. Шесть зон из макета в центре Петропавловска-Камчатского.
 */
export const mockSpectatorLocations: SpectatorLocation[] = [
  {
    id: 'mock-stage',
    name: 'Главная сцена',
    kind: 'festival',
    zone: 'stage',
    lng: 158.642,
    lat: 53.024,
    address: 'Петропавловск-Камчатский, просп. Циолковского, 25',
    description: 'Церемонии открытия и закрытия, награждение и вечерние концерты фестиваля.',
    directions: 'Пешком 7 минут от остановки «Стадион», у входа есть парковка для гостей.',
    travelTimeMinutes: 10,
    parkingInfo: 'Парковка на 200 мест, бесплатно до 22:00.',
    facilities: ['Сцена', 'Экран', 'Парковка', 'Туалет'],
    photoUrl: null,
    firstArrivalAt: null,
    safetyNotes: 'Вход в танцпол закрывают за 15 минут до начала концерта.',
    source: 'mock',
  },
  {
    id: 'mock-food',
    name: 'Фудкорт',
    kind: 'other',
    zone: 'food',
    lng: 158.646,
    lat: 53.0222,
    address: 'Петропавловск-Камчатский, ул. Ленинская, 26',
    description: 'Кафе и фудтраки: горячие блюда, выпечка и напитки на весь день.',
    directions: 'Справа от главной сцены, вход со стороны аллеи.',
    travelTimeMinutes: 5,
    parkingInfo: 'Парковка общая с главной сценой, 3 минуты пешком.',
    facilities: ['Кафе', 'Туалет', 'Оплата картой'],
    photoUrl: null,
    firstArrivalAt: null,
    safetyNotes: 'Горячие напитки выдаём в крышках — осторожно с детьми.',
    source: 'mock',
  },
  {
    id: 'mock-photo',
    name: 'Фотозона',
    kind: 'other',
    zone: 'photo',
    lng: 158.637,
    lat: 53.0265,
    address: 'Петропавловск-Камчатский, ул. Советская, 11',
    description: 'Фотозона с видом на сопки: реквизит, свет и печать снимков на месте.',
    directions: 'У входа в парк, рядом с арт-объектом «Авача».',
    travelTimeMinutes: 5,
    parkingInfo: 'Своей парковки нет — оставьте машину у главной сцены.',
    facilities: ['Фотограф', 'Реквизит', 'Печать фото'],
    photoUrl: null,
    firstArrivalAt: null,
    safetyNotes: 'Штативы ставим только на обозначенной площадке.',
    source: 'mock',
  },
  {
    id: 'mock-ethno',
    name: 'Этнозона',
    kind: 'other',
    zone: 'ethno',
    lng: 158.64,
    lat: 53.0185,
    address: 'Петропавловск-Камчатский, пл. Ленина',
    description: 'Стойбище, корякские и ительменские ремёсла, мастер-классы и дегустации.',
    directions: 'За главной сценой, вдоль аллеи к озеру.',
    travelTimeMinutes: 8,
    parkingInfo: 'Парковка у главной сцены, 5 минут пешком.',
    facilities: ['Мастер-классы', 'Дегустации', 'Пункт обогрева'],
    photoUrl: null,
    firstArrivalAt: null,
    safetyNotes: 'На мастер-классы записываются на месте, места ограничены.',
    source: 'mock',
  },
  {
    id: 'mock-kids',
    name: 'Детская зона',
    kind: 'other',
    zone: 'kids',
    lng: 158.6455,
    lat: 53.0285,
    address: 'Петропавловск-Камчатский, ул. Партизанская, 14',
    description: 'Аниматоры, снежные горки и мастер-классы для детей от трёх лет.',
    directions: 'Слева от фудкорта, вход с улицы Партизанской.',
    travelTimeMinutes: 6,
    parkingInfo: 'Парковка у главной сцены, 4 минуты пешком.',
    facilities: ['Аниматоры', 'Горки', 'Пункт обогрева', 'Туалет'],
    photoUrl: null,
    firstArrivalAt: null,
    safetyNotes: 'Дети до семи лет — только в сопровождении взрослых.',
    source: 'mock',
  },
  {
    id: 'mock-tent',
    name: 'Шатёр',
    kind: 'other',
    zone: 'tent',
    lng: 158.635,
    lat: 53.0158,
    address: 'Петропавловск-Камчатский, ул. Красинцев, 8',
    description: 'Тёплый шатёр с чаем и местами, где можно переждать ветер.',
    directions: 'Между главной сценой и этнозоной, вход свободный.',
    travelTimeMinutes: 4,
    parkingInfo: 'Парковка у главной сцены, 3 минуты пешком.',
    facilities: ['Обогрев', 'Чай', 'Туалет'],
    photoUrl: null,
    firstArrivalAt: null,
    safetyNotes: 'Внутри не курят и не заносят животных.',
    source: 'mock',
  },
]
