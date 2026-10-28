import { useMemo, useRef, useState } from 'react'
import { Panel, PanelHeader, PanelHeaderBack, Subhead } from '@vkontakte/vkui'
import { useSpectatorLocationsQuery } from '../api/queries.ts'
import {
  matchesSpectatorFilter,
  spectatorLocationFilters,
  type SpectatorLocationFilter,
} from '../api/viewerLocations.ts'
import { RouteMapControls } from '../components/route/RouteMapControls.tsx'
import { RouteMapMenu } from '../components/route/RouteMapMenu.tsx'
import { SpectatorArrivalSheet } from '../components/spectator/SpectatorArrivalSheet.tsx'
import { SpectatorLocationCard } from '../components/spectator/SpectatorLocationCard.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import type { MapPlacemark, MapViewHandle } from '../map/mapTypes.ts'
import { MapView } from '../map/MapView.tsx'
import { PATH } from '../routes.ts'

type SpectatorMapPanelProps = {
  id: string
}

export function SpectatorMapPanel({ id }: SpectatorMapPanelProps) {
  const goBack = useMoreSectionBack(PATH.program, { consumeMenuReturn: false })
  const viewportRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapViewHandle>(null)
  const [filter, setFilter] = useState<SpectatorLocationFilter>('all')
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)

  const locationsQuery = useSpectatorLocationsQuery()
  // Стартовая точка (`other`) в макете зрительской карты не показывается.
  const locations = useMemo(
    () => (locationsQuery.data ?? []).filter((location) => location.category !== 'other'),
    [locationsQuery.data],
  )

  // Чипы фильтруют по категории локации из API; kind остаётся для пина на карте.
  const visibleLocations = useMemo(
    () => locations.filter((location) => matchesSpectatorFilter(location.category, filter)),
    [locations, filter],
  )

  const handleFilterChange = (next: SpectatorLocationFilter) => {
    setFilter(next)
    if (next === 'all') {
      setSelectedLocationId(null)
      return
    }
    // При выборе фильтра приближаемся к локации и сразу открываем её карточку.
    const nextVisible = locations.filter((location) =>
      matchesSpectatorFilter(location.category, next),
    )
    setSelectedLocationId(nextVisible[0]?.id ?? null)
  }

  const selectedLocation = locations.find((location) => location.id === selectedLocationId)

  const placemarks = useMemo<MapPlacemark[]>(
    () =>
      visibleLocations.map((location) => ({
        id: location.id,
        lng: location.lng,
        lat: location.lat,
        category: location.category,
        label: location.name,
        selected: location.id === selectedLocationId,
      })),
    [visibleLocations, selectedLocationId],
  )

  return (
    <Panel id={id} className="spectator-map-screen">
      <PanelHeader
        getRootRef={headerRef}
        before={<PanelHeaderBack onClick={goBack} />}
        className="spectator-map-screen__header"
      >
        <span className="spectator-map-screen__header-title">Карта зрительских локаций</span>
      </PanelHeader>
      <div className="spectator-map-screen__filters" role="tablist" aria-label="Фильтр локаций">
        {spectatorLocationFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            className={[
              'spectator-map-screen__filter',
              filter === item.id ? 'spectator-map-screen__filter--active' : '',
            ].join(' ')}
            onClick={() => handleFilterChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div ref={viewportRef} className="spectator-map-screen__viewport">
        <MapView
          ref={mapRef}
          placemarks={placemarks}
          fitBounds
          fitKey={`${filter}:${locations.length}`}
          onPlacemarkClick={setSelectedLocationId}
        />
        {!locationsQuery.isLoading && visibleLocations.length === 0 ? (
          <Subhead className="spectator-map-screen__empty">Площадок пока нет</Subhead>
        ) : null}
        <RouteMapControls
          className="route-map-controls--spectator"
          showInfo={false}
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
          onLocate={() => mapRef.current?.flyToUserLocation()}
          onMenu={() => setMenuOpen((open) => !open)}
          menuActive={menuOpen}
        />
        <SpectatorArrivalSheet
          viewportRef={viewportRef}
          headerRef={headerRef}
          hidden={Boolean(selectedLocation)}
        />
        {selectedLocation ? (
          <SpectatorLocationCard
            location={selectedLocation}
            onClose={() => setSelectedLocationId(null)}
          />
        ) : null}
      </div>
      <RouteMapMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </Panel>
  )
}
