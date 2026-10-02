import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Group, Header, Panel, PanelHeader, Placeholder } from '@vkontakte/vkui'
import { trackMockEnabled, useParticipantsQuery, useTrackPointsQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { ParticipantList } from '../components/ParticipantList.tsx'

type MapPanelProps = {
  id: string
}

export function MapPanel({ id }: MapPanelProps) {
  const routeNavigator = useRouteNavigator()
  const participantsQuery = useParticipantsQuery()
  const pointsQuery = useTrackPointsQuery()
  const participants = participantsQuery.data ?? []
  const isLoading = participantsQuery.isLoading || (trackMockEnabled && pointsQuery.isLoading)
  const isError = participantsQuery.isError || (trackMockEnabled && pointsQuery.isError)

  return (
    <Panel id={id}>
      <PanelHeader>Карта</PanelHeader>
      <div className="map-screen">
        <div className="map-stub">
          <Placeholder>в работе</Placeholder>
        </div>
        <div className="map-sheet">
          <span className="map-sheet__handle" />
          <Group header={<Header size="s">Участники</Header>}>
            <AsyncView
              isLoading={isLoading}
              isError={isError}
              isEmpty={!isLoading && !isError && participants.length === 0}
            >
              <ParticipantList
                participants={participants}
                points={trackMockEnabled ? pointsQuery.data : undefined}
                onOpen={(participantId) => void routeNavigator.push(`/map/${participantId}`)}
              />
            </AsyncView>
          </Group>
        </div>
      </div>
    </Panel>
  )
}
