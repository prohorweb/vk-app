import { useMemo, useRef, useState } from 'react'
import { Panel, PanelHeader } from '@vkontakte/vkui'
import { findMapMarker } from '../api/map.ts'
import type { RouteMapFilter } from '../api/mocks/route.ts'
import {
  usePublicStagesQuery,
  useStageCheckpointsQuery,
  useStageMapPositionsQuery,
  useStageTrackQuery,
} from '../api/queries.ts'
import { MapMiniCard } from '../components/map/MapMiniCard.tsx'
import { MapPositionBanner } from '../components/map/MapPositionBanner.tsx'
import { RouteFilterSheet } from '../components/route/RouteFilterSheet.tsx'
import { RouteMapControls } from '../components/route/RouteMapControls.tsx'
import { RouteMapInfo, RouteMapMenu } from '../components/route/RouteMapMenu.tsx'
import { formatMapPositionTime } from '../lib/formatMapPositionTime.ts'
import { readMapMarkerFromUrl } from '../lib/mapScreenParams.ts'
import { routeStageCheckpoints, routeStageTracks } from '../map/data/route.ts'
import { allRouteCheckpoints } from '../map/routeCheckpoints.ts'
import { MapView } from '../map/MapView.tsx'
import { MAP_TRACK_COLOR, ROUTE_INACTIVE_COLOR } from '../map/yandexColors.ts'
import type { MapPositionsSnapshot, MapViewHandle } from '../map/mapTypes.ts'

type MapPanelProps = {
  id: string
}

function describePositionsBanner(
  snapshot: MapPositionsSnapshot | undefined,
  failed: boolean,
): string {
  if (!snapshot) {
    return failed ? 'Положение недоступно' : 'Положение…'
  }
  if (snapshot.updatedAt === null) {
    return snapshot.source === 'mock' ? 'Демо-данные' : 'Нет отметок'
  }
  const time = formatMapPositionTime(snapshot.updatedAt)
  if (snapshot.source === 'mock') {
    return `Положение на ${time} · демо-данные`
  }
  const stale =
    snapshot.markers.length > 0 && snapshot.markers.every((marker) => marker.status === 'stale')
  return stale ? `Положение на ${time} · данные устарели` : `Положение на ${time}`
}

/** API может отдать трек другого региона — сверяем начало нитки с маршрутом этапа. */
function isTrackNearRoute(apiTrack: [number, number][], routeTrack: [number, number][]): boolean {
  const apiStart = apiTrack[0]
  const routeStart = routeTrack[0]
  if (!apiStart || !routeStart) {
    return false
  }
  return Math.abs(apiStart[0] - routeStart[0]) < 0.5 && Math.abs(apiStart[1] - routeStart[1]) < 0.5
}

export function MapPanel({ id }: MapPanelProps) {
  const mapRef = useRef<MapViewHandle>(null)
  const [stageFilter, setStageFilter] = useState<RouteMapFilter>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(() =>
    readMapMarkerFromUrl(),
  )

  const stagesQuery = usePublicStagesQuery()
  const activeStageId = useMemo(() => {
    const stages = stagesQuery.data ?? []
    const active = stages.find((stage) => stage.status === 'active')
    return active?.id ?? stages[0]?.id ?? 1
  }, [stagesQuery.data])

  // Публичный API позиций требует stage_id, поэтому «Все этапы» показывает активный этап.
  const stageId = typeof stageFilter === 'number' ? stageFilter : activeStageId
  const positionsQuery = useStageMapPositionsQuery(stageId)
  const trackQuery = useStageTrackQuery(stageId)
  const checkpointsQuery = useStageCheckpointsQuery(stageId)

  const snapshot = positionsQuery.data
  const markers = snapshot?.markers
  const stageNumber = typeof stageFilter === 'number' ? stageFilter : null
  // «Все этапы» показывает КП всего маршрута, как на экране «Маршрут».
  const checkpoints = useMemo(() => {
    if (stageNumber === null) {
      return allRouteCheckpoints()
    }
    const apiCheckpoints = checkpointsQuery.data
    if (apiCheckpoints?.length) {
      return apiCheckpoints
    }
    return routeStageCheckpoints[stageNumber] ?? []
  }, [stageNumber, checkpointsQuery.data])

  // «Все этапы» — весь маршрут красным, выбранный этап толще, остальные жёлтые.
  // Геометрию выбранного этапа берём из API, если он её отдал.
  const stageTracks = useMemo(() => {
    const tracks = routeStageTracks.map((track, index) => {
      const selected = stageNumber === index + 1
      const all = stageNumber === null
      const apiTrack = selected ? trackQuery.data?.coordinates : undefined
      return {
        ...track,
        selected,
        coordinates:
          apiTrack && isTrackNearRoute(apiTrack, track.coordinates) ? apiTrack : track.coordinates,
        color: all || selected ? MAP_TRACK_COLOR : ROUTE_INACTIVE_COLOR,
        width: all ? 3 : selected ? 4 : 2,
      }
    })
    // Выбранный этап рисуем последним, иначе общий маршрут перекрывает его.
    return tracks.sort((left, right) => Number(left.selected) - Number(right.selected))
  }, [stageNumber, trackQuery.data])

  const participantMarkers = useMemo(
    () =>
      (markers ?? []).map((marker) => ({
        id: marker.id,
        participantId: marker.participantId,
        lng: marker.lng,
        lat: marker.lat,
        status: marker.status,
        bib: marker.bib,
      })),
    [markers],
  )

  const selectedMarker = useMemo(
    () => (selectedMarkerId ? findMapMarker(markers ?? [], selectedMarkerId) : undefined),
    [markers, selectedMarkerId],
  )

  const bannerLabel = describePositionsBanner(snapshot, positionsQuery.isError)

  return (
    <Panel id={id} className="map-screen">
      <PanelHeader>Карта</PanelHeader>
      <div className="map-screen__viewport">
        <MapView
          ref={mapRef}
          tracks={stageTracks}
          checkpoints={checkpoints}
          markers={participantMarkers}
          fitBounds
          fitKey={snapshot?.stageId ?? trackQuery.data?.id}
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
