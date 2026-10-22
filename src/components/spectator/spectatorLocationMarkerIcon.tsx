import {
  Icon24CameraOutline,
  Icon24MarketOutline,
  Icon24SmileOutline,
  Icon24SongOutline,
} from '@vkontakte/icons'
import type { SpectatorFilterId } from '../../api/mocks/program.ts'

export function SpectatorLocationMarkerIcon({ filter }: { filter: SpectatorFilterId }) {
  if (filter === 'kids') {
    return <Icon24SmileOutline width={18} height={18} />
  }
  if (filter === 'food') {
    return <Icon24MarketOutline width={18} height={18} />
  }
  if (filter === 'tribune') {
    return <Icon24SongOutline width={18} height={18} />
  }
  if (filter === 'shop') {
    return <Icon24MarketOutline width={18} height={18} />
  }
  return <Icon24CameraOutline width={18} height={18} />
}
