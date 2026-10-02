import { SimpleCell } from '@vkontakte/vkui'
import { participantStatusLabel } from '../lib/labels.ts'
import { latestTrackPoint, trackStatusLabel } from '../lib/track.ts'
import type { ParticipantListItem, TrackPoint } from '../types/index.ts'

type ParticipantListProps = {
  participants: ParticipantListItem[]
  points?: TrackPoint[]
  onOpen: (id: number) => void
}

export function ParticipantList({ participants, points, onOpen }: ParticipantListProps) {
  return participants.map((participant) => {
    const point = points ? latestTrackPoint(points, participant.id) : undefined
    const subtitle = points
      ? point
        ? `${point.stageName} · ${trackStatusLabel(point.status)}`
        : 'позиция неизвестна'
      : `№ ${participant.number} · ${participantStatusLabel(participant.status)}`

    return (
      <SimpleCell
        key={participant.id}
        subtitle={subtitle}
        indicator={points ? undefined : participant.supporters_count}
        chevron="always"
        onClick={() => onOpen(participant.id)}
      >
        {participant.name}
      </SimpleCell>
    )
  })
}
