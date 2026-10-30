import { Icon24ChevronRight } from '@vkontakte/icons'
import { ParticipantAvatar } from '../ParticipantAvatar.tsx'
import type { ParticipantListItem } from '../../types/index.ts'

type FavoriteParticipantCellProps = {
  participant: ParticipantListItem
  onOpen: () => void
}

function raceSubtitle(participant: ParticipantListItem): string {
  const discipline = participant.discipline?.trim()
  if (discipline) {
    return discipline.startsWith('Гонка') ? discipline : `Гонка ${discipline}`
  }
  if (participant.dogs_count) {
    return `Гонка · ${participant.dogs_count} соб.`
  }
  return 'Участник гонки'
}

export function FavoriteParticipantCell({ participant, onOpen }: FavoriteParticipantCellProps) {
  return (
    <button type="button" className="profile-favorite-cell" onClick={onOpen}>
      <ParticipantAvatar
        className="profile-favorite-cell__avatar"
        id={participant.id}
        name={participant.name}
        src={participant.photo_url}
      />
      <span className="profile-favorite-cell__text">
        <span className="profile-favorite-cell__name">{participant.name}</span>
        <span className="profile-favorite-cell__bib">Каюр № {participant.number}</span>
        <span className="profile-favorite-cell__race">{raceSubtitle(participant)}</span>
      </span>
      <Icon24ChevronRight className="profile-favorite-cell__chevron" aria-hidden />
    </button>
  )
}
