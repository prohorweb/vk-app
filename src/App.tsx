import { useState } from 'react'
import { useActiveVkuiLocation, useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Epic, SplitCol, SplitLayout, View } from '@vkontakte/vkui'
import { AppTabbar } from './components/AppTabbar.tsx'
import { MoreMenuSheet } from './components/MoreMenuSheet.tsx'
import { isStartSeen } from './lib/startGate.ts'
import { AboutPanel } from './panels/AboutPanel.tsx'
import { GuestsPanel } from './panels/GuestsPanel.tsx'
import { MapPanel } from './panels/MapPanel.tsx'
import { NewsPanel } from './panels/NewsPanel.tsx'
import { ParticipantPanel } from './panels/ParticipantPanel.tsx'
import { ParticipantsPanel } from './panels/ParticipantsPanel.tsx'
import { ProfilePanel } from './panels/ProfilePanel.tsx'
import { ProgramPanel } from './panels/ProgramPanel.tsx'
import { SpectatorMapPanel } from './panels/SpectatorMapPanel.tsx'
import { ResultsPanel } from './panels/ResultsPanel.tsx'
import { RoutePanel } from './panels/RoutePanel.tsx'
import { StartPanel } from './panels/StartPanel.tsx'
import {
  PANEL_ABOUT,
  PANEL_GUESTS,
  PANEL_MAP,
  PANEL_MAP_PARTICIPANT,
  PANEL_NEWS,
  PANEL_PARTICIPANT,
  PANEL_PARTICIPANTS,
  PANEL_PROFILE,
  PANEL_PROGRAM,
  PANEL_SPECTATOR_MAP,
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
  const [startSeen, setStartSeen] = useState(isStartSeen)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const swipeBack = () => {
    void routeNavigator.back()
  }
  const showTabbar = activeView !== VIEW_START || startSeen

  return (
    <SplitLayout>
      <SplitCol width="100%" maxWidth="100%" stretchedOnMobile autoSpaced>
        <Epic
          activeStory={activeView}
          tabbar={
            showTabbar ? (
              <AppTabbar
                activeView={activeView}
                activePanel={activePanel}
                moreMenuOpen={moreMenuOpen}
                onOpenMoreMenu={() => setMoreMenuOpen(true)}
                onCloseMoreMenu={() => setMoreMenuOpen(false)}
              />
            ) : undefined
          }
        >
          <View
            id={VIEW_START}
            activePanel={activePanelOf(activeView, VIEW_START, activePanel, PANEL_START)}
            history={activeView === VIEW_START ? panelsHistory : []}
            onSwipeBack={swipeBack}
          >
            <StartPanel id={PANEL_START} onBegin={() => setStartSeen(true)} />
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
            <ResultsPanel id={PANEL_RESULTS} />
          </View>

          <View
            id={VIEW_MORE}
            activePanel={activePanelOf(activeView, VIEW_MORE, activePanel, PANEL_PROGRAM)}
            history={activeView === VIEW_MORE ? panelsHistory : []}
            onSwipeBack={swipeBack}
          >
            <RoutePanel id={PANEL_ROUTE} />
            <ProgramPanel id={PANEL_PROGRAM} />
            <SpectatorMapPanel id={PANEL_SPECTATOR_MAP} />
            <NewsPanel id={PANEL_NEWS} />
            <GuestsPanel id={PANEL_GUESTS} />
            <AboutPanel id={PANEL_ABOUT} />
            <ProfilePanel id={PANEL_PROFILE} />
          </View>
        </Epic>
        <MoreMenuSheet open={moreMenuOpen} onClose={() => setMoreMenuOpen(false)} />
      </SplitCol>
    </SplitLayout>
  )
}
