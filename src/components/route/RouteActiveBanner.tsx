import { Icon24Cancel } from '@vkontakte/icons'
import { Text } from '@vkontakte/vkui'

type RouteActiveBannerProps = {
  stageNumber: number
  onDismiss: () => void
}

export function RouteActiveBanner({ stageNumber, onDismiss }: RouteActiveBannerProps) {
  return (
    <div className="route-active-banner">
      <Text className="route-active-banner__text">
        Этап {stageNumber} • идёт сейчас
      </Text>
      <button type="button" className="route-active-banner__close" aria-label="Скрыть" onClick={onDismiss}>
        <Icon24Cancel />
      </button>
    </div>
  )
}
