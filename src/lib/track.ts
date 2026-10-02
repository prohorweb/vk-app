import type { TrackPoint, TrackPointStatus } from '../types/index.ts'

const statusLabels: Record<TrackPointStatus, string> = {
  confirmed: 'подтверждено',
  estimated: 'оценка',
  stale: 'устарело',
}

export function trackStatusLabel(status: TrackPointStatus): string {
  return statusLabels[status]
}

export function latestTrackPoint(
  points: TrackPoint[],
  participantId: number,
): TrackPoint | undefined {
  return points
    .filter((point) => point.participantId === participantId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0]
}
