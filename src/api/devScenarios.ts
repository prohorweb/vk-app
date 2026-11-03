import { getAccessToken } from './token.ts'
import { ApiError, OfflineError, apiBaseUrl, hasApiUrl } from './client.ts'

export type DevScenarioName = 'upcoming' | 'live' | 'finished'

/** В сценарии `live` у Волкова (№7) device_id = 7. */
export const DEV_KINETIC_DEVICE_ID = 7

async function postDevPath(pathSuffix: string): Promise<void> {
  if (!navigator.onLine) {
    throw new OfflineError()
  }
  if (!hasApiUrl) {
    throw new ApiError(0, 'Не задан VITE_API_URL')
  }

  const headers = new Headers({ Accept: 'application/json' })
  const token = getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/dev/scenarios/${pathSuffix}`, {
    method: 'POST',
    headers,
  })

  if (response.status === 403) {
    throw new ApiError(403, 'Dev API недоступен: не ENV=dev')
  }
  if (!response.ok) {
    throw new ApiError(response.status || 0, 'Не удалось применить сценарий')
  }
}

/** Полная перезаливка БД демо-сценарием (~1 с). */
export async function applyDevScenario(name: DevScenarioName): Promise<void> {
  await postDevPath(name)
}

/** Фоновый kinetic: точка каждые ~3 с на бэке. */
export async function startKineticDemo(deviceId: number): Promise<void> {
  await postDevPath(`move/${deviceId}`)
}
