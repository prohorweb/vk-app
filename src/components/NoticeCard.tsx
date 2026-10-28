import { Icon24Cancel } from '@vkontakte/icons'
import type { ReactNode } from 'react'

type NoticeCardProps = {
  icon: ReactNode
  title: string
  text?: string
  onClose: () => void
}

/** Всплывающее уведомление поверх экрана: данные не удалось обновить. */
export function NoticeCard({ icon, title, text, onClose }: NoticeCardProps) {
  return (
    <aside className="notice-card" role="alert">
      <span className="notice-card__icon" aria-hidden>
        {icon}
      </span>
      <div className="notice-card__content">
        <p className="notice-card__title">{title}</p>
        {text ? <p className="notice-card__text">{text}</p> : null}
      </div>
      <button type="button" className="notice-card__close" aria-label="Закрыть" onClick={onClose}>
        <Icon24Cancel />
      </button>
    </aside>
  )
}
