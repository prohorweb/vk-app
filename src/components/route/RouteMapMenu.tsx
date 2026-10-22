import { Card, SimpleCell } from '@vkontakte/vkui'
import { routeMapAttribution, routeOverflowMenuItems } from '../../api/mocks/route.ts'

type RouteMapMenuProps = {
  open: boolean
  onClose: () => void
}

export function RouteMapMenu({ open, onClose }: RouteMapMenuProps) {
  if (!open) {
    return null
  }

  return (
    <div className="route-action-menu" role="presentation">
      <button type="button" className="route-action-menu__backdrop" aria-label="Закрыть" onClick={onClose} />
      <Card className="route-action-menu__panel" role="menu">
        {routeOverflowMenuItems.map((label) => (
          <SimpleCell
            key={label}
            role="menuitem"
            onClick={() => {
              // TODO: действие «{label}»
              onClose()
            }}
          >
            {label}
          </SimpleCell>
        ))}
      </Card>
    </div>
  )
}

type RouteMapInfoProps = {
  open: boolean
  onClose: () => void
}

export function RouteMapInfo({ open, onClose }: RouteMapInfoProps) {
  if (!open) {
    return null
  }

  return (
    <div className="route-action-menu" role="presentation">
      <button type="button" className="route-action-menu__backdrop" aria-label="Закрыть" onClick={onClose} />
      <Card className="route-action-menu__panel route-action-menu__panel--info" role="dialog" aria-label="О карте">
        <p className="route-action-menu__info-text">{routeMapAttribution}</p>
        <SimpleCell
          onClick={() => {
            // TODO: открыть условия использования
            onClose()
          }}
        >
          Подробнее
        </SimpleCell>
      </Card>
    </div>
  )
}
