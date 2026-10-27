import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Tabbar, TabbarItem } from '@vkontakte/vkui'
import {
  MORE_MENU_PANELS,
  PATH,
  VIEW_MAP,
  VIEW_MEDIA,
  VIEW_MORE,
  VIEW_PARTICIPANTS,
  VIEW_RESULTS,
} from '../routes.ts'
import { TabbarIcon, type TabbarIconId } from './TabbarIcon.tsx'

type AppTabbarProps = {
  activeView?: string
  activePanel?: string
  moreMenuOpen?: boolean
  onOpenMoreMenu: () => void
  onCloseMoreMenu: () => void
}

const tabs: (
  | {
      id: 'map' | 'participants' | 'results' | 'media'
      view: string
      path: string
      label: string
      icon: TabbarIconId
    }
  | { id: 'more'; label: string; icon: TabbarIconId }
)[] = [
  { id: 'map', view: VIEW_MAP, path: PATH.map, label: 'Карта', icon: 'map' },
  {
    id: 'participants',
    view: VIEW_PARTICIPANTS,
    path: PATH.participants,
    label: 'Участники',
    icon: 'participants',
  },
  { id: 'results', view: VIEW_RESULTS, path: PATH.results, label: 'Результаты', icon: 'results' },
  {
    id: 'media',
    view: VIEW_MEDIA,
    path: PATH.media,
    label: 'Медиа',
    icon: 'media',
  },
  { id: 'more', label: 'Ещё', icon: 'more' },
]

function tabSelected(
  tab: (typeof tabs)[number],
  activeView?: string,
  activePanel?: string,
  moreMenuOpen?: boolean,
): boolean {
  if (moreMenuOpen) {
    return tab.id === 'more'
  }

  if (tab.id === 'more') {
    return (
      activeView === VIEW_MORE &&
      activePanel !== undefined &&
      (MORE_MENU_PANELS as readonly string[]).includes(activePanel)
    )
  }
  return 'view' in tab && activeView === tab.view
}

export function AppTabbar({
  activeView,
  activePanel,
  moreMenuOpen,
  onOpenMoreMenu,
  onCloseMoreMenu,
}: AppTabbarProps) {
  const routeNavigator = useRouteNavigator()

  return (
    <Tabbar className="app-tabbar" mode="vertical" plain>
      {tabs.map((tab) => (
        <TabbarItem
          key={tab.id}
          selected={tabSelected(tab, activeView, activePanel, moreMenuOpen)}
          aria-label={tab.label}
          onClick={() => {
            if (tab.id === 'more') {
              onOpenMoreMenu()
              return
            }
            onCloseMoreMenu()
            if ('path' in tab) {
              void routeNavigator.replace(tab.path)
            }
          }}
        >
          <TabbarIcon id={tab.icon} />
        </TabbarItem>
      ))}
    </Tabbar>
  )
}
