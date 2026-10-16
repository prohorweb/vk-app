import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import { SectionHero } from '../components/SectionHero.tsx'

type AboutPanelProps = {
  id: string
}

export function AboutPanel({ id }: AboutPanelProps) {
  const routeNavigator = useRouteNavigator()

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => void routeNavigator.back()} />}>
        О гонке
      </PanelHeader>
      <SectionHero alt="Иллюстрация к разделу о гонке «Авача»" />
      <p className="section-lead">
        «Авача» — всероссийская гонка на длинные дистанции. Маршрут проходит по Камчатке.
      </p>
    </Panel>
  )
}
