import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Panel, PanelHeader, PanelHeaderBack, Placeholder } from '@vkontakte/vkui'

type InProgressPanelProps = {
  id: string
  title: string
  back?: boolean
}

export function InProgressPanel({ id, title, back = false }: InProgressPanelProps) {
  const routeNavigator = useRouteNavigator()

  return (
    <Panel id={id}>
      <PanelHeader
        before={back ? <PanelHeaderBack onClick={() => void routeNavigator.back()} /> : undefined}
      >
        {title}
      </PanelHeader>
      <Placeholder stretched>в работе</Placeholder>
    </Panel>
  )
}
