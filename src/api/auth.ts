import vkBridge from '@vkontakte/vk-bridge'
import type { VKUserInfo } from '../types/index.ts'
import { api, setUnauthorizedHandler, unwrap } from './client.ts'
import { queryClient } from './queryClient.ts'
import { clearToken, getAccessToken, setAccessToken } from './token.ts'

export function hasLaunchParams(search: string = window.location.search): boolean {
  return new URLSearchParams(search).toString().length > 0
}

function readLaunchParams(search: string): Record<string, unknown> {
  const params: Record<string, unknown> = {}
  new URLSearchParams(search).forEach((value, key) => {
    params[key] = value
  })
  return params
}

/** Вне VK мост не отвечает никогда, поэтому ждём ответ ограниченное время. */
const BRIDGE_TIMEOUT_MS = 3000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('timeout')), ms)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        window.clearTimeout(timer)
        reject(error)
      },
    )
  })
}

async function readUserInfo(): Promise<VKUserInfo | null> {
  try {
    const info = await withTimeout(vkBridge.send('VKWebAppGetUserInfo'), BRIDGE_TIMEOUT_MS)
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

export function resetAuthTask(): void {
  authTask = undefined
}

let relogin: Promise<boolean> | null = null

function reloginOnce(): Promise<boolean> {
  if (!relogin) {
    relogin = (async () => {
      clearToken()
      resetAuthTask()
      try {
        await signInWithVk()
        return getAccessToken() !== null
      } catch {
        return false
      }
    })().finally(() => {
      relogin = null
    })
  }
  return relogin
}

setUnauthorizedHandler(reloginOnce)

export function signInWithVk(): Promise<void> {
  if (!authTask) {
    authTask = performSignIn().catch((error: unknown) => {
      authTask = undefined
      throw error
    })
  }
  return authTask
}

async function performSignIn(): Promise<void> {
  const params = readLaunchParams(window.location.search)
  const userInfo = await readUserInfo()

  if (!hasLaunchParams()) {
    return
  }

  const result = await api.POST('/api/v1/auth/vk', {
    body: {
      params,
      user_info: userInfo,
    },
  })
  const session = unwrap(result)
  setAccessToken(session.access_token, session.expires_in)
  await queryClient.invalidateQueries()
}
