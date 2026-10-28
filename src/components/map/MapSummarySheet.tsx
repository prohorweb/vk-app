import { useMemo, useState, type ReactNode, type RefObject } from 'react'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Icon56CupOutline, Icon56WriteOutline } from '@vkontakte/icons'
import { Button, Separator, Text, Title } from '@vkontakte/vkui'
import type { RouteMapFilter } from '../../api/mocks/route.ts'
import { getRouteStageDetail, routeAllSummary } from '../../api/mocks/route.ts'
import {
  useActiveSeasonQuery,
  useDisciplinesQuery,
  useParticipantsQuery,
  useProtocolsQuery,
  usePublicStagesQuery,
  useStandingsQuery,
} from '../../api/queries.ts'
import {
  disciplineLabel,
  formatCount,
  formatRaceClock,
  formatShortDateTime,
} from '../../lib/labels.ts'
import { APPLY_URL } from '../../lib/links.ts'
import type { StagePublic } from '../../types/index.ts'
import { ParticipantAvatar } from '../ParticipantAvatar.tsx'
import { SnapSheet } from '../sheet/SnapSheet.tsx'

type MapSummarySheetProps = {
  filter: RouteMapFilter
  disciplineId: number | null
  viewportRef: RefObject<HTMLElement | null>
  headerRef: RefObject<HTMLElement | null>
}

type BadgeTone = 'active' | 'finished' | 'muted'

type StageBadge = {
  label: string
  tone: BadgeTone
}

type ResultEntry = {
  participantId: number
  name: string
  number: number
  position: number | null
  seconds: number | null
}

type TopEntry = ResultEntry & {
  region: string | null
  discipline: string | null
}

/** За сколько до старта показываем «гонка скоро начнётся» вместо приёма заявок. */
const SOON_MS = 7 * 24 * 60 * 60 * 1000

function badgeFor(filter: RouteMapFilter, stages: StagePublic[]): StageBadge {
  if (filter !== 'all') {
    const stage = stages.find((item) => item.id === filter)
    if (stage?.status === 'active') {
      return { label: 'Идёт гонка', tone: 'active' }
    }
    if (stage?.status === 'finished') {
      return { label: 'Этап завершён', tone: 'finished' }
    }
    return { label: 'Этап ещё не начался', tone: 'muted' }
  }

  if (stages.some((stage) => stage.status === 'active')) {
    return { label: 'Идёт гонка', tone: 'active' }
  }
  const finished = stages.filter((stage) => stage.status === 'finished')
  if (stages.length > 0 && finished.length === stages.length) {
    return { label: 'Гонка завершена', tone: 'finished' }
  }
  if (finished.length > 0) {
    const last = finished[finished.length - 1]
    return { label: `Завершённый этап ${last.number}`, tone: 'finished' }
  }
  return { label: 'Гонка ещё не началась', tone: 'muted' }
}

function splitName(name: string): { first: string; rest: string } {
  const [first = '', ...rest] = name.trim().split(/\s+/)
  return { first, rest: rest.join(' ') }
}

type EmptyStateProps = {
  icon: ReactNode
  title: string
  text: string
  action?: ReactNode
}

function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className="map-summary__empty">
      {icon}
      <p className="map-summary__empty-title">{title}</p>
      <p className="map-summary__empty-text">{text}</p>
      {action}
    </div>
  )
}

