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

/** ID избранных участников. Без авторизации — пустой список. */
export async function fetchFavoriteIds(): Promise<number[]> {
  if (!getAccessToken()) {
    return []
  }
  try {
    const result = await api.GET('/api/v1/participants/favorites/ids')
    const payload: FavoriteIdsResponse = unwrap(result)
    return payload.participant_ids
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return []
    }
    if (isClientApiError(error)) {
      throw error
    }
    return []
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
