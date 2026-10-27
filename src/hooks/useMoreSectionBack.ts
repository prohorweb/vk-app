import { useActiveVkuiLocation, useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { consumeMoreMenuReturn } from '../lib/moreMenuReturn.ts'
import { PATH } from '../routes.ts'

/**
 * Возврат из разделов «Ещё». Сначала — на таб, откуда открыли шторку.
 * Если возврат не сохранён (прямой вход по ссылке, перезагрузка), то по истории
 * панелей, иначе в корень раздела: стрелка всегда должна куда-то вести.
 */
export function useMoreSectionBack(): () => void {
  const routeNavigator = useRouteNavigator()
  const { panelsHistory = [] } = useActiveVkuiLocation()

  return () => {
    const returnPath = consumeMoreMenuReturn()
    if (returnPath) {
      void routeNavigator.replace(returnPath)
      return
    }
    if (panelsHistory.length > 1) {
      void routeNavigator.back()
      return
    }
    void routeNavigator.replace(PATH.program)
  }
}
