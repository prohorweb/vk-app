import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Icon24Cancel } from '@vkontakte/icons'
import { Subhead, Text, Title } from '@vkontakte/vkui'
import { formatMapPositionTime } from '../../lib/formatMapPositionTime.ts'
import type { MapPositionMarker } from '../../map/mapTypes.ts'
import { ParticipantAvatar } from '../ParticipantAvatar.tsx'

type MapMiniCardProps = {
  marker: MapPositionMarker
  onClose: () => void
}

const kmFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })

export function MapMiniCard({ marker, onClose }: MapMiniCardProps) {
  const routeNavigator = useRouteNavigator()

  return (
    <div className="map-mini-card">
      <div className="map-mini-card__panel" data-testid="map-mini-card">
        <div className="map-mini-card__head">
          <button
            type="button"
            className="map-mini-card__open"
            onClick={() => void routeNavigator.push(`/participants/${marker.participantId}`)}
          >
            <ParticipantAvatar
              id={marker.participantId}
              name={marker.name}
              className="avatar-40 map-mini-card__avatar"
            />
            <span className="map-mini-card__titles">
              <Title level="3" className="map-mini-card__title">
                №{marker.bib} · {marker.name}
              </Title>
              <Text className="map-mini-card__discipline">
                {marker.discipline ?? 'Дисциплина не указана'}
              </Text>
            </span>
          </button>
          <button type="button" className="map-mini-card__close" aria-label="Закрыть" onClick={onClose}>
            <Icon24Cancel />
          </button>
        </div>
        <Subhead className="map-mini-card__time">
          Положение на {formatMapPositionTime(marker.recordedAt)}
        </Subhead>
        <div className="map-mini-card__metrics">
          <Text>
            {marker.kmFromStart != null
              ? `${kmFormatter.format(marker.kmFromStart)} км`
              : 'Дистанция —'}
          </Text>
          <Text>
            {marker.averageSpeedKmh != null
              ? `${kmFormatter.format(marker.averageSpeedKmh)} км/ч`
              : 'Скорость —'}
          </Text>
        </div>
        {marker.status === 'estimated' ? (
          <Text className="map-mini-card__estimated">расчётное</Text>
        ) : null}
        {marker.status === 'stale' ? (
          <Text className="map-mini-card__stale">устаревшее положение</Text>
        ) : null}
      </div>
    </div>
  )
}
