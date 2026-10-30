import {
  isLocalFavorite,
  readLocalFavoriteIds,
  setLocalFavorite,
} from '../lib/localFavorites.ts'
import type { FavoriteIdsResponse, ParticipantListItem, UserProfile } from '../types/index.ts'
import { api, ApiError, isClientApiError, unwrap } from './client.ts'
import { getAccessToken } from './token.ts'

/** Профиль текущего пользователя. Без токена — null (гость). */
export async function fetchMyProfile(): Promise<UserProfile | null> {
  if (!getAccessToken()) {
    return null
  }
  try {
    const result = await api.GET('/api/v1/auth/me')
    return unwrap(result)
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }
    if (isClientApiError(error)) {
      throw error
    }
    return null
  }
}

/** ID избранных: API при авторизации, иначе localStorage гостя. */
export async function fetchFavoriteIds(): Promise<number[]> {
  if (!getAccessToken()) {
    return readLocalFavoriteIds()
  }
  try {
    const result = await api.GET('/api/v1/participants/favorites/ids')
    const payload: FavoriteIdsResponse = unwrap(result)
    return payload.participant_ids
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return readLocalFavoriteIds()
    }
    if (isClientApiError(error)) {
      throw error
    }
    return readLocalFavoriteIds()
  }
}

/**
 * Карточки избранных: ids из favorites/ids, детали из списка участников.
 * Порядок — как в ответе favorites/ids.
 */
export async function fetchFavoriteParticipants(): Promise<ParticipantListItem[]> {
  const ids = await fetchFavoriteIds()
  if (ids.length === 0) {
    return []
  }
  const result = await api.GET('/api/v1/participants', {
    params: { query: { sort: 'bib' } },
  })
  const participants = unwrap(result)
  const byId = new Map(participants.map((item) => [item.id, item]))
  return ids.flatMap((id) => {
    const item = byId.get(id)
    return item ? [item] : []
  })
}

/** Добавить/убрать из избранного: API или localStorage для гостя. */
export async function setFavorite(
  participantId: number,
  nextFavorite: boolean,
  currentSupportersCount: number,
): Promise<{ supporters_count: number; created: boolean }> {
  if (!getAccessToken()) {
    setLocalFavorite(participantId, nextFavorite)
    const delta = nextFavorite ? 1 : -1
    return {
      supporters_count: Math.max(0, currentSupportersCount + delta),
      created: nextFavorite,
    }
  }

  const params = { path: { participant_id: participantId } }
  const result = nextFavorite
    ? await api.POST('/api/v1/participants/{participant_id}/favorite', { params })
    : await api.DELETE('/api/v1/participants/{participant_id}/favorite', { params })
  const payload = unwrap(result)
  return {
    supporters_count: payload.supporters_count,
    created: payload.created,
  }
}

/** is_favorite с учётом локального избранного гостя. */
export function withLocalFavoriteFlag(
  participantId: number,
  isFavoriteFromApi: boolean,
): boolean {
  if (getAccessToken()) {
    return isFavoriteFromApi
  }
  return isLocalFavorite(participantId)
}
