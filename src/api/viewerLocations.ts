import type { ViewerLocationCategory, ViewerLocationItem } from '../types/index.ts'
import { api, isClientApiError, unwrap } from './client.ts'
import { mockSpectatorLocations, type SpectatorLocation } from './mocks/viewerLocations.ts'

/** Модель площадки для экрана: API-поля в camelCase плюс признак источника. */
export type { SpectatorLocation } from './mocks/viewerLocations.ts'

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
 * Какие `category` попадают в фильтр. Категория локации — из БД,
 * она же используется для «таблеток» на карте.
 */
const FILTER_CATEGORIES: Record<
  Exclude<SpectatorLocationFilter, 'all'>,
  ViewerLocationCategory[]
> = {
  kids: ['kids'],
  food: ['food'],
  stage: ['stages'],
  places: ['areas', 'other'],
}

export function matchesSpectatorFilter(
  category: ViewerLocationCategory,
  filter: SpectatorLocationFilter,
): boolean {
  return filter === 'all' || FILTER_CATEGORIES[filter].includes(category)
}

export const spectatorCategoryLabels: Record<ViewerLocationCategory, string> = {
  stages: 'Сцена',
  areas: 'Площадка',
  food: 'Еда',
  kids: 'Детям',
  other: 'Другое',
}

function toSpectatorLocation(item: ViewerLocationItem): SpectatorLocation {
  return {
    id: String(item.id),
    name: item.name,
    kind: item.kind,
    category: item.category,
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
    return unwrap(result).map(toSpectatorLocation)
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
