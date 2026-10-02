import {
  Icon28HomeOutline,
  Icon28MoreHorizontal,
  Icon28PlaceOutline,
  Icon28StatisticsOutline,
  Icon28UsersOutline,
} from '@vkontakte/icons'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Tabbar, TabbarItem } from '@vkontakte/vkui'
import {
  PATH,
  VIEW_MAP,
  VIEW_MORE,
  VIEW_PARTICIPANTS,
  VIEW_RESULTS,
  VIEW_START,
} from '../routes.ts'

type AppTabbarProps = {
  activeView?: string
}

const tabs = [
  { view: VIEW_START, path: PATH.start, label: 'Старт', icon: Icon28HomeOutline },
  { view: VIEW_MAP, path: PATH.map, label: 'Карта', icon: Icon28PlaceOutline },
  {
    view: VIEW_PARTICIPANTS,
    path: PATH.participants,
    label: 'Участники',
    icon: Icon28UsersOutline,
  },
  { view: VIEW_RESULTS, path: PATH.results, label: 'Результаты', icon: Icon28StatisticsOutline },
  { view: VIEW_MORE, path: PATH.more, label: 'Ещё', icon: Icon28MoreHorizontal },
] as const

export function AppTabbar({ activeView }: AppTabbarProps) {
  const routeNavigator = useRouteNavigator()

  return (
    <Tabbar>
      {tabs.map((tab) => {
        const Icon = tab.icon

        return (
          <TabbarItem
            key={tab.view}
            selected={activeView === tab.view}
            label={tab.label}
            onClick={() => void routeNavigator.replace(tab.path)}
          >
            <Icon />
          </TabbarItem>
        )
      })}
    </Tabbar>
  )
}
