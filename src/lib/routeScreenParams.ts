import type { RouteSheetSnap } from '../api/mocks/route.ts'

export function readRouteSheetSnapFromUrl(): RouteSheetSnap | null {
  const value = new URLSearchParams(window.location.search).get('routeSheet')
  if (value === 'collapsed' || value === 'half' || value === 'full') {
    return value
  }
  return null
}

export function readRouteMapFilterFromUrl(): 'all' | 1 | null {
  const value = new URLSearchParams(window.location.search).get('routeMap')
  if (value === 'all') {
    return 'all'
  }
  if (value === 'stage1' || value === '1') {
    return 1
  }
  return null
}
