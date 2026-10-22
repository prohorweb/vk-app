import { Panel, PanelHeader, PanelHeaderBack, Placeholder } from '@vkontakte/vkui'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { SectionHero } from './SectionHero.tsx'

type InProgressPanelProps = {
  id: string
  title: string
  heroAlt: string
  back?: boolean
}

export function InProgressPanel({ id, title, heroAlt, back = false }: InProgressPanelProps) {
  const goBack = useMoreSectionBack()

  return (
    <Panel id={id}>
      <PanelHeader before={back ? <PanelHeaderBack onClick={goBack} /> : undefined}>
        {title}
      </PanelHeader>
      <SectionHero alt={heroAlt} />
      <Placeholder stretched>в работе</Placeholder>
    </Panel>
  )
}
