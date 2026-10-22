import type { RouteMapFilter } from '../../api/mocks/route.ts'
import { publicImage } from '../../lib/publicImage.ts'
import { Picture } from '../Picture.tsx'
import { RouteTrackOverlay } from './RouteTrackOverlay.tsx'

type RoutePlaceholderProps = {
  mapFilter: RouteMapFilter
}

/** TODO: заменить на MapView (Leaflet не использовать). */
export function RoutePlaceholder({ mapFilter }: RoutePlaceholderProps) {
  return (
    <div className="route-placeholder" aria-hidden>
      <Picture
        className="route-placeholder__map"
        src={publicImage('map-base.png')}
        alt=""
        ratio="1 / 1"
        fit="cover"
        position="center center"
      />
      <RouteTrackOverlay mapFilter={mapFilter} />
      <div className="route-placeholder__grid" />
    </div>
  )
}
