import { useState } from 'react'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import {
  Icon20ChevronRightOutline,
  Icon20ErrorCircleOutline,
  Icon20PawOutline,
  Icon20PinOutline,
  Icon24CalendarOutline,
  Icon24CheckCircleFillGreen,
  Icon24Cancel,
  Icon24DownloadCheckOutline,
  Icon24DownloadErrorOutline,
  Icon24DownloadOutline,
  Icon24ErrorCircleOutline,
  Icon24SpeedometerMiddleOutline,
  Icon24WarningTriangleOutline,
  Icon56DocumentOutline,
} from '@vkontakte/icons'
import { Button, Panel, PanelHeader, PanelHeaderButton } from '@vkontakte/vkui'
import { trackerGap, type TrackerGap } from '../api/gaps.ts'
import { APPLY_URL } from '../lib/links.ts'
import {
  useActiveSeasonQuery,
  useDisciplinesQuery,
  useParticipantsQuery,
  useProtocolsQuery,
  usePublicStagesQuery,
  useStandingsQuery,
} from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import {
  disciplineLabel,
  formatCount,
  formatDuration,
  formatRaceClock,
  formatShortDateTime,
} from '../lib/labels.ts'
import type {
  ParticipantListItem,
  StageProtocol,
  StageProtocolRow,
  StandingRow,
} from '../types/index.ts'

type ResultsPanelProps = {
  id: string
}

type StageSelection = 'all' | number

type DownloadState = 'idle' | 'success' | 'error'

type ResultRow = {
  participant: ParticipantListItem
  gap: TrackerGap
  protocol: StageProtocolRow | undefined
  standing: StandingRow | undefined
}

type DisciplineGroup = {
  id: number | null
  title: string
  rows: ResultRow[]
}

/** За сколько до старта показываем «гонка скоро начнётся» вместо приёма заявок. */
const SOON_MS = 7 * 24 * 60 * 60 * 1000

/** Уведомление об обратном отсчёте показывается один раз за сессию. */
let countdownShownInSession = false

const speedFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

function splitName(name: string) {
  const [first = '', ...rest] = name.trim().split(/\s+/)
  return { first, rest: rest.join(' ') }
}

function hasProtocolRows(protocol: StageProtocol | undefined): boolean {
  return (protocol?.rows.length ?? 0) > 0
}

/** «2 мес. 3 д.» — до старта гонки. */
function countdownLabel(ms: number): string {
  if (ms <= 0) {
    return '0 д.'
  }
  const totalMinutes = Math.floor(ms / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const months = Math.floor(days / 30)
  if (months > 0) {
    return `${months} мес. ${days % 30} д.`
  }
  if (days > 0) {
    return `${days} д.`
  }
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours} ч. ${minutes} мин.` : `${minutes} мин.`
}

function speedLabel(distanceKm: number | null, seconds: number | null | undefined): string {
  if (!distanceKm || !seconds) {
    return '—'
  }
  return `${speedFormatter.format(distanceKm / (seconds / 3600))} км/ч`
}

function penaltyLabel(seconds: number): string {
  return seconds > 0 ? formatDuration(seconds) : '-'
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      default:
        return '&quot;'
    }
  })
}

type ProtocolEntry = {
  position: number | null
  number: number
  name: string
  region: string | null
  discipline: string
  result: string
  total: string
  penalty: string
}

/** Протокол собирается на клиенте: файл открывается сразу и печатается в PDF. */
function buildProtocolHtml(title: string, subtitle: string, entries: ProtocolEntry[]): string {
  const rows = entries
    .map(
      (entry) => `<tr>
      <td>${entry.position ?? '—'}</td>
      <td>${entry.number}</td>
      <td>${escapeHtml(entry.name)}</td>
      <td>${escapeHtml(entry.region ?? '')}</td>
      <td>${escapeHtml(entry.discipline)}</td>
      <td>${entry.result}</td>
      <td>${entry.total}</td>
      <td>${entry.penalty}</td>
    </tr>`,
    )
    .join('')

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  body { margin: 24px; color: #000; font: 14px/20px -apple-system, 'Segoe UI', Roboto, sans-serif; }
  h1 { margin: 0 0 4px; font-size: 20px; line-height: 24px; }
  p { margin: 0 0 16px; color: #6d7885; font-size: 13px; line-height: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px; border-bottom: 1px solid #e0e3e6; text-align: left; vertical-align: top; }
  th { font-size: 12px; text-transform: uppercase; color: #818c99; border-bottom-color: #99a2ad; }
  td:nth-child(1), td:nth-child(2) { width: 48px; text-align: center; }
  td:nth-child(6), td:nth-child(7), td:nth-child(8) { white-space: nowrap; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(subtitle)}</p>
<table>
  <thead>
    <tr><th>п/п</th><th>№</th><th>участник</th><th>регион</th><th>дисциплина</th><th>результат этапа</th><th>общее время</th><th>штр. вр.</th></tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
</body>
</html>`
}

