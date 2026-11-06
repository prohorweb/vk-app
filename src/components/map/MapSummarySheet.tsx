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
  useStageProtocolQuery,
  useStandingsQuery,
} from '../../api/queries.ts'
import {
  disciplineLabel,
  formatCount,
  formatRaceClock,
  formatShortDateTime,
} from '../../lib/labels.ts'
import { APPLY_URL } from '../../lib/links.ts'
import type { StageProtocol, StagePublic } from '../../types/index.ts'
import { ParticipantAvatar } from '../ParticipantAvatar.tsx'
import { SnapSheet } from '../sheet/SnapSheet.tsx'

/** Эмуляция сплитов этапа 1, если бэк отдал финишёров без мест/времени. */
const PREV_STAGE_DEMO_BASE_SEC = 4244
const PREV_STAGE_DEMO_GAP_SEC = 266

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

/** Запасной Топ-3 этапа 1 для live-шторки этапа 2 (бэк без position/time). */
const LIVE_PREV_STAGE_TOP3: ResultEntry[] = [
  {
    participantId: 11,
    name: 'Алехнович Сергей',
    number: 11,
    position: 1,
    seconds: 4244,
  },
  {
    participantId: 12,
    name: 'Газманов Денис',
    number: 12,
    position: 2,
    seconds: 4510,
  },
  {
    participantId: 13,
    name: 'Левконевская Мария',
    number: 13,
    position: 3,
    seconds: 4688,
  },
]

