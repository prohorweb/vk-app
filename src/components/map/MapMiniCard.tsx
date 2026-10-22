import { Icon24Cancel } from '@vkontakte/icons'
import { Subhead, Text, Title } from '@vkontakte/vkui'
import type { MapPositionMarker } from '../../api/mocks/positions.ts'

type MapMiniCardProps = {
  marker: MapPositionMarker
  onClose: () => void
}

function formatMarkTime(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function MapMiniCard({ marker, onClose }: MapMiniCardProps) {
  return (
    <div className="map-mini-card">
      <div className="map-mini-card__panel" data-testid="map-mini-card">
        <div className="map-mini-card__head">
          <Title level="3" className="map-mini-card__title">
            №{marker.bib} · {marker.name}
          </Title>
          <button type="button" className="map-mini-card__close" aria-label="Закрыть" onClick={onClose}>
            <Icon24Cancel />
          </button>
        </div>
        <Text className="map-mini-card__discipline">{marker.discipline}</Text>
        <Subhead className="map-mini-card__time">Отметка {formatMarkTime(marker.recordedAt)}</Subhead>
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
