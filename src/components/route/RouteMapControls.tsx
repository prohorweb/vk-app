import {
  Icon24Add,
  Icon24Filter,
  Icon24InfoCircleOutline,
  Icon24LocationMapOutline,
  Icon24MinusOutline,
  Icon24MoreVertical,
} from '@vkontakte/icons'
import { IconButton } from '@vkontakte/vkui'

type RouteMapControlsProps = {
  onFilter: () => void
  onInfo: () => void
  onMenu: () => void
  infoActive?: boolean
  menuActive?: boolean
}

export function RouteMapControls({
  onFilter,
  onInfo,
  onMenu,
  infoActive,
  menuActive,
}: RouteMapControlsProps) {
  return (
    <div className="route-map-controls">
      <IconButton
        className={['route-map-controls__info', infoActive ? 'route-map-controls__btn--active' : '']
          .filter(Boolean)
          .join(' ')}
        label="Информация о карте"
        onClick={onInfo}
      >
        <Icon24InfoCircleOutline />
      </IconButton>
      <div className="route-map-controls__cluster">
        <IconButton label="Фильтр этапов на карте" onClick={onFilter}>
          <Icon24Filter />
        </IconButton>
        <IconButton label="Приблизить">
          <Icon24Add />
        </IconButton>
        <IconButton label="Отдалить">
          <Icon24MinusOutline />
        </IconButton>
        <IconButton label="Моё местоположение">
          <Icon24LocationMapOutline />
        </IconButton>
        <IconButton
          className={menuActive ? 'route-map-controls__btn--active' : undefined}
          label="Дополнительно"
          onClick={onMenu}
        >
          <Icon24MoreVertical />
        </IconButton>
      </div>
    </div>
  )
}
