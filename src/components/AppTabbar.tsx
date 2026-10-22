import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Tabbar, TabbarItem } from '@vkontakte/vkui'
import {
  MORE_MENU_PANELS,
  PANEL_PROGRAM,
  PATH,
  VIEW_MAP,
  VIEW_MORE,
  VIEW_PARTICIPANTS,
  VIEW_RESULTS,
} from '../routes.ts'
import {
  TabIconBars,
  TabIconMap,
  TabIconMore,
  TabIconPeople,
  TabIconProgram,
} from './tabIcons.tsx'

type AppTabbarProps = {
  activeView?: string
  activePanel?: string
  moreMenuOpen?: boolean
  onOpenMoreMenu: () => void
  onCloseMoreMenu: () => void
}

const tabs = [
  { id: 'map', view: VIEW_MAP, path: PATH.map, label: 'Карта', icon: TabIconMap },
  {
    id: 'participants',
    view: VIEW_PARTICIPANTS,
    path: PATH.participants,
    label: 'Участники',
    icon: TabIconPeople,
  },
  { id: 'results', view: VIEW_RESULTS, path: PATH.results, label: 'Результаты', icon: TabIconBars },
  {
    id: 'program',
    view: VIEW_MORE,
    path: PATH.program,
    label: 'Программа',
    icon: TabIconProgram,
  },
  { id: 'more', label: 'Ещё', icon: TabIconMore },
] as const

function tabSelected(
  tab: (typeof tabs)[number],
  activeView?: string,
  activePanel?: string,
  moreMenuOpen?: boolean,
): boolean {
  if (moreMenuOpen) {
    return tab.id === 'more'
  }

  if (tab.id === 'program') {
    return activePanel === PANEL_PROGRAM
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
    <Tabbar className="app-tabbar" mode="vertical">
      {tabs.map((tab) => {
        const Icon = tab.icon

        return (
          <TabbarItem
            key={tab.id}
            selected={tabSelected(tab, activeView, activePanel, moreMenuOpen)}
            label={tab.label}
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
            <Icon className="app-tabbar__icon" />
          </TabbarItem>
        )
      })}
    </Tabbar>
  )
}
