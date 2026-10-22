import { Icon24Cancel, Icon24PhoneOutline, Icon24PlaceOutline } from '@vkontakte/icons'
import { Button, Subhead, Text, Title } from '@vkontakte/vkui'
import type { SpectatorLocation } from '../../api/mocks/program.ts'
import { spectatorVkMapsRouteUrl } from '../../api/mocks/program.ts'

type SpectatorLocationCardProps = {
  location: SpectatorLocation
  onClose: () => void
}

export function SpectatorLocationCard({ location, onClose }: SpectatorLocationCardProps) {
  return (
    <div className="spectator-location-card">
      <div className="spectator-location-card__panel">
        <span className="spectator-location-card__grab-bar" aria-hidden />
        <div className="spectator-location-card__head">
          <Title level="3" className="spectator-location-card__title">
            {location.title}
          </Title>
          <button type="button" className="spectator-location-card__close" aria-label="Закрыть" onClick={onClose}>
            <Icon24Cancel />
          </button>
        </div>
        <div className="spectator-location-card__row">
          <Icon24PlaceOutline />
          <Text>{location.address}</Text>
        </div>
        <div className="spectator-location-card__row">
          <Icon24PhoneOutline />
          <a className="spectator-location-card__phone" href={`tel:${location.phone.replace(/\s/g, '')}`}>
            {location.phone}
          </a>
        </div>
        <Subhead className="spectator-location-card__hours">Нет информации о времени работы</Subhead>
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
