import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Group, Panel, PanelHeader, SimpleCell } from '@vkontakte/vkui'
import { PATH } from '../routes.ts'

const sections = [
  { path: PATH.route, title: 'Маршрут' },
  { path: PATH.program, title: 'Программа' },
  { path: PATH.news, title: 'Новости' },
  { path: PATH.guests, title: 'Гостям' },
  { path: PATH.profile, title: 'Профиль' },
] as const

type MorePanelProps = {
  id: string
}

export function MorePanel({ id }: MorePanelProps) {
  const routeNavigator = useRouteNavigator()

  return (
    <Panel id={id}>
      <PanelHeader>Ещё</PanelHeader>
      <Group>
        {sections.map((section) => (
          <SimpleCell
            key={section.path}
            chevron="always"
            onClick={() => void routeNavigator.push(section.path)}
          >
            {section.title}
          </SimpleCell>
        ))}
      </Group>
    </Panel>
  )
}
