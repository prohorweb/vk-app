export type RouteSheetSnap = 'collapsed' | 'half' | 'full'

export type RouteMapFilter = 'all' | number

export type RouteStage = {
  id: number
  number: number
  from: string
  to: string
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

export type ElevationPoint = {
  km: number
  elevationM: number
}

export type ElevationStageMarker = {
  number: number
  km: number
}

export type RouteMapMarker = {
  id: string
  kind: 'start' | 'checkpoint' | 'finish'
  x: number
  y: number
}

export type RouteStageDetail = {
  headline: string
  distanceKm: number
  elevationGainM: number
  startLabel: string
  finishLabel: string
  profilePoints: ElevationPoint[]
  checkpoints: RouteCheckpoint[]
  segments: RouteSegment[]
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
    from: 'б/к им. Фатьянова',
    to: 'Авачинский',
    distanceKm: 34,
    elevationGainM: 985,
    checkpointCount: 4,
    status: 'active',
  },
  {
    id: 2,
    number: 2,
    from: 'Авачинский',
    to: 'Пиначево',
    distanceKm: 56,
    elevationGainM: 495,
    checkpointCount: 5,
  },
  {
    id: 3,
    number: 3,
    from: 'Кольцевой',
    to: 'Пиначево',
    distanceKm: 71,
    elevationGainM: 410,
    checkpointCount: 6,
  },
  {
    id: 4,
    number: 4,
    from: 'Ночной Кольцевой',
    to: 'Пиначево',
    distanceKm: 38,
    elevationGainM: 695,
    checkpointCount: 4,
  },
  {
    id: 5,
    number: 5,
    from: 'Пиначево',
    to: 'Авачинский',
    distanceKm: 56,
    elevationGainM: 695,
    checkpointCount: 5,
  },
  {
    id: 6,
    number: 6,
    from: 'Авачинский',
    to: 'б/к им. Фатьянова',
    distanceKm: 34,
    elevationGainM: 985,
    checkpointCount: 4,
  },
]

function buildProfile(points: [number, number][]): ElevationPoint[] {
  return points.map(([km, elevationM]) => ({ km, elevationM }))
}

export const routeFullProfilePoints = buildProfile([
  [0, 120],
  [12, 180],
  [24, 260],
  [34, 420],
  [48, 380],
  [64, 520],
  [78, 610],
  [92, 540],
  [110, 680],
  [128, 720],
  [145, 650],
  [162, 780],
  [178, 820],
  [195, 760],
  [212, 890],
  [228, 940],
  [245, 870],
  [262, 980],
  [275, 920],
  [288, 850],
])

export const routeFullProfileStages: ElevationStageMarker[] = [
  { number: 1, km: 17 },
  { number: 2, km: 51 },
  { number: 3, km: 99 },
  { number: 4, km: 137 },
  { number: 5, km: 175 },
  { number: 6, km: 209 },
]

export const routeStage1ProfilePoints = buildProfile([
  [0, 140],
  [4, 160],
  [8, 190],
  [12, 220],
  [16, 280],
  [20, 340],
  [23, 410],
  [26, 480],
  [30, 560],
  [32, 620],
  [34, 680],
])

export const routeStageDetails: Record<number, RouteStageDetail> = {
  1: {
    headline: 'Этап 1 из 6 • Сегодня • 10:16',
    distanceKm: 34,
    elevationGainM: 985,
    startLabel: 'Старт – б/к им. Фатьянова',
    finishLabel: 'Финиш – Авачинский вулкан',
    profilePoints: routeStage1ProfilePoints,
    checkpoints: [
      { id: 's', label: 'Старт', name: 'б/к им. Фатьянова', distanceKm: 0, kind: 'start' },
      { id: 'cp1', label: 'КП-1', name: '12 км', distanceKm: 12, kind: 'checkpoint' },
      { id: 'cp2', label: 'КП-2', name: '23 км', distanceKm: 23, kind: 'checkpoint' },
      { id: 'f', label: 'Финиш', name: 'Авачинский вулкан', distanceKm: 34, kind: 'finish' },
    ],
    segments: [
      { id: 'seg1', fromKm: 0, toKm: 12, title: 'Долина', hint: 'Пологий подъём вдоль реки' },
      { id: 'seg2', fromKm: 12, toKm: 23, title: 'Перевал', hint: 'Рыхлое покрытие' },
      { id: 'seg3', fromKm: 23, toKm: 34, title: 'Подход к вулкану', hint: 'Ветер, плотный наст' },
    ],
  },
  2: {
    headline: 'Этап 2 из 6 • Завтра • 09:00',
    distanceKm: 56,
    elevationGainM: 495,
    startLabel: 'Старт – Авачинский',
    finishLabel: 'Финиш – Пиначево',
    profilePoints: buildProfile([
      [0, 400],
      [14, 450],
      [28, 520],
      [42, 480],
      [56, 430],
    ]),
    checkpoints: [
      { id: 's', label: 'Старт', name: 'Авачинский', distanceKm: 0, kind: 'start' },
      { id: 'cp1', label: 'КП-1', name: '18 км', distanceKm: 18, kind: 'checkpoint' },
      { id: 'f', label: 'Финиш', name: 'Пиначево', distanceKm: 56, kind: 'finish' },
    ],
    segments: [
      { id: 'seg1', fromKm: 0, toKm: 28, title: 'Спуск к реке', hint: 'Лёд' },
      { id: 'seg2', fromKm: 28, toKm: 56, title: 'Равнина', hint: 'Ветер' },
    ],
  },
}

export function getRouteStageDetail(stageId: number): RouteStageDetail {
  return routeStageDetails[stageId] ?? routeStageDetails[1]
}

/** SVG path in viewBox 0 0 360 640 (условные координаты). */
export const routeTrackFullPath =
  'M 48 420 L 92 380 L 140 340 L 188 300 L 228 280 L 268 260 L 300 240 L 318 220'

export const routeTrackStagePaths: Record<number, string> = {
  1: 'M 48 420 L 92 380 L 140 340 L 188 300',
  2: 'M 188 300 L 228 280 L 268 260',
}

export const routeMapMarkers: RouteMapMarker[] = [
  { id: 'start', kind: 'start', x: 48, y: 420 },
  { id: 'cp1', kind: 'checkpoint', x: 140, y: 340 },
  { id: 'cp2', kind: 'checkpoint', x: 228, y: 280 },
  { id: 'finish', kind: 'finish', x: 318, y: 220 },
]

export const routeFilterOptions: { value: RouteMapFilter; label: string }[] = [
  { value: 'all', label: 'Все этапы' },
  { value: 1, label: 'Этап 1' },
  { value: 2, label: 'Этап 2' },
]

export const routeMapLegend = [
  { id: 'route', label: 'Маршрут', color: 'var(--avacha-brand-red)' },
  { id: 'selected', label: 'Выбранный этап', color: 'var(--avacha-route-stage-active)' },
  { id: 'startFinish', label: 'Старт/Финиш', color: 'var(--avacha-brand-dark-blue)' },
  { id: 'checkpoint', label: 'Контрольный пункт', color: 'var(--avacha-route-checkpoint)' },
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
