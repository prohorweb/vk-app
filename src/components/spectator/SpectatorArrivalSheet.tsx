import { Separator, Subhead, Title } from '@vkontakte/vkui'
import type { RefObject } from 'react'
import { spectatorArrival } from '../../api/mocks/program.ts'
import { SnapSheet } from '../sheet/SnapSheet.tsx'
import { SpectatorArrivalRowItem } from './SpectatorArrivalRow.tsx'

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

  const updatedLabel = formatUpdatedAt(spectatorArrival.updatedAt)

  const peek = (
    <>
      <Title level="3" className="route-sheet__title">
        Ожидаемое прибытие первых участников
      </Title>
      <Separator className="route-sheet__title-separator" />
      <Subhead className="spectator-arrival__peek-meta">
        Топ-3 · {updatedLabel}
      </Subhead>
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
              <SpectatorArrivalRowItem key={row.participantId} row={row} />
            ))}
          </ul>
        )
      }}
    </SnapSheet>
  )
}
