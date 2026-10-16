import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Panel, PanelHeader, PanelHeaderBack, Placeholder } from '@vkontakte/vkui'
import { SectionHero } from './SectionHero.tsx'

type InProgressPanelProps = {
  id: string
  title: string
  heroAlt: string
  back?: boolean
}

export function InProgressPanel({ id, title, heroAlt, back = false }: InProgressPanelProps) {
  const routeNavigator = useRouteNavigator()

  return (
    <Panel id={id}>
      <PanelHeader
        before={back ? <PanelHeaderBack onClick={() => void routeNavigator.back()} /> : undefined}
      >
        {title}
      </PanelHeader>
      <SectionHero alt={heroAlt} />
      <Placeholder stretched>в работе</Placeholder>
    </Panel>
  )
}
