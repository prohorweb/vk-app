import {
  Icon24Add,
  Icon24Filter,
  Icon24InfoCircleOutline,
  Icon24ListBulletOutline,
  Icon24LocationMapOutline,
  Icon24MinusOutline,
  Icon24MoreVertical,
} from '@vkontakte/icons'
import { IconButton } from '@vkontakte/vkui'

type RouteMapControlsProps = {
  /** Без обработчика кнопка фильтра не показывается: на экране уже есть чипы. */
  onFilter?: () => void
  /** Отдельный фильтр участников по дисциплине. */
  onDisciplineFilter?: () => void
  onInfo?: () => void
  onMenu: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onLocate?: () => void
  infoActive?: boolean
  menuActive?: boolean
  filterActive?: boolean
  disciplineFilterActive?: boolean
  showInfo?: boolean
  className?: string
}

export function RouteMapControls({
  onFilter,
  onDisciplineFilter,
  onInfo,
  onMenu,
  onZoomIn,
  onZoomOut,
  onLocate,
  infoActive,
  menuActive,
  filterActive,
  disciplineFilterActive,
  showInfo = true,
  className,
}: RouteMapControlsProps) {
  return (
    <div className={['route-map-controls', className].filter(Boolean).join(' ')}>
      {showInfo && onInfo ? (
        <IconButton
          className={[
            'route-map-controls__info',
            infoActive ? 'route-map-controls__btn--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          label="Информация о карте"
          onClick={onInfo}
        >
          <Icon24InfoCircleOutline />
        </IconButton>
      ) : null}
      <div className="route-map-controls__side">
        {onFilter || onDisciplineFilter ? (
          <div className="route-map-controls__group">
            {onFilter ? (
              <IconButton
                className={filterActive ? 'route-map-controls__btn--active' : undefined}
                label="Этапы на карте"
                onClick={onFilter}
              >
                <Icon24ListBulletOutline />
              </IconButton>
            ) : null}
            {onDisciplineFilter ? (
              <IconButton
                className={disciplineFilterActive ? 'route-map-controls__btn--active' : undefined}
                label="Фильтр по дисциплинам"
                onClick={onDisciplineFilter}
              >
                <Icon24Filter />
              </IconButton>
            ) : null}
          </div>
        ) : null}
        <div className="route-map-controls__cluster">
          <div className="route-map-controls__zoom">
            <IconButton label="Приблизить" onClick={onZoomIn}>
              <Icon24Add />
            </IconButton>
            <IconButton label="Отдалить" onClick={onZoomOut}>
              <Icon24MinusOutline />
            </IconButton>
          </div>
          <IconButton label="Моё местоположение" onClick={onLocate}>
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
    </div>
  )
}
