import { SimpleCell } from '@vkontakte/vkui'
import { latestTrackPoint, trackStatusLabel } from '../lib/track.ts'
import type { Participant, Stage, TrackPoint } from '../types/index.ts'

type ParticipantListProps = {
  participants: Participant[]
  stages?: Stage[]
  points?: TrackPoint[]
  onOpen: (id: string) => void
}

export function ParticipantList({ participants, stages, points, onOpen }: ParticipantListProps) {
  return participants.map((participant) => {
    const point = points ? latestTrackPoint(points, participant.id) : undefined
    const stage = stages?.find((item) => item.id === point?.stageId)
    const subtitle = points
      ? point
        ? `${stage?.name ?? 'этап'} · ${trackStatusLabel(point.status)}`
        : 'позиция неизвестна'
      : `№ ${participant.bib}`

    return (
      <SimpleCell
        key={participant.id}
        subtitle={subtitle}
        chevron="always"
        onClick={() => onOpen(participant.id)}
      >
        {participant.name}
      </SimpleCell>
    )
  })
}
