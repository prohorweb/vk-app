import { useMemo, useState } from 'react'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Icon24NotificationOutline } from '@vkontakte/icons'
import {
  Button,
  ModalCard,
  ModalRoot,
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Switch,
} from '@vkontakte/vkui'
import { setFavorite } from '../api/favorites.ts'
import { queryClient } from '../api/queryClient.ts'
import { useFavoriteMutation, useFavoriteParticipantsQuery } from '../api/queries.ts'
import { FavoriteParticipantCell } from '../components/profile/FavoriteParticipantCell.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import {
  NOTIFICATION_PREFERENCES,
  isPreferenceEnabled,
  readNotificationSettings,
  setNotificationPreference,
  setNotificationsAllowed,
  type NotificationSettingsState,
} from '../lib/notificationSettings.ts'
import type { ParticipantListItem } from '../types/index.ts'
import { PATH } from '../routes.ts'

type ProfileNotificationsPanelProps = {
  id: string
}

const UNSUBSCRIBE_MODAL = 'unsubscribe-all'

const EVENT_COPY: Partial<
  Record<(typeof NOTIFICATION_PREFERENCES)[number]['event_type'], string>
> = {
  stage_start: 'Для всех участников',
  leader_changed: 'В каждой дисциплине',
  stage_finish: 'Протокол опубликован',
  broadcast: 'Анонсы и важные объявления',
}

export function ProfileNotificationsPanel({ id }: ProfileNotificationsPanelProps) {
  const goBack = useMoreSectionBack(PATH.profile, { consumeMenuReturn: false })
  const routeNavigator = useRouteNavigator()
  const [settings, setSettings] = useState<NotificationSettingsState>(() =>
    readNotificationSettings(),
  )
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [unsubscribing, setUnsubscribing] = useState(false)
  const favoritesQuery = useFavoriteParticipantsQuery()
  const favorites = favoritesQuery.data ?? []

  const raceEvents = useMemo(
    () =>
      NOTIFICATION_PREFERENCES.filter((item) =>
        ['stage_start', 'leader_changed', 'stage_finish', 'broadcast'].includes(item.event_type),
      ),
    [],
  )

  return (
    <Panel id={id} className="profile-screen profile-screen--sub">
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>Уведомления</PanelHeader>
      <div className="profile-screen__body">
        <div className="profile-card">
          <label className="profile-menu-row">
            <span className="profile-menu-row__icon" aria-hidden>
              <Icon24NotificationOutline />
            </span>
            <span className="profile-menu-row__text">
              <span className="profile-menu-row__title">Push-уведомления</span>
              <span className="profile-menu-row__subtitle">Все уведомления приложения</span>
            </span>
            <Switch
              checked={settings.notifications_allowed}
              onChange={(event) => {
                setSettings(setNotificationsAllowed(event.target.checked))
              }}
            />
          </label>
        </div>

        <section className="profile-card">
          <h2 className="profile-card__title">Мои участники</h2>
          {favorites.length === 0 ? (
            <p className="profile-screen__hint">
              Добавьте участников в избранное, чтобы получать обновления.
            </p>
          ) : (
            <div className="profile-card__list">
              {favorites.map((participant) => (
                <FavoriteNotifyRow
                  key={participant.id}
                  participant={participant}
                  masterEnabled={settings.notifications_allowed}
                  onOpen={() => void routeNavigator.push(`/participants/${participant.id}`)}
                />
              ))}
            </div>
          )}
          {favorites.length > 0 ? (
            <Button
              stretched
              size="l"
              mode="primary"
              className="profile-card__action"
              onClick={() => setActiveModal(UNSUBSCRIBE_MODAL)}
            >
              Отписаться от всех участников
            </Button>
          ) : null}
        </section>

        <section className="profile-card">
          <h2 className="profile-card__title">События гонки</h2>
          <div className="profile-card__list">
            {raceEvents.map((item) => (
              <label key={item.event_type} className="profile-menu-row profile-menu-row--switch">
                <span className="profile-menu-row__text">
                  <span className="profile-menu-row__title">{item.title}</span>
                  <span className="profile-menu-row__subtitle">
                    {EVENT_COPY[item.event_type] ?? ''}
                  </span>
                </span>
                <Switch
                  checked={isPreferenceEnabled(settings, item.event_type)}
                  disabled={!settings.notifications_allowed}
                  onChange={(event) => {
                    setSettings(setNotificationPreference(item.event_type, event.target.checked))
                  }}
                />
              </label>
            ))}
          </div>
        </section>
      </div>

      <ModalRoot activeModal={activeModal} onClose={() => setActiveModal(null)}>
        <ModalCard
          id={UNSUBSCRIBE_MODAL}
          onClose={() => setActiveModal(null)}
          title="Отписаться от всех участников?"
          description="Уведомления о них больше не придут. Подписаться снова можно в карточке участника."
          actions={
            <div className="profile-modal-actions">
              <Button size="l" mode="secondary" stretched onClick={() => setActiveModal(null)}>
                Отмена
              </Button>
              <Button
                size="l"
                mode="primary"
                stretched
                loading={unsubscribing}
                onClick={() => {
                  setUnsubscribing(true)
                  void unsubscribeAll(favorites)
                    .then(() => setActiveModal(null))
                    .finally(() => setUnsubscribing(false))
                }}
              >
                Отписаться
              </Button>
            </div>
          }
        />
      </ModalRoot>
    </Panel>
  )
}

function FavoriteNotifyRow({
  participant,
  masterEnabled,
  onOpen,
}: {
  participant: ParticipantListItem
  masterEnabled: boolean
  onOpen: () => void
}) {
  const favorite = useFavoriteMutation(participant.id)

  return (
    <div className="profile-notify-row">
      <div className="profile-notify-row__cell">
        <FavoriteParticipantCell participant={participant} onOpen={onOpen} />
      </div>
      <Switch
        checked
        disabled={!masterEnabled || favorite.isPending}
        onChange={(event) => {
          if (!event.target.checked) {
            favorite.mutate(false)
          }
        }}
        aria-label={`Уведомления: ${participant.name}`}
      />
    </div>
  )
}

async function unsubscribeAll(favorites: ParticipantListItem[]): Promise<void> {
  await Promise.all(
    favorites.map((participant) =>
      setFavorite(participant.id, false, participant.supporters_count),
    ),
  )
  await queryClient.invalidateQueries({ queryKey: ['favorites'] })
  await queryClient.invalidateQueries({ queryKey: ['supporters'] })
  await queryClient.invalidateQueries({ queryKey: ['participants'] })
}
