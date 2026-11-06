import type {
  DisciplinePublic,
  FAQListResponse,
  MapCheckpointItem,
  MapParticipantsResponse,
  NewsPostListResponse,
  ParticipantDetail,
  ParticipantListItem,
  ParticipantSupporters,
  RaceStandings,
  ScheduleEventListResponse,
  SeasonPublic,
  StageProtocol,
  StagePublic,
  SupporterRatingEntry,
  ViewerLocationItem,
} from '../../types/index.ts'
import type { DevScenarioName } from '../devScenarios.ts'
import {
  applyKineticToMap,
  startMockKinetic,
  stopMockKinetic,
} from './kinetic.ts'

type ScenarioBundle = {
  season: SeasonPublic
  stages: StagePublic[]
  disciplines: DisciplinePublic[]
  participants: ParticipantListItem[]
  participantDetails: Record<string, ParticipantDetail>
  supporters: Record<string, ParticipantSupporters>
  supportersRating: SupporterRatingEntry[]
  standings: RaceStandings
  protocols: Record<string, StageProtocol>
  mapParticipants: MapParticipantsResponse
  tracks: Record<string, { type?: string; coordinates: number[][] }>
  checkpoints: Record<string, MapCheckpointItem[]>
  news: NewsPostListResponse
  schedule: ScheduleEventListResponse
  faq: FAQListResponse
  viewerLocations: ViewerLocationItem[]
}

type TrackGeo = { type?: string; coordinates: number[][] }

const modules = import.meta.glob('./scenarios/*/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

function read<T>(scenario: DevScenarioName, file: string): T {
  const key = `./scenarios/${scenario}/${file}.json`
  const value = modules[key]
  if (value === undefined) {
    throw new Error(`Missing mock fixture: ${key}`)
  }
  return value as T
}

function loadBundle(scenario: DevScenarioName): ScenarioBundle {
  return {
    season: read(scenario, 'season'),
    stages: read(scenario, 'stages'),
    disciplines: read(scenario, 'disciplines'),
    participants: read(scenario, 'participants'),
    participantDetails: read(scenario, 'participant-details'),
    supporters: read(scenario, 'supporters'),
    supportersRating: read(scenario, 'supporters-rating'),
    standings: read(scenario, 'standings'),
    protocols: read(scenario, 'protocols'),
    mapParticipants: read(scenario, 'map-participants'),
    tracks: read(scenario, 'tracks'),
    checkpoints: read(scenario, 'checkpoints'),
    news: read(scenario, 'news'),
    schedule: read(scenario, 'schedule'),
    faq: read(scenario, 'faq'),
    viewerLocations: read(scenario, 'viewer-locations'),
  }
}

const bundles: Record<DevScenarioName, ScenarioBundle> = {
  upcoming: loadBundle('upcoming'),
  live: loadBundle('live'),
  finished: loadBundle('finished'),
}

/** Default presentation state: до старта (~3 мес.), как сценарий 1. */
let activeScenario: DevScenarioName = 'upcoming'
const scenarioListeners = new Set<() => void>()

function notifyScenario(): void {
  for (const listener of scenarioListeners) {
    listener()
  }
}

export function getMockScenario(): DevScenarioName {
  return activeScenario
}

export function subscribeMockScenario(listener: () => void): () => void {
  scenarioListeners.add(listener)
  return () => {
    scenarioListeners.delete(listener)
  }
}

function bundle(): ScenarioBundle {
  return bundles[activeScenario]
}

export function setMockScenario(name: DevScenarioName): void {
  stopMockKinetic()
  activeScenario = name
  notifyScenario()
}

/** Client kinetic for Dorokhov (id 7) on the live map stage track. */
export function startMockKineticDemo(participantId: number, onTick: () => void): void {
  const data = bundle()
  const stageId = data.mapParticipants.stage_id ?? data.stages.find((s) => s.status === 'active')?.id
  if (stageId == null) {
    return
  }
  const track = data.tracks[String(stageId)] as TrackGeo | undefined
  const coordinates = (track?.coordinates ?? []).filter(
    (pair): pair is [number, number] =>
      Array.isArray(pair) &&
      pair.length >= 2 &&
      typeof pair[0] === 'number' &&
      typeof pair[1] === 'number',
  )
  startMockKinetic(participantId, stageId, coordinates, onTick)
}

export function mockSeason(): SeasonPublic | null {
  return structuredClone(bundle().season)
}

export function mockStages(seasonId: number): StagePublic[] {
  void seasonId
  return structuredClone(bundle().stages).sort(
    (a, b) => a.order_index - b.order_index || a.number - b.number,
  )
}

export function mockDisciplines(seasonId: number): DisciplinePublic[] {
  void seasonId
  return structuredClone(bundle().disciplines).sort(
    (a, b) => a.sort_order - b.sort_order || a.id - b.id,
  )
}

export function mockParticipants(filters: {
  search?: string
  sort?: 'bib' | 'name' | 'supporters'
  disciplineId?: number | null
}): ParticipantListItem[] {
  let list = structuredClone(bundle().participants)
  const search = filters.search?.trim().toLowerCase()
  if (search) {
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(search) || String(item.number).includes(search),
    )
  }
  if (filters.disciplineId != null) {
    list = list.filter((item) => item.discipline_id === filters.disciplineId)
  }
  const sort = filters.sort ?? 'bib'
  list.sort((a, b) => {
    if (sort === 'name') {
      return a.name.localeCompare(b.name, 'ru')
    }
    if (sort === 'supporters') {
      return b.supporters_count - a.supporters_count || a.number - b.number
    }
    return a.number - b.number
  })
  return list
}

