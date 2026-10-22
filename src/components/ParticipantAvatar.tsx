import { Picture } from './Picture.tsx'

type Look = {
  background: string
  skin: string
  hair: string
  shirt: string
  hairStyle: 0 | 1 | 2
}

const LOOKS: Look[] = [
  { background: '#045890', skin: '#F3C7A6', hair: '#2A211B', shirt: '#083458', hairStyle: 0 },
  { background: '#2A7C35', skin: '#F6D3B6', hair: '#1A1A1A', shirt: '#1A5C30', hairStyle: 2 },
  { background: '#1F6AA3', skin: '#E8B48E', hair: '#4A3020', shirt: '#0E4A72', hairStyle: 1 },
  { background: '#3D5A80', skin: '#F4CDB0', hair: '#241C18', shirt: '#2A4460', hairStyle: 0 },
  { background: '#0E6B6B', skin: '#E0AE86', hair: '#201814', shirt: '#0B5252', hairStyle: 2 },
  { background: '#1864A0', skin: '#F8D7C0', hair: '#5C4030', shirt: '#0C4C78', hairStyle: 1 },
  { background: '#045890', skin: '#D9A47C', hair: '#141414', shirt: '#0A3458', hairStyle: 2 },
  { background: '#2F6F4E', skin: '#F3C7A6', hair: '#3A2A20', shirt: '#245C40', hairStyle: 0 },
]

function lookFor(seed: number): Look {
  const index = Math.abs(seed * 5) % LOOKS.length
  return LOOKS[index] ?? LOOKS[0]
}

function hairPath(style: Look['hairStyle']): string {
  if (style === 1) {
    return 'M20 24.5c.8-7.6 5.4-12.2 12-12.2s11.2 4.6 12 12.2c-1.2-1.4-3.4-2.6-6.2-2.6-1.6 0-2.8.2-3.8.6-1-.4-2.2-.6-3.6-.6-3.2 0-5.6 1.2-6.8 2.6h-3.6z'
  }
  if (style === 2) {
    return 'M18.5 26c.8-8.4 6-13.6 13.5-13.6S44.7 17.6 45.5 26c.4 6 .2 12-.2 16.5-1.6-7-4.2-10-7.4-10-.8 0-1.6.1-2.3.4V28c-.6-2.4-2.2-3.6-4.6-3.6s-4 1.2-4.6 3.6v4.9c-.7-.3-1.5-.4-2.3-.4-3.2 0-5.8 3-7.4 10-.4-4.5-.6-10.5-.2-16.5z'
  }
  return 'M20.5 25.8C21.2 18.2 25.8 14 32 14s10.8 4.2 11.5 11.8c-1.2-3.4-4-5.4-7.6-5.4-2.2 0-3.8.4-4.6 1-.8-.6-2.4-1-4.4-1-3.6 0-6.4 2-7.4 5.4h-1z'
}

export function AvatarMark({ seed }: { seed: number }) {
  const look = lookFor(seed)

  return (
    <svg viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="32" fill={look.background} />
      <path d="M8 62c2.2-11.5 11-18.5 24-18.5S53.8 50.5 56 62" fill={look.shirt} />
      <rect x="28" y="40" width="8" height="7" rx="3" fill={look.skin} />
      <circle cx="32" cy="28" r="12" fill={look.skin} />
      <path d={hairPath(look.hairStyle)} fill={look.hair} />
      <circle cx="27.6" cy="28.4" r="1.25" fill="#2A241C" />
      <circle cx="36.4" cy="28.4" r="1.25" fill="#2A241C" />
    </svg>
  )
}

type ParticipantAvatarProps = {
  id: number
  name: string
  src?: string | null
  className?: string
}

export function ParticipantAvatar({ id, name, src, className }: ParticipantAvatarProps) {
  const alt = `Фото участника ${name}`
  const classes = ['participant-avatar', className].filter(Boolean).join(' ')

  if (src) {
    return <Picture className={classes} src={src} alt={alt} ratio="1 / 1" />
  }

  return (
    <span className={classes} role="img" aria-label={alt}>
      <AvatarMark seed={id} />
    </span>
  )
}

type ParticipantCoverProps = {
  id: number
  name: string
  src?: string | null
}

export function ParticipantCover({ id, name, src }: ParticipantCoverProps) {
  const alt = `Фото участника ${name}`

  if (src) {
    return <Picture className="participant-card__photo" src={src} alt={alt} ratio="16 / 9" />
  }

  const look = lookFor(id)

  return (
    <div
      className="participant-cover"
      style={{ background: look.background }}
      role="img"
      aria-label={alt}
    >
      <AvatarMark seed={id} />
    </div>
  )
}
