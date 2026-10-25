import { useLayoutEffect, type ReactNode } from 'react'
import { Card } from '@vkontakte/vkui'
import { useBottomSheet } from '../hooks/useBottomSheet.ts'

type BottomSheetProps = {
  open: boolean
  onClose: () => void
  ariaLabel: string
  sheetClassName: string
  panelClassName: string
  swipeToClose?: boolean
  hideTabbar?: boolean
  children: ReactNode
}

export function BottomSheet({
  open,
  onClose,
  ariaLabel,
  sheetClassName,
  panelClassName,
  swipeToClose = true,
  hideTabbar = false,
  children,
}: BottomSheetProps) {
  const panelDraggingClass = `${panelClassName}--dragging`
  const {
    mounted,
    visible,
    panelRef,
    handlePanelTransitionEnd,
    requestClose,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useBottomSheet(open, onClose, { swipeToClose, panelDraggingClass })

  useLayoutEffect(() => {
    if (!open || !hideTabbar) {
      return
    }
    document.documentElement.classList.add('app-hide-tabbar')
    return () => {
      document.documentElement.classList.remove('app-hide-tabbar')
    }
  }, [open, hideTabbar])

  if (!mounted) {
    return null
  }

  const sheetClasses = [sheetClassName, visible ? `${sheetClassName}--visible` : ''].filter(Boolean).join(' ')

  return (
    <div className={sheetClasses} role="presentation">
      <button
        type="button"
        className={`${sheetClassName}__backdrop`}
        aria-label="Закрыть"
        onClick={requestClose}
      />
      <Card
        mode="shadow"
        getRootRef={panelRef}
        className={panelClassName}
        role="dialog"
        aria-label={ariaLabel}
        onTransitionEnd={handlePanelTransitionEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </Card>
    </div>
  )
}
