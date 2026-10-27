import { Icon24ChevronRight } from '@vkontakte/icons'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import { guestsCards, guestsHero, type GuestsCard } from '../api/mocks/guests.ts'
import { GuestsHero } from '../components/GuestsHero.tsx'
import { GuestsIcon } from '../components/GuestsIcon.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { PATH } from '../routes.ts'

type GuestsPanelProps = {
  id: string
}

const guestsPaths: Record<GuestsCard['id'], string> = {
  transport: PATH.guestsTransport,
  packing: PATH.guestsPacking,
  safety: PATH.guestsSafety,
  faq: PATH.guestsFaq,
  contacts: PATH.guestsContacts,
}

export function GuestsPanel({ id }: GuestsPanelProps) {
  const goBack = useMoreSectionBack()
  const routeNavigator = useRouteNavigator()

  return (
    <Panel id={id} className="guests-screen">
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>Гостям</PanelHeader>
      <GuestsHero
        src={guestsHero}
        alt="Упряжка на заснеженной равнине на фоне камчатских гор"
        title="Добро пожаловать на Камчатку!"
      />
      <div className="guests-list">
        {guestsCards.map((card) => (
          <button
            key={card.id}
            type="button"
            className="guests-list__card"
            onClick={() => void routeNavigator.push(guestsPaths[card.id])}
          >
            <GuestsIcon id={card.icon} tone="brand" />
            <span className="guests-list__text">
              <span className="guests-list__title">{card.title}</span>
              <span className="guests-list__subtitle">{card.subtitle}</span>
            </span>
            <Icon24ChevronRight className="guests-list__chevron" aria-hidden />
          </button>
        ))}
      </div>
    </Panel>
  )
}
