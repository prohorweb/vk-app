import type { ViewerLocationItem, ViewerLocationKind } from '../types/index.ts'
import { api, isClientApiError, unwrap } from './client.ts'
import {
  mockSpectatorLocations,
  type SpectatorLocation,
  type SpectatorZone,
} from './mocks/viewerLocations.ts'

/** Модель площадки для экрана: API-поля в camelCase плюс признак источника. */
export type { SpectatorLocation, SpectatorZone } from './mocks/viewerLocations.ts'

const VIEWER_LOCATIONS_LIMIT = 100

/** Фильтры тулбара из макета: назначение зоны, а не роль точки в гонке. */
export type SpectatorLocationFilter = 'all' | 'kids' | 'food' | 'stage' | 'places'

export const spectatorLocationFilters: { id: SpectatorLocationFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'kids', label: 'Детям' },
  { id: 'food', label: 'Еда' },
  { id: 'stage', label: 'Сцены' },
  { id: 'places', label: 'Площадки' },
]

/**
 * Зоны по чипам макета: «Площадки» собирает фотозону, этнозону и шатёр.
 * Старые `kind` (старт, финиш, смотровая) на этой карте не показываем.
 */
const FILTER_ZONES: Record<Exclude<SpectatorLocationFilter, 'all'>, SpectatorZone[]> = {
  kids: ['kids'],
  food: ['food'],
  stage: ['stage'],
  places: ['photo', 'ethno', 'tent'],
}

export function matchesSpectatorFilter(
  location: SpectatorLocation,
  filter: SpectatorLocationFilter,
): boolean {
  if (filter === 'all') {
    return true
  }
  return location.zone !== null && FILTER_ZONES[filter].includes(location.zone)
}

export const spectatorKindLabels: Record<ViewerLocationKind, string> = {
  start: 'Старт',
  finish: 'Финиш',
  viewpoint: 'Смотровая площадка',
  festival: 'Фестиваль',
  other: 'Площадка',
}

function toSpectatorLocation(item: ViewerLocationItem): SpectatorLocation {
  return {
    id: String(item.id),
    name: item.name,
    kind: item.kind,
    // Контракт пока отдаёт точки трассы: старт, финиш, смотровую и фестиваль.
    // Зоны фестиваля появятся в `ViewerLocationKind` вместе с issue 08.
    zone: null,
    lng: item.lon,
    lat: item.lat,
    address: item.address ?? null,
    description: item.description ?? null,
    directions: item.directions ?? null,
    travelTimeMinutes: item.travel_time_minutes ?? null,
    parkingInfo: item.parking_info ?? null,
    facilities: item.facilities ?? [],
    photoUrl: item.photo_url ?? null,
    firstArrivalAt: item.first_arrival_planned_at ?? null,
    safetyNotes: item.safety_notes ?? null,
    source: 'api',
  }
}

/** Публичный справочник зрительских площадок. Пустой ответ — это данные, а не повод для мока. */
export async function fetchSpectatorLocations(): Promise<SpectatorLocation[]> {
  if (!navigator.onLine) {
    return mockSpectatorLocations
  }
  try {
    const result = await api.GET('/api/v1/content/viewer-locations', {
      params: { query: { limit: VIEWER_LOCATIONS_LIMIT } },
    })
    const locations = unwrap(result).map(toSpectatorLocation)
    if (locations.length === 0) {
      return locations
    }
    const zones = locations.filter((location) => location.zone !== null)
    // Пока контракт отдаёт только точки трассы, на карте зон их нет: берём
    // каталог зон из макета. После issue 08 сюда придут зоны из API.
    return zones.length > 0 ? zones : mockSpectatorLocations
  } catch (error) {
    if (isClientApiError(error)) {
      throw error
    }
    return mockSpectatorLocations
  }
}

/** Ссылка на карту VK: точка площадки и подсказка «как добраться». */
export function spectatorVkMapsRouteUrl(lng: number, lat: number): string {
  return `https://maps.vk.com/?ll=${lng},${lat}&z=16`
}
