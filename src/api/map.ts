import type {
  MapCheckpointItem,
  MapFreshnessStatus,
  MapParticipant,
  TrackPointStatus,
} from '../types/index.ts'
import type {
  MapCheckpoint,
  MapPositionMarker,
  MapPositionsSnapshot,
  MapTrack,
} from '../map/mapTypes.ts'
import { ApiError, api, OfflineError, unwrap } from './client.ts'
import { getMapStageCheckpoints, getMapStageTrack } from './mocks/mapStage.ts'
import { buildMapPositionsSnapshot } from './mocks/positions.ts'

const MAP_MARKERS_LIMIT = 500
const DEFAULT_TRACK_COLOR = '#e64646'

/** Свежесть трекера → статус точки. `no_data` не доходит до карты: у неё нет координат. */
const freshnessToStatus: Record<MapFreshnessStatus, TrackPointStatus> = {
  fresh: 'confirmed',
  delayed: 'estimated',
  stale: 'stale',
  no_data: 'stale',
}

function toMapPositionMarker(item: MapParticipant): MapPositionMarker | null {
  const position = item.position
  if (position === null) {
    return null
  }
  return {
    id: `participant-${item.id}`,
    participantId: item.id,
    bib: item.number,
    name: item.name,
    discipline: item.discipline,
    lng: position.lon,
    lat: position.lat,
    status: freshnessToStatus[item.freshness_status],
    recordedAt: position.recorded_at,
  }
}

function toMapCheckpoint(item: MapCheckpointItem): MapCheckpoint {
  return {
    id: `checkpoint-${item.id}`,
    lng: item.lon,
    lat: item.lat,
    kind: item.type === 'start' || item.type === 'finish' ? item.type : 'checkpoint',
    label: item.code,
  }
}

/** Положение подписываем самой свежей отметкой трекера, а не временем запроса. */
function latestRecordedAt(markers: MapPositionMarker[]): string | null {
  let latestMs = 0
  for (const marker of markers) {
    const value = Date.parse(marker.recordedAt)
    if (Number.isFinite(value) && value > latestMs) {
      latestMs = value
    }
  }
  return latestMs > 0 ? new Date(latestMs).toISOString() : null
}

/** 4xx — ошибка contract или auth: маскировать её mock-данными нельзя, остальное — fallback. */
function isClientApiError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status >= 400 && error.status < 500
}

function isLngLatPair(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  )
}

/** Контракт типизирован как `LineString`, но длину пар проверяем в рантайме. */
function parseStageTrack(payload: { coordinates: number[][] }): [number, number][] {
  return payload.coordinates.filter(isLngLatPair)
}

export function findMapMarker(
  markers: MapPositionMarker[],
  markerId: string,
): MapPositionMarker | undefined {
  return markers.find((marker) => marker.id === markerId)
}

export async function fetchStageMapPositions(stageId: number): Promise<MapPositionsSnapshot> {
  if (!navigator.onLine) {
    throw new OfflineError()
  }
  try {
    const result = await api.GET('/api/v1/map/participants', {
      params: { query: { stage_id: stageId, limit: MAP_MARKERS_LIMIT } },
    })
    const data = unwrap(result)
    const markers = data.items
      .map(toMapPositionMarker)
      .filter((marker): marker is MapPositionMarker => marker !== null)
    return {
      stageId: data.stage_id,
      updatedAt: latestRecordedAt(markers),
      markers,
      source: 'api',
    }
  } catch (error) {
    if (isClientApiError(error)) {
      throw error
    }
    return buildMapPositionsSnapshot(stageId)
  }
}

export async function fetchStageTrack(stageId: number): Promise<MapTrack> {
  if (!navigator.onLine) {
    throw new OfflineError()
  }
  try {
    const result = await api.GET('/api/v1/stages/{stage_id}/track', {
      params: { path: { stage_id: stageId } },
    })
    return {
      id: `stage-${stageId}`,
      coordinates: parseStageTrack(unwrap(result)),
      color: DEFAULT_TRACK_COLOR,
    }
  } catch (error) {
    if (isClientApiError(error)) {
      throw error
    }
    return getMapStageTrack(stageId)
  }
}

export async function fetchStageCheckpoints(stageId: number): Promise<MapCheckpoint[]> {
  if (!navigator.onLine) {
    throw new OfflineError()
  }
  try {
    const result = await api.GET('/api/v1/stages/{stage_id}/checkpoints', {
      params: { path: { stage_id: stageId } },
    })
    return unwrap(result).map(toMapCheckpoint)
  } catch (error) {
    if (isClientApiError(error)) {
      throw error
    }
    return getMapStageCheckpoints(stageId)
  }
}
