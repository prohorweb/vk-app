import { Accordion } from '@vkontakte/vkui'
import type { GuestsTip } from '../api/mocks/guests.ts'
import { GuestsIcon } from './GuestsIcon.tsx'

type GuestsAccordionProps = {
  items: GuestsTip[]
  /** Префикс для id аккордеонов: на экране их может быть несколько групп. */
  idPrefix: string
}

export function GuestsAccordion({ items, idPrefix }: GuestsAccordionProps) {
  return (
    <div className="guests-accordion">
      {items.map((item) => (
        <div key={item.id} className="guests-accordion__item">
          <Accordion id={`${idPrefix}-${item.id}`}>
            <Accordion.Summary multiline before={<GuestsIcon id={item.icon} />}>
              {item.title}
            </Accordion.Summary>
            <Accordion.Content>
              <p className="guests-accordion__text">{item.text}</p>
            </Accordion.Content>
          </Accordion>
        </div>
      ))}
    </div>
  )
}
