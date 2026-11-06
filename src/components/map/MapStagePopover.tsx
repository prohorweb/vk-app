import { Radio } from '@vkontakte/vkui'
import type { RouteMapFilter } from '../../api/mocks/route.ts'
import type { StagePublic } from '../../types/index.ts'
import { MapChoicePopover } from './MapChoicePopover.tsx'

type MapStagePopoverProps = {
  open: boolean
  value: RouteMapFilter
  stages: StagePublic[]
  onClose: () => void
  onChange: (value: RouteMapFilter) => void
}

/** Выбор этапа на карте — значения = API `stage.id`, не порядковый номер. */
export function MapStagePopover({ open, value, stages, onClose, onChange }: MapStagePopoverProps) {
  const options: { value: RouteMapFilter; label: string }[] = [
    { value: 'all', label: 'Все этапы' },
    ...stages.map((stage) => ({
      value: stage.id as number,
      label: `Этап ${stage.number}`,
    })),
  ]

  return (
    <MapChoicePopover open={open} title="Этапы" onClose={onClose}>
      {options.map((option) => (
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
