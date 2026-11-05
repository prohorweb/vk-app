import type { MapParticipant, MapParticipantsResponse } from '../../types/index.ts'

const STEPS = 15
const STEP_MS = 3_000
const START_RATIO = 0.65
const END_RATIO = 1

type KineticState = {
  participantId: number
  stageId: number
  coordinates: [number, number][]
  step: number
  timerId: number | null
}

let state: KineticState | null = null

function pointAlong(coordinates: [number, number][], ratio: number): [number, number] {
  if (coordinates.length === 0) {
    return [0, 0]
  }
  if (coordinates.length === 1 || ratio <= 0) {
    return coordinates[0]
  }
  if (ratio >= 1) {
    return coordinates[coordinates.length - 1]
  }
  const exact = ratio * (coordinates.length - 1)
  const index = Math.floor(exact)
  const t = exact - index
  const a = coordinates[index]
  const b = coordinates[Math.min(index + 1, coordinates.length - 1)]
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

function clearTimer(): void {
  if (state?.timerId != null) {
    window.clearInterval(state.timerId)
    state.timerId = null
  }
}

/** Stop client-side kinetic overlay (scenario switch / finished). */
export function stopMockKinetic(): void {
  clearTimer()
  state = null
}

export function isMockKineticActive(): boolean {
  return state !== null && state.step < STEPS
}

/**
 * Move participant along stage track from ~65% to finish.
 * Coordinates are GeoJSON [lon, lat].
 */
export function startMockKinetic(
  participantId: number,
  stageId: number,
  coordinates: [number, number][],
  onTick: () => void,
): void {
  stopMockKinetic()
  if (coordinates.length < 2) {
    return
  }
  state = {
    participantId,
    stageId,
    coordinates,
    step: 0,
    timerId: null,
  }
  onTick()
  state.timerId = window.setInterval(() => {
    if (!state) {
      return
    }
    state.step += 1
    onTick()
    if (state.step >= STEPS - 1) {
      clearTimer()
    }
  }, STEP_MS)
}

/** Apply kinetic position onto a map participants payload (clone). */
export function applyKineticToMap(
  payload: MapParticipantsResponse,
): MapParticipantsResponse {
  if (!state) {
    return payload
  }
  const ratio =
    START_RATIO + ((END_RATIO - START_RATIO) * state.step) / Math.max(1, STEPS - 1)
  const [lon, lat] = pointAlong(state.coordinates, ratio)
  const items = payload.items.map((item): MapParticipant => {
    if (item.id !== state!.participantId) {
      return item
    }
    return {
      ...item,
      status: 'active',
      freshness_status: 'fresh',
      position: {
        lat,
        lon,
        recorded_at: new Date().toISOString(),
        average_speed_kmh: item.position?.average_speed_kmh ?? 8,
        km_from_start: item.position?.km_from_start ?? null,
      },
    }
  })
  return {
    ...payload,
    stage_id: state.stageId,
    items,
    total: items.length,
  }
}
