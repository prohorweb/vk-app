import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import { guestsFaqFallback, type GuestsIconId } from '../api/mocks/guests.ts'
import { useFaqQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { GuestsAccordion } from '../components/GuestsAccordion.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import { PATH } from '../routes.ts'

type GuestsFaqPanelProps = {
  id: string
}

/** Иконка строки по категории вопроса: категории приходят из API свободным текстом. */
const faqIcons: Record<string, GuestsIconId> = {
  Транспорт: 'place',
  Безопасность: 'warning',
  Сувениры: 'gift',
  Связь: 'pulse',
  Страховка: 'health',
  Кухня: 'fire',
  Туризм: 'compass',
  Природа: 'sun',
}

function faqIcon(category?: string | null): GuestsIconId {
  if (!category) {
    return 'question'
  }
  return faqIcons[category] ?? 'question'
}

export function GuestsFaqPanel({ id }: GuestsFaqPanelProps) {
  const goBack = useMoreSectionBack(PATH.guests)
  const query = useFaqQuery()
  const apiItems = query.data?.items ?? []
  // Вопросы из API, а при недоступном API — моки.
  const items = query.isError ? guestsFaqFallback : apiItems
  const tips = items.map((item) => ({
    id: String(item.id),
    icon: faqIcon(item.category),
    title: item.question,
    text: item.answer,
  }))

  return (
    <Panel id={id} className="guests-screen">
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>
        Ответы на частые вопросы
      </PanelHeader>
      <AsyncView
        isLoading={query.isLoading}
        isError={query.isError && items.length === 0}
        isEmpty={!query.isLoading && !query.isError && items.length === 0}
        updatedAt={query.dataUpdatedAt}
      >
        <GuestsAccordion items={tips} idPrefix="guests-faq" />
      </AsyncView>
    </Panel>
  )
}
