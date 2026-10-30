import vkBridge from '@vkontakte/vk-bridge'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import {
  Icon24ChevronRight,
  Icon24FavoriteOutline,
  Icon24NotificationOutline,
  Icon24UserAddOutline,
} from '@vkontakte/icons'
import { Button, Panel, PanelHeader, PanelHeaderBack, Spinner } from '@vkontakte/vkui'
import coverImage from '../assets/start/bg.jpg'
import { useFavoriteParticipantsQuery, useMyProfileQuery } from '../api/queries.ts'
import { FavoriteParticipantCell } from '../components/profile/FavoriteParticipantCell.tsx'
import { Picture } from '../components/Picture.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { readNotificationSettings } from '../lib/notificationSettings.ts'
import { PATH } from '../routes.ts'

type ProfilePanelProps = {
  id: string
}

export function ProfilePanel({ id }: ProfilePanelProps) {
  const goBack = useMoreSectionBack()
  const routeNavigator = useRouteNavigator()
  const profileQuery = useMyProfileQuery()
  const favoritesQuery = useFavoriteParticipantsQuery()
  const profile = profileQuery.data
  const favorites = favoritesQuery.data ?? []
  const previewFavorite = favorites[0]
  const notifications = readNotificationSettings()
  const notificationsSubtitle = notifications.notifications_allowed
    ? favorites.length > 0
      ? `Включены · ${favorites.length} ${participantsWord(favorites.length)}`
      : 'Включены'
    : 'Выключены'

  const displayName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Зритель'
    : 'Зритель'

  return (
    <Panel id={id} className="profile-screen">
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>Профиль</PanelHeader>
      <div className="profile-screen__body">
        <section className="profile-hero" aria-label="Профиль пользователя">
          <div className="profile-hero__cover">
            <Picture src={coverImage} alt="" ratio="2 / 1" className="profile-hero__cover-image" />
          </div>
          <div className="profile-hero__identity">
            {profile?.photo_url ? (
              <img className="profile-hero__avatar" src={profile.photo_url} alt="" />
            ) : (
              <span className="profile-hero__avatar profile-hero__avatar--placeholder" aria-hidden>
                {initials(displayName)}
              </span>
            )}
            <h1 className="profile-hero__name">{displayName}</h1>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-card__head">
            <h2 className="profile-card__title">За кого болею</h2>
            <button
              type="button"
              className="profile-card__link"
              onClick={() => void routeNavigator.push(PATH.profileFavorites)}
            >
              Все
              <Icon24ChevronRight width={20} height={20} aria-hidden />
            </button>
          </div>
          {favoritesQuery.isLoading ? (
            <div className="profile-screen__state profile-screen__state--inline">
              <Spinner size="s" />
            </div>
          ) : previewFavorite ? (
            <FavoriteParticipantCell
              participant={previewFavorite}
              onOpen={() => void routeNavigator.push(`/participants/${previewFavorite.id}`)}
            />
          ) : (
            <div className="profile-screen__empty-block">
              <p className="profile-screen__empty-text">
                Пока никого нет. Добавьте участника кнопкой «Болею за…» в его карточке.
              </p>
              <Button
                size="m"
                mode="secondary"
                onClick={() => void routeNavigator.push(PATH.participants)}
              >
                К участникам
              </Button>
            </div>
          )}
        </section>

        <section className="profile-card">
          <h2 className="profile-card__title">Сохранённые материалы</h2>
          <p className="profile-screen__hint">
            Сохранённые новости и фото появятся здесь позже.
          </p>
        </section>

        <section className="profile-card profile-card--menu">
          <button
            type="button"
            className="profile-menu-row"
            onClick={() => void routeNavigator.push(PATH.profileNotifications)}
          >
            <span className="profile-menu-row__icon" aria-hidden>
              <Icon24NotificationOutline />
            </span>
            <span className="profile-menu-row__text">
              <span className="profile-menu-row__title">Уведомления</span>
              <span className="profile-menu-row__subtitle">{notificationsSubtitle}</span>
            </span>
            <Icon24ChevronRight className="profile-menu-row__chevron" aria-hidden />
          </button>

          <button
            type="button"
            className="profile-menu-row"
            onClick={() => {
              void inviteFriends().catch(() => undefined)
            }}
          >
            <span className="profile-menu-row__icon" aria-hidden>
              <Icon24UserAddOutline />
            </span>
            <span className="profile-menu-row__text">
              <span className="profile-menu-row__title">Пригласить друзей</span>
              <span className="profile-menu-row__subtitle">Вместе болеть веселее</span>
            </span>
            <Icon24ChevronRight className="profile-menu-row__chevron" aria-hidden />
          </button>

          <button
            type="button"
            className="profile-menu-row"
            onClick={() => {
              void addAppToFavorites().catch(() => undefined)
            }}
          >
            <span className="profile-menu-row__icon" aria-hidden>
              <Icon24FavoriteOutline />
            </span>
            <span className="profile-menu-row__text">
              <span className="profile-menu-row__title">
                {profile?.is_favorite_app ? 'В избранном VK' : 'Добавить в избранное'}
              </span>
              <span className="profile-menu-row__subtitle">Быстрый доступ к приложению</span>
            </span>
            <Icon24ChevronRight className="profile-menu-row__chevron" aria-hidden />
          </button>
        </section>
      </div>
    </Panel>
  )
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '')
  return letters.join('') || 'А'
}

function participantsWord(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) {
    return 'участник'
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'участника'
  }
  return 'участников'
}

async function inviteFriends(): Promise<void> {
  try {
    await vkBridge.send('VKWebAppShowInviteBox')
    return
  } catch {
    // Вне VK — обычный share.
  }
  const link = window.location.origin + window.location.pathname
  if (navigator.share) {
    await navigator.share({ title: 'Авача', text: 'Следи за гонкой Авача', url: link })
    return
  }
  await navigator.clipboard.writeText(link)
}

async function addAppToFavorites(): Promise<void> {
  await vkBridge.send('VKWebAppAddToFavorites')
}
