import { useMemo, useRef, useState } from 'react'
import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import type { RouteMapFilter } from '../api/mocks/route.ts'
import { RouteActiveBanner } from '../components/route/RouteActiveBanner.tsx'
import { RouteFilterSheet } from '../components/route/RouteFilterSheet.tsx'
import { RouteMapControls } from '../components/route/RouteMapControls.tsx'
import { RouteMapInfo, RouteMapMenu } from '../components/route/RouteMapMenu.tsx'
import { RouteSheet } from '../components/route/RouteSheet.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { readRouteMapFilterFromUrl, readRouteSheetSnapFromUrl } from '../lib/routeScreenParams.ts'
import { routeStageCheckpoints, routeStageTracks } from '../map/data/route.ts'
import type { MapViewHandle } from '../map/mapTypes.ts'
import { MapView } from '../map/MapView.tsx'
import { allRouteCheckpoints } from '../map/routeCheckpoints.ts'
import { MAP_TRACK_COLOR, ROUTE_INACTIVE_COLOR } from '../map/yandexColors.ts'

type RoutePanelProps = {
  id: string
}

export function RoutePanel({ id }: RoutePanelProps) {
  const goBack = useMoreSectionBack()
  const mapRef = useRef<MapViewHandle>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const initialSnap = useMemo(() => readRouteSheetSnapFromUrl(), [])
  const initialMapFilter = useMemo(() => readRouteMapFilterFromUrl(), [])

  const [mapFilter, setMapFilter] = useState<RouteMapFilter>(initialMapFilter ?? 'all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const showStageBanner = mapFilter !== 'all' && !bannerDismissed

  // Геометрия — те же этапы, что рисует главный экран: все этапы красным,
  // выбранный этап толще, остальные остаются жёлтыми.
  const stageTracks = useMemo(() => {
    const tracks = routeStageTracks.map((track, index) => {
      const selected = mapFilter === index + 1
      const all = mapFilter === 'all'
      return {
        ...track,
        selected,
        color: all || selected ? MAP_TRACK_COLOR : ROUTE_INACTIVE_COLOR,
        width: all ? 3 : selected ? 4 : 2,
      }
    })
    // Выбранный этап рисуем последним, иначе общий маршрут перекрывает его.
    return tracks.sort((left, right) => Number(left.selected) - Number(right.selected))
  }, [mapFilter])

  const checkpoints = useMemo(
    () => (mapFilter === 'all' ? allRouteCheckpoints() : (routeStageCheckpoints[mapFilter] ?? [])),
    [mapFilter],
  )

  return (
    <Panel id={id} className="route-screen">
      <PanelHeader getRootRef={headerRef} before={<PanelHeaderBack onClick={goBack} />}>
        Маршрут
      </PanelHeader>
      <div ref={viewportRef} className="route-screen__viewport">
        <MapView
          ref={mapRef}
          tracks={stageTracks}
          checkpoints={checkpoints}
          fitBounds
          fitKey={String(mapFilter)}
        />
        <RouteMapControls
          onFilter={() => setFilterOpen(true)}
          onInfo={() => {
            setInfoOpen((open) => !open)
            setMenuOpen(false)
          }}
          onMenu={() => {
            setMenuOpen((open) => !open)
            setInfoOpen(false)
          }}
          infoActive={infoOpen}
          menuActive={menuOpen}
          filterActive={filterOpen}
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
          onLocate={() => mapRef.current?.flyToUserLocation()}
        />
        {showStageBanner && typeof mapFilter === 'number' ? (
          <RouteActiveBanner stageNumber={mapFilter} onDismiss={() => setBannerDismissed(true)} />
        ) : null}
        <RouteSheet
          mapFilter={mapFilter}
          initialSnap={initialSnap}
          viewportRef={viewportRef}
          headerRef={headerRef}
        />
      </div>
      <RouteFilterSheet
        open={filterOpen}
        value={mapFilter}
        onClose={() => setFilterOpen(false)}
        onChange={(value) => {
          setMapFilter(value)
          setBannerDismissed(false)
        }}
      />
      <RouteMapMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <RouteMapInfo open={infoOpen} onClose={() => setInfoOpen(false)} />
    </Panel>
  )
}
