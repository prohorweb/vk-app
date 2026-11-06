import type { MapCheckpointKind } from './mapTypes.ts'
import { TRACK_COLOR_BY_KIND } from './yandexColors.ts'

export const CHECKPOINT_PIN_SIZE: readonly [number, number] = [28, 28]
export const CHECKPOINT_PIN_OFFSET: readonly [number, number] = [-14, -14]

const hrefCache = new Map<string, string>()

function glyph(kind: MapCheckpointKind): string {
  if (kind === 'start') {
    return '<polygon points="14,7 18,21 14,18 10,21" fill="#fff"/>'
  }
  if (kind === 'finish') {
    return '<rect x="9" y="9" width="10" height="10" fill="#fff"/>'
  }
  return '<text x="14" y="14" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="700">КП</text>'
}

function pinSvg(kind: MapCheckpointKind): string {
  const color = TRACK_COLOR_BY_KIND[kind]
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">',
    `<circle cx="14" cy="14" r="12" fill="${color}" stroke="#fff" stroke-width="2"/>`,
    glyph(kind),
    '</svg>',
  ].join('')
}

export function checkpointPinHref(kind: MapCheckpointKind): string {
  const cached = hrefCache.get(kind)
  if (cached) {
    return cached
  }
  const href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(pinSvg(kind))}`
  hrefCache.set(kind, href)
  return href
}
