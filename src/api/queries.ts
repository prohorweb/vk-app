import { useQuery } from '@tanstack/react-query'
import { fetchJson } from './client.ts'
import { participants, stages, trackPoints } from './mock.ts'
import type { Participant, Stage, TrackPoint } from '../types/index.ts'

const TRACK_REFETCH_MS = 2 * 60 * 1000

export function fetchParticipants(): Promise<Participant[]> {
  return fetchJson('/participants', participants)
}

export function fetchStages(): Promise<Stage[]> {
  return fetchJson('/stages', stages)
}

export function fetchTrackPoints(): Promise<TrackPoint[]> {
  return fetchJson('/track-points', trackPoints)
}

export async function fetchParticipant(id: string): Promise<Participant | null> {
  const list = await fetchParticipants()
  return list.find((item) => item.id === id) ?? null
}

export function useParticipantsQuery() {
  return useQuery({
    queryKey: ['participants'],
    queryFn: fetchParticipants,
  })
}

export function useStagesQuery() {
  return useQuery({
    queryKey: ['stages'],
    queryFn: fetchStages,
  })
}

export function useTrackPointsQuery() {
  return useQuery({
    queryKey: ['track-points'],
    queryFn: fetchTrackPoints,
    refetchInterval: TRACK_REFETCH_MS,
  })
}

export function useParticipantQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['participants', id],
    queryFn: () => fetchParticipant(id ?? ''),
    enabled: Boolean(id),
  })
}
