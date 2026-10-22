export type RouteSheetSnap = 'collapsed' | 'half' | 'full'

export type RouteMapFilter = 'all' | number

export type RouteStage = {
  id: number
  number: number
  title: string
  distanceKm: number
  elevationGainM: number
  checkpointCount: number
  status?: 'active' | 'default'
}

export type RouteCheckpoint = {
  id: string
  label: string
  name: string
  distanceKm: number
  kind: 'start' | 'checkpoint' | 'finish'
}

export type RouteSegment = {
  id: string
  fromKm: number
  toKm: number
  title: string
  hint?: string
}

export const routeAllSummary = {
  title: 'Весь маршрут',
  distanceKm: 288,
  elevationGainM: 4120,
  stagesLabel: '6 Этапов • с 3–15 февраля',
  subtitle: 'Старт и финиш б/к им. Фатьянова',
}

export const routeStages: RouteStage[] = [
  {
    id: 1,
    number: 1,
    title: 'б/к им. Фатьянова – Авачинский',
    distanceKm: 34,
    elevationGainM: 985,
    checkpointCount: 4,
    status: 'active',
  },
  {
    id: 2,
    number: 2,
    title: 'Авачинский – Пиначево',
    distanceKm: 56,
    elevationGainM: 495,
    checkpointCount: 5,
  },
  {
    id: 3,
    number: 3,
    title: 'Кольцевой – Пиначево',
    distanceKm: 71,
    elevationGainM: 410,
    checkpointCount: 6,
  },
  {
    id: 4,
    number: 4,
    title: 'Ночной Кольцевой – Пиначево',
    distanceKm: 38,
    elevationGainM: 695,
    checkpointCount: 4,
  },
  {
    id: 5,
    number: 5,
    title: 'Пиначево – Авачинский',
    distanceKm: 56,
    elevationGainM: 695,
    checkpointCount: 5,
  },
  {
    id: 6,
    number: 6,
    title: 'Авачинский – б/к им. Фатьянова',
    distanceKm: 34,
    elevationGainM: 985,
    checkpointCount: 4,
  },
]

export const routeStage1Summary = {
  headline: 'Этап 1 из 6 • Сегодня • 10:16',
  distanceKm: 34,
  elevationGainM: 985,
  startLabel: 'Старт – б/к им. Фатьянова',
  finishLabel: 'Финиш – Авачинский вулкан',
}

export const routeStage1Checkpoints: RouteCheckpoint[] = [
  { id: 's', label: 'Старт', name: 'б/к им. Фатьянова', distanceKm: 0, kind: 'start' },
  { id: 'cp1', label: 'КП-1', name: '12 км', distanceKm: 12, kind: 'checkpoint' },
  { id: 'cp2', label: 'КП-2', name: '23 км', distanceKm: 23, kind: 'checkpoint' },
  { id: 'f', label: 'Финиш', name: 'Авачинский вулкан', distanceKm: 34, kind: 'finish' },
]

export const routeStage1Segments: RouteSegment[] = [
  { id: 'seg1', fromKm: 0, toKm: 12, title: 'Долина', hint: 'Пologий подъём вдоль реки' },
  { id: 'seg2', fromKm: 12, toKm: 23, title: 'Перевал', hint: 'Рыхлое покрытие' },
  {
    id: 'seg3',
    fromKm: 23,
    toKm: 34,
    title: 'Подход к вулкану',
    hint: 'Ветер, плотный наст',
  },
]

export const routeFilterOptions: { value: RouteMapFilter; label: string }[] = [
  { value: 'all', label: 'Все этапы' },
  { value: 1, label: 'Этап 1' },
  { value: 2, label: 'Этап 2' },
]

export const routeMapLegend = [
  { id: 'route', label: 'Маршрут', color: 'var(--avacha-brand-red)' },
  { id: 'selected', label: 'Выбранный этап', color: 'var(--avacha-route-stage-active, #e7372f)' },
  { id: 'startFinish', label: 'Старт/Финиш', color: 'var(--avacha-brand-dark-blue)' },
  { id: 'checkpoint', label: 'Контрольный пункт', color: 'var(--avacha-route-checkpoint, #f5a623)' },
]

export const routeOverflowMenuItems = [
  'Печать',
  'Поделиться',
  'Сообщить об ошибке',
  'Обратная связь',
  'Линейка',
] as const

export const routeMapAttribution =
  '© VK, OpenStreetMap contributors · Условия использования · Политика конфиденциальности'
