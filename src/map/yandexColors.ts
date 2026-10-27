import type { MapCheckpointKind } from './mapTypes.ts'
import type { TrackPointStatus } from '../types/index.ts'

/**
 * Цвета слоя данных Yandex Maps. SVG-метки не читают CSS-переменные, поэтому
 * значения привязаны к токенам из theme.css и повторены в легенде фильтра:
 * при смене токенов обновить оба места.
 */

export const MAP_TRACK_COLOR = '#e64646'

/** Невыбранные этапы на карте: маршрут остаётся видимым, но жёлтым и тоньше. */
export const ROUTE_INACTIVE_COLOR = '#f2c94c'

/** Палитра трасс в режиме «Все этапы»: цвета циклятся по номеру этапа. */
export const STAGE_TRACK_COLORS = [
  '#e64646',
  '#045890',
  '#2a7c35',
  '#f59824',
  '#388bc7',
  '#7e3ff2',
] as const

export const TRACK_COLOR_BY_KIND: Record<MapCheckpointKind, string> = {
  start: '#2a7c35',
  finish: '#e7372f',
  checkpoint: '#f59824',
}

export const PARTICIPANT_COLOR_BY_STATUS: Record<TrackPointStatus, string> = {
  confirmed: '#045890',
  estimated: '#f59824',
  stale: '#9aa0a6',
}

/** Легенда для шторки «Этапы на карте» — цвета обязаны совпадать с движком. */
export const MAP_SCREEN_LEGEND = [
  { id: 'route', label: 'Выбранный этап', color: MAP_TRACK_COLOR },
  { id: 'route-inactive', label: 'Весь маршрут', color: ROUTE_INACTIVE_COLOR },
  { id: 'start', label: 'Старт', color: TRACK_COLOR_BY_KIND.start },
  { id: 'finish', label: 'Финиш', color: TRACK_COLOR_BY_KIND.finish },
  { id: 'checkpoint', label: 'Контрольный пункт', color: TRACK_COLOR_BY_KIND.checkpoint },
] as const

/** Цвет трека этапа в режиме «Все этапы». */
export function stageTrackColor(index: number): string {
  return STAGE_TRACK_COLORS[index % STAGE_TRACK_COLORS.length] ?? MAP_TRACK_COLOR
}
