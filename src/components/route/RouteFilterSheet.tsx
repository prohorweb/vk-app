import { Icon24Cancel } from '@vkontakte/icons'
import { Radio } from '@vkontakte/vkui'
import type { RouteMapFilter } from '../../api/mocks/route.ts'
import { routeFilterOptions, routeMapLegend } from '../../api/mocks/route.ts'
import { BottomSheet } from '../BottomSheet.tsx'

type RouteFilterSheetProps = {
  open: boolean
  value: RouteMapFilter
  onClose: () => void
  onChange: (value: RouteMapFilter) => void
}

export function RouteFilterSheet({ open, value, onClose, onChange }: RouteFilterSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="Этапы на карте"
      sheetClassName="route-filter-sheet"
      panelClassName="route-filter-sheet__panel"
      swipeToClose
    >
      <div className="route-filter-sheet__head">
        <h2 className="route-filter-sheet__title">Этапы на карте</h2>
        <button type="button" className="route-filter-sheet__close" aria-label="Закрыть" onClick={onClose}>
          <Icon24Cancel />
        </button>
      </div>
      <div className="route-filter-sheet__options">
        {routeFilterOptions.map((option) => (
          <Radio
            key={String(option.value)}
            name="route-map-filter"
            checked={value === option.value}
            onChange={() => {
              onChange(option.value)
              // TODO: применить фильтр на карте
            }}
          >
            {option.label}
          </Radio>
        ))}
      </div>
      <p className="route-filter-sheet__legend">Обозначения</p>
      <ul className="route-filter-sheet__symbols">
        {routeMapLegend.map((item) => (
          <li key={item.id}>
            <span className="route-filter-sheet__swatch" style={{ background: item.color }} aria-hidden />
            {item.label}
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}
