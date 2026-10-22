import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import { SectionHero } from '../components/SectionHero.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'

type AboutPanelProps = {
  id: string
}

export function AboutPanel({ id }: AboutPanelProps) {
  const goBack = useMoreSectionBack()

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>
        О гонке
      </PanelHeader>
      <SectionHero alt="Иллюстрация к разделу о гонке «Авача»" />
      <p className="section-lead">
        «Авача» — всероссийская гонка на длинные дистанции. Маршрут проходит по Камчатке.
      </p>
    </Panel>
  )
}
