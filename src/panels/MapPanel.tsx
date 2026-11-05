import { useMemo, useRef, useState } from 'react'
import { Icon24ErrorCircleOutline } from '@vkontakte/icons'
import { Button, Panel, PanelHeader, Snackbar } from '@vkontakte/vkui'
import { findMapMarker } from '../api/map.ts'
import type { RouteMapFilter } from '../api/mocks/route.ts'
import { showDevScenariosMenu } from '../api/mocks/useMockApi.ts'
import {
  useDisciplinesQuery,
  useFavoriteIdsQuery,
  usePublicStagesQuery,
  useStageCheckpointsQuery,
  useStageMapPositionsQuery,
  useStageTrackQuery,
} from '../api/queries.ts'
import { MapDisciplinePopover } from '../components/map/MapDisciplinePopover.tsx'
import { MapFavoritesPopover } from '../components/map/MapFavoritesPopover.tsx'
import { MapMiniCard } from '../components/map/MapMiniCard.tsx'
import { MapStagePopover } from '../components/map/MapStagePopover.tsx'
import { MapSummarySheet } from '../components/map/MapSummarySheet.tsx'
import { NoticeCard } from '../components/NoticeCard.tsx'
import { RouteMapControls } from '../components/route/RouteMapControls.tsx'
import { RouteMapMenu } from '../components/route/RouteMapMenu.tsx'
import { useOnline } from '../hooks/useOnline.ts'
import { formatFullDateTime } from '../lib/labels.ts'
import { readMapMarkerFromUrl } from '../lib/mapScreenParams.ts'
import { routeStageCheckpoints, routeStageTracks } from '../map/data/route.ts'
import { allRouteCheckpoints } from '../map/routeCheckpoints.ts'
import { MapView } from '../map/MapView.tsx'
import { MAP_TRACK_COLOR, ROUTE_INACTIVE_COLOR } from '../map/yandexColors.ts'
import type { MapViewHandle } from '../map/mapTypes.ts'

