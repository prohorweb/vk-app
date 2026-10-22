import type { MapCheckpoint, MapTrack } from '../../map/mapTypes.ts'

/** Координаты этапа 1 (lng, lat), условно в районе маршрута «Авача». */
export const mapStage1TrackCoordinates: [number, number][] = [
  [158.793, 53.025],
  [158.805, 53.032],
  [158.818, 53.038],
  [158.828, 53.045],
  [158.842, 53.054],
  [158.855, 53.062],
]

export const mapStage1Track: MapTrack = {
  id: 'stage-1',
  coordinates: mapStage1TrackCoordinates,
  color: '#e64646',
}

export const mapStage1Checkpoints: MapCheckpoint[] = [
  {
    id: 'start',
    lng: 158.793,
    lat: 53.025,
    kind: 'start',
    label: 'Старт',
  },
  {
    id: 'cp1',
    lng: 158.818,
    lat: 53.038,
    kind: 'checkpoint',
    label: 'КП-1',
  },
  {
    id: 'cp2',
    lng: 158.842,
    lat: 53.054,
    kind: 'checkpoint',
    label: 'КП-2',
  },
  {
    id: 'finish',
    lng: 158.855,
    lat: 53.062,
    kind: 'finish',
    label: 'Финиш',
  },
]

export function getMapStageTrack(stageId: number): MapTrack {
  if (stageId === 1) {
    return mapStage1Track
  }
  return mapStage1Track
}

export function getMapStageCheckpoints(stageId: number): MapCheckpoint[] {
  if (stageId === 1) {
    return mapStage1Checkpoints
  }
  return mapStage1Checkpoints
}
