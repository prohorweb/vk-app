import type { Participant, Stage, TrackPoint } from '../types/index.ts'

export const participants: Participant[] = [
  { id: 'p-field', name: 'Илья Полевой', bib: '101' },
  { id: 'p-lake', name: 'Софья Озёрная', bib: '102' },
  { id: 'p-shore', name: 'Матвей Береговой', bib: '104' },
  { id: 'p-trail', name: 'Алина Тропинина', bib: '107' },
  { id: 'p-stone', name: 'Глеб Каменский', bib: '110' },
  { id: 'p-meadow', name: 'Вера Луговская', bib: '113' },
]

export const stages: Stage[] = [
  { id: 'stage-start', name: 'Старт поляны', order: 1, distanceKm: 0 },
  { id: 'stage-ford', name: 'Каменный брод', order: 2, distanceKm: 6.4 },
  { id: 'stage-ridge', name: 'Хребет', order: 3, distanceKm: 14.2 },
  { id: 'stage-finish', name: 'Финишная просека', order: 4, distanceKm: 21.8 },
]

export const trackPoints: TrackPoint[] = [
  {
    id: 'tp-1',
    participantId: 'p-field',
    stageId: 'stage-ridge',
    lat: 55.751,
    lng: 37.618,
    status: 'confirmed',
    recordedAt: '2026-10-02T08:40:00.000Z',
  },
  {
    id: 'tp-2',
    participantId: 'p-lake',
    stageId: 'stage-ford',
    lat: 55.742,
    lng: 37.631,
    status: 'estimated',
    recordedAt: '2026-10-02T08:28:00.000Z',
  },
  {
    id: 'tp-3',
    participantId: 'p-shore',
    stageId: 'stage-finish',
    lat: 55.76,
    lng: 37.609,
    status: 'confirmed',
    recordedAt: '2026-10-02T09:05:00.000Z',
  },
  {
    id: 'tp-4',
    participantId: 'p-trail',
    stageId: 'stage-start',
    lat: 55.738,
    lng: 37.64,
    status: 'stale',
    recordedAt: '2026-10-02T07:10:00.000Z',
  },
  {
    id: 'tp-5',
    participantId: 'p-stone',
    stageId: 'stage-ridge',
    lat: 55.755,
    lng: 37.625,
    status: 'estimated',
    recordedAt: '2026-10-02T08:51:00.000Z',
  },
  {
    id: 'tp-6',
    participantId: 'p-meadow',
    stageId: 'stage-ford',
    lat: 55.747,
    lng: 37.612,
    status: 'stale',
    recordedAt: '2026-10-02T07:44:00.000Z',
  },
]
