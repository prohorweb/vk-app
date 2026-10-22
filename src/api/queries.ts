import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import type {
  FAQListResponse,
  FavoriteResponse,
  NewsPostListResponse,
  ParticipantDetail,
  ParticipantListItem,
  ParticipantSort,
  ParticipantSupporters,
  RaceStandings,
  ScheduleEventListResponse,
  StageProtocol,
  StagePublic,
  SupporterRatingEntry,
  TrackPoint,
  SeasonPublic,
  DisciplinePublic,
} from '../types/index.ts'
import { api, OfflineError, unwrap } from './client.ts'
import { buildMapPositionsSnapshot, fetchMapPositionsMock } from './mocks/positions.ts'
import { trackPoints } from './mock.ts'

const TRACK_REFETCH_MS = 2 * 60 * 1000
const MAP_POSITIONS_REFETCH_MS = 120 * 1000

export const trackMockEnabled = import.meta.env.VITE_USE_MOCK === 'true'

type ParticipantFilters = {
  search?: string
  sort?: ParticipantSort
  disciplineId?: number | null
}

/** Черновик этапа (status=draft) в селекторы не попадает. */
export function isListedStage(stage: { status: string }): boolean {
  return stage.status !== 'draft'
}

export async function fetchParticipants(
  filters: ParticipantFilters = {},
): Promise<ParticipantListItem[]> {
  const search = filters.search?.trim()
  const result = await api.GET('/api/v1/participants', {
    params: {
      query: {
        search: search || undefined,
        discipline_id: filters.disciplineId ?? undefined,
        sort: filters.sort ?? 'bib',
      },
    },
  })
  return unwrap(result)
}

export async function fetchParticipant(id: number): Promise<ParticipantDetail | null> {
  const result = await api.GET('/api/v1/participants/{participant_id}', {
    params: { path: { participant_id: id } },
  })
  if (result.response.status === 404) {
    return null
  }
  return unwrap(result)
}

export async function fetchSupporters(id: number): Promise<ParticipantSupporters> {
  const result = await api.GET('/api/v1/participants/{participant_id}/supporters', {
    params: { path: { participant_id: id } },
  })
  return unwrap(result)
}

export async function fetchNews(): Promise<NewsPostListResponse> {
  const result = await api.GET('/api/v1/content/news', {
    params: { query: { limit: 50, offset: 0 } },
  })
  return unwrap(result)
}

export async function fetchSchedule(stageId?: number | null): Promise<ScheduleEventListResponse> {
  const result = await api.GET('/api/v1/content/schedule', {
    params: {
      query: {
        limit: 50,
        offset: 0,
        stage_id: stageId ?? undefined,
      },
    },
  })
  return unwrap(result)
}

export async function fetchActiveSeason(): Promise<SeasonPublic | null> {
  const result = await api.GET('/api/v1/directory/seasons/active')
  if (result.response.status === 404) {
    return null
  }
  return unwrap(result)
}

export async function fetchPublicStages(seasonId: number): Promise<StagePublic[]> {
  const result = await api.GET('/api/v1/directory/stages', {
    params: { query: { season_id: seasonId } },
  })
  return unwrap(result)
    .filter(isListedStage)
    .sort((left, right) => left.order_index - right.order_index || left.number - right.number)
}

export async function fetchDisciplines(seasonId: number): Promise<DisciplinePublic[]> {
  const result = await api.GET('/api/v1/directory/disciplines', {
    params: { query: { season_id: seasonId } },
  })
  return unwrap(result).sort((left, right) => left.sort_order - right.sort_order || left.id - right.id)
}

