import { useState } from 'react'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import {
  Icon16MicrophoneOutline,
  Icon24Cancel,
  Icon24CupOutline,
  Icon24FavoriteOutline,
  Icon24Filter,
} from '@vkontakte/icons'
import { Button, Panel, PanelHeader, Radio, Search } from '@vkontakte/vkui'
import { trackerGap } from '../api/gaps.ts'
import { useDisciplinesQuery, useParticipantsQuery, useStandingsQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { BottomSheet } from '../components/BottomSheet.tsx'
import { ParticipantAvatar } from '../components/ParticipantAvatar.tsx'
import { useDebounced } from '../hooks/useDebounced.ts'
import { formatCount } from '../lib/labels.ts'
import type { DisciplinePublic, ParticipantListItem } from '../types/index.ts'

type ListSort = 'bib' | 'position' | 'supporters'

const sortOptions: { value: ListSort; label: string }[] = [
  { value: 'bib', label: 'По стартовому номеру' },
  { value: 'position', label: 'По позиции в гонке' },
  { value: 'supporters', label: 'По количеству болельщиков' },
]

type Row = ParticipantListItem & {
  racePosition: number | null
}

type ParticipantsPanelProps = {
  id: string
}

/** Имя и фамилия идут отдельными строками, как в макете. */
function splitName(name: string) {
  const [first = '', ...rest] = name.trim().split(/\s+/)
  return { first, rest: rest.join(' ') }
}

function compareRows(left: Row, right: Row, sort: ListSort): number {
  if (sort === 'supporters') {
    return right.supporters_count - left.supporters_count || left.number - right.number
  }
  if (sort === 'position') {
    const leftPosition = left.racePosition ?? Number.POSITIVE_INFINITY
    const rightPosition = right.racePosition ?? Number.POSITIVE_INFINITY
    return leftPosition - rightPosition || left.number - right.number
  }
  return left.number - right.number
}

function groupByDiscipline(
  items: ParticipantListItem[],
  positions: Map<number, number | null>,
  sort: ListSort,
  disciplines: DisciplinePublic[],
) {
  const order = new Map(disciplines.map((item) => [item.id, item.sort_order]))
  const names = new Map(disciplines.map((item) => [item.id, item.name]))
  const groups = new Map<number, { title: string; rows: Row[] }>()
  for (const item of items) {
    const key = item.discipline_id ?? 0
    const gap = trackerGap(item.id, item.dogs_count ?? null)
    const row: Row = {
      ...item,
      racePosition: gap.outcome ? null : (positions.get(item.id) ?? null),
    }
    const group = groups.get(key) ?? {
      title: names.get(key) ?? item.discipline ?? 'Без дисциплины',
      rows: [],
    }
    group.rows.push(row)
    groups.set(key, group)
  }

  return [...groups.entries()]
    .sort(
      ([left], [right]) =>
        (order.get(left) ?? Number.POSITIVE_INFINITY) -
          (order.get(right) ?? Number.POSITIVE_INFINITY) || left - right,
    )
    .map(([, group]) => ({
      ...group,
      rows: [...group.rows].sort((left, right) => compareRows(left, right, sort)),
    }))
}

export function ParticipantsPanel({ id }: ParticipantsPanelProps) {
  const routeNavigator = useRouteNavigator()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ListSort>('bib')
  const [draftSort, setDraftSort] = useState<ListSort>('bib')
  const [disciplineId, setDisciplineId] = useState<number | null>(null)
  const [draftDisciplineId, setDraftDisciplineId] = useState<number | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const debouncedSearch = useDebounced(search, 300)
  const disciplinesQuery = useDisciplinesQuery()
  const disciplines = disciplinesQuery.data ?? []
  const participantsQuery = useParticipantsQuery({ search: debouncedSearch, disciplineId })
  const standingsQuery = useStandingsQuery()
  const participants = participantsQuery.data ?? []
  const positions = new Map(
    (standingsQuery.data?.rows ?? []).map((row) => [row.participant_id, row.position ?? null]),
  )
  const groups = groupByDiscipline(participants, positions, sort, disciplines)
  const isLoading = participantsQuery.isLoading
  const isError = participantsQuery.isError

  return (
    <Panel id={id}>
      <PanelHeader>Участники</PanelHeader>
      <div className="participants-screen">
        <div className="participants-toolbar">
          <div className="participants-search">
            <Search
              value={search}
              placeholder="Поиск"
              onChange={(event) => setSearch(event.target.value)}
            />
            {search ? null : (
              <Icon16MicrophoneOutline
                className="participants-search__mic"
                width={20}
                height={20}
              />
            )}
          </div>
          <Button
            size="l"
            mode="primary"
            className="participants-filter"
            aria-label="Фильтр"
            onClick={() => {
              setDraftSort(sort)
              setDraftDisciplineId(disciplineId)
              setFilterOpen(true)
            }}
          >
            <Icon24Filter />
          </Button>
        </div>
        <AsyncView
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && groups.length === 0}
          updatedAt={participantsQuery.dataUpdatedAt}
        >
          <div className="participants-list">
            {groups.map((group) => (
              <section key={group.title} className="discipline-group">
                <header className="discipline-group__head">
                  <h2 className="discipline-group__title">{group.title}</h2>
                </header>
                <p className="discipline-group__count">Всего участников: {group.rows.length}</p>
                <div className="discipline-group__columns">
                  <span className="discipline-group__column">п/п</span>
                  <span className="discipline-group__column">участник</span>
                  <span className="discipline-group__columns-stats">
                    <span className="discipline-group__column">позиция</span>
                    <span className="discipline-group__column discipline-group__column--secondary">
                      болельщики
                    </span>
                  </span>
                </div>
                <ul className="musher-list">
                  {group.rows.map((row, index) => {
                    const name = splitName(row.name)

                    return (
                      <li key={row.id} className="musher-item">
                        <button
                          type="button"
                          className="musher-row"
                          onClick={() => void routeNavigator.push(`/participants/${row.id}`)}
                        >
                          <span className="musher-row__rank">{index + 1}</span>
                          <ParticipantAvatar
                            className="avatar-40 musher-row__avatar"
                            id={row.id}
                            name={row.name}
                            src={row.photo_url}
                          />
                          <span className="musher-row__main">
                            <span className="musher-row__name">{name.first}</span>
                            <span className="musher-row__surname">
                              <span className="musher-row__surname-text">{name.rest}</span>
                              <span className="bib-badge">#{row.number}</span>
                            </span>
                            {row.region ? (
                              <span className="musher-row__region">{row.region}</span>
                            ) : null}
                          </span>
                          <span className="musher-row__stats">
                            <span className="musher-row__stat">
                              <span className="visually-hidden">Позиция</span>
                              {row.racePosition ?? '—'}
                              <Icon24CupOutline
                                className="musher-row__icon"
                                width={16}
                                height={16}
                              />
                            </span>
                            <span className="musher-row__stat">
                              <span className="visually-hidden">Болельщики</span>
                              {formatCount(row.supporters_count)}
                              <Icon24FavoriteOutline
                                className="musher-row__icon"
                                width={16}
                                height={16}
                              />
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </AsyncView>
      </div>
      <BottomSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        ariaLabel="Фильтр"
        sheetClassName="filter-sheet"
        panelClassName="filter-sheet__panel"
        hideTabbar
      >
        <div className="filter-sheet__head">
          <button
            type="button"
            className="filter-sheet__close"
            aria-label="Закрыть"
            onClick={() => setFilterOpen(false)}
          >
            <Icon24Cancel />
          </button>
          <h2 className="filter-sheet__title">Фильтр</h2>
        </div>
        <div className="filter-sheet__options">
          {sortOptions.map((option) => (
            <Radio
              key={option.value}
              name="participant-sort"
              value={option.value}
              checked={draftSort === option.value}
              onChange={() => setDraftSort(option.value)}
            >
              {option.label}
            </Radio>
          ))}
          <p className="filter-sheet__legend filter-sheet__legend--section">Дисциплина</p>
          <Radio
            name="participant-discipline"
            checked={draftDisciplineId === null}
            onChange={() => setDraftDisciplineId(null)}
          >
            Все дисциплины
          </Radio>
          {disciplines.map((discipline) => (
            <Radio
              key={discipline.id}
              name="participant-discipline"
              checked={draftDisciplineId === discipline.id}
              onChange={() => setDraftDisciplineId(discipline.id)}
            >
              {discipline.name}
            </Radio>
          ))}
        </div>
        <Button
          stretched
          size="l"
          mode="primary"
          onClick={() => {
            setSort(draftSort)
            setDisciplineId(draftDisciplineId)
            setFilterOpen(false)
          }}
        >
          Показать результаты
        </Button>
      </BottomSheet>
    </Panel>
  )
}
