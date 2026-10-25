import { useCallback, useEffect, useRef, useState } from 'react'

const SWIPE_CLOSE_THRESHOLD_PX = 56
const EXIT_FALLBACK_MS = 300

type UseBottomSheetOptions = {
  swipeToClose?: boolean
  panelDraggingClass?: string
}

export function useBottomSheet(open: boolean, onClose: () => void, options: UseBottomSheetOptions = {}) {
  const { swipeToClose = false, panelDraggingClass = '' } = options
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; deltaY: number } | null>(null)

  useEffect(() => {
    if (open) {
      // Mount before slide-in so transform can animate from off-screen.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- bottom sheet enter/exit animation
      setMounted(true)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
      return () => cancelAnimationFrame(frame)
    }
    setVisible(false)
    // transitionend не приходит при prefers-reduced-motion, поэтому подстраховываемся таймером.
    const timer = window.setTimeout(() => setMounted(false), EXIT_FALLBACK_MS)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!visible) {
      return
    }
    const frame = requestAnimationFrame(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [visible])

  const requestClose = useCallback(() => {
    onClose()
  }, [onClose])

  const handlePanelTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== panelRef.current || event.propertyName !== 'transform') {
      return
    }
    if (!visible) {
      setMounted(false)
    }
  }

  const onTouchStart = (event: React.TouchEvent) => {
    if (!swipeToClose) {
      return
    }
    const touch = event.touches[0]
    if (!touch) {
      return
    }
    dragRef.current = { startY: touch.clientY, deltaY: 0 }
  }

  const onTouchMove = (event: React.TouchEvent) => {
    if (!swipeToClose) {
      return
    }
    const drag = dragRef.current
    const touch = event.touches[0]
    const panel = panelRef.current
    if (!drag || !touch || !panel || !panelDraggingClass) {
      return
    }
    drag.deltaY = Math.max(0, touch.clientY - drag.startY)
    panel.classList.add(panelDraggingClass)
    panel.style.transform = `translateY(${drag.deltaY}px)`
  }

  const onTouchEnd = () => {
    if (!swipeToClose) {
      return
    }
    const drag = dragRef.current
    dragRef.current = null
    const panel = panelRef.current
    if (!panel || !panelDraggingClass) {
      return
    }
    panel.classList.remove(panelDraggingClass)
    panel.style.transform = ''
    if (drag && drag.deltaY >= SWIPE_CLOSE_THRESHOLD_PX) {
      requestClose()
    }
  }

  return {
    mounted,
    visible,
    panelRef,
    handlePanelTransitionEnd,
    requestClose,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
