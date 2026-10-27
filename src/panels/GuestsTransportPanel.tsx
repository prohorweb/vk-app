import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import { guestsTransportPhoto, guestsTransportTips } from '../api/mocks/guests.ts'
import { GuestsAccordion } from '../components/GuestsAccordion.tsx'
import { GuestsHero } from '../components/GuestsHero.tsx'
import { TickerDivider } from '../components/TickerDivider.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { PATH } from '../routes.ts'

type GuestsTransportPanelProps = {
  id: string
}

export function GuestsTransportPanel({ id }: GuestsTransportPanelProps) {
  const goBack = useMoreSectionBack(PATH.guests)

  return (
    <Panel id={id} className="guests-screen">
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>Как добраться</PanelHeader>
      <GuestsHero src={guestsTransportPhoto} alt="Упряжка на заснеженном склоне под солнцем" />
      <TickerDivider />
      <GuestsAccordion items={guestsTransportTips} idPrefix="guests-transport" />
    </Panel>
  )
}
