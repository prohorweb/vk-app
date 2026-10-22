import { useState } from 'react'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Group, Header, Panel, PanelHeader, SimpleCell, Tabs, TabsItem } from '@vkontakte/vkui'
import { useActiveSeasonQuery, useParticipantsQuery, useProtocolsQuery, usePublicStagesQuery, useStandingsQuery } from '../api/queries.ts'
import { AsyncView } from '../components/AsyncView.tsx'
import { DirectoryStageSelect } from '../components/DirectoryStageSelect.tsx'
import { ParticipantAvatar } from '../components/ParticipantAvatar.tsx'
import { Picture } from '../components/Picture.tsx'
import { formatDuration, publicationLabel } from '../lib/labels.ts'
import type { StageProtocol, StageProtocolRow, StandingRow } from '../types/index.ts'

type ResultsTab = 'standings' | 'protocol'

type ResultsPanelProps = {
  id: string
}

function rowNotes(penaltySeconds: number, stopSeconds: number): string | undefined {
  const notes = [
    penaltySeconds > 0 ? `штраф ${formatDuration(penaltySeconds)}` : null,
    stopSeconds > 0 ? `остановка ${formatDuration(stopSeconds)}` : null,
  ].filter((note) => note !== null)
  return notes.length > 0 ? notes.join(' · ') : undefined
}

function ResultRow({
  position,
  name,
  number,
  photoUrl,
  timeSeconds,
  penaltySeconds,
  stopSeconds,
  onOpen,
  participantId,
}: {
  position: number | null | undefined
  name: string
  number: number
  photoUrl?: string | null
  participantId: number
  timeSeconds: number | null | undefined
  penaltySeconds: number
  stopSeconds: number
  onOpen: () => void
}) {
  return (
    <SimpleCell
      before={
        <span className="result-row__before">
          <span className="result-row__position">{position ?? '—'}</span>
          <ParticipantAvatar className="avatar-32" id={participantId} name={name} src={photoUrl} />
        </span>
      }
      subtitle={`№ ${number}`}
      extraSubtitle={rowNotes(penaltySeconds, stopSeconds)}
      indicator={formatDuration(timeSeconds)}
      chevron="always"
      onClick={onOpen}
    >
      {name}
    </SimpleCell>
  )
}

function standingRowProps(row: StandingRow) {
  return {
    position: row.position,
    name: row.participant_name,
    number: row.participant_number,
    timeSeconds: row.final_time_seconds,
    penaltySeconds: row.total_penalty_seconds,
    stopSeconds: row.total_mandatory_stop_seconds,
    participantId: row.participant_id,
  }
}

function protocolRowProps(row: StageProtocolRow) {
  return {
    position: row.position,
    name: row.participant_name,
    number: row.participant_number,
    timeSeconds: row.final_time_seconds,
    penaltySeconds: row.total_penalty_seconds,
    stopSeconds: row.total_mandatory_stop_seconds,
    participantId: row.participant_id,
  }
}

export function ResultsPanel({ id }: ResultsPanelProps) {
  const routeNavigator = useRouteNavigator()
  const [tab, setTab] = useState<ResultsTab>('standings')
  const [stageId, setStageId] = useState<number | null>(null)
  const seasonQuery = useActiveSeasonQuery()
  const stagesQuery = usePublicStagesQuery()
  const standingsQuery = useStandingsQuery()
  const protocolsQuery = useProtocolsQuery()
  const participantsQuery = useParticipantsQuery()
  const photos = new Map(
    (participantsQuery.data ?? []).map((item) => [item.id, item.photo_url ?? null]),
  )
  const rows = standingsQuery.data?.rows ?? []
  const protocols = protocolsQuery.data ?? []
  const protocol = protocols.find((item) => item.stage_id === stageId) ?? protocols[0]

  const openParticipant = (participantId: number) => {
    void routeNavigator.push(`/participants/${participantId}`)
  }

  return (
    <Panel id={id}>
      <PanelHeader>Результаты</PanelHeader>
      <Tabs>
        <TabsItem selected={tab === 'standings'} onClick={() => setTab('standings')}>
          Сводная
        </TabsItem>
        <TabsItem selected={tab === 'protocol'} onClick={() => setTab('protocol')}>
          Протокол
        </TabsItem>
      </Tabs>
      {tab === 'standings' ? (
        <Group>
          <Picture alt="Обложка сводной таблицы результатов" ratio="3 / 1" />
          <AsyncView
            isLoading={standingsQuery.isLoading}
            isError={standingsQuery.isError}
            isEmpty={!standingsQuery.isLoading && !standingsQuery.isError && rows.length === 0}
            updatedAt={standingsQuery.dataUpdatedAt}
          >
            {rows.map((row) => {
              const props = standingRowProps(row)
              return (
                <ResultRow
                  key={props.participantId}
                  {...props}
                  photoUrl={photos.get(props.participantId)}
                  onOpen={() => openParticipant(props.participantId)}
                />
              )
            })}
          </AsyncView>
        </Group>
      ) : (
        <ProtocolTab
          isLoading={seasonQuery.isLoading || stagesQuery.isLoading || protocolsQuery.isLoading}
          isError={seasonQuery.isError || stagesQuery.isError || protocolsQuery.isError}
          updatedAt={protocolsQuery.dataUpdatedAt}
          seasonTitle={seasonQuery.data?.title}
          protocols={protocols}
          protocol={protocol}
          onStageChange={setStageId}
          onOpen={openParticipant}
          photos={photos}
        />
      )}
    </Panel>
  )
}

function ProtocolTab({
  isLoading,
  isError,
  updatedAt,
  seasonTitle,
  protocols,
  protocol,
  onStageChange,
  onOpen,
  photos,
}: {
  isLoading: boolean
  isError: boolean
  updatedAt: number
  seasonTitle?: string
  protocols: StageProtocol[]
  protocol: StageProtocol | undefined
  onStageChange: (stageId: number) => void
  onOpen: (participantId: number) => void
  photos: Map<number, string | null>
}) {
  return (
    <Group
      header={
        protocol ? (
          <Header subtitle={publicationLabel(protocol.publication)}>{protocol.stage_name}</Header>
        ) : undefined
      }
    >
      {protocol ? (
        <Picture
          className="results-cover"
          alt={`Обложка этапа «${protocol.stage_name}»`}
          ratio="3 / 1"
        />
      ) : null}
      {protocols.length > 0 ? (
        <DirectoryStageSelect
          seasonTitle={seasonTitle}
          stages={protocols.map((item) => ({ id: item.stage_id, name: item.stage_name }))}
          value={protocol?.stage_id ?? protocols[0].stage_id}
          onChange={(next) => {
            if (next !== 'all') {
              onStageChange(next)
            }
          }}
        />
      ) : null}
      <AsyncView
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && (protocol?.rows.length ?? 0) === 0}
        updatedAt={updatedAt}
      >
        {protocol?.rows.map((row) => {
          const props = protocolRowProps(row)
          return (
            <ResultRow
              key={props.participantId}
              {...props}
              photoUrl={photos.get(props.participantId)}
              onOpen={() => onOpen(props.participantId)}
            />
          )
        })}
      </AsyncView>
    </Group>
  )
}
