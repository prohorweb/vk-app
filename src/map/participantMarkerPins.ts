/**
 * Метки участников на карте: свой SVG вместо `islands#circleIcon`.
 * Стандартный пресет Yandex размывается на retina; вектор с обводкой читается чётче.
 */

export const PARTICIPANT_MARKER_SIZE: readonly [number, number] = [36, 36]
export const PARTICIPANT_MARKER_OFFSET: readonly [number, number] = [-18, -18]

const hrefCache = new Map<string, string>()

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function markerSvg(label: string, color: string): string {
  const text = escapeXml(label)
  const fontSize = label.length >= 3 ? 11 : label.length === 2 ? 13 : 15
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">',
    `<circle cx="18" cy="18" r="15" fill="${color}" stroke="#fff" stroke-width="2.5"/>`,
    '<circle cx="18" cy="18" r="15" fill="none" stroke="rgba(0,0,0,0.22)" stroke-width="1"/>',
    `<text x="18" y="18" text-anchor="middle" dominant-baseline="central"`,
    ` fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}"`,
    ` font-weight="700" letter-spacing="-0.3">${text}</text>`,
    '</svg>',
  ].join('')
}

/** Data-URI для `iconImageHref`: круг статуса + жирный номер нагрудника. */
export function participantMarkerHref(label: string, color: string): string {
  const key = `${color}|${label}`
  const cached = hrefCache.get(key)
  if (cached) {
    return cached
  }
  const href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markerSvg(label, color))}`
  hrefCache.set(key, href)
  return href
}
