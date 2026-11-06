import type { RouteMapFilter } from '../api/mocks/route.ts'

const STORAGE_KEY = 'avacha-vk-app.map-filters'

export type StoredMapFilters = {
  stageFilter: RouteMapFilter
  disciplineId: number | null
  favoritesOnly: boolean
}

export function readMapFilters(): StoredMapFilters | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<StoredMapFilters>
    const stageFilter =
      parsed.stageFilter === 'all' || typeof parsed.stageFilter === 'number'
        ? parsed.stageFilter
        : null
    if (stageFilter === null) {
      return null
    }
    return {
      stageFilter,
      disciplineId: typeof parsed.disciplineId === 'number' ? parsed.disciplineId : null,
      favoritesOnly: parsed.favoritesOnly === true,
    }
  } catch {
    return null
  }
}

export function writeMapFilters(filters: StoredMapFilters): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
}

export function clearMapFilters(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}