export async function fetchFaq(): Promise<FAQListResponse> {
  const result = await api.GET('/api/v1/content/faq', {
    params: { query: { limit: 50, offset: 0 } },
  })
  return unwrap(result)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export async function fetchTrackPoints(): Promise<TrackPoint[]> {
  if (!trackMockEnabled) {
    return []
  }
  if (!navigator.onLine) {
    throw new OfflineError()
  }
  await delay(280)
  return structuredClone(trackPoints)
}

export function useParticipantsQuery(filters: ParticipantFilters = {}) {
  const search = filters.search?.trim() ?? ''
  const sort = filters.sort ?? 'bib'
  const disciplineId = filters.disciplineId ?? null

  return useQuery({
    queryKey: ['participants', { search, sort, disciplineId }],
    queryFn: () => fetchParticipants({ search, sort, disciplineId }),
    placeholderData: keepPreviousData,
  })
}

export function useParticipantQuery(id: number | undefined) {
  return useQuery({
    queryKey: ['participant', id],
    queryFn: () => fetchParticipant(id ?? 0),
    enabled: id !== undefined,
  })
}

export function useSupportersQuery(id: number | undefined) {
  return useQuery({
    queryKey: ['supporters', id],
    queryFn: () => fetchSupporters(id ?? 0),
    enabled: id !== undefined,
  })
}

export async function fetchStandings(): Promise<RaceStandings> {
  const result = await api.GET('/api/v1/results/standings')
  return unwrap(result)
}

export async function fetchStageProtocol(stageId: number): Promise<StageProtocol | null> {
  const result = await api.GET('/api/v1/results/stage/{stage_id}', {
    params: { path: { stage_id: stageId } },
  })
  if (result.response.status === 404) {
    return null
  }
  return unwrap(result)
}

export async function fetchProtocolsForStages(stages: StagePublic[]): Promise<StageProtocol[]> {
  const protocols = await Promise.all(stages.map((stage) => fetchStageProtocol(stage.id)))
  const order = new Map(stages.map((stage) => [stage.id, stage.order_index]))
  return protocols
    .filter((protocol): protocol is StageProtocol => protocol !== null && protocol.publication !== 'draft')
    .sort((left, right) => (order.get(left.stage_id) ?? 0) - (order.get(right.stage_id) ?? 0))
}

export function useStageProtocolQuery(stageId: number | null) {
  return useQuery({
    queryKey: ['results', 'protocol', stageId],
    queryFn: () => fetchStageProtocol(stageId ?? 0),
    enabled: stageId !== null,
  })
}

export async function fetchSupportersRating(): Promise<SupporterRatingEntry[]> {
  const result = await api.GET('/api/v1/participants/supporters/rating', {
    params: { query: { limit: 200 } },
  })
  return unwrap(result)
}

export function useActiveSeasonQuery() {
  return useQuery({
    queryKey: ['directory', 'season'],
    queryFn: fetchActiveSeason,
  })
}

export function usePublicStagesQuery() {
  const seasonQuery = useActiveSeasonQuery()
  const seasonId = seasonQuery.data?.id

  return useQuery({
    queryKey: ['directory', 'stages', seasonId ?? null],
    queryFn: () => fetchPublicStages(seasonId ?? 0),
    enabled: seasonId !== undefined,
  })
}

export function useDisciplinesQuery() {
  const seasonQuery = useActiveSeasonQuery()
  const seasonId = seasonQuery.data?.id

  return useQuery({
    queryKey: ['directory', 'disciplines', seasonId ?? null],
    queryFn: () => fetchDisciplines(seasonId ?? 0),
    enabled: seasonId !== undefined,
  })
}

export function useSupportersRatingQuery() {
  return useQuery({
    queryKey: ['supporters-rating'],
    queryFn: fetchSupportersRating,
  })
}

export function useStandingsQuery() {
  return useQuery({
    queryKey: ['results', 'standings'],
    queryFn: fetchStandings,
  })
}

export function useProtocolsQuery() {
  const stagesQuery = usePublicStagesQuery()
  const stages = stagesQuery.data ?? []

  return useQuery({
    queryKey: ['results', 'protocols', stages.map((stage) => stage.id)],
    queryFn: () => fetchProtocolsForStages(stages),
    enabled: stagesQuery.isSuccess,
  })
}

export function useNewsQuery() {
  return useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
  })
}

export function useScheduleQuery(stageId: number | null = null) {
  return useQuery({
    queryKey: ['schedule', stageId],
    queryFn: () => fetchSchedule(stageId),
  })
}

