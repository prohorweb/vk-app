import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'

export type SheetSnap = 'collapsed' | 'half' | 'full'

const HALF_RATIO = 0.5

function halfHeight(maxH: number): number {
  return Math.round(maxH * HALF_RATIO)
}

function snapHeight(snap: SheetSnap, maxH: number, collapsedH: number): number {
  if (snap === 'collapsed') {
    return Math.min(collapsedH, maxH)
  }
  if (snap === 'half') {
    return halfHeight(maxH)
  }
  return maxH
}

function nearestSnap(visibleH: number, maxH: number, collapsedH: number): SheetSnap {
  const options: { snap: SheetSnap; h: number }[] = [
    { snap: 'collapsed', h: snapHeight('collapsed', maxH, collapsedH) },
    { snap: 'half', h: snapHeight('half', maxH, collapsedH) },
    { snap: 'full', h: snapHeight('full', maxH, collapsedH) },
  ]
  let best: SheetSnap = 'collapsed'
  let bestDelta = Number.POSITIVE_INFINITY
  for (const { snap, h } of options) {
    const delta = Math.abs(h - visibleH)
    if (delta < bestDelta) {
      bestDelta = delta
      best = snap
    }
  }
  return best
}

function snapFromVelocity(
  visibleH: number,
  velocityPxPerMs: number,
  maxH: number,
  collapsedH: number,
): SheetSnap {
  const threshold = 0.35
  const halfH = snapHeight('half', maxH, collapsedH)
  if (velocityPxPerMs > threshold) {
    if (visibleH > halfH) {
      return 'half'
    }
    return 'collapsed'
  }
  if (velocityPxPerMs < -threshold) {
    if (visibleH < halfH) {
      return 'half'
    }
    return 'full'
  }
  return nearestSnap(visibleH, maxH, collapsedH)
}

function readTabbarTotalPx(): number {
  if (typeof document === 'undefined') {
    return 48
  }
  const root = document.documentElement
  const styles = getComputedStyle(root)
  const tabbar = Number.parseFloat(styles.getPropertyValue('--app-tabbar-height')) || 48
  const safeBottom = Number.parseFloat(
    styles.getPropertyValue('env(safe-area-inset-bottom)') ||
      styles.getPropertyValue('--env-safe-area-inset-bottom'),
  )
  return tabbar + (Number.isFinite(safeBottom) ? safeBottom : 0)
}

type SnapSheetProps = {
  viewportRef: RefObject<HTMLElement | null>
  headerRef: RefObject<HTMLElement | null>
  initialSnap?: SheetSnap | null
  peekKey?: string | number
  peek: ReactNode
  children: (snap: SheetSnap) => ReactNode
}

export function SnapSheet({
  viewportRef,
  headerRef,
  initialSnap,
  peekKey,
  peek,
  children,
}: SnapSheetProps) {
  const [maxH, setMaxH] = useState(480)
  const [collapsedH, setCollapsedH] = useState(160)
  const [snap, setSnap] = useState<SheetSnap>(initialSnap ?? 'collapsed')
  const [visibleH, setVisibleH] = useState(160)
  const [dragging, setDragging] = useState(false)
  const visibleRef = useRef(visibleH)
  visibleRef.current = visibleH
  const dragRef = useRef<{ startY: number; startVisible: number } | null>(null)
  const moveHistory = useRef<{ t: number; y: number }[]>([])
  const grabRef = useRef<HTMLDivElement>(null)
  const peekRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }
    const measure = () => {
      const headerBottom = headerRef.current?.getBoundingClientRect().bottom
      const tabbarTotal = readTabbarTotalPx()
      const availableFromDom =
        headerBottom != null
          ? Math.round(window.innerHeight - headerBottom - tabbarTotal)
          : viewport.clientHeight
      const available = Math.max(0, Math.min(viewport.clientHeight, availableFromDom))
      setMaxH(available)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    if (headerRef.current) {
      observer.observe(headerRef.current)
    }
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [viewportRef, headerRef])

  useLayoutEffect(() => {
    const grab = grabRef.current
    const peekNode = peekRef.current
    if (!grab || !peekNode) {
      return
    }
    const measureCollapsed = () => {
      setCollapsedH(grab.offsetHeight + peekNode.offsetHeight)
    }
    measureCollapsed()
    const observer = new ResizeObserver(measureCollapsed)
    observer.observe(grab)
    observer.observe(peekNode)
    return () => observer.disconnect()
  }, [peekKey, peek])

  const applySnap = useCallback(
    (next: SheetSnap) => {
      setSnap(next)
      setVisibleH(snapHeight(next, maxH, collapsedH))
    },
    [maxH, collapsedH],
  )

  useEffect(() => {
    if (initialSnap) {
      applySnap(initialSnap)
    }
  }, [initialSnap, applySnap])

  useEffect(() => {
    setVisibleH(snapHeight(snap, maxH, collapsedH))
  }, [maxH, collapsedH, snap])

  const minVisible = snapHeight('collapsed', maxH, collapsedH)
  const maxVisible = maxH
  const offsetY = maxH - visibleH

  const onPointerDown = (event: React.PointerEvent) => {
    dragRef.current = { startY: event.clientY, startVisible: visibleH }
    moveHistory.current = [{ t: event.timeStamp, y: event.clientY }]
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) {
      return
    }
    const delta = drag.startY - event.clientY
    const next = Math.min(maxVisible, Math.max(minVisible, drag.startVisible + delta))
    setVisibleH(next)
    const history = moveHistory.current
    history.push({ t: event.timeStamp, y: event.clientY })
    if (history.length > 6) {
      history.shift()
    }
  }

  const onPointerUp = (event: React.PointerEvent) => {
    dragRef.current = null
    setDragging(false)
    event.currentTarget.releasePointerCapture(event.pointerId)
    const history = moveHistory.current
    let velocity = 0
    if (history.length >= 2) {
      const first = history[0]
      const last = history[history.length - 1]
      const dt = last.t - first.t
      if (dt > 0) {
        velocity = (last.y - first.y) / dt
      }
    }
    applySnap(snapFromVelocity(visibleRef.current, velocity, maxH, collapsedH))
  }

  const dragProps = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  }

  return (
    <div
      className={[
        'route-sheet',
        `route-sheet--${snap}`,
        dragging ? 'route-sheet--dragging' : '',
      ].join(' ')}
      style={{
        height: maxH,
        transform: `translateY(${offsetY}px)`,
      }}
      {...(snap !== 'full' ? dragProps : {})}
    >
      <div ref={grabRef} className="route-sheet__grab" {...(snap === 'full' ? dragProps : {})}>
        <span className="route-sheet__grab-bar" aria-hidden />
      </div>
      <div ref={peekRef} className="route-sheet__peek">
        {peek}
      </div>
      <div className="route-sheet__scroll">{children(snap)}</div>
    </div>
  )
}
