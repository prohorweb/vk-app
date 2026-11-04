import type { DevScenarioName } from '../api/devScenarios.ts'

/** Сколько ждать после `live`, пока БД догонит seed (бэк: 5–7 с). */
export const DEV_LIVE_SETTLE_MS = 6500

let activeScenario: DevScenarioName | null = null
let liveReadyAtMs = 0
const listeners = new Set<() => void>()

function notify(): void {
  for (const listener of listeners) {
    listener()
  }
}

export function getActiveDevScenario(): DevScenarioName | null {
  return activeScenario
}

export function setActiveDevScenario(name: DevScenarioName): void {
  activeScenario = name
  if (name === 'live') {
    liveReadyAtMs = Date.now() + DEV_LIVE_SETTLE_MS
  } else {
    liveReadyAtMs = 0
  }
  notify()
}

/** Движение Дорохова только в live и после settle БД. */
export function canStartDevKinetic(nowMs = Date.now()): boolean {
  return activeScenario === 'live' && nowMs >= liveReadyAtMs
}

export function getDevKineticWaitMs(nowMs = Date.now()): number {
  if (activeScenario !== 'live') {
    return 0
  }
  return Math.max(0, liveReadyAtMs - nowMs)
}

export function subscribeDevScenarioState(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
