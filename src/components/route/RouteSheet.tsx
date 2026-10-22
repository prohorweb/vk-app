import { Accordion, Separator, Subhead, Text, Title } from '@vkontakte/vkui'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import type { RouteMapFilter, RouteSheetSnap } from '../../api/mocks/route.ts'
import {
  getRouteStageDetail,
  routeAllSummary,
  routeFullProfilePoints,
  routeFullProfileStages,
  routeStages,
} from '../../api/mocks/route.ts'
import { ElevationProfile } from './ElevationProfile.tsx'

const HALF_RATIO = 0.5

function halfHeight(maxH: number): number {
  return Math.round(maxH * HALF_RATIO)
}

function snapHeight(snap: RouteSheetSnap, maxH: number, collapsedH: number): number {
  if (snap === 'collapsed') {
    return Math.min(collapsedH, maxH)
  }
  if (snap === 'half') {
    return halfHeight(maxH)
  }
  return maxH
}

function nearestSnap(visibleH: number, maxH: number, collapsedH: number): RouteSheetSnap {
  const options: { snap: RouteSheetSnap; h: number }[] = [
    { snap: 'collapsed', h: snapHeight('collapsed', maxH, collapsedH) },
    { snap: 'half', h: snapHeight('half', maxH, collapsedH) },
    { snap: 'full', h: snapHeight('full', maxH, collapsedH) },
  ]
  let best: RouteSheetSnap = 'collapsed'
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
): RouteSheetSnap {
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

type RouteSheetProps = {
  mapFilter: RouteMapFilter
  initialSnap?: RouteSheetSnap | null
  viewportRef: RefObject<HTMLElement | null>
  headerRef: RefObject<HTMLElement | null>
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

export function RouteSheet({ mapFilter, initialSnap, viewportRef, headerRef }: RouteSheetProps) {
  const [maxH, setMaxH] = useState(480)
  const [collapsedH, setCollapsedH] = useState(160)
  const [snap, setSnap] = useState<RouteSheetSnap>(initialSnap ?? 'collapsed')
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
    const peek = peekRef.current
    if (!grab || !peek) {
      return
    }
    const measureCollapsed = () => {
      setCollapsedH(grab.offsetHeight + peek.offsetHeight)
    }
    measureCollapsed()
    const observer = new ResizeObserver(measureCollapsed)
    observer.observe(grab)
    observer.observe(peek)
    return () => observer.disconnect()
  }, [mapFilter])

  const applySnap = useCallback(
    (next: RouteSheetSnap) => {
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

  const isAll = mapFilter === 'all'
  const stage =
    mapFilter === 'all' ? null : routeStages.find((item) => item.id === mapFilter) ?? routeStages[0]
  const stageDetail = typeof mapFilter === 'number' ? getRouteStageDetail(mapFilter) : null

  const showProfile = snap === 'half' || snap === 'full'
  const showDetails = snap === 'full'

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
        {isAll ? (
          <>
            <Title level="3" className="route-sheet__title">
              {routeAllSummary.title}
            </Title>
            <Separator className="route-sheet__title-separator" />
            <div className="route-sheet__peek-stats">
              <Text className="route-sheet__stats route-sheet__stats--primary">
                {routeAllSummary.distanceKm} км • {routeAllSummary.elevationGainM} м ↑
              </Text>
              <Subhead className="route-sheet__meta">{routeAllSummary.stagesLabel}</Subhead>
              <Text className="route-sheet__subtitle">{routeAllSummary.subtitle}</Text>
            </div>
          </>
        ) : stage && stageDetail ? (
          <>
            <Title level="3" className="route-sheet__title">
              {stageDetail.headline}
            </Title>
            <Separator className="route-sheet__title-separator" />
            <div className="route-sheet__peek-stats">
              <Text className="route-sheet__stats route-sheet__stats--primary">
                {stageDetail.distanceKm} км • {stageDetail.elevationGainM} м ↑
              </Text>
              <Text className="route-sheet__subtitle">{stageDetail.startLabel}</Text>
              <Text className="route-sheet__subtitle">{stageDetail.finishLabel}</Text>
            </div>
          </>
        ) : null}
      </div>
      <div className="route-sheet__scroll">
        {isAll ? (
          <>
            {showProfile ? (
              <section className="route-sheet__section">
                <Title level="3" className="route-sheet__section-title">
                  Профиль всей трассы
                </Title>
                <Text className="route-sheet__stats">
                  {routeAllSummary.distanceKm} км • {routeAllSummary.elevationGainM} м • 6 этапов
                </Text>
                <ElevationProfile points={routeFullProfilePoints} stages={routeFullProfileStages} />
              </section>
            ) : null}
            {showDetails ? (
              <section className="route-sheet__section">
                <Title level="3" className="route-sheet__section-title">
                  Схема этапов
                </Title>
                <ul className="route-sheet__stages">
                  {routeStages.map((item) => (
                    <li key={item.id} className="route-sheet__stage-row">
                      <span className="route-sheet__stage-num">{item.number}</span>
                      <div className="route-sheet__stage-body">
                        <Text className="route-sheet__stage-route">
                          {item.from} — {item.to}
                        </Text>
                        <Subhead className="route-sheet__stage-elev">{item.elevationGainM} м↑</Subhead>
                      </div>
                      <span className="route-sheet__stage-km">{item.distanceKm} км</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : stage && stageDetail ? (
          <>
            {showProfile ? (
              <section className="route-sheet__section">
                <Title level="3" className="route-sheet__section-title">
                  Профиль высот · этап {stage.number}
                </Title>
                <Text className="route-sheet__stats">
                  {stageDetail.distanceKm} км • {stageDetail.elevationGainM} м
                </Text>
                <ElevationProfile points={stageDetail.profilePoints} />
              </section>
            ) : null}
            {showDetails ? (
              <>
                <section className="route-sheet__section">
                  <Title level="3" className="route-sheet__section-title">
                    Контрольные пункты
                  </Title>
                  <ul className="route-sheet__checkpoints">
                    {stageDetail.checkpoints.map((cp) => (
                      <li key={cp.id} className="route-sheet__checkpoint-row">
                        <span
                          className={[
                            'route-sheet__cp-icon',
                            `route-sheet__cp-icon--${cp.kind}`,
                          ].join(' ')}
                          aria-hidden
                        />
                        <div className="route-sheet__checkpoint-body">
                          <Text>
                            {cp.label} · {cp.name}
                          </Text>
                        </div>
                        <span className="route-sheet__checkpoint-km">{cp.distanceKm} км</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="route-sheet__section route-sheet__section--segments">
                  <Title level="3" className="route-sheet__section-title">
                    Участки трассы
                  </Title>
                  <div className="route-sheet__segments">
                    {stageDetail.segments.map((seg) => (
                      <Accordion key={seg.id} id={`route-seg-${seg.id}`}>
                        <Accordion.Summary>
                          {seg.fromKm}–{seg.toKm} км · {seg.title}
                        </Accordion.Summary>
                        <Accordion.Content>
                          {seg.hint ? <Text>{seg.hint}</Text> : null}
                        </Accordion.Content>
                      </Accordion>
                    ))}
                  </div>
                </section>
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}
