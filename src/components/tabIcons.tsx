import type { ReactNode } from 'react'

type TabIconProps = {
  className?: string
}

function TabSvg({ className, children }: TabIconProps & { children: ReactNode }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden>
      {children}
    </svg>
  )
}

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function TabIconMap({ className }: TabIconProps) {
  return (
    <TabSvg className={className}>
      <path
        {...stroke}
        d="M14 24.2s6.1-6.15 6.1-10.7a6.1 6.1 0 1 0-12.2 0c0 4.55 6.1 10.7 6.1 10.7z"
      />
      <circle {...stroke} cx="14" cy="13.2" r="2.15" />
    </TabSvg>
  )
}

export function TabIconPeople({ className }: TabIconProps) {
  return (
    <TabSvg className={className}>
      <circle {...stroke} cx="8" cy="11" r="2.15" />
      <path {...stroke} d="M4.3 19.1c.5-2.1 1.85-3.15 3.7-3.15 1.1 0 2.05.35 2.65.95" />
      <circle {...stroke} cx="20" cy="11" r="2.15" />
      <path {...stroke} d="M23.7 19.1c-.5-2.1-1.85-3.15-3.7-3.15-1.1 0-2.05.35-2.65.95" />
      <circle {...stroke} cx="14" cy="12.15" r="2.5" />
      <path {...stroke} d="M8.9 21.35c.7-2.65 2.45-4 5.1-4s4.4 1.35 5.1 4" />
    </TabSvg>
  )
}

export function TabIconBars({ className }: TabIconProps) {
  return (
    <TabSvg className={className}>
      <rect {...stroke} x="4.6" y="15.1" width="4.8" height="7.6" rx="1.2" />
      <rect {...stroke} x="11.6" y="10.2" width="4.8" height="12.5" rx="1.2" />
      <rect {...stroke} x="18.6" y="5.4" width="4.8" height="17.3" rx="1.2" />
    </TabSvg>
  )
}

export function TabIconProgram({ className }: TabIconProps) {
  return (
    <TabSvg className={className}>
      <rect {...stroke} x="6.2" y="4.6" width="15.6" height="18.8" rx="2.2" />
      <path {...stroke} d="M9.4 9.4h9.2M9.4 13.4h9.2M9.4 17.4h6" />
    </TabSvg>
  )
}

export function TabIconMore({ className }: TabIconProps) {
  const diamond = (cx: number, cy: number) => {
    const radius = 3.05
    return `M${cx} ${cy - radius}L${cx + radius} ${cy}L${cx} ${cy + radius}L${cx - radius} ${cy}Z`
  }

  return (
    <TabSvg className={className}>
      <path {...stroke} d={diamond(9.15, 9.15)} />
      <path {...stroke} d={diamond(18.85, 9.15)} />
      <path {...stroke} d={diamond(9.15, 18.85)} />
      <path {...stroke} d={diamond(18.85, 18.85)} />
    </TabSvg>
  )
}
