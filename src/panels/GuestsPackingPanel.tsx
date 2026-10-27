import { useState } from 'react'
import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import { guestsPackingTabs, type GuestsPackingTab } from '../api/mocks/guests.ts'
import { GuestsHero } from '../components/GuestsHero.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { PATH } from '../routes.ts'

type GuestsPackingPanelProps = {
  id: string
}

export function GuestsPackingPanel({ id }: GuestsPackingPanelProps) {
  const goBack = useMoreSectionBack(PATH.guests)
  const [tabId, setTabId] = useState<GuestsPackingTab['id']>('clothes')
  const tab = guestsPackingTabs.find((item) => item.id === tabId) ?? guestsPackingTabs[0]

  return (
    <Panel id={id} className="guests-screen">
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>Что взять с собой</PanelHeader>
      <div className="packing-tabs" role="tablist" aria-label="Что взять с собой">
        {guestsPackingTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === tabId}
            className={['packing-tabs__item', item.id === tabId ? 'packing-tabs__item--active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setTabId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <GuestsHero src={tab.photo} alt={`Фото для раздела «${tab.label}»`} />
      <div className="packing-items">
        {tab.items.map((item) => (
          <div key={item.id} className="packing-item">
            <h3 className="packing-item__title">{item.title}</h3>
            <p className="packing-item__text">{item.text}</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}
