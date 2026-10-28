import mapSvg from '../assets/icons/tabbar/map.svg?raw'
import moreSvg from '../assets/icons/tabbar/more.svg?raw'
import participantsSvg from '../assets/icons/tabbar/participants.svg?raw'
import programSvg from '../assets/icons/tabbar/program.svg?raw'
import resultsSvg from '../assets/icons/tabbar/results.svg?raw'

export type TabbarIconId = 'map' | 'participants' | 'results' | 'program' | 'more'

const icons: Record<TabbarIconId, string> = {
  map: mapSvg,
  participants: participantsSvg,
  results: resultsSvg,
  program: programSvg,
  more: moreSvg,
}

type TabbarIconProps = {
  id: TabbarIconId
}

export function TabbarIcon({ id }: TabbarIconProps) {
  return (
    <span
      className="app-tabbar__icon"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: icons[id] }}
    />
  )
}