export function mockParticipant(id: number): ParticipantDetail | null {
  const detail = bundle().participantDetails[String(id)]
  return detail ? structuredClone(detail) : null
}

export function mockSupporters(id: number): ParticipantSupporters {
  const row = bundle().supporters[String(id)]
  if (row) {
    return structuredClone(row)
  }
  return { participant_id: id, supporters_count: 0, is_favorite: false }
}

export function mockSupportersRating(): SupporterRatingEntry[] {
  return structuredClone(bundle().supportersRating)
}

export function mockStandings(filters: {
  disciplineId?: number | null
  seasonId?: number | null
}): RaceStandings {
  const standings = structuredClone(bundle().standings)
  if (filters.disciplineId == null) {
    return standings
  }
  return {
    ...standings,
    rows: standings.rows.filter((row) => row.discipline_id === filters.disciplineId),
  }
}

export function mockStageProtocol(
  stageId: number,
  filters: { disciplineId?: number | null } = {},
): StageProtocol | null {
  const protocol = bundle().protocols[String(stageId)]
  if (!protocol) {
    return null
  }
  const clone = structuredClone(protocol)
  if (filters.disciplineId == null) {
    return clone
  }
  return {
    ...clone,
    rows: clone.rows.filter((row) => row.discipline_id === filters.disciplineId),
  }
}

export function mockNews(): NewsPostListResponse {
  return structuredClone(bundle().news)
}

export function mockSchedule(stageId?: number | null): ScheduleEventListResponse {
  const schedule = structuredClone(bundle().schedule)
  if (stageId == null) {
    return schedule
  }
  return {
    ...schedule,
    items: schedule.items.filter((item) => item.stage_id === stageId),
  }
}

export function mockFaq(): FAQListResponse {
  return structuredClone(bundle().faq)
}

export function mockViewerLocations(): ViewerLocationItem[] {
  return structuredClone(bundle().viewerLocations)
}

export function mockMapParticipants(
  stageId: number,
  disciplineIds?: number[] | null,
): MapParticipantsResponse {
  const base = structuredClone(bundle().mapParticipants)
  // Fixtures are captured for the scenario's active stage; if UI asks another id, still serve items.
  let items = base.items ?? []
  if (disciplineIds && disciplineIds.length > 0) {
    const allowed = new Set(disciplineIds)
    items = items.filter((item) => allowed.has(item.discipline_id))
  }
  const payload: MapParticipantsResponse = {
    stage_id: base.stage_id ?? stageId,
    items,
    total: items.length,
    limit: base.limit ?? 500,
    offset: base.offset ?? 0,
  }
  return applyKineticToMap(payload)
}

export function mockStageTrack(stageId: number): { coordinates: number[][] } {
  const track = bundle().tracks[String(stageId)]
  return structuredClone(track ?? { coordinates: [] })
}

export function mockStageCheckpoints(stageId: number): MapCheckpointItem[] {
  return structuredClone(bundle().checkpoints[String(stageId)] ?? [])
}
