import { Accordion, Separator, Subhead, Text, Title } from '@vkontakte/vkui'
import type { RefObject } from 'react'
import type { RouteMapFilter, RouteSheetSnap } from '../../api/mocks/route.ts'
import {
  getRouteStageDetail,
  routeAllSummary,
  routeFullProfilePoints,
  routeFullProfileStages,
  routeStages,
} from '../../api/mocks/route.ts'
import { SnapSheet } from '../sheet/SnapSheet.tsx'
import { ElevationProfile } from './ElevationProfile.tsx'

type RouteSheetProps = {
  mapFilter: RouteMapFilter
  initialSnap?: RouteSheetSnap | null
  viewportRef: RefObject<HTMLElement | null>
  headerRef: RefObject<HTMLElement | null>
}

export function RouteSheet({ mapFilter, initialSnap, viewportRef, headerRef }: RouteSheetProps) {
  const isAll = mapFilter === 'all'
  const stage =
    mapFilter === 'all' ? null : routeStages.find((item) => item.id === mapFilter) ?? routeStages[0]
  const stageDetail = typeof mapFilter === 'number' ? getRouteStageDetail(mapFilter) : null

  const peek =
    isAll ? (
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
    ) : null

  return (
    <SnapSheet
      viewportRef={viewportRef}
      headerRef={headerRef}
      initialSnap={initialSnap}
      peekKey={mapFilter}
      peek={peek}
    >
      {(snap) => {
        const showProfile = snap === 'half' || snap === 'full'
        const showDetails = snap === 'full'
        if (isAll) {
          return (
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
          )
        }
        if (!stage || !stageDetail) {
          return null
        }
        return (
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
        )
      }}
    </SnapSheet>
  )
}