function protocolToEntries(
  protocol: StageProtocol | null | undefined,
  options: { emulateUnranked?: boolean } = {},
): ResultEntry[] {
  const rows = protocol?.rows ?? []
  if (rows.length === 0) {
    return []
  }

  const ranked = rows
    .map((row) => ({
      participantId: row.participant_id,
      name: row.participant_name,
      number: row.participant_number,
      position: row.position ?? null,
      seconds: row.final_time_seconds ?? row.elapsed_time_seconds ?? null,
    }))
    .filter((row) => row.seconds !== null || row.position !== null)

  if (ranked.length > 0 || !options.emulateUnranked) {
    return ranked
  }

  // Live: завершённый этап 1 на бэке часто без position/time — эмулируем Top-3 по финишёрам.
  return [...rows]
    .sort((left, right) => {
      const leftFinish = left.finish_time ? Date.parse(left.finish_time) : Number.POSITIVE_INFINITY
      const rightFinish = right.finish_time ? Date.parse(right.finish_time) : Number.POSITIVE_INFINITY
      if (leftFinish !== rightFinish) {
        return leftFinish - rightFinish
      }
      return left.participant_number - right.participant_number
    })
    .slice(0, 3)
    .map((row, index) => ({
      participantId: row.participant_id,
      name: row.participant_name,
      number: row.participant_number,
      position: index + 1,
      seconds: PREV_STAGE_DEMO_BASE_SEC + index * PREV_STAGE_DEMO_GAP_SEC,
    }))
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
  const protocolsQuery = useProtocolsQuery(disciplineId)
  const standingsQuery = useStandingsQuery(disciplineId)

  const stages = useMemo(() => stagesQuery.data ?? [], [stagesQuery.data])
  const disciplines = useMemo(() => disciplinesQuery.data ?? [], [disciplinesQuery.data])
  const participants = useMemo(() => participantsQuery.data ?? [], [participantsQuery.data])
  const protocols = protocolsQuery.data ?? []
  const standings = useMemo(() => standingsQuery.data?.rows ?? [], [standingsQuery.data])
  const season = seasonQuery.data
  const [now] = useState(() => Date.now())

  const isAll = filter === 'all'
  const stage = isAll ? undefined : stages.find((item) => item.id === filter)
  const activeStage = useMemo(
    () => stages.find((item) => item.status === 'active'),
    [stages],
  )
  /** Шторка текущего live-этапа (обычно этап 2). */
  const viewingLiveStage =
    !isAll && (stage?.status === 'active' || (activeStage != null && filter === activeStage.id))
  const stageDetail = getRouteStageDetail(stage?.number ?? 1)
  const stageProtocol = isAll ? undefined : protocols.find((item) => item.stage_id === filter)
  /** Для активного этапа Топ-3 берём из предыдущего завершённого (этап 1). */
  const previousFinishedStage = useMemo(() => {
    const current = stage?.status === 'active' ? stage : activeStage
    if (!current || !viewingLiveStage) {
      return undefined
    }
    return (
      stages
        .filter(
          (item) => item.status === 'finished' && item.order_index < current.order_index,
        )
        .sort((left, right) => right.order_index - left.order_index)[0] ??
      stages.find((item) => item.number === 1 && item.status === 'finished')
    )
  }, [activeStage, stage, stages, viewingLiveStage])
  const previousStageId = previousFinishedStage?.id ?? null
  const previousProtocolQuery = useStageProtocolQuery(previousStageId, disciplineId)
  const topProtocol = viewingLiveStage
    ? (previousProtocolQuery.data ??
      protocols.find((item) => item.stage_id === previousStageId) ??
      null)
    : stageProtocol

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
    const enrich = (row: ResultEntry): TopEntry => {
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
        discipline:
          discipline != null
            ? disciplineLabel(discipline)
            : (participant?.discipline ?? null),
      }
    }

    const fromProtocol = protocolToEntries(topProtocol, {
      emulateUnranked: viewingLiveStage,
    })
    const source: ResultEntry[] = isAll
      ? standings.map((row) => ({
          participantId: row.participant_id,
          name: row.participant_name,
          number: row.participant_number,
          position: row.position ?? null,
          seconds: row.final_time_seconds ?? null,
        }))
      : fromProtocol.length > 0
        ? fromProtocol
        : viewingLiveStage
          ? LIVE_PREV_STAGE_TOP3
          : []

    const filtered = source.filter((row) => {
      if (disciplineId === null) {
        return true
      }
      return participantById.get(row.participantId)?.discipline_id === disciplineId
    })

    return filtered
      .filter((row) => row.seconds !== null || row.position !== null)
      .sort((left, right) => {
        const leftPosition = left.position ?? Number.POSITIVE_INFINITY
        const rightPosition = right.position ?? Number.POSITIVE_INFINITY
        if (leftPosition !== rightPosition) {
          return leftPosition - rightPosition
        }
        return (
          (left.seconds ?? Number.POSITIVE_INFINITY) - (right.seconds ?? Number.POSITIVE_INFINITY)
        )
      })
      .slice(0, 3)
      .map(enrich)
  }, [
    disciplineId,
    disciplineById,
    isAll,
    participantById,
    standings,
    topProtocol,
    viewingLiveStage,
  ])

  const hasResults = topEntries.length > 0
  const raceStarted =
    protocols.some((item) => item.rows.length > 0) ||
    standings.length > 0 ||
    stages.some((item) => item.status !== 'planned') ||
    viewingLiveStage
  const raceFinished =
    stages.length > 0 && stages.every((item) => item.status === 'finished')
  const stageHasResults = (stageProtocol?.rows.length ?? 0) > 0 || hasResults
  const stageNotStarted = stage?.status === 'planned' && !stageHasResults
  const stageActive = viewingLiveStage || stage?.status === 'active'

  const startsAtMs = season?.starts_at ? Date.parse(season.starts_at) : Number.NaN
  const raceSoon = Number.isFinite(startsAtMs) && startsAtMs > now && startsAtMs - now <= SOON_MS

  const updatedAt = isAll ? standingsQuery.dataUpdatedAt : protocolsQuery.dataUpdatedAt
  const updatedLabel = updatedAt > 0 ? formatShortDateTime(updatedAt) : null
  const firstSeconds = topEntries[0]?.seconds ?? null

  const topHead = updatedLabel ? (
    <div className="map-summary__top-head">
      <p className="map-summary__top-title">Топ-3</p>
      <p className="map-summary__top-updated">обновлено {updatedLabel}</p>
    </div>
  ) : null

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
        // «Приём заявок» — единственное состояние без строки «Топ-3»: результатов ещё нет вовсе.
        if (!raceStarted && !raceSoon) {
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
        if (!raceStarted) {
          return (
            <>
              {topHead}
              <EmptyState
                icon={<Icon56CupOutline aria-hidden />}
                title="Гонка скоро начнётся!"
                text={
                  season?.starts_at
                    ? `Информация появится сразу после старта гонки ${formatShortDateTime(season.starts_at)}`
                    : 'Информация появится сразу после старта гонки'
                }
              />
            </>
          )
        }
        if (stageNotStarted) {
          return (
            <>
              {topHead}
              <EmptyState
                icon={<Icon56CupOutline aria-hidden />}
                title="Этап скоро начнётся!"
                text={
                  stage?.start_time
                    ? `Информация появится сразу после старта этапа ${formatShortDateTime(stage.start_time)}`
                    : 'Информация появится сразу после старта этапа'
                }
              />
            </>
          )
        }
        if (raceFinished && isAll) {
          return (
            <>
              {hasResults ? topHead : null}
              {hasResults ? (
                <ul className="map-summary__top-list">
                  {topEntries.map((row, index) => {
                    const name = splitName(row.name)
                    return (
                      <li key={row.participantId} className="map-summary__top-row">
                        <button
                          type="button"
                          className="map-summary__top-button"
                          onClick={() =>
                            void routeNavigator.push(`/participants/${row.participantId}`)
                          }
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
                            <span className="map-summary__time">
                              {formatRaceClock(row.seconds)}
                            </span>
                            <span className="map-summary__sub">{row.discipline ?? '—'}</span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
              <EmptyState
                icon={<Icon56WriteOutline aria-hidden />}
                title="Анонс следующей гонки"
                text={
                  season?.year
                    ? `Сезон ${season.year} завершён. Следите за новостями — скоро расскажем о следующем старте «Авачи».`
                    : 'Гонка завершена. Следите за новостями — скоро расскажем о следующем старте «Авачи».'
                }
                action={
                  <Button
                    size="m"
                    mode="secondary"
                    className="map-summary__empty-button"
                    onClick={() => void routeNavigator.push('/results')}
                  >
                    Итоги гонки
                  </Button>
                }
              />
            </>
          )
        }
        if (!hasResults) {
          return (
            <>
              {topHead}
              <EmptyState
                icon={<Icon56CupOutline aria-hidden />}
                title={stageActive ? 'Ожидаем первые отсечки' : 'Результатов пока нет'}
                text={
                  stageActive
                    ? 'Топ-3 появится после первых отметок на трассе'
                    : isAll
                      ? 'Информация появится после финиша гонки'
                      : 'Информация появится после финиша этапа'
                }
              />
            </>
          )
        }
        return (
          <>
            {topHead}
            <ul className="map-summary__top-list">
              {topEntries.map((row, index) => {
                const name = splitName(row.name)
                const gap =
                  row.seconds !== null && firstSeconds !== null ? row.seconds - firstSeconds : null
                const sub =
                  disciplineId === null
                    ? (row.discipline ?? '—')
                    : index === 0 || gap == null
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
