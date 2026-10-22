import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { consumeMoreMenuReturn } from '../lib/moreMenuReturn.ts'

export function useMoreSectionBack(): () => void {
  const routeNavigator = useRouteNavigator()

  return () => {
    const returnPath = consumeMoreMenuReturn()
    if (returnPath) {
      void routeNavigator.replace(returnPath)
      return
    }
    void routeNavigator.back()
  }
}
