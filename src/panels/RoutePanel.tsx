import { useMemo, useState } from 'react'
import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import type { RouteMapFilter } from '../api/mocks/route.ts'
import { RouteActiveBanner } from '../components/route/RouteActiveBanner.tsx'
import { RouteFilterSheet } from '../components/route/RouteFilterSheet.tsx'
import { RouteMapControls } from '../components/route/RouteMapControls.tsx'
import { RouteMapInfo, RouteMapMenu } from '../components/route/RouteMapMenu.tsx'
import { RoutePlaceholder } from '../components/route/RoutePlaceholder.tsx'
import { RouteSheet } from '../components/route/RouteSheet.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { readRouteMapFilterFromUrl, readRouteSheetSnapFromUrl } from '../lib/routeScreenParams.ts'

type RoutePanelProps = {
  id: string
}

export function RoutePanel({ id }: RoutePanelProps) {
  const goBack = useMoreSectionBack()
  const initialSnap = useMemo(() => readRouteSheetSnapFromUrl(), [])
  const initialMapFilter = useMemo(() => readRouteMapFilterFromUrl(), [])

  const [mapFilter, setMapFilter] = useState<RouteMapFilter>(initialMapFilter ?? 'all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const showStageBanner = mapFilter !== 'all' && !bannerDismissed

  return (
    <Panel id={id} className="route-screen">
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>Маршрут</PanelHeader>
      <div className="route-screen__viewport">
        <RoutePlaceholder />
        <RouteMapControls
          onFilter={() => setFilterOpen(true)}
          onInfo={() => setInfoOpen(true)}
          onMenu={() => setMenuOpen(true)}
        />
        {showStageBanner && typeof mapFilter === 'number' ? (
          <RouteActiveBanner stageNumber={mapFilter} onDismiss={() => setBannerDismissed(true)} />
        ) : null}
        <RouteSheet mapFilter={mapFilter} initialSnap={initialSnap} />
      </div>
      <RouteFilterSheet
        open={filterOpen}
        value={mapFilter}
        onClose={() => setFilterOpen(false)}
        onChange={(value) => setMapFilter(value)}
      />
      <RouteMapMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <RouteMapInfo open={infoOpen} onClose={() => setInfoOpen(false)} />
    </Panel>
  )
}
