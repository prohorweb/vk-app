import { Radio } from '@vkontakte/vkui'
import type { RouteMapFilter } from '../../api/mocks/route.ts'
import { routeFilterOptions } from '../../api/mocks/route.ts'
import { MapChoicePopover } from './MapChoicePopover.tsx'

type MapStagePopoverProps = {
  open: boolean
  value: RouteMapFilter
  onClose: () => void
  onChange: (value: RouteMapFilter) => void
}

/** Выбор этапа на карте — поповер у кнопки тулбара, как в макете «Карта». */
export function MapStagePopover({ open, value, onClose, onChange }: MapStagePopoverProps) {
  return (
    <MapChoicePopover open={open} title="Этапы" onClose={onClose}>
      {routeFilterOptions.map((option) => (
        <Radio
          key={String(option.value)}
          name="map-stage"
          checked={value === option.value}
          onChange={() => {
            onChange(option.value)
            onClose()
          }}
        >
          {option.label}
        </Radio>
      ))}
    </MapChoicePopover>
  )
}
