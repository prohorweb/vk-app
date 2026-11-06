import type { MapPositionMarker } from '../map/mapTypes.ts'

/** Базовый сплит лидера и шаг места — совпадает с эмуляцией Топ-3 на карте. */
const LIVE_LEADER_ELAPSED_SEC = 6840
const LIVE_GAP_SEC = 165

export type LiveMapStanding = {
  position: number
  elapsedSeconds: number
  leaderElapsedSeconds: number
  kmFromStart: number | null
  averageSpeedKmh: number | null
}

/** Место и сплит по км от старта, пока протокол live без position/time. */
export function liveStandingFromMap(
  markers: MapPositionMarker[],
  participantId: number,
): LiveMapStanding | null {
  const ranked = markers
    .filter((marker) => marker.kmFromStart != null)
    .sort((left, right) => (right.kmFromStart ?? 0) - (left.kmFromStart ?? 0))

  const index = ranked.findIndex((marker) => marker.participantId === participantId)
  if (index < 0) {
    return null
  }

  const marker = ranked[index]
  return {
    position: index + 1,
    elapsedSeconds: LIVE_LEADER_ELAPSED_SEC + index * LIVE_GAP_SEC,
    leaderElapsedSeconds: LIVE_LEADER_ELAPSED_SEC,
    kmFromStart: marker.kmFromStart,
    averageSpeedKmh: marker.averageSpeedKmh,
  }
}

/** Демо-болельщики для сценария «Гонка идёт», если API отдал 0. */
export function demoSupportersCount(participantId: number): number {
  return 8 + ((participantId * 17) % 43)
}

export function demoSupportersDelta(participantId: number): number {
  const value = 1 + (participantId % 5)
  return participantId % 2 === 0 ? value : -Math.min(2, value)
}
