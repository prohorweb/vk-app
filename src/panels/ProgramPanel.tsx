import { useState } from 'react'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Icon24FlagStart, Icon24MasksOutline, Icon24PlaceOutline } from '@vkontakte/icons'
import { Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui'
import { useActiveSeasonQuery, usePublicStagesQuery, useScheduleQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { DirectoryStageSelect } from '../components/DirectoryStageSelect.tsx'
import { Picture } from '../components/Picture.tsx'
import { SectionHero } from '../components/SectionHero.tsx'
import { formatDateTime, scheduleKindLabel } from '../lib/labels.ts'
import type { ScheduleKind } from '../types/index.ts'

type ProgramPanelProps = {
  id: string
}

function kindIcon(kind: ScheduleKind) {
  if (kind === 'race') {
    return <Icon24FlagStart />
  }
  if (kind === 'cultural') {
    return <Icon24MasksOutline />
  }
  return <Icon24PlaceOutline />
}

export function ProgramPanel({ id }: ProgramPanelProps) {
  const routeNavigator = useRouteNavigator()
  const [stageId, setStageId] = useState<number | 'all'>('all')
  const seasonQuery = useActiveSeasonQuery()
  const stagesQuery = usePublicStagesQuery()
  const query = useScheduleQuery(stageId === 'all' ? null : stageId)
  const items = query.data?.items ?? []
  const stages = stagesQuery.data ?? []

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={() => void routeNavigator.back()} />}>
        Программа
      </PanelHeader>
      <SectionHero alt="Иллюстрация программы гонки «Авача»" />
      {stages.length > 0 ? (
        <DirectoryStageSelect
          seasonTitle={seasonQuery.data?.title}
          stages={stages}
          value={stageId}
          allowAll
          onChange={setStageId}
        />
      ) : null}
      <AsyncView
        isLoading={query.isLoading}
        isError={query.isError}
        isEmpty={!query.isLoading && !query.isError && items.length === 0}
        updatedAt={query.dataUpdatedAt}
      >
        {items.map((event) => (
          <article key={event.id} className="program-row">
            <Picture
              className="program-row__cover"
              alt={scheduleKindLabel(event.kind)}
              ratio="1 / 1"
              fallback={kindIcon(event.kind)}
            />
            <div className="program-row__body">
              <h3>{event.title}</h3>
              <p>{formatDateTime(event.starts_at)}</p>
              <p>
                {[scheduleKindLabel(event.kind), event.location].filter((part) => part).join(' · ')}
              </p>
            </div>
          </article>
        ))}
      </AsyncView>
    </Panel>
  )
}
