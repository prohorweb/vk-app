import { useEffect, useState } from 'react'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Icon24Cancel, Icon24ChevronRight, Icon24Filter } from '@vkontakte/icons'
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
    const group = groups.get(key) ?? { title: names.get(key) ?? item.discipline ?? 'Без дисциплины', rows: [] }
    group.rows.push(row)
    groups.set(key, group)
  }

  return [...groups.entries()]
    .sort(([left], [right]) => (order.get(left) ?? Number.POSITIVE_INFINITY) - (order.get(right) ?? Number.POSITIVE_INFINITY) || left - right)
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

  useEffect(() => {
    if (!filterOpen) {
      return
    }
    document.documentElement.classList.add('app-hide-tabbar')
    return () => {
      document.documentElement.classList.remove('app-hide-tabbar')
    }
  }, [filterOpen])

  return (
    <Panel id={id}>
      <PanelHeader>Участники</PanelHeader>
      <div className="participants-toolbar">
        <Search
          value={search}
          placeholder="Поиск по имени"
          onChange={(event) => setSearch(event.target.value)}
        />
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
        {groups.map((group) => (
          <section key={group.title} className="discipline-group">
            <div className="discipline-group__titles">
              <h2 className="discipline-group__title">{group.title}</h2>
              <p className="discipline-group__count">Всего участников: {group.rows.length}</p>
            </div>
            <div className="musher-grid musher-grid--head" aria-hidden>
              <span />
              <span />
              <span />
              <span>позиция</span>
              <span>болельщики</span>
              <span />
            </div>
            {group.rows.map((row, index) => (
              <button
                key={row.id}
                type="button"
                className="musher-row musher-grid"
                onClick={() => void routeNavigator.push(`/participants/${row.id}`)}
              >
                <span className="musher-row__rank">{index + 1}</span>
                <ParticipantAvatar
                  className="avatar-48"
                  id={row.id}
                  name={row.name}
                  src={row.photo_url}
                />
                <span className="musher-row__main">
                  <span className="musher-row__name">{row.name}</span>
                  <span className="musher-row__meta">
                    <span className="bib-badge">#{row.number}</span>
                    {row.region ? <span>{row.region}</span> : null}
                  </span>
                </span>
                <span className="musher-row__stat">
                  <span className="visually-hidden">позиция</span>
                  {row.racePosition ?? '—'}
                </span>
                <span className="musher-row__stat">
                  <span className="visually-hidden">болельщики</span>
                  {formatCount(row.supporters_count)}
                </span>
                <Icon24ChevronRight className="musher-row__chevron" />
              </button>
            ))}
          </section>
        ))}
      </AsyncView>
      <BottomSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        ariaLabel="Фильтр"
        sheetClassName="filter-sheet"
        panelClassName="filter-sheet__panel"
      >
        <div className="filter-sheet__head">
          <h2 className="filter-sheet__title">Фильтр</h2>
          <button
            type="button"
            className="filter-sheet__close"
            aria-label="Закрыть"
            onClick={() => setFilterOpen(false)}
          >
            <Icon24Cancel />
          </button>
        </div>
        <div className="filter-sheet__options">
          <p className="filter-sheet__legend">Сортировка</p>
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
          <p className="filter-sheet__legend">Дисциплина</p>
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
