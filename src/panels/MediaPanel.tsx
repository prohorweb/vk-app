import { useState } from 'react'
import vkBridge from '@vkontakte/vk-bridge'
import { Icon24ChevronRight, Icon24Notification, Icon24Play } from '@vkontakte/icons'
import { Panel, PanelHeader } from '@vkontakte/vkui'
import { api, unwrap } from '../api/client.ts'
import {
  mediaDays,
  mediaGalleries,
  mediaNewsFallback,
  mediaVideos,
  newsCoverFallback,
  type MediaGallery,
  type MediaVideo,
} from '../api/mocks/media.ts'
import { useNewsQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { Picture } from '../components/Picture.tsx'
import { useDragScroll } from '../hooks/useDragScroll.ts'
import { formatCompactCount, formatPhotoCount, formatRelativeTime } from '../lib/labels.ts'
import type { NewsPostListItem } from '../types/index.ts'

type MediaTab = 'news' | 'photo' | 'video'

type MediaPanelProps = {
  id: string
}

/**
 * Сообщество гонки. Пока у галерей и видео нет эндпоинтов,
 * карточки ведут в сообщество, а не в несуществующий экран.
 */
const COMMUNITY_URL = 'https://vk.ru/avacha.race'

const MEDIA_TABS: { id: MediaTab; label: string }[] = [
  { id: 'news', label: 'Новости' },
  { id: 'photo', label: 'Фото' },
  { id: 'video', label: 'Видео' },
]

function parseWallPost(url: string): { owner_id: number; post_id: number } | null {
  const match = /wall(-?\d+)_(\d+)/.exec(url)
  if (!match) {
    return null
  }
  return { owner_id: Number(match[1]), post_id: Number(match[2]) }
}

function openInBrowser(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}

/** Новость ведёт в запись сообщества: сначала средствами клиента VK, затем браузером. */
async function openNewsPost(id: number): Promise<void> {
  const post = unwrap(
    await api.GET('/api/v1/content/news/{news_id}', {
      params: { path: { news_id: id } },
    }),
  )
  const url = post.vk_url
  if (!url) {
    return
  }
  const wall = parseWallPost(url)
  if (wall) {
    try {
      await vkBridge.send('VKWebAppOpenWallPost', wall)
      return
    } catch {
      // Вне клиента VK открываем ссылку в браузере.
    }
  }
  openInBrowser(url)
}

function videoCaption(video: MediaVideo): string {
  if (video.state === 'live') {
    return `${formatCompactCount(video.viewers ?? 0)} смотрят`
  }
  if (video.state === 'soon') {
    return video.startsIn ? `Начнётся ${video.startsIn}` : 'Скоро'
  }
  return video.publishedAt ? formatRelativeTime(video.publishedAt) : 'Запись'
}

function NewsCard({ item }: { item: NewsPostListItem }) {
  return (
    <article className="media-news-card">
      <Picture
        className="media-news-card__cover"
        src={item.cover_url ?? newsCoverFallback(item.id)}
        alt={`Обложка новости «${item.title}»`}
        ratio="16 / 9"
      />
      <div className="media-card__row">
        <span className="media-card__text">
          <span className="media-card__title">{item.title}</span>
          {item.lead ? <span className="media-card__lead">{item.lead}</span> : null}
          <span className="media-card__meta">{formatRelativeTime(item.published_at)}</span>
        </span>
        <Icon24ChevronRight className="media-card__chevron" aria-hidden />
      </div>
      <button
        type="button"
        className="media-card__hit"
        aria-label={`Открыть новость «${item.title}»`}
        onClick={() => {
          if (item.id < 0) {
            openInBrowser(COMMUNITY_URL)
            return
          }
          void openNewsPost(item.id).catch(() => undefined)
        }}
      />
    </article>
  )
}

function NewsTab() {
  const query = useNewsQuery()
  const apiItems = query.data?.items ?? []
  // Новости из API, а при недоступном API — моки.
  const items = query.isError ? mediaNewsFallback : apiItems

  return (
    <AsyncView
      isLoading={query.isLoading}
      isError={query.isError && items.length === 0}
      isEmpty={!query.isLoading && !query.isError && items.length === 0}
      updatedAt={query.dataUpdatedAt}
    >
      <div className="media-list">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </AsyncView>
  )
}

function GalleryCard({ gallery }: { gallery: MediaGallery }) {
  return (
    <article className="media-gallery-card">
      <Picture src={gallery.cover} alt={`Обложка галереи «${gallery.title}»`} ratio="16 / 10" />
      <div className="media-gallery-card__overlay">
        <span className="media-card__text">
          <span className="media-card__title">{gallery.title}</span>
          <span className="media-card__meta">{formatPhotoCount(gallery.photoCount)}</span>
        </span>
        <Icon24ChevronRight className="media-card__chevron" aria-hidden />
      </div>
      <button
        type="button"
        className="media-card__hit"
        aria-label={`Открыть галерею «${gallery.title}»`}
        onClick={() => openInBrowser(COMMUNITY_URL)}
      />
    </article>
  )
}

function PhotoTab() {
  const [dayId, setDayId] = useState(mediaDays[0].id)
  const daysDragProps = useDragScroll<HTMLDivElement>()
  const galleries = mediaGalleries.filter((gallery) => gallery.dayId === dayId)

  return (
    <div className="media-photo">
      <div className="media-days" role="tablist" aria-label="Дни гонки" {...daysDragProps}>
        {mediaDays.map((day) => (
          <button
            key={day.id}
            type="button"
            role="tab"
            aria-selected={day.id === dayId}
            className={[
              'media-days__chip',
              day.id === dayId ? 'media-days__chip--active' : '',
            ].join(' ')}
            onClick={() => setDayId(day.id)}
          >
            {day.label}
          </button>
        ))}
      </div>
      {galleries.length === 0 ? (
        <p className="media-empty">Фотографий за этот день пока нет</p>
      ) : (
        <div className="media-list">
          {galleries.map((gallery) => (
            <GalleryCard key={gallery.id} gallery={gallery} />
          ))}
        </div>
      )}
    </div>
  )
}

function VideoCard({
  video,
  reminded,
  onRemind,
}: {
  video: MediaVideo
  reminded: boolean
  onRemind: () => void
}) {
  return (
    <article className="media-video-card">
      <div className="media-video-card__cover">
        <Picture src={video.cover} alt={`Обложка видео «${video.title}»`} ratio="16 / 9" />
        <span className="media-video-card__play" aria-hidden>
          <Icon24Play />
        </span>
        {video.state === 'live' ? (
          <span className="media-video-card__badge media-video-card__badge--live">В эфире</span>
        ) : null}
        {video.state === 'soon' ? <span className="media-video-card__badge">Анонс</span> : null}
        {video.state === 'recorded' && video.duration ? (
          <span className="media-video-card__duration">{video.duration}</span>
        ) : null}
      </div>
      <div className="media-card__row">
        <span className="media-card__text">
          <span className="media-card__title">{video.title}</span>
          <span className="media-card__meta">{videoCaption(video)}</span>
        </span>
        <Icon24ChevronRight className="media-card__chevron" aria-hidden />
      </div>
      {video.state === 'soon' ? (
        <div className="media-video-card__actions">
          <button type="button" className="media-remind" aria-pressed={reminded} onClick={onRemind}>
            <Icon24Notification aria-hidden />
            {reminded ? 'Напомним' : 'Напомнить'}
          </button>
        </div>
      ) : null}
      <button
        type="button"
        className="media-card__hit"
        aria-label={`Открыть видео «${video.title}»`}
        onClick={() => openInBrowser(COMMUNITY_URL)}
      />
    </article>
  )
}

function VideoTab() {
  const [reminded, setReminded] = useState<Record<string, boolean>>({})

  const remind = (videoId: string) => {
    setReminded((current) => ({ ...current, [videoId]: true }))
    // Напоминания о старте этапа приходят push-уведомлениями приложения.
    void vkBridge.send('VKWebAppAllowNotifications').catch(() => undefined)
  }

  return (
    <div className="media-list">
      {mediaVideos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          reminded={Boolean(reminded[video.id])}
          onRemind={() => remind(video.id)}
        />
      ))}
    </div>
  )
}

export function MediaPanel({ id }: MediaPanelProps) {
  const [tab, setTab] = useState<MediaTab>('news')

  return (
    <Panel id={id} className="media-screen">
      <PanelHeader>Новости</PanelHeader>
      <div className="media-hero">
        <p className="media-lead">
          Следите за событиями, участниками и жизнью гонки «Авача — 2027»
        </p>
      </div>
      <div className="media-stripes" aria-hidden />
      <div className="media-tabs" role="tablist" aria-label="Разделы новостей">
        {MEDIA_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={['media-tabs__item', tab === item.id ? 'media-tabs__item--active' : ''].join(
              ' ',
            )}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === 'news' ? <NewsTab /> : null}
      {tab === 'photo' ? <PhotoTab /> : null}
      {tab === 'video' ? <VideoTab /> : null}
    </Panel>
  )
}
