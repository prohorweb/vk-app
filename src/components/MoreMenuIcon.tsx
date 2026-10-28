import aboutSvg from '../assets/icons/more/about.svg?raw'
import guestsSvg from '../assets/icons/more/guests.svg?raw'
import newsSvg from '../assets/icons/more/news.svg?raw'
import profileSvg from '../assets/icons/more/profile.svg?raw'
import routeSvg from '../assets/icons/more/route.svg?raw'

export type MoreMenuIconId = 'profile' | 'about' | 'route' | 'guests' | 'news'

const icons: Record<MoreMenuIconId, string> = {
  profile: profileSvg,
  about: aboutSvg,
  route: routeSvg,
  guests: guestsSvg,
  news: newsSvg,
}

type MoreMenuIconProps = {
  id: MoreMenuIconId
}

export function MoreMenuIcon({ id }: MoreMenuIconProps) {
  return (
    <span
      className="more-menu-sheet__icon"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: icons[id] }}
    />
  )
}
