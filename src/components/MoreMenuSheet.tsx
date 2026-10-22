import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Icon24Cancel,
  Icon24InfoCircleOutline,
  Icon24LocationMapOutline,
  Icon24SquareStackUpOutline,
  Icon24User,
  Icon24VolumeOutline,
} from '@vkontakte/icons'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Card, SimpleCell } from '@vkontakte/vkui'
import { setMoreMenuReturn } from '../lib/moreMenuReturn.ts'
import { PATH } from '../routes.ts'

type MoreMenuSheetProps = {
  open: boolean
  onClose: () => void
}

const items = [
  { path: PATH.profile, label: 'Профиль', Icon: Icon24User },
  { path: PATH.about, label: 'О гонке', Icon: Icon24InfoCircleOutline },
  { path: PATH.route, label: 'Маршрут', Icon: Icon24LocationMapOutline },
  { path: PATH.guests, label: 'Гостям', Icon: Icon24SquareStackUpOutline },
  { path: PATH.news, label: 'Новости', Icon: Icon24VolumeOutline },
] as const

const SWIPE_CLOSE_THRESHOLD_PX = 56

export function MoreMenuSheet({ open, onClose }: MoreMenuSheetProps) {
  const routeNavigator = useRouteNavigator()
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startY: number; deltaY: number } | null>(null)
  const ignorePopStateRef = useRef(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
      return () => cancelAnimationFrame(frame)
    }
    setVisible(false)
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    history.pushState({ moreMenu: true }, '')

    const onPopState = () => {
      if (ignorePopStateRef.current) {
        ignorePopStateRef.current = false
        return
      }
      onClose()
    }

    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      return
    }
    if (history.state?.moreMenu) {
      ignorePopStateRef.current = true
      history.back()
    }
  }, [open])

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

  const openSection = (path: string) => {
    const returnPath = window.location.hash.replace(/^#/, '') || '/'
    setMoreMenuReturn(returnPath)
    requestClose()
    void routeNavigator.push(path)
  }

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) {
      return
    }
    dragRef.current = { startY: touch.clientY, deltaY: 0 }
  }

  const onTouchMove = (event: React.TouchEvent) => {
    const drag = dragRef.current
    const touch = event.touches[0]
    if (!drag || !touch || !panelRef.current) {
      return
    }
    drag.deltaY = Math.max(0, touch.clientY - drag.startY)
    panelRef.current.classList.add('more-menu-sheet__panel--dragging')
    panelRef.current.style.transform = `translateY(${drag.deltaY}px)`
  }

  const onTouchEnd = () => {
    const drag = dragRef.current
    dragRef.current = null
    if (!panelRef.current) {
      return
    }
    panelRef.current.classList.remove('more-menu-sheet__panel--dragging')
    panelRef.current.style.transform = ''
    if (drag && drag.deltaY >= SWIPE_CLOSE_THRESHOLD_PX) {
      requestClose()
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div
      className={['more-menu-sheet', visible ? 'more-menu-sheet--visible' : ''].filter(Boolean).join(' ')}
      role="presentation"
    >
      <button
        type="button"
        className="more-menu-sheet__backdrop"
        aria-label="Закрыть"
        onClick={requestClose}
      />
      <Card
        mode="shadow"
        getRootRef={panelRef}
        className="more-menu-sheet__panel"
        role="dialog"
        aria-label="Дополнительное меню"
        onTransitionEnd={handlePanelTransitionEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button type="button" className="more-menu-sheet__close" aria-label="Закрыть" onClick={requestClose}>
          <Icon24Cancel />
        </button>
        {items.map(({ path, label, Icon }) => (
          <SimpleCell key={path} before={<Icon />} onClick={() => openSection(path)}>
            {label}
          </SimpleCell>
        ))}
      </Card>
    </div>
  )
}
