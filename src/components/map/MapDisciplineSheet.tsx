import { Icon24Cancel } from '@vkontakte/icons'
import { Radio } from '@vkontakte/vkui'
import { disciplineLabel } from '../../lib/labels.ts'
import type { DisciplinePublic } from '../../types/index.ts'
import { BottomSheet } from '../BottomSheet.tsx'

type MapDisciplineSheetProps = {
  open: boolean
  value: number | null
  disciplines: DisciplinePublic[]
  onClose: () => void
  onChange: (value: number | null) => void
}

/** Фильтр участников на карте по дисциплине — как в макете «Карта». */
export function MapDisciplineSheet({
  open,
  value,
  disciplines,
  onClose,
  onChange,
}: MapDisciplineSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="Дисциплины"
      sheetClassName="route-filter-sheet"
      panelClassName="route-filter-sheet__panel"
      swipeToClose
      hideTabbar
    >
      <div className="route-filter-sheet__head">
        <h2 className="route-filter-sheet__title">Дисциплины</h2>
        <button
          type="button"
          className="route-filter-sheet__close"
          aria-label="Закрыть"
          onClick={onClose}
        >
          <Icon24Cancel />
        </button>
      </div>
      <div className="route-filter-sheet__options">
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
      </div>
    </BottomSheet>
  )
}
