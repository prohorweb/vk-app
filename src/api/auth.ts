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

type AuthListener = () => void

let authTask: Promise<void> | undefined
let authError: string | null = null
const authListeners = new Set<AuthListener>()

function publishAuthError(message: string | null): void {
  authError = message
  authListeners.forEach((listener) => listener())
}

export function getAuthError(): string | null {
  return authError
}

export function subscribeAuthError(listener: AuthListener): () => void {
  authListeners.add(listener)
  return () => {
    authListeners.delete(listener)
  }
}

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
    publishAuthError(null)
    authTask = performSignIn()
      .then(() => {
        publishAuthError(null)
      })
      .catch((error: unknown) => {
        authTask = undefined
        publishAuthError(error instanceof Error ? error.message : 'Не удалось войти')
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