export function MapSummarySheet({
  filter,
  disciplineId,
  viewportRef,
  headerRef,
}: MapSummarySheetProps) {
  const routeNavigator = useRouteNavigator()
  const seasonQuery = useActiveSeasonQuery()
  const stagesQuery = usePublicStagesQuery()
  const disciplinesQuery = useDisciplinesQuery()
  const participantsQuery = useParticipantsQuery({ disciplineId })
  const protocolsQuery = useProtocolsQuery()
  const standingsQuery = useStandingsQuery()

  const stages = useMemo(() => stagesQuery.data ?? [], [stagesQuery.data])
  const disciplines = useMemo(() => disciplinesQuery.data ?? [], [disciplinesQuery.data])
  const participants = useMemo(() => participantsQuery.data ?? [], [participantsQuery.data])
  const protocols = protocolsQuery.data ?? []
  const standings = useMemo(() => standingsQuery.data?.rows ?? [], [standingsQuery.data])
  const season = seasonQuery.data
  const [now] = useState(() => Date.now())

  const isAll = filter === 'all'
  const stage = isAll ? undefined : stages.find((item) => item.id === filter)
  const stageDetail = getRouteStageDetail(stage?.number ?? 1)
  const stageProtocol = isAll ? undefined : protocols.find((item) => item.stage_id === filter)

  const badge = badgeFor(filter, stages)
  const title = isAll ? 'Все этапы' : `Этап ${stage?.number ?? filter}`
  const distanceKm = isAll
    ? routeAllSummary.distanceKm
    : (stage?.distance_km ?? stageDetail.distanceKm)
  const elevationM = isAll ? routeAllSummary.elevationGainM : stageDetail.elevationGainM

  const startValue = isAll ? stages[0]?.start_time : stage?.start_time
  const finishValue = isAll ? stages[stages.length - 1]?.finish_time : stage?.finish_time
  const dateLine =
    startValue && finishValue
      ? `старт ${formatShortDateTime(startValue)} • финиш ${formatShortDateTime(finishValue)}`
      : null

  const selectedDiscipline = disciplines.find((item) => item.id === disciplineId)
  const sectionTitle = selectedDiscipline ? disciplineLabel(selectedDiscipline) : 'Все дисциплины'

  const participantById = useMemo(
    () => new Map(participants.map((participant) => [participant.id, participant])),
    [participants],
  )
  const disciplineById = useMemo(
    () => new Map(disciplines.map((discipline) => [discipline.id, discipline])),
    [disciplines],
  )

  const topEntries = useMemo<TopEntry[]>(() => {
    const source: ResultEntry[] = isAll
      ? standings.map((row) => ({
          participantId: row.participant_id,
          name: row.participant_name,
          number: row.participant_number,
          position: row.position ?? null,
          seconds: row.final_time_seconds ?? null,
        }))
      : (stageProtocol?.rows ?? []).map((row) => ({
          participantId: row.participant_id,
          name: row.participant_name,
          number: row.participant_number,
          position: row.position ?? null,
          seconds: row.final_time_seconds ?? row.elapsed_time_seconds ?? null,
        }))

    const filtered = source.filter((row) => {
      if (disciplineId === null) {
        return true
      }
      return participantById.get(row.participantId)?.discipline_id === disciplineId
    })

    return filtered
      .filter((row) => row.seconds !== null)
      .sort((left, right) => {
        if (disciplineId === null) {
          const leftPosition = left.position ?? Number.POSITIVE_INFINITY
          const rightPosition = right.position ?? Number.POSITIVE_INFINITY
          if (leftPosition !== rightPosition) {
            return leftPosition - rightPosition
          }
        }
        return (
          (left.seconds ?? Number.POSITIVE_INFINITY) - (right.seconds ?? Number.POSITIVE_INFINITY)
        )
      })
      .slice(0, 3)
      .map((row) => {
        const participant = participantById.get(row.participantId)
        const discipline =
          participant?.discipline_id != null
            ? disciplineById.get(participant.discipline_id)
            : undefined
        return {
          ...row,
          name: participant?.name ?? row.name,
          number: participant?.number ?? row.number,
          region: participant?.region ?? null,
          discipline: discipline ? disciplineLabel(discipline) : (participant?.discipline ?? null),
        }
      })
  }, [disciplineId, disciplineById, isAll, participantById, stageProtocol, standings])

  const hasResults = topEntries.length > 0
  const raceStarted =
    protocols.some((item) => item.rows.length > 0) ||
    standings.length > 0 ||
    stages.some((item) => item.status !== 'planned')
  const stageHasResults = (stageProtocol?.rows.length ?? 0) > 0
  const stageNotStarted = stage?.status === 'planned' && !stageHasResults

  const startsAtMs = season?.starts_at ? Date.parse(season.starts_at) : Number.NaN
  const raceSoon = Number.isFinite(startsAtMs) && startsAtMs > now && startsAtMs - now <= SOON_MS

  const updatedAt = isAll ? standingsQuery.dataUpdatedAt : protocolsQuery.dataUpdatedAt
  const updatedLabel = updatedAt > 0 ? formatShortDateTime(updatedAt) : null
  const firstSeconds = topEntries[0]?.seconds ?? null

  const peek = (
    <>
      <div className="map-summary__peek-head">
        <Title level="3" className="route-sheet__title">
          {title}
        </Title>
        <span className={`map-summary__badge map-summary__badge--${badge.tone}`}>
          {badge.label}
        </span>
      </div>
      <Separator className="route-sheet__title-separator" />
      <div className="route-sheet__peek-stats">
        <Text className="route-sheet__stats route-sheet__stats--primary">
          {formatCount(distanceKm)} км, {formatCount(elevationM)} м ↑
        </Text>
        {dateLine ? <Text className="map-summary__dates">{dateLine}</Text> : null}
      </div>
      <Separator className="map-summary__section-separator" />
      <h2 className="map-summary__section-title">{sectionTitle}</h2>
    </>
  )

  return (
    <SnapSheet
      viewportRef={viewportRef}
      headerRef={headerRef}
      halfRatio={0.62}
      peekKey={`${filter}:${disciplineId ?? 'all'}`}
      peek={peek}
    >
      {(snap) => {
        if (snap === 'collapsed') {
          return null
        }
        if (!raceStarted) {
          if (raceSoon) {
            return (
              <EmptyState
                icon={<Icon56CupOutline aria-hidden />}
                title="Гонка скоро начнётся!"
                text={
                  season?.starts_at
                    ? `Информация появится сразу после старта гонки ${formatShortDateTime(season.starts_at)}`
                    : 'Информация появится сразу после старта гонки'
                }
              />
            )
          }
          return (
            <EmptyState
              icon={<Icon56WriteOutline aria-hidden />}
              title="Идёт приём заявок"
              text="Подача заявок открыта до старта гонки"
              action={
                <Button
                  size="m"
                  mode="primary"
                  className="map-summary__empty-button"
                  onClick={() => window.open(APPLY_URL, '_blank', 'noopener')}
                >
                  Подать заявку
                </Button>
              }
            />
          )
        }
        if (stageNotStarted) {
          return (
            <EmptyState
              icon={<Icon56CupOutline aria-hidden />}
              title="Этап скоро начнётся!"
              text={
                stage?.start_time
                  ? `Информация появится сразу после старта этапа ${formatShortDateTime(stage.start_time)}`
                  : 'Информация появится сразу после старта этапа'
              }
            />
          )
        }
        if (!hasResults) {
          return (
            <EmptyState
              icon={<Icon56CupOutline aria-hidden />}
              title="Результатов пока нет"
              text={
                isAll
                  ? 'Информация появится после финиша гонки'
                  : 'Информация появится после финиша этапа'
              }
            />
          )
        }
        return (
          <>
            <div className="map-summary__top-head">
              <p className="map-summary__top-title">Топ-3</p>
              {updatedLabel ? (
                <p className="map-summary__top-updated">обновлено {updatedLabel}</p>
              ) : null}
            </div>
            <ul className="map-summary__top-list">
              {topEntries.map((row, index) => {
                const name = splitName(row.name)
                const gap =
                  row.seconds !== null && firstSeconds !== null ? row.seconds - firstSeconds : null
                const sub =
                  disciplineId === null
                    ? (row.discipline ?? '—')
                    : index === 0 || !gap
                      ? '-'
                      : `+${formatRaceClock(gap)}`

                return (
                  <li key={row.participantId} className="map-summary__top-row">
                    <button
                      type="button"
                      className="map-summary__top-button"
                      onClick={() => void routeNavigator.push(`/participants/${row.participantId}`)}
                    >
                      <span
                        className={`map-summary__rank map-summary__rank--${index + 1}`}
                        aria-hidden
                      >
                        {index + 1}
                      </span>
                      <ParticipantAvatar
                        id={row.participantId}
                        name={row.name}
                        className="avatar-40 map-summary__avatar"
                      />
                      <span className="map-summary__body">
                        <span className="map-summary__name">
                          <span>{name.first}</span>
                          {name.rest ? (
                            <span className="map-summary__surname">{name.rest}</span>
                          ) : null}
                          <span className="bib-badge">#{row.number}</span>
                        </span>
                        {row.region ? (
                          <span className="map-summary__region">{row.region}</span>
                        ) : null}
                      </span>
                      <span className="map-summary__times">
                        <span className="map-summary__time">{formatRaceClock(row.seconds)}</span>
                        <span className="map-summary__sub">{sub}</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )
      }}
    </SnapSheet>
  )
}
