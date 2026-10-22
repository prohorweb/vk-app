import { useState } from 'react'
import vkBridge from '@vkontakte/vk-bridge'
import { useParams, useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import {
  Icon24LikeOutline,
  Icon24ShareOutline,
  Icon28ArticleOutline,
  Icon28ClockOutline,
  Icon28CupOutline,
  Icon28PlaceOutline,
  Icon28StatisticsOutline,
} from '@vkontakte/icons'
import {
  Button,
  HorizontalScroll,
  Panel,
  PanelHeader,
  PanelHeaderBack,
  SubnavigationBar,
  SubnavigationButton,
} from '@vkontakte/vkui'
import { trackerGap } from '../api/gaps.ts'
import {
  useFavoriteMutation,
  useParticipantQuery,
  useProtocolsQuery,
  usePublicStagesQuery,
  useStageProtocolQuery,
  useStandingsQuery,
  useSupportersQuery,
  useSupportersRatingQuery,
} from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { ParticipantCover } from '../components/ParticipantAvatar.tsx'
import { Picture } from '../components/Picture.tsx'
import {
  formatCount,
  formatDateTime,
  formatRaceClock,
  formatStageStart,
  participantStatusLabel,
} from '../lib/labels.ts'
import type { ParticipantStatus, StageProtocolRow, StandingRow } from '../types/index.ts'

type ParticipantPanelProps = {
  id: string
}

type StageSelection = 'all' | number

function parseParticipantId(value: string | undefined): number | undefined {
  if (!value) {
    return undefined
  }
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined
  }
  return parsed
}

