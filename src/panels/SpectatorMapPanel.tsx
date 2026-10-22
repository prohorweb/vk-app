import { useMemo, useRef, useState } from 'react'
import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import type { SpectatorFilterId } from '../api/mocks/program.ts'
import { spectatorFilters, spectatorLocations } from '../api/mocks/program.ts'
import { RouteMapControls } from '../components/route/RouteMapControls.tsx'
import { RouteMapInfo, RouteMapMenu } from '../components/route/RouteMapMenu.tsx'
import { RoutePlaceholder } from '../components/route/RoutePlaceholder.tsx'
import { SpectatorArrivalSheet } from '../components/spectator/SpectatorArrivalSheet.tsx'
import { SpectatorLocationCard } from '../components/spectator/SpectatorLocationCard.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'

type SpectatorMapPanelProps = {
  id: string
}

export function SpectatorMapPanel({ id }: SpectatorMapPanelProps) {
  const goBack = useMoreSectionBack()
  const viewportRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<SpectatorFilterId>('all')
  const [menuOpen, setMenuOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
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
      >
        {selectedLocation?.title ?? 'Карта зрительских локаций'}
      </PanelHeader>
      <div ref={viewportRef} className="spectator-map-screen__viewport">
        <RoutePlaceholder mapFilter="all" />
        <div className="spectator-map-screen__markers" aria-hidden>
          {visibleLocations.map((location) => (
            <button
              key={location.id}
              type="button"
              className={[
                'spectator-map-marker',
                selectedLocationId === location.id ? 'spectator-map-marker--active' : '',
              ].join(' ')}
              style={{ left: `${location.mapX}%`, top: `${location.mapY}%` }}
              aria-label={location.title}
              onClick={() => setSelectedLocationId(location.id)}
            />
          ))}
        </div>
        <div className="spectator-map-screen__filters" role="tablist">
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
        <RouteMapControls
          onFilter={() => {}}
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
      <RouteMapInfo open={infoOpen} onClose={() => setInfoOpen(false)} />
    </Panel>
  )
}
