import vkBridge from '@vkontakte/vk-bridge'
import type { VKUserInfo } from '../types/index.ts'
import { api, unwrap } from './client.ts'
import { setAccessToken } from './token.ts'

function readLaunchParams(search: string): Record<string, unknown> {
  const params: Record<string, unknown> = {}
  new URLSearchParams(search).forEach((value, key) => {
    params[key] = value
  })
  return params
}

async function readUserInfo(): Promise<VKUserInfo | null> {
  try {
    const info = await vkBridge.send('VKWebAppGetUserInfo')
    return {
      first_name: info.first_name,
      last_name: info.last_name,
      photo_200: info.photo_200,
    }
  } catch {
    return null
  }
}

let authTask: Promise<void> | undefined

export function signInWithVk(): Promise<void> {
  authTask ??= performSignIn()
  return authTask
}

async function performSignIn(): Promise<void> {
  const params = readLaunchParams(window.location.search)
  const userInfo = await readUserInfo()

  if (Object.keys(params).length === 0) {
    return
  }

  const result = await api.POST('/api/v1/auth/vk', {
    body: {
      params,
      user_info: userInfo,
    },
  })
  const session = unwrap(result)
  setAccessToken(session.access_token)
}
