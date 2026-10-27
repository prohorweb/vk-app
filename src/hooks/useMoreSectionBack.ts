import { useActiveVkuiLocation, useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { consumeMoreMenuReturn } from '../lib/moreMenuReturn.ts'
import { PATH } from '../routes.ts'

type MoreSectionBackOptions = {
  /**
   * Забирать сохранённый путь возврата из шторки «Ещё».
   * Подразделы выключают это: стрелка ведёт в свой раздел, а сохранённый путь
   * остаётся для стрелки на корневом экране раздела.
   */
  consumeMenuReturn?: boolean
}

/**
 * Возврат из разделов «Ещё». Сначала — на таб, откуда открыли шторку.
 * Если возврат не сохранён (прямой вход по ссылке, перезагрузка), то по истории
 * панелей, иначе — в `fallbackPath`: стрелка всегда должна куда-то вести.
 */
export function useMoreSectionBack(
  fallbackPath: string = PATH.program,
  { consumeMenuReturn = true }: MoreSectionBackOptions = {},
): () => void {
  const routeNavigator = useRouteNavigator()
  const { panelsHistory = [] } = useActiveVkuiLocation()

  return () => {
    if (consumeMenuReturn) {
      const returnPath = consumeMoreMenuReturn()
      if (returnPath) {
        void routeNavigator.replace(returnPath)
        return
      }
    }
    if (panelsHistory.length > 1) {
      void routeNavigator.back()
      return
    }
    void routeNavigator.replace(fallbackPath)
  }
}
