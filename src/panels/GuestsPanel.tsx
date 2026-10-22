import { Accordion, Div, Group, Panel, PanelHeader, PanelHeaderBack, Text } from '@vkontakte/vkui'
import { useFaqQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { SectionHero } from '../components/SectionHero.tsx'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'

type GuestsPanelProps = {
  id: string
}

export function GuestsPanel({ id }: GuestsPanelProps) {
  const goBack = useMoreSectionBack()
  const query = useFaqQuery()
  const items = query.data?.items ?? []

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>
        Гостям
      </PanelHeader>
      <SectionHero alt="Иллюстрация раздела для гостей гонки «Авача»" />
      <p className="section-lead">Добро пожаловать на Камчатку!</p>
      <AsyncView
        isLoading={query.isLoading}
        isError={query.isError}
        isEmpty={!query.isLoading && !query.isError && items.length === 0}
        updatedAt={query.dataUpdatedAt}
      >
        <Group>
          {items.map((item) => (
            <Accordion key={item.id} id={`faq-${item.id}`}>
              <Accordion.Summary multiline>{item.question}</Accordion.Summary>
              <Accordion.Content>
                <Div>
                  <Text>{item.answer}</Text>
                </Div>
              </Accordion.Content>
            </Accordion>
          ))}
        </Group>
      </AsyncView>
    </Panel>
  )
}
