import { routeStageCheckpoints, routeStageTracks } from '../../map/data/route.ts'
import { MAP_TRACK_COLOR } from '../../map/yandexColors.ts'
import type { MapCheckpoint, MapTrack } from '../../map/mapTypes.ts'

/**
 * Fallback для карты: пока API не отдаёт нитку этапа, берём маршрут из My Maps.
 * Номер этапа совпадает с `number` в справочнике, а не с произвольным id.
 */
export function getMapStageTrack(stageNumber: number): MapTrack {
  const track = routeStageTracks[stageNumber - 1] ?? routeStageTracks[0]
  return { ...track, color: MAP_TRACK_COLOR }
}

export function getMapStageCheckpoints(stageNumber: number): MapCheckpoint[] {
  return routeStageCheckpoints[stageNumber] ?? []
}

/** Число этапов в маршруте — для легенды и фильтра. */
export const routeStageCount = routeStageTracks.length