function saveFile(html: string, filename: string): string {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  return url
}

export function ResultsPanel({ id }: ResultsPanelProps) {
  const routeNavigator = useRouteNavigator()
  const seasonQuery = useActiveSeasonQuery()
  const stagesQuery = usePublicStagesQuery()
  const disciplinesQuery = useDisciplinesQuery()
  const participantsQuery = useParticipantsQuery()
  const standingsQuery = useStandingsQuery()
  const protocolsQuery = useProtocolsQuery()

  const [selectedStage, setSelectedStage] = useState<StageSelection | null>(null)
  const [openDiscipline, setOpenDiscipline] = useState<number | null | undefined>(undefined)
  const [download, setDownload] = useState<{ key: string; state: DownloadState } | null>(null)
  const [closedToast, setClosedToast] = useState<string | null>(null)
  const [closedWarning, setClosedWarning] = useState<string | null>(null)
  const [protocolUrl, setProtocolUrl] = useState<string | null>(null)
  const [countdownVisible] = useState(() => {
    if (countdownShownInSession) {
      return false
    }
    countdownShownInSession = true
    return true
  })
  const [countdownClosed, setCountdownClosed] = useState(false)
  const [now] = useState(() => Date.now())

  const stages = stagesQuery.data ?? []
  const disciplines = disciplinesQuery.data ?? []
  const participants = participantsQuery.data ?? []
  const standings = standingsQuery.data?.rows ?? []
  const protocols = protocolsQuery.data ?? []
  const season = seasonQuery.data

  const protocolByStage = new Map(protocols.map((item) => [item.stage_id, item]))
  const standingById = new Map(standings.map((row) => [row.participant_id, row]))

  const raceStarted =
    protocols.some((item) => hasProtocolRows(item)) ||
    stages.some((item) => item.status !== 'planned')
  const activeStage = stages.find((item) => item.status === 'active')
  const stagesWithResults = stages.filter((item) => hasProtocolRows(protocolByStage.get(item.id)))
  const lastResultsStage = stagesWithResults[stagesWithResults.length - 1]
  const defaultStage: StageSelection = activeStage?.id ?? lastResultsStage?.id ?? 'all'
  const stage = selectedStage ?? defaultStage
  const stageKey = String(stage)

  const stageInfo = typeof stage === 'number' ? stages.find((item) => item.id === stage) : undefined
  const stageProtocol = typeof stage === 'number' ? protocolByStage.get(stage) : undefined
  const stageHasResults = hasProtocolRows(stageProtocol)
  const stageNotStarted =
    typeof stage === 'number' && stageInfo?.status === 'planned' && !stageHasResults
  const showWarning = stageNotStarted && closedWarning !== stageKey

  const downloadableStages = stages.filter(
    (item) => item.status === 'finished' || hasProtocolRows(protocolByStage.get(item.id)),
  )
  const canDownload =
    stage === 'all'
      ? downloadableStages.length > 0
      : downloadableStages.some((item) => item.id === stage)

  const downloadState: DownloadState = download?.key === stageKey ? download.state : 'idle'
  const toastKey = `${stageKey}:${downloadState}`
  const showToast = downloadState !== 'idle' && closedToast !== toastKey

  const startsAt = season?.starts_at ? new Date(season.starts_at).getTime() : null
  const msToStart = startsAt !== null ? startsAt - now : null
  const raceSoon = msToStart !== null && msToStart > 0 && msToStart <= SOON_MS

  const totalDistance = stages.reduce((sum, item) => sum + item.distance_km, 0)
  const stageDistance = stageInfo?.distance_km ?? null

  const buildRows = (list: ParticipantListItem[]): ResultRow[] =>
    list
      .map((participant) => ({
        participant,
        gap: trackerGap(participant.id, participant.dogs_count ?? null),
        protocol: stageProtocol?.rows.find((row) => row.participant_id === participant.id),
        standing: standingById.get(participant.id),
      }))
      .sort((left, right) => {
        const leftOut = left.gap.outcome ? 1 : 0
        const rightOut = right.gap.outcome ? 1 : 0
        if (leftOut !== rightOut) {
          return leftOut - rightOut
        }
        const leftPosition =
          (stage === 'all' ? left.standing?.position : left.protocol?.position) ??
          left.standing?.position ??
          null
        const rightPosition =
          (stage === 'all' ? right.standing?.position : right.protocol?.position) ??
          right.standing?.position ??
          null
        if (leftPosition !== null && rightPosition !== null && leftPosition !== rightPosition) {
          return leftPosition - rightPosition
        }
        if (leftPosition === null && rightPosition !== null) {
          return 1
        }
        if (leftPosition !== null && rightPosition === null) {
          return -1
        }
        return left.participant.number - right.participant.number
      })

  const groups: DisciplineGroup[] = disciplines.map((discipline) => ({
    id: discipline.id,
    title: disciplineLabel(discipline),
    rows: buildRows(participants.filter((item) => item.discipline_id === discipline.id)),
  }))
  const ungrouped = participants.filter((item) => item.discipline_id === null)
  if (ungrouped.length > 0) {
    groups.push({ id: null, title: 'Без дисциплины', rows: buildRows(ungrouped) })
  }

  const expandedId = openDiscipline === undefined ? (groups[0]?.id ?? null) : openDiscipline
  const toggleDiscipline = (groupId: number | null) => {
    setOpenDiscipline(expandedId === groupId ? null : groupId)
  }

  const positionOf = (row: ResultRow): number | null =>
    (stage === 'all' ? row.standing?.position : row.protocol?.position) ??
    row.standing?.position ??
    null

  /** Номер этапа, на котором участник сошёл: первый этап без финишного времени. */
  const dropStageNumber = (row: ResultRow): number | null => {
    for (const item of stages) {
      const result = protocolByStage
        .get(item.id)
        ?.rows.find((entry) => entry.participant_id === row.participant.id)
      if (result && result.final_time_seconds === null) {
        return item.number
      }
    }
    return lastResultsStage?.number ?? null
  }

  const stageTimeOf = (row: ResultRow): string =>
    formatRaceClock(
      stage === 'all' ? row.standing?.final_time_seconds : row.protocol?.final_time_seconds,
    )

  const totalTimeOf = (row: ResultRow): string => formatRaceClock(row.standing?.final_time_seconds)

  const handleDownload = () => {
    try {
      const stageLabel =
        stage === 'all' ? 'Все этапы' : (stageInfo?.name ?? `Этап ${stageInfo?.number ?? ''}`)
      const title = `Протокол · ${stageLabel}`
      const subtitle = [
        season?.title ?? 'Гонка «Авача»',
        stageInfo?.start_time ? formatShortDateTime(stageInfo.start_time) : null,
      ]
        .filter(Boolean)
        .join(' · ')
      const entries: ProtocolEntry[] = groups.flatMap((group) =>
        group.rows.map((row) => ({
          position: positionOf(row),
          number: row.participant.number,
          name: row.participant.name,
          region: row.participant.region,
          discipline: group.title,
          result: stageTimeOf(row),
          total: totalTimeOf(row),
          penalty:
            stage === 'all'
              ? penaltyLabel(row.standing?.total_penalty_seconds ?? 0)
              : penaltyLabel(row.protocol?.total_penalty_seconds ?? 0),
        })),
      )
      const filename = `avacha-protocol-${stage === 'all' ? 'all-stages' : `stage-${stageInfo?.number ?? stage}`}.html`
      setProtocolUrl(saveFile(buildProtocolHtml(title, subtitle, entries), filename))
      setDownload({ key: stageKey, state: 'success' })
      setClosedToast(null)
    } catch {
      setDownload({ key: stageKey, state: 'error' })
      setClosedToast(null)
    }
  }

  const openProtocol = () => {
    if (protocolUrl) {
      window.open(protocolUrl, '_blank', 'noopener')
    }
  }

  const isLoading =
    seasonQuery.isLoading ||
    stagesQuery.isLoading ||
    disciplinesQuery.isLoading ||
    participantsQuery.isLoading ||
    standingsQuery.isLoading ||
    protocolsQuery.isLoading
  const isError =
    seasonQuery.isError ||
    stagesQuery.isError ||
    disciplinesQuery.isError ||
    participantsQuery.isError ||
    standingsQuery.isError ||
    protocolsQuery.isError
  const updatedAt = Math.max(
    standingsQuery.dataUpdatedAt,
    protocolsQuery.dataUpdatedAt,
    participantsQuery.dataUpdatedAt,
  )

  const downloadIcon =
    downloadState === 'success' ? (
      <Icon24DownloadCheckOutline />
    ) : downloadState === 'error' ? (
      <Icon24DownloadErrorOutline />
    ) : (
      <Icon24DownloadOutline />
    )

  const downloadTone = !canDownload
    ? raceStarted
      ? 'is-disabled'
      : 'is-muted'
    : downloadState === 'idle'
      ? 'is-active'
      : 'is-done'

  return (
    <Panel id={id} className="results-screen">
      <PanelHeader
        delimiter="none"
        after={
          <PanelHeaderButton
            className={`results-download ${downloadTone}`}
            aria-label="Скачать протокол"
            disabled={!canDownload}
            onClick={handleDownload}
          >
            {downloadIcon}
          </PanelHeaderButton>
        }
      >
        Результаты
      </PanelHeader>
      <AsyncView isLoading={isLoading} isError={isError} isEmpty={false} updatedAt={updatedAt}>
        <div className="results-body">
          <div className="results-stages">
            <button
              type="button"
              className={`results-stage${stage === 'all' ? ' is-selected' : ''}`}
              disabled={!raceStarted}
              onClick={() => setSelectedStage('all')}
            >
              Все этапы
            </button>
            {stages.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`results-stage${stage === item.id ? ' is-selected' : ''}`}
                disabled={!raceStarted}
                onClick={() => setSelectedStage(item.id)}
              >
                {item.number}
              </button>
            ))}
          </div>
          {showWarning && stageInfo ? (
            <aside className="results-warning" role="status">
              <Icon24WarningTriangleOutline aria-hidden />
              <p className="results-warning__text">
                {stageInfo.start_time
                  ? `Начало этапа ${formatShortDateTime(stageInfo.start_time)}. Информация появится сразу после начала этапа.`
                  : 'Информация появится сразу после начала этапа.'}
              </p>
              <button
                type="button"
                className="results-warning__close"
                aria-label="Закрыть"
                onClick={() => setClosedWarning(stageKey)}
              >
                <Icon24Cancel aria-hidden />
              </button>
            </aside>
          ) : null}
          {!raceStarted ? (
            <div className="results-empty">
              <Icon56DocumentOutline aria-hidden />
              <p className="results-empty__title">
                {raceSoon ? 'Гонка скоро начнётся!' : 'Идёт приём заявок'}
              </p>
              <p className="results-empty__text">
                {raceSoon && season?.starts_at
                  ? `Информация появится сразу после старта гонки ${formatShortDateTime(season.starts_at)}`
                  : 'Подача заявок открыта до старта гонки'}
              </p>
              {raceSoon ? null : (
                <Button
                  size="m"
                  mode="primary"
                  className="results-empty__button"
                  onClick={() => window.open(APPLY_URL, '_blank', 'noopener')}
                >
                  Подать заявку
                </Button>
              )}
            </div>
          ) : (
            <div className="results-cards">
              {groups.map((group) => {
                const open = expandedId === group.id
                return (
                  <section
                    key={group.id ?? 'none'}
                    className={`results-card${open ? ' is-open' : ''}`}
                  >
                    <button
                      type="button"
                      className="results-card__head"
                      aria-expanded={open}
                      onClick={() => toggleDiscipline(group.id)}
                    >
                      <span className="results-card__title">{group.title}</span>
                      <Icon20ChevronRightOutline className="results-card__chevron" aria-hidden />
                    </button>
                    {open ? (
                      <>
                        <p className="results-card__count">
                          Всего участников: {formatCount(group.rows.length)}
                        </p>
                        <div className="results-table">
                          <div className="results-table__head">
                            <span>п/п</span>
                            <span>участник</span>
                            <span className="results-table__times">
                              <span>результат этапа</span>
                              <span>общее время</span>
                            </span>
                          </div>
                          {group.rows.map((row) => {
                            const name = splitName(row.participant.name)
                            const outcome = row.gap.outcome
                            const showMetrics = !outcome && (stage === 'all' || stageHasResults)
                            const seconds =
                              stage === 'all'
                                ? row.standing?.final_time_seconds
                                : (row.protocol?.elapsed_time_seconds ??
                                  row.protocol?.final_time_seconds)
                            return (
                              <div
                                key={row.participant.id}
                                className="results-row"
                                role="button"
                                tabIndex={0}
                                onClick={() =>
                                  void routeNavigator.push(`/participants/${row.participant.id}`)
                                }
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault()
                                    void routeNavigator.push(`/participants/${row.participant.id}`)
                                  }
                                }}
                              >
                                <span className="results-row__num">{positionOf(row) ?? '—'}</span>
                                <div className="results-row__main">
                                  <p className="results-row__name">
                                    <span>{name.first}</span>
                                    <span className="results-row__surname">
                                      {name.rest}
                                      {name.rest ? ' ' : null}
                                      <span className="results-row__bib">
                                        #{row.participant.number}
                                      </span>
                                    </span>
                                  </p>
                                  {row.participant.region ? (
                                    <p className="results-row__region">{row.participant.region}</p>
                                  ) : null}
                                  {showMetrics ? (
                                    <ul className="results-row__metrics">
                                      <li className="results-metric">
                                        <Icon20PawOutline width={16} height={16} aria-hidden />
                                        <span>
                                          старт: {row.gap.dogsAtStart ?? '—'} финиш:{' '}
                                          {row.gap.dogsAtFinish ?? '—'}
                                        </span>
                                      </li>
                                      <li className="results-metric">
                                        <Icon24SpeedometerMiddleOutline
                                          width={16}
                                          height={16}
                                          aria-hidden
                                        />
                                        <span>
                                          скорость:{' '}
                                          {speedLabel(
                                            stage === 'all' ? totalDistance : stageDistance,
                                            seconds,
                                          )}
                                        </span>
                                      </li>
                                      <li className="results-metric">
                                        <Icon20ErrorCircleOutline
                                          width={16}
                                          height={16}
                                          aria-hidden
                                        />
                                        <span>
                                          штр. вр.:{' '}
                                          {penaltyLabel(
                                            stage === 'all'
                                              ? (row.standing?.total_penalty_seconds ?? 0)
                                              : (row.protocol?.total_penalty_seconds ?? 0),
                                          )}
                                        </span>
                                      </li>
                                      <li className="results-metric">
                                        <Icon20PinOutline width={16} height={16} aria-hidden />
                                        <span>место: {positionOf(row) ?? '—'}</span>
                                      </li>
                                    </ul>
                                  ) : null}
                                </div>
                                <div className="results-row__times">
                                  {outcome ? (
                                    <>
                                      <span className="results-row__status">
                                        {outcome === 'dns' ? 'DNS' : 'DNF'}
                                      </span>
                                      <span className="results-row__status-stage">
                                        {dropStageNumber(row) !== null
                                          ? `этап ${dropStageNumber(row)}`
                                          : '—'}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="results-row__result">
                                        {stageTimeOf(row)}
                                      </span>
                                      <span className="results-row__total">{totalTimeOf(row)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    ) : null}
                  </section>
                )
              })}
            </div>
          )}
        </div>
      </AsyncView>
      {showToast && downloadState === 'success' ? (
        <aside className="results-toast" role="status">
          <span className="results-toast__icon results-toast__icon--success" aria-hidden>
            <Icon24CheckCircleFillGreen />
          </span>
          <div className="results-toast__content">
            <p className="results-toast__title">Файл скачан</p>
            <button type="button" className="results-toast__link" onClick={openProtocol}>
              открыть
            </button>
          </div>
          <button
            type="button"
            className="results-toast__close"
            aria-label="Закрыть"
            onClick={() => setClosedToast(toastKey)}
          >
            <Icon24Cancel aria-hidden />
          </button>
        </aside>
      ) : null}
      {showToast && downloadState === 'error' ? (
        <aside className="results-toast results-toast--error" role="alert">
          <span className="results-toast__icon results-toast__icon--error" aria-hidden>
            <Icon24ErrorCircleOutline />
          </span>
          <div className="results-toast__content">
            <p className="results-toast__title">Ошибка загрузки</p>
            <p className="results-toast__text">Проверьте подключение к сети и повторите попытку</p>
          </div>
          <button
            type="button"
            className="results-toast__close"
            aria-label="Закрыть"
            onClick={() => setClosedToast(toastKey)}
          >
            <Icon24Cancel aria-hidden />
          </button>
        </aside>
      ) : null}
      {!raceStarted &&
      countdownVisible &&
      !countdownClosed &&
      msToStart !== null &&
      msToStart > 0 ? (
        <aside className="results-toast results-toast--countdown" role="status">
          <span className="results-toast__icon" aria-hidden>
            <Icon24CalendarOutline />
          </span>
          <div className="results-toast__content">
            <p className="results-toast__title">До старта гонки осталось:</p>
            <p className="results-toast__text">{countdownLabel(msToStart)}</p>
          </div>
          <button
            type="button"
            className="results-toast__close"
            aria-label="Закрыть"
            onClick={() => setCountdownClosed(true)}
          >
            <Icon24Cancel aria-hidden />
          </button>
        </aside>
      ) : null}
    </Panel>
  )
}
