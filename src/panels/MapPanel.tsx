import { useMemo, useRef, useState } from 'react'
import { Panel, PanelHeader } from '@vkontakte/vkui'
import type { RouteMapFilter } from '../api/mocks/route.ts'
import { findMapPositionMarker } from '../api/mocks/positions.ts'
import { getMapStageCheckpoints, getMapStageTrack } from '../api/mocks/mapStage.ts'
import { useMapPositionsQuery } from '../api/queries.ts'
import { MapMiniCard } from '../components/map/MapMiniCard.tsx'
import { MapPositionBanner } from '../components/map/MapPositionBanner.tsx'
import { RouteFilterSheet } from '../components/route/RouteFilterSheet.tsx'
import { RouteMapControls } from '../components/route/RouteMapControls.tsx'
import { RouteMapInfo, RouteMapMenu } from '../components/route/RouteMapMenu.tsx'
import { formatMapPositionBannerTime } from '../lib/formatMapPositionTime.ts'
import { readMapMarkerFromUrl } from '../lib/mapScreenParams.ts'
import { MapView } from '../map/MapView.tsx'
import type { MapViewHandle } from '../map/mapTypes.ts'

type MapPanelProps = {
  id: string
}

export function MapPanel({ id }: MapPanelProps) {
  const mapRef = useRef<MapViewHandle>(null)
  const [stageFilter, setStageFilter] = useState<RouteMapFilter>(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(() => readMapMarkerFromUrl())

  const positionsQuery = useMapPositionsQuery()
  const snapshot = positionsQuery.data

  const stageId = typeof stageFilter === 'number' ? stageFilter : 1
  const track = getMapStageTrack(stageId)
  const checkpoints = getMapStageCheckpoints(stageId)
  const participantMarkers = useMemo(
    () =>
      (snapshot?.markers ?? []).map((marker) => ({
        id: marker.id,
        participantId: marker.participantId,
        lng: marker.lng,
        lat: marker.lat,
        status: marker.status,
      })),
    [snapshot?.markers],
  )

  const selectedMarker =
    snapshot && selectedMarkerId ? findMapPositionMarker(snapshot, selectedMarkerId) : undefined

  const bannerLabel = snapshot
    ? `Положение на ${formatMapPositionBannerTime(snapshot.updatedAt)}`
    : 'Положение…'

  return (
    <Panel id={id} className="map-screen">
      <PanelHeader>Карта</PanelHeader>
      <div className="map-screen__viewport">
        <MapView
          ref={mapRef}
          track={track}
          checkpoints={checkpoints}
          markers={participantMarkers}
          fitBounds
          onMarkerClick={(markerId) => setSelectedMarkerId(markerId)}
        />
        <MapPositionBanner label={bannerLabel} />
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
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
          onLocate={() => mapRef.current?.flyToUserLocation()}
        />
        {selectedMarker ? (
          <MapMiniCard marker={selectedMarker} onClose={() => setSelectedMarkerId(null)} />
        ) : null}
      </div>
      <RouteFilterSheet
        open={filterOpen}
        value={stageFilter}
        onClose={() => setFilterOpen(false)}
        onChange={(value) => setStageFilter(value)}
      />
      <RouteMapMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <RouteMapInfo open={infoOpen} onClose={() => setInfoOpen(false)} />
    </Panel>
  )
}
