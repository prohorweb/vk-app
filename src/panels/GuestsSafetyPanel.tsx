import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import { guestsSafetyPhoto, guestsSafetyTips } from '../api/mocks/guests.ts'
import { GuestsAccordion } from '../components/GuestsAccordion.tsx'
import { GuestsHero } from '../components/GuestsHero.tsx'
import { TickerDivider } from '../components/TickerDivider.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { PATH } from '../routes.ts'

type GuestsSafetyPanelProps = {
  id: string
}

export function GuestsSafetyPanel({ id }: GuestsSafetyPanelProps) {
  const goBack = useMoreSectionBack(PATH.guests)

  return (
    <Panel id={id} className="guests-screen">
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>Безопасность зимой</PanelHeader>
      <GuestsHero src={guestsSafetyPhoto} alt="Собачья упряжка в зимнем лесу у незамёрзшей реки" />
      <TickerDivider />
      <GuestsAccordion items={guestsSafetyTips} idPrefix="guests-safety" />
    </Panel>
  )
}
