import { useEffect, useId, useRef, useState } from 'react'
import vkBridge from '@vkontakte/vk-bridge'
import { useParams, useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import {
  Icon16Chevron,
  Icon20ArticleOutline,
  Icon20ErrorCircleOutline,
  Icon20Like,
  Icon20LikeOutline,
  Icon20PawOutline,
  Icon20PinOutline,
  Icon24ErrorCircleOutline,
  Icon24ShareOutline,
  Icon28CupOutline,
  Icon28GraphOutline,
  Icon28HistoryBackwardOutline,
  Icon28WristWatchOutline,
} from '@vkontakte/icons'
import { Button, Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import { trackerGap } from '../api/gaps.ts'
import {
  isListedStage,
  useActiveSeasonQuery,
  useDisciplinesQuery,
  useFavoriteMutation,
  useParticipantQuery,
  usePublicStagesQuery,
  useStageProtocolQuery,
  useStandingsQuery,
  useSupportersQuery,
} from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { NoticeCard } from '../components/NoticeCard.tsx'
import { ParticipantCover } from '../components/ParticipantAvatar.tsx'
import {
  disciplineCardLabel,
  formatCount,
  formatFullDateTime,
  formatRaceClock,
  formatShortDateTime,
  formatStageStart,
  participantAccusative,
  participantFirstNameAccusative,
} from '../lib/labels.ts'
import type { StageProtocolRow, StandingRow } from '../types/index.ts'
import { guessGender } from '../lib/gender.ts'

type ParticipantPanelProps = {
  id: string
}

type StageSelection = 'all' | number

type StatusTone = 'success' | 'warning' | 'danger'

const kmFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

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

/** Имя и фамилия идут отдельными строками, как в макете. */
function splitName(name: string) {
  const [first = '', ...rest] = name.trim().split(/\s+/)
  return { first, rest: rest.join(' ') }
}

/** Пунктир из красных точек и синих треугольников, как в макете. */
function CardDivider() {
  const patternId = useId()

  return (
    <svg className="participant-divider" height="6" aria-hidden>
      <defs>
        <pattern id={patternId} width="75" height="6" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="3" r="2.5" fill="var(--avacha-brand-red)" />
          <path d="M21 0 26 6H16Z" fill="var(--avacha-brand-dark-blue)" />
          <circle cx="40" cy="3" r="2.5" fill="var(--avacha-brand-red)" />
          <path d="M51 0h10l-5 6Z" fill="var(--avacha-brand-dark-blue)" />
        </pattern>
      </defs>
      <rect width="100%" height="6" fill={`url(#${patternId})`} />
    </svg>
  )
}

function formatLeaderGap(
  leaderSeconds: number | null | undefined,
  seconds: number | null | undefined,
): string {
  if (leaderSeconds == null || seconds == null) {
    return '—'
  }
  const diff = seconds - leaderSeconds
  if (diff <= 0) {
    return '-'
  }
  return `+${formatRaceClock(diff)}`
}

function statusView(
  status: string,
  outcome: 'dnf' | 'dns' | null,
  raceStarted: boolean,
): { label: string; tone: StatusTone } {
  if (outcome === 'dnf') {
    return { label: 'DNF', tone: 'danger' }
  }
  if (outcome === 'dns') {
    return { label: 'DNS', tone: 'danger' }
  }
  if (status === 'active') {
    return { label: 'На трассе', tone: 'success' }
  }
  if (status === 'finished') {
    return { label: 'Финишировал', tone: 'success' }
  }
  if (status === 'withdrawn') {
    return { label: 'Снят', tone: 'danger' }
  }
  if (status === 'disqualified') {
    return { label: 'Дисквалифицирован', tone: 'danger' }
  }
  return {
    label: raceStarted ? 'Ожидание старта' : 'Ожидание начала гонки',
    tone: 'warning',
  }
}

/** Текст поста для репоста: место и результат, а до старта — стартовый номер. */
function buildShareMessage({
  name,
  number,
  seasonYear,
  standing,
}: {
  name: string
  number: number
  seasonYear: number | undefined
  standing: StandingRow | undefined
}): string {
  const race = seasonYear ? `«Авача–${seasonYear}»` : '«Авача»'
  const participantWord = guessGender(name) === 'female' ? 'участницы' : 'участника'
  const isFinished = standing?.position != null && standing.final_time_seconds != null
  const summary = isFinished
    ? `Место - ${standing.position}, результат - ${formatRaceClock(standing.final_time_seconds)}`
    : `Стартовый номер - #${number}`

  return [
    `❤️ Болею за ${participantAccusative(name)} - ${participantWord} гонки ${race}!`,
    '',
    summary,
    '',
    'Пусть каждый километр приближает к победе 🏅, а поддержка болельщиков придаёт сил 💪',
    '',
    'Присоединяйся и поддержи своего фаворита!',
    '',
    '----',
    '',
    'Подписывайтесь на наши новости:',
    'ВК — vk.ru/avacha.race',
  ].join('\n')
}

async function shareParticipant(message: string, link: string): Promise<void> {
  try {
    await vkBridge.send('VKWebAppShowWallPostBox', { message })
    return
  } catch {
    // Вне клиента VK или без прав на стену — делимся ссылкой.
  }
  try {
    await vkBridge.send('VKWebAppShare', { link })
    return
  } catch {
    // Дальше — средствами браузера.
  }
  if (navigator.share) {
    await navigator.share({ title: 'Авача', text: message, url: link })
    return
  }
  await navigator.clipboard.writeText(`${message}\n\n${link}`)
}

export function ParticipantPanel({ id }: ParticipantPanelProps) {
  const routeNavigator = useRouteNavigator()
  const params = useParams<'participantId'>()
  const participantId = parseParticipantId(params?.participantId)
  const [selectedStage, setSelectedStage] = useState<StageSelection | null>(null)
  const [staleDismissedAt, setStaleDismissedAt] = useState<number | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [mountedAt] = useState(() => Date.now())
  const [bioOverflow, setBioOverflow] = useState(false)
  const bioRef = useRef<HTMLParagraphElement>(null)

  const query = useParticipantQuery(participantId)
  const supportersQuery = useSupportersQuery(participantId)
  const standingsQuery = useStandingsQuery()
  const stagesQuery = usePublicStagesQuery()
  const disciplinesQuery = useDisciplinesQuery()
  const seasonQuery = useActiveSeasonQuery()

  const participant = query.data
  const stages = (stagesQuery.data ?? []).filter(isListedStage)
  const activeStageId = stages.find((item) => item.status === 'active')?.id
  const stage: StageSelection = selectedStage ?? activeStageId ?? 'all'
  const protocolQuery = useStageProtocolQuery(stage === 'all' ? null : stage)
  const favorite = useFavoriteMutation(participantId ?? 0)

  // Лайк считаем локально: счётчик меняется ровно на единицу от показанного значения.
  const [like, setLike] = useState<{
    id: number | undefined
    count: number
    favorite: boolean
  } | null>(null)
  const local = like && like.id === participantId ? like : null
  const isFavorite = local?.favorite ?? supportersQuery.data?.is_favorite ?? false
  const supportersCount =
    local?.count ?? supportersQuery.data?.supporters_count ?? participant?.supporters_count ?? 0
  const gap = participant ? trackerGap(participant.id, participant.dogs_count ?? null) : null
  const standing = standingsQuery.data?.rows.find((row) => row.participant_id === participantId)
  const protocolRow = protocolQuery.data?.rows.find((row) => row.participant_id === participantId)
  const stageInfo = typeof stage === 'number' ? stages.find((item) => item.id === stage) : undefined
  const discipline = disciplinesQuery.data?.find((item) => item.id === participant?.discipline_id)

  const seasonStartsAt = seasonQuery.data?.starts_at
  const raceStarted = seasonStartsAt
    ? new Date(seasonStartsAt).getTime() <= mountedAt
    : stages.some((item) => item.status !== 'planned')

  const stale =
    Boolean(participant) &&
    (query.isError || standingsQuery.isError || stagesQuery.isError || protocolQuery.isError)
  const lastUpdatedAt = Math.max(
    query.dataUpdatedAt,
    standingsQuery.dataUpdatedAt,
    stagesQuery.dataUpdatedAt,
    protocolQuery.dataUpdatedAt,
  )

  const bio = participant?.bio

  useEffect(() => {
    const element = bioRef.current
    if (!element || expanded) {
      return
    }
    const check = () => setBioOverflow(element.scrollHeight > element.clientHeight + 1)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(element)
    // Шрифт Onest подгружается асинхронно: до него текст меряется по fallback и «Показать ещё» пропадает.
    let cancelled = false
    void document.fonts.ready.then(() => {
      if (!cancelled) {
        check()
      }
    })
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [bio, expanded])

  const shareMessage = participant
    ? buildShareMessage({
        name: participant.name,
        number: participant.number,
        seasonYear: seasonQuery.data?.year,
        standing,
      })
    : ''

  const share = () => {
    void shareParticipant(shareMessage, window.location.href).catch(() => undefined)
  }

  const source: StandingRow | StageProtocolRow | undefined =
    stage === 'all' ? standing : protocolRow
  const peers: (StandingRow | StageProtocolRow)[] =
    stage === 'all' ? (standingsQuery.data?.rows ?? []) : (protocolQuery.data?.rows ?? [])
  const leader = peers.find((row) => row.position === 1) ?? peers[0]
  const position = source?.position ?? null
  const result = source?.final_time_seconds ?? null
  const penalty = source?.total_penalty_seconds ?? 0
  const statsLoading = stage !== 'all' && protocolQuery.isLoading
  const statsReady = Boolean(source) && !statsLoading

  const totalStages = stages.length
  const finishedStages = standing?.stages_finished ?? 0
  const stageDistance = stageInfo?.distance_km ?? null
  const totalDistance = stages.reduce((sum, item) => sum + item.distance_km, 0)
  const coveredDistance =
    stage === 'all'
      ? finishedStages > 0
        ? stages
            .slice(0, Math.min(finishedStages, totalStages))
            .reduce((sum, item) => sum + item.distance_km, 0)
        : null
      : result != null
        ? stageDistance
        : null
  const distanceLimit = stage === 'all' ? totalDistance : stageDistance
  const speed =
    result != null && coveredDistance != null && result > 0
      ? coveredDistance / (result / 3600)
      : null
  const progress =
    coveredDistance != null && distanceLimit
      ? Math.min(100, Math.max(0, (coveredDistance / distanceLimit) * 100))
      : 0

  const stageNumber = stage === 'all' ? finishedStages : (stageInfo?.number ?? null)

  const emptyHint =
    stage === 'all'
      ? seasonStartsAt && !raceStarted
        ? `Информация появится сразу после старта гонки ${formatStageStart(seasonStartsAt)}`
        : 'Информация появится позже'
      : stageInfo?.status === 'planned' && stageInfo.start_time
        ? `Информация появится сразу после старта этапа ${formatStageStart(stageInfo.start_time)}`
        : 'Информация появится позже'

  const showToggle = expanded || bioOverflow
  const showStale = stale && staleDismissedAt !== lastUpdatedAt
  const status = participant
    ? statusView(participant.status, gap?.outcome ?? null, raceStarted)
    : null
  const name = participant ? splitName(participant.name) : null
  const favoriteName = participant ? participantFirstNameAccusative(participant.name) : ''

  return (
    <Panel id={id} className="participant-screen">
      <PanelHeader
        delimiter="none"
        before={
          <PanelHeaderBack
            hideLabelOnIOS
            hideLabelOnVKCom
            onClick={() => void routeNavigator.back()}
          />
        }
      >
        Назад
      </PanelHeader>
      <AsyncView
        isLoading={query.isLoading}
        isError={query.isError && !participant}
        isEmpty={!query.isLoading && !query.isError && !participant}
        updatedAt={query.dataUpdatedAt}
      >
        {participant && gap && status && name ? (
          <div className="participant-body">
            <ParticipantCover
              id={participant.id}
              name={participant.name}
              src={participant.photo_url}
            />
            <p className={`participant-card__status is-${status.tone}`}>{status.label}</p>
            <div className="participant-card__hero">
              <span className="participant-card__bib">#{participant.number}</span>
              <span className="participant-card__hero-name">
                <span className="participant-card__hero-first">{name.first}</span>
                {name.rest ? (
                  <span className="participant-card__hero-rest">{name.rest}</span>
                ) : null}
              </span>
            </div>
            <div className="participant-meta">
              {participant.region ? (
                <div className="participant-meta__row">
                  <Icon20PinOutline aria-hidden />
                  <span>{participant.region}</span>
                </div>
              ) : null}
              {participant.bio ? (
                <div className="participant-meta__row participant-meta__row--bio">
                  <Icon20ArticleOutline aria-hidden />
                  <p
                    ref={bioRef}
                    className={`participant-bio__text${expanded ? '' : ' is-collapsed'}`}
                  >
                    {participant.bio}
                  </p>
                </div>
              ) : null}
              {participant.bio && showToggle ? (
                <div className="participant-meta__toggle">
                  <button
                    type="button"
                    className="participant-bio__toggle"
                    aria-expanded={expanded}
                    onClick={() => setExpanded((value) => !value)}
                  >
                    {expanded ? 'Скрыть' : 'Показать ещё'}
                    <Icon16Chevron aria-hidden />
                  </button>
                </div>
              ) : null}
            </div>
            <CardDivider />
            <section className="participant-section">
              <h2 className="participant-section__title">Дисциплина</h2>
              <p className="participant-section__text">
                {disciplineCardLabel(discipline, participant.discipline)}
              </p>
            </section>
            <CardDivider />
            <section className="participant-section">
              <div className="participant-stats__head">
                <h2 className="participant-section__title">Статистика</h2>
                {gap.lastPointAt ? (
                  <span className="participant-stats__updated">
                    обновлено {formatShortDateTime(gap.lastPointAt)}
                  </span>
                ) : null}
              </div>
              <div className="participant-stages" role="tablist" aria-label="Этапы">
                <button
                  type="button"
                  role="tab"
                  aria-selected={stage === 'all'}
                  className={`participant-stage${stage === 'all' ? ' is-selected' : ''}`}
                  onClick={() => setSelectedStage('all')}
                >
                  Все этапы
                </button>
                {stages.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={stage === item.id}
                    className={`participant-stage${stage === item.id ? ' is-selected' : ''}`}
                    onClick={() => setSelectedStage(item.id)}
                  >
                    {item.number}
                  </button>
                ))}
              </div>
              {statsLoading ? (
                <p className="participant-stats__note">Загрузка статистики</p>
              ) : statsReady ? (
                <>
                  <div className="participant-tiles">
                    <article className="participant-tile">
                      <span className="participant-tile__indicator">
                        <Icon28WristWatchOutline aria-hidden />
                        <span className="participant-tile__label">результат</span>
                      </span>
                      <span className="participant-tile__value">{formatRaceClock(result)}</span>
                    </article>
                    <article className="participant-tile">
                      <span className="participant-tile__indicator">
                        <Icon28HistoryBackwardOutline aria-hidden />
                        <span className="participant-tile__label">отрыв от лидера</span>
                      </span>
                      <span className="participant-tile__value">
                        {formatLeaderGap(leader?.final_time_seconds ?? null, result)}
                      </span>
                    </article>
                    <article className="participant-tile">
                      <span className="participant-tile__indicator">
                        <Icon28CupOutline aria-hidden />
                        <span className="participant-tile__label">позиция</span>
                      </span>
                      <span className="participant-tile__value">
                        {position != null ? `№ ${position}` : '—'}
                      </span>
                    </article>
                  </div>
                  <div className="participant-distance">
                    <h3>Дистанция</h3>
                    <div className="participant-distance__rows">
                      <span className="participant-distance__row">
                        <span>этап:</span>
                        <span className="participant-distance__value">
                          {stageNumber ?? '—'} из {totalStages}
                        </span>
                      </span>
                      <span className="participant-distance__row">
                        <span>скорость:</span>
                        <span className="participant-distance__value">
                          {speed != null ? `${kmFormatter.format(speed)} км/ч` : '—'}
                        </span>
                      </span>
                    </div>
                    <p className="participant-distance__km">
                      <span className="participant-distance__covered">
                        {coveredDistance != null
                          ? `${kmFormatter.format(coveredDistance)} км`
                          : '—'}
                      </span>{' '}
                      / {distanceLimit != null ? `${kmFormatter.format(distanceLimit)} км` : '—'}
                    </p>
                    <div
                      className="participant-distance__bar"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progress)}
                    >
                      <span
                        className="participant-distance__fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="participant-cards">
                    <div className="participant-mini">
                      <div className="participant-mini__head">
                        <Icon20PawOutline aria-hidden />
                        <span>Собаки</span>
                      </div>
                      <p className="participant-mini__row">
                        старт:{' '}
                        <span className="participant-mini__value">{gap.dogsAtStart ?? '—'}</span>
                      </p>
                      <p className="participant-mini__row">
                        финиш:{' '}
                        <span className="participant-mini__value">{gap.dogsAtFinish ?? '—'}</span>
                      </p>
                    </div>
                    <div className="participant-mini">
                      <div className="participant-mini__head">
                        <Icon20ErrorCircleOutline aria-hidden />
                        <span>Штр. вр.</span>
                      </div>
                      <p className="participant-mini__value participant-mini__penalty">
                        {penalty > 0 ? formatRaceClock(penalty) : '-'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="participant-empty">
                  <Icon28GraphOutline aria-hidden />
                  <p className="participant-empty__title">Статистика скоро появится!</p>
                  <p className="participant-empty__text">{emptyHint}</p>
                </div>
              )}
            </section>
            <div className={`participant-fans${isFavorite ? ' is-liked' : ''}`}>
              {isFavorite ? <Icon20Like aria-hidden /> : <Icon20LikeOutline aria-hidden />}
              <span className="participant-fans__count">{formatCount(supportersCount)}</span>
            </div>
            <div className="participant-actions">
              <Button
                stretched
                size="l"
                mode="primary"
                onClick={() => {
                  const nextFavorite = !isFavorite
                  setLike({
                    id: participantId,
                    count: Math.max(0, supportersCount + (nextFavorite ? 1 : -1)),
                    favorite: nextFavorite,
                  })
                  favorite.mutate(nextFavorite)
                }}
              >
                {isFavorite ? 'Больше не болею' : `Болею за ${favoriteName}`}
              </Button>
              <Button
                size="l"
                mode="primary"
                className="participant-actions__share"
                aria-label="Поделиться"
                onClick={share}
              >
                <Icon24ShareOutline />
              </Button>
            </div>
          </div>
        ) : null}
      </AsyncView>
      {showStale ? (
        <NoticeCard
          icon={<Icon24ErrorCircleOutline />}
          title="Данные не были обновлены"
          text={
            lastUpdatedAt > 0
              ? `Последнее обновление ${formatFullDateTime(lastUpdatedAt)}`
              : 'Проверьте подключение и попробуйте позже'
          }
          onClose={() => setStaleDismissedAt(lastUpdatedAt)}
        />
      ) : null}
    </Panel>
  )
}
