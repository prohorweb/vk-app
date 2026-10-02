import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Group, Panel, PanelHeader, PanelHeaderBack, SimpleCell } from '@vkontakte/vkui'
import { useNewsQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { formatDateTime, newsSourceLabel } from '../lib/labels.ts'

type NewsPanelProps = {
  id: string
}

export function NewsPanel({ id }: NewsPanelProps) {
  const routeNavigator = useRouteNavigator()
  const query = useNewsQuery()
  const items = query.data?.items ?? []

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => void routeNavigator.back()} />}>
        Новости
      </PanelHeader>
      <Group>
        <AsyncView
          isLoading={query.isLoading}
          isError={query.isError}
          isEmpty={!query.isLoading && !query.isError && items.length === 0}
          updatedAt={query.dataUpdatedAt}
        >
          {items.map((item) => (
            <SimpleCell
              key={item.id}
              subtitle={item.lead ?? formatDateTime(item.published_at)}
              extraSubtitle={
                item.lead
                  ? [formatDateTime(item.published_at), newsSourceLabel(item.source)]
                      .filter(Boolean)
                      .join(' · ')
                  : newsSourceLabel(item.source)
              }
              badgeAfterTitle={item.is_important ? 'важно' : undefined}
              multiline
            >
              {item.title}
            </SimpleCell>
          ))}
        </AsyncView>
      </Group>
    </Panel>
  )
}