export function useFaqQuery() {
  return useQuery({
    queryKey: ['faq'],
    queryFn: fetchFaq,
  })
}

export function useTrackPointsQuery() {
  return useQuery({
    queryKey: ['track-points'],
    queryFn: fetchTrackPoints,
    enabled: trackMockEnabled,
    refetchInterval: trackMockEnabled ? TRACK_REFETCH_MS : false,
  })
}

export async function fetchMapPositions() {
  if (!navigator.onLine) {
    throw new OfflineError()
  }
  return fetchMapPositionsMock()
}

export function useMapPositionsQuery() {
  return useQuery({
    queryKey: ['map-positions'],
    queryFn: fetchMapPositions,
    refetchInterval: MAP_POSITIONS_REFETCH_MS,
    initialData: buildMapPositionsSnapshot(),
    placeholderData: keepPreviousData,
  })
}

export function useFavoriteMutation(participantId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (nextFavorite: boolean): Promise<FavoriteResponse> => {
      const params = { path: { participant_id: participantId } }
      const result = nextFavorite
        ? await api.POST('/api/v1/participants/{participant_id}/favorite', { params })
        : await api.DELETE('/api/v1/participants/{participant_id}/favorite', { params })
      return unwrap(result)
    },
    onMutate: async (nextFavorite) => {
      await queryClient.cancelQueries({ queryKey: ['supporters', participantId] })
      await queryClient.cancelQueries({ queryKey: ['participant', participantId] })
      await queryClient.cancelQueries({ queryKey: ['participants'] })

      const previousSupporters = queryClient.getQueryData<ParticipantSupporters>([
        'supporters',
        participantId,
      ])
      const previousDetail = queryClient.getQueryData<ParticipantDetail>([
        'participant',
        participantId,
      ])
      const previousLists = queryClient.getQueriesData<ParticipantListItem[]>({
        queryKey: ['participants'],
      })

      const delta = nextFavorite ? 1 : -1
      const baseCount =
        previousSupporters?.supporters_count ?? previousDetail?.supporters_count ?? 0
      const nextCount = Math.max(0, baseCount + delta)

      queryClient.setQueryData<ParticipantSupporters>(['supporters', participantId], {
        participant_id: participantId,
        supporters_count: nextCount,
        is_favorite: nextFavorite,
      })
      if (previousDetail) {
        queryClient.setQueryData<ParticipantDetail>(['participant', participantId], {
          ...previousDetail,
          supporters_count: nextCount,
        })
      }
      queryClient.setQueriesData<ParticipantListItem[]>({ queryKey: ['participants'] }, (list) =>
        list?.map((item) =>
          item.id === participantId
            ? { ...item, supporters_count: Math.max(0, item.supporters_count + delta) }
            : item,
        ),
      )

      return { previousSupporters, previousDetail, previousLists }
    },
    onError: (_error, _nextFavorite, context) => {
      if (!context) {
        return
      }
      restoreQuery(queryClient, ['supporters', participantId], context.previousSupporters)
      restoreQuery(queryClient, ['participant', participantId], context.previousDetail)
      for (const [key, data] of context.previousLists) {
        restoreQuery(queryClient, key, data)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries()
    },
    onSuccess: (payload, nextFavorite) => {
      queryClient.setQueryData<ParticipantSupporters>(['supporters', participantId], {
        participant_id: participantId,
        supporters_count: payload.supporters_count,
        is_favorite: nextFavorite,
      })
      queryClient.setQueryData<ParticipantDetail>(['participant', participantId], (detail) =>
        detail ? { ...detail, supporters_count: payload.supporters_count } : detail,
      )
      queryClient.setQueriesData<ParticipantListItem[]>({ queryKey: ['participants'] }, (list) =>
        list?.map((item) =>
          item.id === participantId
            ? { ...item, supporters_count: payload.supporters_count }
            : item,
        ),
      )
    },
  })
}

function restoreQuery<T>(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: QueryKey,
  data: T | undefined,
): void {
  if (data === undefined) {
    queryClient.removeQueries({ queryKey, exact: true })
    return
  }
  queryClient.setQueryData(queryKey, data)
}
