import type { ReactNode } from 'react'

type MapChoicePopoverProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Поповер выбора рядом с кнопками тулбара: карточка под ними и клик мимо закрывает. */
export function MapChoicePopover({ open, title, onClose, children }: MapChoicePopoverProps) {
  if (!open) {
    return null
  }

  return (
    <>
      <button
        type="button"
        className="map-choice__backdrop"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div className="map-choice" role="dialog" aria-label={title}>
        <h2 className="map-choice__title">{title}</h2>
        <div className="map-choice__options">{children}</div>
      </div>
    </>
  )
}
