import { Picture } from '../Picture.tsx'
import { publicImage } from '../../lib/publicImage.ts'

/** TODO: заменить на MapView (Leaflet не использовать). */
export function RoutePlaceholder() {
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
      <div className="route-placeholder__grid" />
    </div>
  )
}
