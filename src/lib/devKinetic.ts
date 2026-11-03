/** demo kinetic: ускоренный polling позиций карты после POST …/move/{device_id}. */

const DEFAULT_DURATION_MS = 15 * 60 * 1000
const KINETIC_REFETCH_MS = 3_000

let kineticUntilMs = 0
const listeners = new Set<() => void>()

function notify(): void {
  for (const listener of listeners) {
    listener()
  }
}

export function enableDevKineticPolling(durationMs = DEFAULT_DURATION_MS): void {
  kineticUntilMs = Date.now() + durationMs
  notify()
  // Когда окно kinetic истекает — вернуть обычный refetchInterval.
  window.setTimeout(() => notify(), durationMs + 50)
}

export function isDevKineticPollingActive(): boolean {
  return Date.now() < kineticUntilMs
}

export function getMapPositionsRefetchInterval(normalMs: number): number {
  return isDevKineticPollingActive() ? KINETIC_REFETCH_MS : normalMs
}

export function subscribeDevKinetic(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
