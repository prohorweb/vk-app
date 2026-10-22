import { Subhead, Text } from '@vkontakte/vkui'
import type { SpectatorArrivalRow as SpectatorArrivalRowData } from '../../api/mocks/program.ts'
import { ParticipantAvatar } from '../ParticipantAvatar.tsx'

function nameLines(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { first: '', last: '' }
  }
  if (parts.length === 1) {
    return { first: parts[0], last: '' }
  }
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

type SpectatorArrivalRowProps = {
  row: SpectatorArrivalRowData
}

export function SpectatorArrivalRowItem({ row }: SpectatorArrivalRowProps) {
  const { first, last } = nameLines(row.name)

  return (
    <li className="spectator-arrival__row">
      <span className="spectator-arrival__place">{row.place}</span>
      <ParticipantAvatar id={row.participantId} name={row.name} className="spectator-arrival__avatar" />
      <div className="spectator-arrival__body">
        <div className="spectator-arrival__name-lines">
          <span className="spectator-arrival__name-line">{first}</span>
          {last ? <span className="spectator-arrival__name-line">{last}</span> : null}
        </div>
        <Subhead className="spectator-arrival__region">{row.region}</Subhead>
      </div>
      <div className="spectator-arrival__times">
        <Text className="spectator-arrival__time">{row.time}</Text>
        {row.gap ? <Text className="spectator-arrival__gap">{row.gap}</Text> : null}
      </div>
    </li>
  )
}
