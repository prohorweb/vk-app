import { Separator, Subhead, Text, Title } from '@vkontakte/vkui'
import type { RefObject } from 'react'
import { spectatorArrival } from '../../api/mocks/program.ts'
import { ParticipantAvatar } from '../ParticipantAvatar.tsx'
import { SnapSheet } from '../sheet/SnapSheet.tsx'

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso)
  const day = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(
    date,
  )
  const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date)
  return `обновлено ${day} в ${time}`
}

type SpectatorArrivalSheetProps = {
  viewportRef: RefObject<HTMLElement | null>
  headerRef: RefObject<HTMLElement | null>
  hidden?: boolean
}

export function SpectatorArrivalSheet({ viewportRef, headerRef, hidden }: SpectatorArrivalSheetProps) {
  if (hidden) {
    return null
  }

  const peek = (
    <>
      <Title level="3" className="route-sheet__title">
        Ожидаемое прибытие первых участников
      </Title>
      <Separator className="route-sheet__title-separator" />
      <div className="spectator-arrival__head">
        <Text className="spectator-arrival__top-label">Топ-3</Text>
        <Subhead className="spectator-arrival__updated">{formatUpdatedAt(spectatorArrival.updatedAt)}</Subhead>
      </div>
    </>
  )

  return (
    <SnapSheet viewportRef={viewportRef} headerRef={headerRef} peekKey="arrival" peek={peek}>
      {(snap) => {
        if (snap === 'collapsed') {
          return null
        }
        return (
          <ul className="spectator-arrival__list">
            {spectatorArrival.rows.map((row) => (
              <li key={row.participantId} className="spectator-arrival__row">
                <span className="spectator-arrival__place">{row.place}</span>
                <ParticipantAvatar id={row.participantId} name={row.name} />
                <div className="spectator-arrival__body">
                  <Text className="spectator-arrival__name">{row.name}</Text>
                  <Subhead className="spectator-arrival__region">{row.region}</Subhead>
                </div>
                <div className="spectator-arrival__times">
                  <Text className="spectator-arrival__time">{row.time}</Text>
                  {row.gap ? <Text className="spectator-arrival__gap">{row.gap}</Text> : null}
                </div>
              </li>
            ))}
          </ul>
        )
      }}
    </SnapSheet>
  )
}
