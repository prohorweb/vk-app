import { useActiveVkuiLocation, useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Epic, SplitCol, SplitLayout, View } from '@vkontakte/vkui'
import { AppTabbar } from './components/AppTabbar.tsx'
import { InProgressPanel } from './components/InProgressPanel.tsx'
import { GuestsPanel } from './panels/GuestsPanel.tsx'
import { MapPanel } from './panels/MapPanel.tsx'
import { MorePanel } from './panels/MorePanel.tsx'
import { NewsPanel } from './panels/NewsPanel.tsx'
import { ParticipantPanel } from './panels/ParticipantPanel.tsx'
import { ParticipantsPanel } from './panels/ParticipantsPanel.tsx'
import { ProgramPanel } from './panels/ProgramPanel.tsx'
import {
  PANEL_GUESTS,
  PANEL_MAP,
  PANEL_MAP_PARTICIPANT,
  PANEL_MORE,
  PANEL_NEWS,
  PANEL_PARTICIPANT,
  PANEL_PARTICIPANTS,
  PANEL_PROFILE,
  PANEL_PROGRAM,
  PANEL_RESULTS,
  PANEL_ROUTE,
  PANEL_START,
  VIEW_MAP,
  VIEW_MORE,
  VIEW_PARTICIPANTS,
  VIEW_RESULTS,
  VIEW_START,
} from './routes.ts'

function activePanelOf(
  activeView: string | undefined,
  view: string,
  activePanel: string | undefined,
  fallback: string,
): string {
  return activeView === view ? (activePanel ?? fallback) : fallback
}

export function App() {
  const {
    view: activeView = VIEW_START,
    panel: activePanel = PANEL_START,
    panelsHistory = [],
  } = useActiveVkuiLocation()
  const routeNavigator = useRouteNavigator()
  const swipeBack = () => {
    void routeNavigator.back()
  }

  return (
    <SplitLayout>
      <SplitCol width="100%" maxWidth="100%" stretchedOnMobile autoSpaced>
        <Epic activeStory={activeView} tabbar={<AppTabbar activeView={activeView} />}>
          <View
            id={VIEW_START}
            activePanel={activePanelOf(activeView, VIEW_START, activePanel, PANEL_START)}
            history={activeView === VIEW_START ? panelsHistory : []}
            onSwipeBack={swipeBack}
          >
            <InProgressPanel id={PANEL_START} title="Старт" />
          </View>

          <View
            id={VIEW_MAP}
            activePanel={activePanelOf(activeView, VIEW_MAP, activePanel, PANEL_MAP)}
            history={activeView === VIEW_MAP ? panelsHistory : []}
            onSwipeBack={swipeBack}
          >
            <MapPanel id={PANEL_MAP} />
            <ParticipantPanel id={PANEL_MAP_PARTICIPANT} />
          </View>

          <View
            id={VIEW_PARTICIPANTS}
            activePanel={activePanelOf(
              activeView,
              VIEW_PARTICIPANTS,
              activePanel,
              PANEL_PARTICIPANTS,
            )}
            history={activeView === VIEW_PARTICIPANTS ? panelsHistory : []}
            onSwipeBack={swipeBack}
          >
            <ParticipantsPanel id={PANEL_PARTICIPANTS} />
            <ParticipantPanel id={PANEL_PARTICIPANT} />
          </View>

          <View
            id={VIEW_RESULTS}
            activePanel={activePanelOf(activeView, VIEW_RESULTS, activePanel, PANEL_RESULTS)}
            history={activeView === VIEW_RESULTS ? panelsHistory : []}
            onSwipeBack={swipeBack}
          >
            <InProgressPanel id={PANEL_RESULTS} title="Результаты" />
          </View>

          <View
            id={VIEW_MORE}
            activePanel={activePanelOf(activeView, VIEW_MORE, activePanel, PANEL_MORE)}
            history={activeView === VIEW_MORE ? panelsHistory : []}
            onSwipeBack={swipeBack}
          >
            <MorePanel id={PANEL_MORE} />
            <InProgressPanel id={PANEL_ROUTE} title="Маршрут" back />
            <ProgramPanel id={PANEL_PROGRAM} />
            <NewsPanel id={PANEL_NEWS} />
            <GuestsPanel id={PANEL_GUESTS} />
            <InProgressPanel id={PANEL_PROFILE} title="Профиль" back />
          </View>
        </Epic>
      </SplitCol>
    </SplitLayout>
  )
}
