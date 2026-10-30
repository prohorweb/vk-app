import { Radio } from '@vkontakte/vkui'
import { MapChoicePopover } from './MapChoicePopover.tsx'

type MapFavoritesPopoverProps = {
  open: boolean
  value: boolean
  onClose: () => void
  onChange: (favoritesOnly: boolean) => void
}

/** Фильтр маркеров участников: все или только избранные (пересечение на клиенте). */
export function MapFavoritesPopover({
  open,
  value,
  onClose,
  onChange,
}: MapFavoritesPopoverProps) {
  return (
    <MapChoicePopover open={open} title="Участники" onClose={onClose}>
      <Radio
        name="map-favorites"
        checked={!value}
        onChange={() => {
          onChange(false)
          onClose()
        }}
      >
        Все участники
      </Radio>
      <Radio
        name="map-favorites"
        checked={value}
        onChange={() => {
          onChange(true)
          onClose()
        }}
      >
        Мои фавориты
      </Radio>
    </MapChoicePopover>
  )
}
