import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Button, Panel, PanelHeader, PanelHeaderBack, Spinner } from '@vkontakte/vkui'
import { useFavoriteParticipantsQuery } from '../api/queries.ts'
import { FavoriteParticipantCell } from '../components/profile/FavoriteParticipantCell.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { PATH } from '../routes.ts'

type ProfileFavoritesPanelProps = {
  id: string
}

export function ProfileFavoritesPanel({ id }: ProfileFavoritesPanelProps) {
  const goBack = useMoreSectionBack(PATH.profile, { consumeMenuReturn: false })
  const routeNavigator = useRouteNavigator()
  const favoritesQuery = useFavoriteParticipantsQuery()
  const favorites = favoritesQuery.data ?? []

  return (
    <Panel id={id} className="profile-screen profile-screen--sub">
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>За кого болею</PanelHeader>
      <div className="profile-screen__body">
        {favoritesQuery.isLoading ? (
          <div className="profile-screen__state">
            <Spinner size="m" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="profile-screen__state profile-screen__state--card">
            <p className="profile-screen__empty-title">Пока никого нет</p>
            <p className="profile-screen__empty-text">
              Откройте карточку участника и нажмите «Болею за…», чтобы добавить в избранное.
            </p>
            <Button
              size="l"
              mode="primary"
              onClick={() => void routeNavigator.push(PATH.participants)}
            >
              К участникам
            </Button>
          </div>
        ) : (
          <div className="profile-card profile-card--list">
            {favorites.map((participant) => (
              <FavoriteParticipantCell
                key={participant.id}
                participant={participant}
                onOpen={() => void routeNavigator.push(`/participants/${participant.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Panel>
  )
}
