import { Radio } from '@vkontakte/vkui'
import { disciplineLabel } from '../../lib/labels.ts'
import type { DisciplinePublic } from '../../types/index.ts'
import { MapChoicePopover } from './MapChoicePopover.tsx'

type MapDisciplinePopoverProps = {
  open: boolean
  value: number | null
  disciplines: DisciplinePublic[]
  onClose: () => void
  onChange: (value: number | null) => void
}

/** Фильтр участников на карте по дисциплине — поповер у кнопки тулбара. */
export function MapDisciplinePopover({
  open,
  value,
  disciplines,
  onClose,
  onChange,
}: MapDisciplinePopoverProps) {
  return (
    <MapChoicePopover open={open} title="Дисциплины" onClose={onClose}>
      <Radio
        name="map-discipline"
        checked={value === null}
        onChange={() => {
          onChange(null)
          onClose()
        }}
      >
        Все дисциплины
      </Radio>
      {disciplines.map((discipline) => (
        <Radio
          key={discipline.id}
          name="map-discipline"
          checked={value === discipline.id}
          onChange={() => {
            onChange(discipline.id)
            onClose()
          }}
        >
          {disciplineLabel(discipline)}
        </Radio>
      ))}
    </MapChoicePopover>
  )
}
