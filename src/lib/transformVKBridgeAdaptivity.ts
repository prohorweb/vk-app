import type { UseAdaptivity } from '@vkontakte/vk-bridge-react'
import {
  type AdaptivityProps,
  ViewWidth,
  getViewHeightByViewportHeight,
  getViewWidthByViewportWidth,
} from '@vkontakte/vkui'

/**
 * Конвертирует данные VK Bridge в параметры AdaptivityProvider.
 * @see https://vkcom.github.io/VKUI/integrations/vk-mini-apps
 */
export function transformVKBridgeAdaptivity({
  type,
  viewportWidth,
  viewportHeight,
}: UseAdaptivity): AdaptivityProps {
  switch (type) {
    case 'adaptive':
      return {
        viewWidth: getViewWidthByViewportWidth(viewportWidth),
        viewHeight: getViewHeightByViewportHeight(viewportHeight),
      }
    case 'force_mobile':
    case 'force_mobile_compact':
      return {
        viewWidth: ViewWidth.MOBILE,
        density: type === 'force_mobile_compact' ? 'compact' : 'regular',
      }
    default:
      return {}
  }
}
