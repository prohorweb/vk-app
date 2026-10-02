import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Group, Panel, PanelHeader } from '@vkontakte/vkui'
import { useParticipantsQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { ParticipantList } from '../components/ParticipantList.tsx'

type ParticipantsPanelProps = {
  id: string
}

export function ParticipantsPanel({ id }: ParticipantsPanelProps) {
  const routeNavigator = useRouteNavigator()
  const query = useParticipantsQuery()
  const participants = query.data ?? []

  return (
    <Panel id={id}>
      <PanelHeader>Участники</PanelHeader>
      <Group>
        <AsyncView
          isLoading={query.isLoading}
          isError={query.isError}
          isEmpty={!query.isLoading && !query.isError && participants.length === 0}
        >
          <ParticipantList
            participants={participants}
            onOpen={(participantId) => void routeNavigator.push(`/participants/${participantId}`)}
          />
        </AsyncView>
      </Group>
    </Panel>
  )
}
