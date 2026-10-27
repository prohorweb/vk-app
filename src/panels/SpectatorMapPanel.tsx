import { useMemo, useRef, useState } from 'react'
import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import type { SpectatorFilterId } from '../api/mocks/program.ts'
import { spectatorFilters, spectatorLocations } from '../api/mocks/program.ts'
import { RouteMapControls } from '../components/route/RouteMapControls.tsx'
import { RouteMapMenu } from '../components/route/RouteMapMenu.tsx'
import { RoutePlaceholder } from '../components/route/RoutePlaceholder.tsx'
import { SpectatorArrivalSheet } from '../components/spectator/SpectatorArrivalSheet.tsx'
import { SpectatorLocationCard } from '../components/spectator/SpectatorLocationCard.tsx'
import { SpectatorLocationMarkerIcon } from '../components/spectator/spectatorLocationMarkerIcon.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { PATH } from '../routes.ts'

type SpectatorMapPanelProps = {
  id: string
}

export function SpectatorMapPanel({ id }: SpectatorMapPanelProps) {
  const goBack = useMoreSectionBack(PATH.program, { consumeMenuReturn: false })
  const viewportRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<SpectatorFilterId>('all')
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)

  const visibleLocations = useMemo(
    () =>
      spectatorLocations.filter((item) => filter === 'all' || item.filter === filter),
    [filter],
  )
  const selectedLocation = spectatorLocations.find((item) => item.id === selectedLocationId)

  return (
    <Panel id={id} className="spectator-map-screen">
      <PanelHeader
        getRootRef={headerRef}
        before={<PanelHeaderBack onClick={goBack} />}
        className="spectator-map-screen__header"
      >
        {selectedLocation?.title ?? (
          <span className="spectator-map-screen__header-title">Карта зрительских локаций</span>
        )}
      </PanelHeader>
      <div className="spectator-map-screen__filters" role="tablist" aria-label="Фильтр локаций">
        {spectatorFilters.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            className={[
              'spectator-map-screen__filter',
              filter === item.id ? 'spectator-map-screen__filter--active' : '',
            ].join(' ')}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div ref={viewportRef} className="spectator-map-screen__viewport">
        <RoutePlaceholder mapFilter="all" />
        <div className="spectator-map-screen__markers" aria-hidden>
          {visibleLocations.map((location) => (
            <button
              key={location.id}
              type="button"
              className={[
                'spectator-map-marker',
                `spectator-map-marker--${location.filter}`,
                selectedLocationId === location.id ? 'spectator-map-marker--active' : '',
              ].join(' ')}
              style={{ left: `${location.mapX}%`, top: `${location.mapY}%` }}
              aria-label={location.title}
              onClick={() => setSelectedLocationId(location.id)}
            >
              <SpectatorLocationMarkerIcon filter={location.filter} />
            </button>
          ))}
        </div>
        <RouteMapControls
          className="route-map-controls--spectator"
          showInfo={false}
          onFilter={() => {}}
          onMenu={() => setMenuOpen((open) => !open)}
          menuActive={menuOpen}
        />
        <SpectatorArrivalSheet
          viewportRef={viewportRef}
          headerRef={headerRef}
          hidden={Boolean(selectedLocation)}
        />
        {selectedLocation ? (
          <SpectatorLocationCard location={selectedLocation} onClose={() => setSelectedLocationId(null)} />
        ) : null}
      </div>
      <RouteMapMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </Panel>
  )
}
