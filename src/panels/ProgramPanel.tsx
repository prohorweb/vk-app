import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Group, Panel, PanelHeader, PanelHeaderBack, SimpleCell } from '@vkontakte/vkui'
import { useScheduleQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { formatDateTime, scheduleKindLabel } from '../lib/labels.ts'

type ProgramPanelProps = {
  id: string
}

export function ProgramPanel({ id }: ProgramPanelProps) {
  const routeNavigator = useRouteNavigator()
  const query = useScheduleQuery()
  const items = query.data?.items ?? []

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => void routeNavigator.back()} />}>
        Программа
      </PanelHeader>
      <Group>
        <AsyncView
          isLoading={query.isLoading}
          isError={query.isError}
          isEmpty={!query.isLoading && !query.isError && items.length === 0}
          updatedAt={query.dataUpdatedAt}
        >
          {items.map((event) => (
            <SimpleCell
              key={event.id}
              subtitle={formatDateTime(event.starts_at)}
              extraSubtitle={[scheduleKindLabel(event.kind), event.location]
                .filter((part) => part)
                .join(' · ')}
              multiline
            >
              {event.title}
            </SimpleCell>
          ))}
        </AsyncView>
      </Group>
    </Panel>
  )
}
