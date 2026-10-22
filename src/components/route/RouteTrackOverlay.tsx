import type { RouteMapFilter } from '../../api/mocks/route.ts'
import { routeMapMarkers, routeTrackFullPath, routeTrackStagePaths } from '../../api/mocks/route.ts'

type RouteTrackOverlayProps = {
  mapFilter: RouteMapFilter
}

export function RouteTrackOverlay({ mapFilter }: RouteTrackOverlayProps) {
  const stagePath = typeof mapFilter === 'number' ? routeTrackStagePaths[mapFilter] : null

  return (
    <svg
      className="route-track-overlay"
      viewBox="0 0 360 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <path d={routeTrackFullPath} className="route-track-overlay__full" fill="none" />
      {stagePath ? <path d={stagePath} className="route-track-overlay__stage" fill="none" /> : null}
      {routeMapMarkers.map((marker) => (
        <g key={marker.id} transform={`translate(${marker.x} ${marker.y})`}>
          {marker.kind === 'start' || marker.kind === 'finish' ? (
            <circle r={7} className={`route-track-overlay__marker route-track-overlay__marker--${marker.kind}`} />
          ) : (
            <rect
              x={-6}
              y={-6}
              width={12}
              height={12}
              rx={2}
              className="route-track-overlay__marker route-track-overlay__marker--checkpoint"
            />
          )}
        </g>
      ))}
    </svg>
  )
}
