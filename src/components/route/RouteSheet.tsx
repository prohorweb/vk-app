import { useCallback, useEffect, useRef, useState } from 'react'
import { Subhead, Text, Title } from '@vkontakte/vkui'
import type { RouteMapFilter, RouteSheetSnap } from '../../api/mocks/route.ts'
import {
  routeAllSummary,
  routeStage1Checkpoints,
  routeStage1Segments,
  routeStage1Summary,
  routeStages,
} from '../../api/mocks/route.ts'

const SNAP_RATIO: Record<RouteSheetSnap, number> = {
  collapsed: 0.22,
  half: 0.5,
  full: 0.86,
}

function nearestSnap(heightRatio: number): RouteSheetSnap {
  const entries = Object.entries(SNAP_RATIO) as [RouteSheetSnap, number][]
  let best: RouteSheetSnap = 'collapsed'
  let bestDelta = Number.POSITIVE_INFINITY
  for (const [snap, ratio] of entries) {
    const delta = Math.abs(ratio - heightRatio)
    if (delta < bestDelta) {
      bestDelta = delta
      best = snap
    }
  }
  return best
}

type RouteSheetProps = {
  mapFilter: RouteMapFilter
  initialSnap?: RouteSheetSnap | null
}

export function RouteSheet({ mapFilter, initialSnap }: RouteSheetProps) {
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800,
  )
  const [snap, setSnap] = useState<RouteSheetSnap>(initialSnap ?? 'collapsed')
  const [heightPx, setHeightPx] = useState(() => Math.round(viewportHeight * SNAP_RATIO.collapsed))
  const heightRef = useRef(heightPx)
  heightRef.current = heightPx
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialSnap) {
      setSnap(initialSnap)
      setHeightPx(Math.round(viewportHeight * SNAP_RATIO[initialSnap]))
    }
  }, [initialSnap, viewportHeight])

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const applySnap = useCallback(
    (next: RouteSheetSnap) => {
      setSnap(next)
      setHeightPx(Math.round(viewportHeight * SNAP_RATIO[next]))
    },
    [viewportHeight],
  )

  const minHeight = Math.round(viewportHeight * SNAP_RATIO.collapsed)
  const maxHeight = Math.round(viewportHeight * SNAP_RATIO.full)

  const onPointerDown = (event: React.PointerEvent) => {
    dragRef.current = { startY: event.clientY, startHeight: heightPx }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) {
      return
    }
    const delta = drag.startY - event.clientY
    const next = Math.min(maxHeight, Math.max(minHeight, drag.startHeight + delta))
    setHeightPx(next)
  }

  const onPointerUp = (event: React.PointerEvent) => {
    dragRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
    applySnap(nearestSnap(heightRef.current / viewportHeight))
  }

  const isAll = mapFilter === 'all'
  const stage =
    mapFilter === 'all' ? null : routeStages.find((item) => item.id === mapFilter) ?? routeStages[0]

  const showProfile = snap === 'half' || snap === 'full'
  const showDetails = snap === 'full'

  return (
    <div
      ref={sheetRef}
      className={['route-sheet', `route-sheet--${snap}`].join(' ')}
      style={{ height: `${heightPx}px` }}
    >
      <div
        className="route-sheet__grab"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className="route-sheet__grab-bar" aria-hidden />
      </div>
      <div className="route-sheet__scroll">
        {isAll ? (
          <>
            <Title level="3" className="route-sheet__title">
              {routeAllSummary.title}
            </Title>
            <Text className="route-sheet__stats">
              {routeAllSummary.distanceKm} км • {routeAllSummary.elevationGainM} м ↑
            </Text>
            <Subhead className="route-sheet__meta">{routeAllSummary.stagesLabel}</Subhead>
            <Text className="route-sheet__subtitle">{routeAllSummary.subtitle}</Text>
            {showProfile ? (
              <section className="route-sheet__section">
                <Title level="3" className="route-sheet__section-title">
                  Профиль всей трассы
                </Title>
                <Text className="route-sheet__stats">
                  {routeAllSummary.distanceKm} км • {routeAllSummary.elevationGainM} м • 6 этапов
                </Text>
                <p className="route-sheet__placeholder">Профиль высот появится позже</p>
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
                        <Text>{item.title}</Text>
                        <Subhead>
                          {item.distanceKm} км ({item.elevationGainM} м↑)
                        </Subhead>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : (
          <>
            <Title level="3" className="route-sheet__title">
              {routeStage1Summary.headline}
            </Title>
            <Text className="route-sheet__stats">
              {routeStage1Summary.distanceKm} км • {routeStage1Summary.elevationGainM} м ↑
            </Text>
            <Text className="route-sheet__subtitle">{routeStage1Summary.startLabel}</Text>
            <Text className="route-sheet__subtitle">{routeStage1Summary.finishLabel}</Text>
            {showProfile ? (
              <section className="route-sheet__section">
                <Title level="3" className="route-sheet__section-title">
                  Профиль высот · этап {stage?.number ?? 1}
                </Title>
                <Text className="route-sheet__stats">
                  {routeStage1Summary.distanceKm} км • {routeStage1Summary.elevationGainM} м
                </Text>
                <p className="route-sheet__placeholder">Профиль высот появится позже</p>
              </section>
            ) : null}
            {showDetails ? (
              <>
                <section className="route-sheet__section">
                  <Title level="3" className="route-sheet__section-title">
                    Контрольные пункты
                  </Title>
                  <ul className="route-sheet__checkpoints">
                    {routeStage1Checkpoints.map((cp) => (
                      <li key={cp.id}>
                        <Text>
                          {cp.label} • {cp.name} {cp.distanceKm} км
                        </Text>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="route-sheet__section">
                  <Title level="3" className="route-sheet__section-title">
                    Участки трассы
                  </Title>
                  <ul className="route-sheet__segments">
                    {routeStage1Segments.map((seg) => (
                      <li key={seg.id}>
                        <Text>
                          {seg.fromKm}–{seg.toKm} км • {seg.title}
                        </Text>
                        {seg.hint ? <Subhead>{seg.hint}</Subhead> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