function formatGap(leaderSeconds: number | null | undefined, seconds: number | null | undefined): string {
  if (leaderSeconds == null || seconds == null || seconds <= leaderSeconds) {
    return '—'
  }
  const diff = seconds - leaderSeconds
  const hours = Math.floor(diff / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const rest = diff % 60
  const clock = [minutes, rest].map((part) => String(part).padStart(2, '0')).join(':')
  return hours > 0 ? `+${String(hours).padStart(2, '0')}:${clock}` : `+${clock}`
}

function statusText(status: ParticipantStatus, outcome: 'dnf' | 'dns' | null): string {
  if (outcome === 'dnf') {
    return 'DNF'
  }
  if (outcome === 'dns') {
    return 'DNS'
  }
  if (status === 'active') {
    return 'На трассе'
  }
  return participantStatusLabel(status)
}

async function shareParticipant(name: string): Promise<void> {
  const link = window.location.href
  try {
    await vkBridge.send('VKWebAppShare', { link })
    return
  } catch {
    // Вне клиента VK делимся средствами браузера.
  }
  if (navigator.share) {
    await navigator.share({ title: name, url: link })
    return
  }
  await navigator.clipboard.writeText(link)
}

export function ParticipantPanel({ id }: ParticipantPanelProps) {
  const routeNavigator = useRouteNavigator()
  const params = useParams<'participantId'>()
  const participantId = parseParticipantId(params?.participantId)
  const [stage, setStage] = useState<StageSelection>('all')
  const query = useParticipantQuery(participantId)
  const supportersQuery = useSupportersQuery(participantId)
  const ratingQuery = useSupportersRatingQuery()
  const standingsQuery = useStandingsQuery()
  const stagesQuery = usePublicStagesQuery()
  const protocolsQuery = useProtocolsQuery()
  const protocolQuery = useStageProtocolQuery(stage === 'all' ? null : stage)
  const favorite = useFavoriteMutation(participantId ?? 0)
  const participant = query.data
  const publishedStageIds = new Set((protocolsQuery.data ?? []).map((item) => item.stage_id))
  const stages = (stagesQuery.data ?? []).filter((item) => publishedStageIds.has(item.id))
  const supportersCount = supportersQuery.data?.supporters_count ?? participant?.supporters_count ?? 0
  const isFavorite = supportersQuery.data?.is_favorite ?? false
  const delta = ratingQuery.data?.find((entry) => entry.participant_id === participantId)?.delta_24h ?? 0
  const gap = participant ? trackerGap(participant.id, participant.dogs_count ?? null) : null
  const standing = standingsQuery.data?.rows.find((row) => row.participant_id === participantId)
  const protocolRow = protocolQuery.data?.rows.find((row) => row.participant_id === participantId)
  const selectedStage = stages.find((item) => item.id === stage)

  return (
    <Panel id={id} className="participant-card">
      <PanelHeader before={<PanelHeaderBack onClick={() => void routeNavigator.back()} />}>
        Назад
      </PanelHeader>
      <AsyncView
        isLoading={query.isLoading}
        isError={query.isError}
        isEmpty={!query.isLoading && !query.isError && !participant}
        updatedAt={query.dataUpdatedAt}
      >
        {participant && gap ? (
          <>
            <ParticipantCover
              id={participant.id}
              name={participant.name}
              src={participant.photo_url}
            />
            <section className="dogs-block">
              <Picture
                className="dogs-block__photo"
                alt={`Собаки каюра ${participant.name}`}
                ratio="1 / 1"
                fallback="Собаки"
              />
              <p>
                Собаки на старте {gap.dogsAtStart ?? '—'} · на финише {gap.dogsAtFinish ?? '—'}
              </p>
            </section>
            <p className={`participant-card__status ${gap.outcome ? 'is-out' : 'is-racing'}`}>
              {statusText(participant.status, gap.outcome)}
            </p>
            <div className="participant-card__hero">
              <span className="bib-badge">#{participant.number}</span>
              <div>
                <div className="participant-card__hero-name">{participant.name}</div>
                {participant.region ? (
                  <div className="participant-card__hero-region">{participant.region}</div>
                ) : null}
              </div>
            </div>
            {participant.bio ? (
              <p className="participant-card__bio">
                <Icon28ArticleOutline />
                <span>{participant.bio}</span>
              </p>
            ) : null}
            <section className="participant-card__section">
              <h2>Дисциплина</h2>
              <p>{participant.discipline ?? '—'}</p>
            </section>
            <section className="participant-card__section">
              <div className="participant-card__stats-head">
                <h2>Статистика</h2>
                {gap.lastPointAt ? (
                  <span>обновлено {formatDateTime(gap.lastPointAt)}</span>
                ) : null}
              </div>
              <HorizontalScroll>
                <SubnavigationBar>
                  <SubnavigationButton
                    selected={stage === 'all'}
                    onClick={() => setStage('all')}
                  >
                    Все этапы
                  </SubnavigationButton>
                  {stages.map((item) => (
                    <SubnavigationButton
                      key={item.id}
                      selected={stage === item.id}
                      onClick={() => setStage(item.id)}
                    >
                      Этап {item.number}
                    </SubnavigationButton>
                  ))}
                </SubnavigationBar>
              </HorizontalScroll>
              <StatsBody
                mode={stage}
                outcome={gap.outcome}
                standing={standing}
                standings={standingsQuery.data?.rows ?? []}
                protocolRow={protocolRow}
                protocolRows={protocolQuery.data?.rows ?? []}
                protocolMissing={stage !== 'all' && !protocolQuery.isLoading && protocolQuery.data == null}
                protocolLoading={stage !== 'all' && protocolQuery.isLoading}
                stageStartsAt={selectedStage?.start_time ?? null}
                stagesFinished={standing?.stages_finished ?? 0}
                stageLabel={stage === 'all' ? null : (selectedStage?.number ?? null)}
              />
            </section>
            <p className="participant-card__fans">
              <Icon24LikeOutline />
              <span>{formatCount(supportersCount)} болельщиков</span>
              {delta > 0 ? <span className="participant-card__delta">+{delta}</span> : null}
            </p>
            <div className="participant-card__actions">
              <Button
                stretched
                size="l"
                mode="primary"
                loading={favorite.isPending}
                onClick={() => favorite.mutate(!isFavorite)}
              >
                {isFavorite ? 'Больше не болею' : 'Болею за'}
              </Button>
              <Button
                size="l"
                mode="outline"
                className="share-button"
                aria-label="Поделиться"
                onClick={() => {
                  void shareParticipant(participant.name).catch(() => undefined)
                }}
              >
                <Icon24ShareOutline />
              </Button>
            </div>
            {favorite.isError ? (
              <p className="participant-card__error">Не удалось обновить поддержку</p>
            ) : null}
          </>
        ) : null}
      </AsyncView>
    </Panel>
  )
}

function StatsBody({
  mode,
  outcome,
  standing,
  standings,
  protocolRow,
  protocolRows,
  protocolMissing,
  protocolLoading,
  stageStartsAt,
  stagesFinished,
  stageLabel,
}: {
  mode: StageSelection
  outcome: 'dnf' | 'dns' | null
  standing: StandingRow | undefined
  standings: StandingRow[]
  protocolRow: StageProtocolRow | undefined
  protocolRows: StageProtocolRow[]
  protocolMissing: boolean
  protocolLoading: boolean
  stageStartsAt: string | null
  stagesFinished: number
  stageLabel: number | null
}) {
  if (protocolLoading) {
    return <p className="participant-card__note">Загрузка статистики</p>
  }

  const dropped = outcome !== null
  const stageUnavailable = mode !== 'all' && (protocolMissing || (!protocolRow && !dropped))
  const overallUnavailable = mode === 'all' && !standing && !dropped
  if (stageUnavailable || overallUnavailable) {
    return (
      <div className="stats-empty">
        <Icon28StatisticsOutline />
        <p>Статистика скоро появится</p>
        {stageStartsAt ? (
          <p>
            Начало этапа
            <br />
            {formatStageStart(stageStartsAt)}
          </p>
        ) : null}
      </div>
    )
  }

  const source = mode === 'all' ? standing : protocolRow
  const peers = mode === 'all' ? standings : protocolRows
  const leader = peers.find((row) => row.position === 1) ?? peers[0]
  const leaderTime = leader?.final_time_seconds
  const position = dropped ? null : (source?.position ?? null)
  const result = dropped ? null : (source?.final_time_seconds ?? null)
  const penalty = source?.total_penalty_seconds ?? 0

  return (
    <>
      <div className="stat-grid">
        <article>
          <Icon28CupOutline />
          <span>позиция</span>
          <strong>{position ?? '—'}</strong>
        </article>
        <article>
          <Icon28ClockOutline />
          <span>результат</span>
          <strong>{formatRaceClock(result)}</strong>
        </article>
        <article>
          <Icon28PlaceOutline />
          <span>отрыв</span>
          <strong>{dropped ? '—' : formatGap(leaderTime, result)}</strong>
        </article>
      </div>
      <div className="distance-card">
        <h3>Дистанция</h3>
        <ul>
          <li>этап: {mode === 'all' ? stagesFinished : stageLabel}</li>
          <li>штраф: {penalty > 0 ? formatRaceClock(penalty) : '—'}</li>
          <li>скорость: —</li>
        </ul>
      </div>
    </>
  )
}
