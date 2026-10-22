import vkBridge from '@vkontakte/vk-bridge'
import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { api, unwrap } from '../api/client.ts'
import { useNewsQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { Picture } from '../components/Picture.tsx'
import { formatDateTime, newsSourceLabel } from '../lib/labels.ts'

type NewsPanelProps = {
  id: string
}

function parseWallPost(url: string): { owner_id: number; post_id: number } | null {
  const match = /wall(-?\d+)_(\d+)/.exec(url)
  if (!match) {
    return null
  }
  return { owner_id: Number(match[1]), post_id: Number(match[2]) }
}

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
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function NewsPanel({ id }: NewsPanelProps) {
  const goBack = useMoreSectionBack()
  const query = useNewsQuery()
  const items = query.data?.items ?? []

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>
        Новости
      </PanelHeader>
      <AsyncView
        isLoading={query.isLoading}
        isError={query.isError}
        isEmpty={!query.isLoading && !query.isError && items.length === 0}
        updatedAt={query.dataUpdatedAt}
      >
        {items.map((item) => (
          <article key={item.id} className="news-card">
            <Picture
              src={item.cover_url}
              alt={`Обложка новости «${item.title}»`}
              ratio="16 / 9"
            />
            <button
              type="button"
              className="news-card__body"
              onClick={() => {
                void openNewsPost(item.id).catch(() => undefined)
              }}
            >
              <h3>{item.title}</h3>
              <p>
                {formatDateTime(item.published_at)} · {newsSourceLabel(item.source)}
              </p>
            </button>
          </article>
        ))}
      </AsyncView>
    </Panel>
  )
}