type MapPanelProps = {
  id: string
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
  const viewportRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [stageFilter, setStageFilter] = useState<RouteMapFilter>('all')
  const [disciplineId, setDisciplineId] = useState<number | null>(null)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [disciplineFilterOpen, setDisciplineFilterOpen] = useState(false)
  const [favoritesFilterOpen, setFavoritesFilterOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [devNotice, setDevNotice] = useState<string | null>(null)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(() =>
    readMapMarkerFromUrl(),
  )
  const [staleDismissedAt, setStaleDismissedAt] = useState<number | null>(null)
  const online = useOnline()

  const stagesQuery = usePublicStagesQuery()
  const disciplinesQuery = useDisciplinesQuery()
  const favoriteIdsQuery = useFavoriteIdsQuery()
  const disciplines = disciplinesQuery.data ?? []
  const favoriteIds = favoriteIdsQuery.data ?? []
  const activeStageId = useMemo(() => {
    const stages = stagesQuery.data ?? []
    const active = stages.find((stage) => stage.status === 'active')
    return active?.id ?? stages[0]?.id ?? 1
  }, [stagesQuery.data])

  // Публичный API позиций требует stage_id, поэтому «Все этапы» показывает активный этап.
  const stageId = typeof stageFilter === 'number' ? stageFilter : activeStageId
  const positionsQuery = useStageMapPositionsQuery(stageId, disciplineId)
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

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds])

  const participantMarkers = useMemo(() => {
    return (markers ?? [])
      .filter((marker) => !favoritesOnly || favoriteIdSet.has(marker.participantId))
      .map((marker) => ({
        id: marker.id,
        participantId: marker.participantId,
        lng: marker.lng,
        lat: marker.lat,
        status: marker.status,
        bib: marker.bib,
      }))
  }, [markers, favoritesOnly, favoriteIdSet])

  const selectedMarker = useMemo(
    () => (selectedMarkerId ? findMapMarker(markers ?? [], selectedMarkerId) : undefined),
    [markers, selectedMarkerId],
  )

  const favoritesEmptyHint = useMemo(() => {
    if (!favoritesOnly) {
      return null
    }
    if (favoriteIds.length === 0) {
      return {
        title: 'Вы пока ни на кого не подписаны',
        showReset: false,
      }
    }
    if (participantMarkers.length === 0) {
      return {
        title: 'Нет ваших кайюров в этом фильтре',
        showReset: true,
      }
    }
    return null
  }, [favoritesOnly, favoriteIds.length, participantMarkers.length])

  const stale =
    !online ||
    stagesQuery.isError ||
    disciplinesQuery.isError ||
    favoriteIdsQuery.isError ||
    positionsQuery.isError ||
    trackQuery.isError ||
    checkpointsQuery.isError
  const lastUpdatedAt = Math.max(
    stagesQuery.dataUpdatedAt,
    disciplinesQuery.dataUpdatedAt,
    favoriteIdsQuery.dataUpdatedAt,
    positionsQuery.dataUpdatedAt,
    trackQuery.dataUpdatedAt,
    checkpointsQuery.dataUpdatedAt,
  )
  const showStale = stale && lastUpdatedAt > 0 && staleDismissedAt !== lastUpdatedAt

  const closePopovers = () => {
    setFilterOpen(false)
    setDisciplineFilterOpen(false)
    setFavoritesFilterOpen(false)
  }

  return (
    <Panel id={id} className="map-screen">
      <PanelHeader getRootRef={headerRef}>Карта</PanelHeader>
      <div ref={viewportRef} className="map-screen__viewport">
        <MapView
          ref={mapRef}
          tracks={stageTracks}
          checkpoints={checkpoints}
          markers={participantMarkers}
          fitBounds
          fitTo={stageFilter === 'all' ? 'content' : 'markers'}
          fitBottomInset={0.25}
          fitKey={`${stageFilter}:${snapshot?.stageId ?? trackQuery.data?.id ?? ''}`}
          onMarkerClick={(markerId) => setSelectedMarkerId(markerId)}
        />
        <RouteMapControls
          onFilter={() => {
            setFilterOpen((open) => !open)
            setDisciplineFilterOpen(false)
            setFavoritesFilterOpen(false)
          }}
          onFavoritesFilter={() => {
            setFavoritesFilterOpen((open) => !open)
            setFilterOpen(false)
            setDisciplineFilterOpen(false)
          }}
          onDisciplineFilter={() => {
            setDisciplineFilterOpen((open) => !open)
            setFilterOpen(false)
            setFavoritesFilterOpen(false)
          }}
          filterActive={filterOpen}
          favoritesFilterActive={favoritesFilterOpen || favoritesOnly}
          disciplineFilterActive={disciplineFilterOpen || disciplineId !== null}
          onMenu={() => {
            setMenuOpen((open) => !open)
          }}
          menuActive={menuOpen}
          menuPlacement="bottom"
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
        />
        {favoritesEmptyHint ? (
          <div className="map-favorites-hint" role="status">
            <p className="map-favorites-hint__title">{favoritesEmptyHint.title}</p>
            {favoritesEmptyHint.showReset ? (
              <Button
                size="s"
                mode="secondary"
                onClick={() => {
                  setFavoritesOnly(false)
                  closePopovers()
                }}
              >
                Все
              </Button>
            ) : null}
          </div>
        ) : null}
        {selectedMarker ? (
          <MapMiniCard marker={selectedMarker} onClose={() => setSelectedMarkerId(null)} />
        ) : (
          <MapSummarySheet
            filter={stageFilter}
            disciplineId={disciplineId}
            viewportRef={viewportRef}
            headerRef={headerRef}
          />
        )}
        <MapStagePopover
          open={filterOpen}
          value={stageFilter}
          onClose={() => setFilterOpen(false)}
          onChange={(value) => {
            setStageFilter(value)
            setSelectedMarkerId(null)
          }}
        />
        <MapFavoritesPopover
          open={favoritesFilterOpen}
          value={favoritesOnly}
          onClose={() => setFavoritesFilterOpen(false)}
          onChange={(value) => {
            setFavoritesOnly(value)
            setSelectedMarkerId(null)
          }}
        />
        <MapDisciplinePopover
          open={disciplineFilterOpen}
          value={disciplineId}
          disciplines={disciplines}
          onClose={() => setDisciplineFilterOpen(false)}
          onChange={(value) => {
            setDisciplineId(value)
            setSelectedMarkerId(null)
          }}
        />
        <RouteMapMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          variant="popover"
          onDevNotice={showDevScenariosMenu ? setDevNotice : undefined}
        />
      </div>
      {showStale ? (
        <NoticeCard
          icon={<Icon24ErrorCircleOutline />}
          title="Данные не были обновлены"
          text={`Последнее обновление ${formatFullDateTime(lastUpdatedAt)}`}
          onClose={() => setStaleDismissedAt(lastUpdatedAt)}
        />
      ) : null}
      {devNotice ? (
        <Snackbar onClose={() => setDevNotice(null)} onClosed={() => setDevNotice(null)}>
          {devNotice}
        </Snackbar>
      ) : null}
    </Panel>
  )
}
