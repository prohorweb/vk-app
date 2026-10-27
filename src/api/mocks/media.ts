import { publicImage } from '../../lib/publicImage.ts'
import type { NewsPostListItem } from '../../types/index.ts'

export type MediaDay = {
  id: string
  label: string
}

export type MediaGallery = {
  id: string
  dayId: string
  title: string
  photoCount: number
  cover: string
}

export type MediaVideoState = 'soon' | 'live' | 'recorded'

export type MediaVideo = {
  id: string
  title: string
  state: MediaVideoState
  cover: string
  /** Для `soon`: когда начнётся трансляция. */
  startsIn?: string
  /** Для `live`: сколько человек смотрят. */
  viewers?: number
  /** Для `recorded`: длительность записи. */
  duration?: string
  /** Для `recorded`: когда опубликовано. */
  publishedAt?: string
}

/** Дни гонки «Авача» — 3–15 февраля. */
export const mediaDays: MediaDay[] = [
  { id: 'media-03', label: '03 ср' },
  { id: 'media-04', label: '04 чт' },
  { id: 'media-05', label: '05 пт' },
  { id: 'media-06', label: '06 сб' },
  { id: 'media-07', label: '07 вс' },
  { id: 'media-08', label: '08 пн' },
  { id: 'media-09', label: '09 вт' },
  { id: 'media-10', label: '10 ср' },
  { id: 'media-11', label: '11 чт' },
  { id: 'media-12', label: '12 пт' },
  { id: 'media-13', label: '13 сб' },
  { id: 'media-14', label: '14 вс' },
  { id: 'media-15', label: '15 пн' },
]

const gallerySources: { title: string; photoCount: number; file: string }[] = [
  { title: 'Открытие и жеребьёвка', photoCount: 68, file: 'about/photo-1.jpg' },
  { title: 'Старт первого этапа', photoCount: 42, file: 'about/photo-2.jpg' },
  { title: 'Гонка на перевалах', photoCount: 51, file: 'about/photo-3.jpg' },
  { title: 'Контрольный пункт «Налычево»', photoCount: 33, file: 'about/photo-4.jpg' },
  { title: 'Ночной этап', photoCount: 27, file: 'about/photo-5.jpg' },
  { title: 'Финиш этапа', photoCount: 39, file: 'about/photo-6.jpg' },
  { title: 'Награждение', photoCount: 22, file: 'about/photo-7.jpg' },
  { title: 'Отдых на базе', photoCount: 18, file: 'about/photo-8.jpg' },
]

/** Две галереи на каждый день гонки; подписи и обложки идут по кругу. */
export const mediaGalleries: MediaGallery[] = mediaDays.flatMap((day, dayIndex) =>
  [0, 1].map((offset) => {
    const source = gallerySources[(dayIndex + offset) % gallerySources.length]
    return {
      id: `${day.id}-${offset + 1}`,
      dayId: day.id,
      title: source.title,
      photoCount: source.photoCount,
      cover: publicImage(source.file),
    }
  }),
)

/** Видеотрансляции: анонс, эфир и запись. Эндпоинта в API нет — данные моковые. */
export const mediaVideos: MediaVideo[] = [
  {
    id: 'video-live',
    title: 'Прямой эфир: старт третьего этапа',
    state: 'live',
    cover: publicImage('about/photo-2.jpg'),
    viewers: 1240,
  },
  {
    id: 'video-soon',
    title: 'Прямой эфир: финиш третьего этапа',
    state: 'soon',
    cover: publicImage('about/photo-4.jpg'),
    startsIn: 'сегодня в 21:40, через 1 ч 20 мин',
  },
  {
    id: 'video-record-1',
    title: 'Подготовка к гонке — все закулисье',
    state: 'recorded',
    cover: publicImage('about/photo-6.jpg'),
    duration: '3:12:40',
    publishedAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 'video-record-2',
    title: '«Авача» — 2026: как это было',
    state: 'recorded',
    cover: publicImage('about/photo-8.jpg'),
    duration: '12:15',
    publishedAt: '2026-02-06T09:00:00.000Z',
  },
]

/**
 * Лента новостей из сообщества. Используется только как fallback,
 * когда API новостей недоступен.
 */
export const mediaNewsFallback: NewsPostListItem[] = [
  {
    id: -1,
    title: 'Документы для перелёта с собаками',
    lead: 'Анна Еремина — каюр, ветеринар и совладелица питомника ездовых собак «Северный».',
    cover_url: null,
    source: 'manual',
    published_at: '2026-04-20T09:00:00.000Z',
    is_important: true,
    is_pinned: false,
  },
  {
    id: -2,
    title: 'Приём заявок на гонку',
    lead: 'Заявки принимаются до 15 января 2027 года.',
    cover_url: publicImage('about/photo-1.jpg'),
    source: 'vk',
    published_at: '2026-06-02T09:00:00.000Z',
    is_important: false,
    is_pinned: false,
  },
  {
    id: -3,
    title: 'Как готовят трассу у подножия вулканов',
    lead: 'Рассказываем, кто и как размечает 300 км маршрута через перевалы и парк «Налычево».',
    cover_url: publicImage('about/photo-7.jpg'),
    source: 'manual',
    published_at: '2026-07-18T09:00:00.000Z',
    is_important: false,
    is_pinned: true,
  },
  {
    id: -4,
    title: 'Ветеринарный контроль на этапах',
    lead: 'На каждом контрольном пункте упряжки осматривают ветеринары — это обязательное условие гонки.',
    cover_url: null,
    source: 'manual',
    published_at: '2026-09-05T09:00:00.000Z',
    is_important: false,
    is_pinned: false,
  },
]
