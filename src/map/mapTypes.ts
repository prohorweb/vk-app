import type { TrackPointStatus } from '../types/index.ts'

export type MapCheckpointKind = 'start' | 'checkpoint' | 'finish'

/** Метка-площадка для зрителей: старт/финиш гонки, смотровая, фестиваль. */
export type MapPlacemarkKind = 'start' | 'finish' | 'viewpoint' | 'festival' | 'other'

export type MapPlacemark = {
  id: string
  lng: number
  lat: number
  kind: MapPlacemarkKind
  label: string
  /** Выбранная метка поднимается над соседними: подпись площадки показывает карточка. */
  selected?: boolean
}

export type MapTrack = {
  id: string
  coordinates: [number, number][]
  color?: string
  /** Толщина линии: выбранный этап рисуем жирнее общего маршрута. */
  width?: number
}

export type MapCheckpoint = {
  id: string
  lng: number
  lat: number
  kind: MapCheckpointKind
  label?: string
}

export type MapParticipantMarker = {
  id: string
  participantId: number
  lng: number
  lat: number
  status: TrackPointStatus
  bib?: number
}

/** Точка участника для карточки на карте: view-модель поверх `MapParticipant` из контракта. */
export type MapPositionMarker = {
  id: string
  participantId: number
  bib: number
  name: string
  discipline: string | null
  lng: number
  lat: number
  status: TrackPointStatus
  recordedAt: string
}

export type MapPositionsSource = 'api' | 'mock'

/**
 * Снимок положений этапа. `updatedAt` — самая свежая отметка трекера,
 * а не судейское время и не время запроса.
 */
export type MapPositionsSnapshot = {
  stageId: number
  updatedAt: string | null
  markers: MapPositionMarker[]
  source: MapPositionsSource
}

export type MapViewProps = {
  track?: MapTrack
  /** Несколько треков сразу: «Все этапы» и подсветка выбранного этапа. */
  tracks?: MapTrack[]
  checkpoints?: MapCheckpoint[]
  markers?: MapParticipantMarker[]
  /** Площадки для зрителей: цветная метка на карте, подпись — только в хинте. */
  placemarks?: MapPlacemark[]
  fitBounds?: boolean
  /** Смена ключа пересобирает bounds; обновление данных при том же ключе камеру не трогает. */
  fitKey?: string | number
  /** Что брать за рамку камеры: всё содержимое или только участников. */
  fitTo?: 'content' | 'markers'
  /** Нижний отступ рамки (доля высоты карты) — компенсация шторки снизу. */
  fitBottomInset?: number
  onMarkerClick?: (markerId: string) => void
  onPlacemarkClick?: (placemarkId: string) => void
  className?: string
}

export type MapViewHandle = {
  zoomIn: () => void
  zoomOut: () => void
  fitToContent: () => void
  flyToUserLocation: () => void
}
