import { useId } from 'react'

/**
 * Разделитель из чередующихся треугольников — как в макете.
 * Цвета берутся из токенов, поэтому SVG рисуется в DOM, а не data-URI.
 */
export function TickerDivider() {
  const patternId = `ticker-${useId().replace(/:/g, '')}`

  return (
    <svg className="ticker-divider" width="100%" height="8" aria-hidden>
      <defs>
        <pattern id={patternId} width="24" height="8" patternUnits="userSpaceOnUse">
          <polygon points="0,8 6,0 12,8" fill="var(--avacha-secondary-light-blue)" />
          <polygon points="12,0 18,8 24,0" fill="var(--avacha-brand-red)" />
        </pattern>
      </defs>
      <rect width="100%" height="8" fill={`url(#${patternId})`} />
    </svg>
  )
}
