import type {
  MapPositionMarker,
  MapPositionsSnapshot,
} from '../../map/mapTypes.ts'

const STALE_MS = 45 * 60 * 1000

const rawMarkers: MapPositionMarker[] = [
  {
    id: 'p-1',
    participantId: 1,
    bib: 12,
    name: 'Иван Петров',
    discipline: 'Троеборье',
    lng: 158.812,
    lat: 53.031,
    status: 'confirmed',
    recordedAt: '2026-02-10T10:16:00.000+03:00',
  },
  {
    id: 'p-2',
    participantId: 2,
    bib: 27,
    name: 'Мария Соколова',
    discipline: 'Спринт',
    lng: 158.826,
    lat: 53.044,
    status: 'estimated',
    recordedAt: '2026-02-10T10:08:00.000+03:00',
  },
  {
    id: 'p-3',
    participantId: 3,
    bib: 41,
    name: 'Алексей Ким',
    discipline: 'Троеборье',
    lng: 158.838,
    lat: 53.052,
    status: 'confirmed',
    recordedAt: '2026-02-10T10:14:00.000+03:00',
  },
  {
    id: 'p-4',
    participantId: 4,
    bib: 8,
    name: 'Ольга Новикова',
    discipline: 'Спринт',
    lng: 158.798,
    lat: 53.028,
    status: 'stale',
    recordedAt: '2026-02-10T08:50:00.000+03:00',
  },
  {
    id: 'p-5',
    participantId: 5,
    bib: 33,
    name: 'Дмитрий Орлов',
    discipline: 'Троеборье',
    lng: 158.821,
    lat: 53.039,
    status: 'estimated',
    recordedAt: '2026-02-10T10:11:00.000+03:00',
  },
]

function withStaleRule(marker: MapPositionMarker, nowMs: number): MapPositionMarker {
  const age = nowMs - new Date(marker.recordedAt).getTime()
  if (age > STALE_MS) {
    return { ...marker, status: 'stale' }
  }
  return marker
}

/** Демо-снимок положений: используется только когда API недоступен. */
export function buildMapPositionsSnapshot(stageId = 1, now = new Date()): MapPositionsSnapshot {
  const nowMs = now.getTime()
  return {
    stageId,
    updatedAt: now.toISOString(),
    markers: rawMarkers.map((marker) => withStaleRule(marker, nowMs)),
    source: 'mock',
  }
}
