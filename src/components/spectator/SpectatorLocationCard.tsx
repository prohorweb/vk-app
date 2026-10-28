import {
  Icon24Cancel,
  Icon24CarOutline,
  Icon24ClockOutline,
  Icon24CompassOutline,
  Icon24InfoCircleOutline,
  Icon24PlaceOutline,
} from '@vkontakte/icons'
import { Button, Subhead, Text, Title } from '@vkontakte/vkui'
import type { SpectatorLocation } from '../../api/viewerLocations.ts'
import { spectatorKindLabels, spectatorVkMapsRouteUrl } from '../../api/viewerLocations.ts'

type SpectatorLocationCardProps = {
  location: SpectatorLocation
  onClose: () => void
}

export function SpectatorLocationCard({ location, onClose }: SpectatorLocationCardProps) {
  const meta = [spectatorKindLabels[location.kind]]
  if (location.travelTimeMinutes !== null) {
    meta.push(`в пути ~${location.travelTimeMinutes} мин`)
  }

  return (
    <div className="spectator-location-card">
      <div className="spectator-location-card__panel">
        <span className="spectator-location-card__grab-bar" aria-hidden />
        <div className="spectator-location-card__head">
          <Title level="3" className="spectator-location-card__title">
            {location.name}
          </Title>
          <button
            type="button"
            className="spectator-location-card__close"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <Icon24Cancel />
          </button>
        </div>
        <Subhead className="spectator-location-card__kind">{meta.join(' · ')}</Subhead>
        {location.address ? (
          <div className="spectator-location-card__row">
            <Icon24PlaceOutline />
            <Text>{location.address}</Text>
          </div>
        ) : null}
        {location.directions ? (
          <div className="spectator-location-card__row">
            <Icon24CompassOutline />
            <Text>{location.directions}</Text>
          </div>
        ) : null}
        {location.parkingInfo ? (
          <div className="spectator-location-card__row">
            <Icon24CarOutline />
            <Text>{location.parkingInfo}</Text>
          </div>
        ) : null}
        {location.travelTimeMinutes !== null ? (
          <div className="spectator-location-card__row">
            <Icon24ClockOutline />
            <Text>Дорога занимает около {location.travelTimeMinutes} минут</Text>
          </div>
        ) : null}
        {location.facilities.length > 0 ? (
          <ul className="spectator-location-card__facilities">
            {location.facilities.map((facility) => (
              <li key={facility} className="spectator-location-card__facility">
                {facility}
              </li>
            ))}
          </ul>
        ) : null}
        {location.safetyNotes ? (
          <div className="spectator-location-card__note">
            <Icon24InfoCircleOutline />
            <Text>{location.safetyNotes}</Text>
          </div>
        ) : null}
        <Button
          size="l"
          stretched
          className="spectator-location-card__route"
          href={spectatorVkMapsRouteUrl(location.lng, location.lat)}
          target="_blank"
        >
          Построить маршрут
        </Button>
      </div>
    </div>
  )
}
