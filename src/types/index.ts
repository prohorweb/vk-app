export const trackPointStatuses = ['confirmed', 'estimated', 'stale'] as const

export type TrackPointStatus = (typeof trackPointStatuses)[number]

export interface Participant {
  id: string
  name: string
  bib: string
}

export interface Stage {
  id: string
  name: string
  order: number
  distanceKm: number
}

export interface TrackPoint {
  id: string
  participantId: string
  stageId: string
  lat: number
  lng: number
  status: TrackPointStatus
  recordedAt: string
}
