import type { MapCheckpoint } from './mapTypes.ts'
import { routeStageCheckpoints } from './data/route.ts'

/**
 * КП всех этапов без дублей: на стыках финиш этапа совпадает со стартом
 * следующего, поэтому точки склеиваем по координате.
 */
export function allRouteCheckpoints(): MapCheckpoint[] {
  const seen = new Set<string>()
  return Object.values(routeStageCheckpoints)
    .flat()
    .filter((checkpoint) => {
      const key = `${checkpoint.lat.toFixed(4)}:${checkpoint.lng.toFixed(4)}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
}
