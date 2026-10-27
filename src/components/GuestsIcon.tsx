import type { ReactNode } from 'react'
import {
  Icon24ChartSquareOutline,
  Icon24CloudOutline,
  Icon24CommentOutline,
  Icon24Compass,
  Icon24ErrorCircleOutline,
  Icon24Fire,
  Icon24FlagStart,
  Icon24GiftOutline,
  Icon24Globe,
  Icon24HealthOutline,
  Icon24HomeOutline,
  Icon24LogoVk,
  Icon24MailOutline,
  Icon24Mention,
  Icon24Place,
  Icon24PlaneOutline,
  Icon24QuestionOutline,
  Icon24SnowflakeOutline,
  Icon24StatisticsOutline,
  Icon24SunOutline,
  Icon24TicketOutline,
} from '@vkontakte/icons'
import type { GuestsIconId } from '../api/mocks/guests.ts'

const icons: Record<GuestsIconId, ReactNode> = {
  place: <Icon24Place />,
  plane: <Icon24PlaneOutline />,
  ticket: <Icon24TicketOutline />,
  compass: <Icon24Compass />,
  home: <Icon24HomeOutline />,
  cloud: <Icon24CloudOutline />,
  snowflake: <Icon24SnowflakeOutline />,
  pulse: <Icon24StatisticsOutline />,
  flag: <Icon24FlagStart />,
  warning: <Icon24ErrorCircleOutline />,
  gift: <Icon24GiftOutline />,
  chart: <Icon24ChartSquareOutline />,
  health: <Icon24HealthOutline />,
  fire: <Icon24Fire />,
  sun: <Icon24SunOutline />,
  question: <Icon24QuestionOutline />,
  mail: <Icon24MailOutline />,
  comment: <Icon24CommentOutline />,
  globe: <Icon24Globe />,
  vk: <Icon24LogoVk />,
  mention: <Icon24Mention />,
}

type GuestsIconProps = {
  id: GuestsIconId
  tone?: 'brand' | 'light'
}

export function GuestsIcon({ id, tone = 'light' }: GuestsIconProps) {
  return (
    <span className={`guests-icon guests-icon--${tone}`} aria-hidden>
      {icons[id]}
    </span>
  )
}
