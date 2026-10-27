import { useCallback, useRef } from 'react'

/** Порог, после которого движение считается перетаскиванием, а не кликом. */
const DRAG_THRESHOLD_PX = 5
const DRAGGING_CLASS = 'is-drag-scrolling'

type DragState = {
  pointerId: number
  startX: number
  startScrollLeft: number
  moved: boolean
}

/**
 * Панорамирование горизонтальной строки мышью.
 *
 * Браузеры не тянут `overflow-x: auto` перетаскиванием мыши — работают только
 * трекпад, колесо и скроллбар, — поэтому drag добавляем руками.
 * Тач и трекпад не перехватываем: реагируем только на `pointerType === 'mouse'`.
 */
export function useDragScroll<T extends HTMLElement>() {
  const dragRef = useRef<DragState | null>(null)
  const suppressClickRef = useRef(false)

  const onPointerDown = useCallback((event: React.PointerEvent<T>) => {
    suppressClickRef.current = false
    const element = event.currentTarget
    if (event.pointerType !== 'mouse' || event.button !== 0) {
      return
    }
    // Тянуть нечего, если контент помещается целиком.
    if (element.scrollWidth <= element.clientWidth) {
      return
    }
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: element.scrollLeft,
      moved: false,
    }
  }, [])

  const onPointerMove = useCallback((event: React.PointerEvent<T>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) {
      return
    }
    const element = event.currentTarget
    const delta = event.clientX - drag.startX
    if (!drag.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD_PX) {
        return
      }
      drag.moved = true
      suppressClickRef.current = true
      element.classList.add(DRAGGING_CLASS)
      element.setPointerCapture(event.pointerId)
    }
    event.preventDefault()
    element.scrollLeft = drag.startScrollLeft - delta
  }, [])

  const endDrag = useCallback((event: React.PointerEvent<T>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) {
      return
    }
    dragRef.current = null
    if (!drag.moved) {
      return
    }
    event.currentTarget.classList.remove(DRAGGING_CLASS)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  /** После перетаскивания клик по вложенной кнопке срабатывать не должен. */
  const onClickCapture = useCallback((event: React.MouseEvent<T>) => {
    if (!suppressClickRef.current) {
      return
    }
    suppressClickRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }, [])

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onClickCapture,
  }
}
