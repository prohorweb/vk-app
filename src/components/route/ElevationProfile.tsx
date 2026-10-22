import type { ElevationPoint, ElevationStageMarker } from '../../api/mocks/route.ts'

type ElevationProfileProps = {
  points: ElevationPoint[]
  stages?: ElevationStageMarker[]
  className?: string
}

const WIDTH = 328
const HEIGHT = 152
const PAD = { left: 36, right: 12, top: 28, bottom: 28 }

export function ElevationProfile({ points, stages, className }: ElevationProfileProps) {
  if (points.length < 2) {
    return null
  }

  const maxKm = points[points.length - 1].km
  const elevations = points.map((point) => point.elevationM)
  const minElev = Math.min(...elevations)
  const maxElev = Math.max(...elevations)
  const elevSpan = Math.max(maxElev - minElev, 1)

  const plotW = WIDTH - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom

  const toX = (km: number) => PAD.left + (km / maxKm) * plotW
  const toY = (elev: number) => PAD.top + plotH - ((elev - minElev) / elevSpan) * plotH

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${toX(point.km).toFixed(2)} ${toY(point.elevationM).toFixed(2)}`)
    .join(' ')

  const areaPath = `${linePath} L ${toX(maxKm).toFixed(2)} ${(PAD.top + plotH).toFixed(2)} L ${toX(0).toFixed(2)} ${(PAD.top + plotH).toFixed(2)} Z`

  const yTicks = [minElev, minElev + elevSpan / 2, maxElev]
  const xTicks = [0, maxKm / 2, maxKm]

  return (
    <svg
      className={['elevation-profile', className].filter(Boolean).join(' ')}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height={HEIGHT}
      role="img"
      aria-label="Профиль высот"
    >
      {yTicks.map((tick) => (
        <text
          key={`y-${tick}`}
          x={PAD.left - 6}
          y={toY(tick) + 4}
          className="elevation-profile__axis-label"
          textAnchor="end"
        >
          {Math.round(tick)}
        </text>
      ))}
      {xTicks.map((tick) => (
        <text
          key={`x-${tick}`}
          x={toX(tick)}
          y={HEIGHT - 6}
          className="elevation-profile__axis-label"
          textAnchor="middle"
        >
          {Math.round(tick)}
        </text>
      ))}
      <path d={areaPath} className="elevation-profile__fill" />
      <path d={linePath} className="elevation-profile__line" fill="none" />
      {stages?.map((stage) => {
        const point = points.reduce((best, current) =>
          Math.abs(current.km - stage.km) < Math.abs(best.km - stage.km) ? current : best,
        )
        const x = toX(stage.km)
        const y = toY(point.elevationM)
        return (
          <g key={stage.number}>
            <circle cx={x} cy={y} r={4} className="elevation-profile__peak-dot" />
            <text x={x} y={y - 10} className="elevation-profile__stage-label" textAnchor="middle">
              {stage.number}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
