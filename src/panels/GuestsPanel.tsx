import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Accordion, Div, Group, Panel, PanelHeader, PanelHeaderBack, Text } from '@vkontakte/vkui'
import { useFaqQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'

type GuestsPanelProps = {
  id: string
}

export function GuestsPanel({ id }: GuestsPanelProps) {
  const routeNavigator = useRouteNavigator()
  const query = useFaqQuery()
  const items = query.data?.items ?? []

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => void routeNavigator.back()} />}>
        Гостям
      </PanelHeader>
      <AsyncView
        isLoading={query.isLoading}
        isError={query.isError}
        isEmpty={!query.isLoading && !query.isError && items.length === 0}
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
