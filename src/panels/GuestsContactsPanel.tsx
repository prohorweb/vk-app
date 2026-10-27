import { Icon24ChevronRight } from '@vkontakte/icons'
import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import { guestsContacts, guestsContactsPhoto } from '../api/mocks/guests.ts'
import { GuestsHero } from '../components/GuestsHero.tsx'
import { GuestsIcon } from '../components/GuestsIcon.tsx'
import { TickerDivider } from '../components/TickerDivider.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { PATH } from '../routes.ts'

type GuestsContactsPanelProps = {
  id: string
}

export function GuestsContactsPanel({ id }: GuestsContactsPanelProps) {
  const goBack = useMoreSectionBack(PATH.guests, { consumeMenuReturn: false })

  return (
    <Panel id={id} className="guests-screen">
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>Контакты</PanelHeader>
      <GuestsHero src={guestsContactsPhoto} alt="Участники и организаторы на стартовой площадке" />
      <TickerDivider />
      {guestsContacts.map((group) => (
        <section key={group.id} className="guests-contacts">
          <h3 className="guests-contacts__title">{group.title}</h3>
          <div className="guests-contacts__card">
            {group.items.map((item) => (
              <a
                key={item.id}
                className="guests-contact"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GuestsIcon id={item.icon} />
                <span className="guests-contact__text">
                  <span className="guests-contact__title">{item.title}</span>
                  <span className="guests-contact__subtitle">{item.subtitle}</span>
                </span>
                <Icon24ChevronRight className="guests-contact__chevron" aria-hidden />
              </a>
            ))}
          </div>
        </section>
      ))}
    </Panel>
  )
}
