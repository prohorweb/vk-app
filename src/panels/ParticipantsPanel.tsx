import { useState } from 'react'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { FormItem, Group, Panel, PanelHeader, Search, Select } from '@vkontakte/vkui'
import { useParticipantsQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { ParticipantList } from '../components/ParticipantList.tsx'
import { useDebounced } from '../hooks/useDebounced.ts'
import { participantSorts, type ParticipantSort } from '../types/index.ts'

const sortLabels: Record<ParticipantSort, string> = {
  bib: 'Номер',
  name: 'Имя',
  supporters: 'Болельщики',
}

type ParticipantsPanelProps = {
  id: string
}

export function ParticipantsPanel({ id }: ParticipantsPanelProps) {
  const routeNavigator = useRouteNavigator()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ParticipantSort>('bib')
  const debouncedSearch = useDebounced(search, 300)
  const query = useParticipantsQuery({ search: debouncedSearch, sort })
  const participants = query.data ?? []

  return (
    <Panel id={id}>
      <PanelHeader>Участники</PanelHeader>
      <Search
        value={search}
        placeholder="Поиск по имени"
        onChange={(event) => setSearch(event.target.value)}
      />
      <FormItem top="Сортировка">
        <Select
          value={sort}
          options={participantSorts.map((value) => ({
            label: sortLabels[value],
            value,
          }))}
          onChange={(event) => {
            const value = event.target.value
            if (value === 'bib' || value === 'name' || value === 'supporters') {
              setSort(value)
            }
          }}
        />
      </FormItem>
      <Group>
        <AsyncView
          isLoading={query.isLoading}
          isError={query.isError}
          isEmpty={!query.isLoading && !query.isError && participants.length === 0}
        >
          <ParticipantList
            participants={participants}
            onOpen={(participantId) => void routeNavigator.push(`/participants/${participantId}`)}
          />
        </AsyncView>
      </Group>
    </Panel>
  )
}
