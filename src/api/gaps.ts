/**
 * TODO: публичный API не отдаёт DNF/DNS, число собак на старте и финише
 * и время последней точки трекера. Пока это локальная заглушка.
 * Время точки — данные трекера, не официальный результат.
 *
 * TODO (картинки, запрос к бэкенду):
 * - ParticipantDetail / ParticipantListItem.photo_url есть в OpenAPI, в сиде пустое — нужен URL фото каюра.
 * - Фото собак нет в контракте. Нужен массив URL, например dogs_photo_urls, рядом с dogs_count.
 * - NewsPostListItemResponse.cover_url есть, в сиде пустое — нужна обложка 16:9.
 * - NewsPostListItemResponse не содержит vk_url (он только у полной новости и в сиде тоже пустой).
 * - ScheduleEventResponse не содержит обложку. Нужен cover_url.
 * - StandingRow и StageProtocolRow не содержат photo_url участника.
 * - StageProtocol не содержит обложку этапа. Нужен cover_url.
 */

export type RaceOutcome = 'dnf' | 'dns'

export type TrackerGap = {
  outcome: RaceOutcome | null
  dogsAtStart: number | null
  dogsAtFinish: number | null
  lastPointAt: string | null
}

const seededGaps: Record<number, Partial<TrackerGap>> = {
  14: { outcome: 'dns', dogsAtFinish: null },
  15: { outcome: 'dnf', dogsAtFinish: 4 },
}

export function trackerGap(participantId: number, dogsCount: number | null): TrackerGap {
  const extra = seededGaps[participantId]
  const dogsAtStart = extra?.dogsAtStart ?? dogsCount
  const finished = extra && 'dogsAtFinish' in extra ? extra.dogsAtFinish : dogsAtStart
  const minutesBack = 8 + (participantId % 7) * 3

  return {
    outcome: extra?.outcome ?? null,
    dogsAtStart: dogsAtStart ?? null,
    dogsAtFinish: extra?.outcome === 'dns' ? null : (finished ?? null),
    lastPointAt: new Date(Date.now() - minutesBack * 60 * 1000).toISOString(),
  }
}
