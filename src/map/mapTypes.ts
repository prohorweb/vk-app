import type { TrackPointStatus } from '../types/index.ts'

export type MapCheckpointKind = 'start' | 'checkpoint' | 'finish'

export type MapTrack = {
  id: string
  coordinates: [number, number][]
  color?: string
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
}

export type MapViewProps = {
  track?: MapTrack
  checkpoints?: MapCheckpoint[]
  markers?: MapParticipantMarker[]
  fitBounds?: boolean
  onMarkerClick?: (markerId: string) => void
  className?: string
}

export type MapViewHandle = {
  zoomIn: () => void
  zoomOut: () => void
  fitToContent: () => void
  flyToUserLocation: () => void
}
