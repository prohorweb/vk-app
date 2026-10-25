import type { components } from '../api/schema.d.ts'

export type ParticipantStatus = components['schemas']['ParticipantStatus']
export type ParticipantListItem = components['schemas']['ParticipantListItem']
export type ParticipantDetail = components['schemas']['ParticipantDetail']
export type ParticipantSupporters = components['schemas']['ParticipantSupporters']
export type FavoriteResponse = components['schemas']['FavoriteResponse']
export type NewsPostListItem = components['schemas']['NewsPostListItemResponse']
export type NewsPostListResponse = components['schemas']['NewsPostListResponse']
export type NewsSource = components['schemas']['NewsSource']
export type ScheduleEvent = components['schemas']['ScheduleEventResponse']
export type ScheduleEventListResponse = components['schemas']['ScheduleEventListResponse']
export type ScheduleKind = components['schemas']['ScheduleKind']
export type FAQItem = components['schemas']['FAQItemResponse']
export type FAQListResponse = components['schemas']['FAQListResponse']
export type VKAuthRequest = components['schemas']['VKAuthRequest']
export type VKUserInfo = components['schemas']['VKUserInfo']
export type AuthResponse = components['schemas']['AuthResponse']
export type RaceStandings = components['schemas']['RaceStandings']
export type StandingRow = components['schemas']['StandingRow']
export type StageProtocol = components['schemas']['StageProtocol']
export type StageProtocolRow = components['schemas']['StageProtocolRow']
export type PublicationStatus = components['schemas']['PublicationStatus']
export type SupporterRatingEntry = components['schemas']['SupporterRatingEntry']
export type SeasonPublic = components['schemas']['SeasonPublicResponse']
export type DisciplinePublic = components['schemas']['DisciplinePublicResponse']
export type StagePublic = components['schemas']['StagePublicResponse']
export type StageStatus = components['schemas']['StageStatus']
export type NotificationEventType = components['schemas']['NotificationEventType']
export type MapParticipant = components['schemas']['MapParticipant']
export type MapParticipantsResponse = components['schemas']['MapParticipantsResponse']
export type MapPosition = components['schemas']['MapPosition']
export type MapFreshnessStatus = MapParticipant['freshness_status']
export type MapCheckpointItem = components['schemas']['MapCheckpoint']
export type MapCheckpointsResponse = components['schemas']['MapCheckpointsResponse']

export const participantSorts = ['bib', 'name', 'supporters'] as const

export type ParticipantSort = (typeof participantSorts)[number]

export const trackPointStatuses = ['confirmed', 'estimated', 'stale'] as const

export type TrackPointStatus = (typeof trackPointStatuses)[number]

/** Локальная модель точек трека: в контракте API её нет, на карте остаётся mock. */
export interface TrackPoint {
  id: number
  participantId: number
  stageName: string
  lat: number
  lng: number
  status: TrackPointStatus
  recordedAt: string
}
