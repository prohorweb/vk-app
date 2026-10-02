import { useParams, useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import {
  Avatar,
  Button,
  Div,
  Group,
  Panel,
  PanelHeader,
  PanelHeaderBack,
  SimpleCell,
  Text,
} from '@vkontakte/vkui'
import { hasLaunchParams } from '../api/auth.ts'
import { useFavoriteMutation, useParticipantQuery, useSupportersQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { participantStatusLabel } from '../lib/labels.ts'

type ParticipantPanelProps = {
  id: string
}

function parseParticipantId(value: string | undefined): number | undefined {
  if (!value) {
    return undefined
  }
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    return undefined
  }
  return id
}

export function ParticipantPanel({ id }: ParticipantPanelProps) {
  const routeNavigator = useRouteNavigator()
  const params = useParams<'participantId'>()
  const participantId = parseParticipantId(params?.participantId)
  const query = useParticipantQuery(participantId)
  const supportersQuery = useSupportersQuery(participantId)
  const favorite = useFavoriteMutation(participantId ?? 0)
  const participant = query.data
  const supportersCount =
    supportersQuery.data?.supporters_count ?? participant?.supporters_count ?? 0
  const isFavorite = supportersQuery.data?.is_favorite ?? false
  const subtitle = participant
    ? [`№ ${participant.number}`, participant.region, participant.discipline]
        .filter((part) => part)
        .join(' · ')
    : undefined

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => void routeNavigator.back()} />}>
        {participant?.name ?? 'Участник'}
      </PanelHeader>
      <AsyncView
        isLoading={query.isLoading}
        isError={query.isError}
        isEmpty={!query.isLoading && !query.isError && !participant}
        updatedAt={query.dataUpdatedAt}
      >
        {participant ? (
          <Group>
            <SimpleCell
              before={
                <Avatar
                  src={participant.photo_url ?? undefined}
                  size={72}
                  initials={participant.name.slice(0, 1)}
                />
              }
              subtitle={subtitle}
              extraSubtitle={participantStatusLabel(participant.status)}
              multiline
            >
              {participant.name}
            </SimpleCell>
            {participant.dogs_count != null ? (
              <SimpleCell indicator={participant.dogs_count}>Собаки</SimpleCell>
            ) : null}
            {participant.bio ? (
              <Div>
                <Text>{participant.bio}</Text>
              </Div>
            ) : null}
            <Div className="participant-actions">
              <Text>Болельщики: {supportersCount}</Text>
              {hasLaunchParams() ? (
                <Button
                  stretched
                  size="l"
                  mode={isFavorite ? 'secondary' : 'primary'}
                  appearance={isFavorite ? 'positive' : 'accent'}
                  onClick={() => {
                    if (favorite.isPending) {
                      return
                    }
                    favorite.mutate(!isFavorite)
                  }}
                >
                  Болею за
                </Button>
              ) : null}
              {favorite.isError ? <Text>Не удалось обновить поддержку</Text> : null}
            </Div>
          </Group>
        ) : null}
      </AsyncView>
    </Panel>
  )
}
