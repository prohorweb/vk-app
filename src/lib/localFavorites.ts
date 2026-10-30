const STORAGE_KEY = 'avacha-vk-app.favorite-ids'

function readRaw(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  } catch {
    return []
  }
}

function writeRaw(ids: number[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]))
  } catch {
    // localStorage может быть недоступен.
  }
}

/** Локальные избранные для гостя (без JWT). */
export function readLocalFavoriteIds(): number[] {
  return readRaw()
}

export function isLocalFavorite(participantId: number): boolean {
  return readRaw().includes(participantId)
}

export function setLocalFavorite(participantId: number, nextFavorite: boolean): number[] {
  const current = readRaw()
  const next = nextFavorite
    ? [...new Set([...current, participantId])]
    : current.filter((id) => id !== participantId)
  writeRaw(next)
  return next
}

export function clearLocalFavorites(): void {
  writeRaw([])
}
