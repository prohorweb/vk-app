import { useParams, useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Panel, PanelHeader, PanelHeaderBack, Placeholder } from '@vkontakte/vkui'
import { useParticipantQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'

type ParticipantPanelProps = {
  id: string
}

export function ParticipantPanel({ id }: ParticipantPanelProps) {
  const routeNavigator = useRouteNavigator()
  const params = useParams<'participantId'>()
  const query = useParticipantQuery(params?.participantId)

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => void routeNavigator.back()} />}>
        {query.data?.name ?? 'Участник'}
      </PanelHeader>
      <AsyncView
        isLoading={query.isLoading}
        isError={query.isError}
        isEmpty={!query.isLoading && !query.isError && !query.data}
      >
        <Placeholder stretched>в работе</Placeholder>
      </AsyncView>
    </Panel>
  )
}
