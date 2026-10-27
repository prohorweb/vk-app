import type { YmapsApi } from './yandexTypes.ts'

const SDK_URL = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU'
const SDK_TIMEOUT_MS = 10_000

let sdkPromise: Promise<YmapsApi | null> | null = null

function loadSdkScript(): Promise<YmapsApi | null> {
  return new Promise((resolve) => {
    if (window.ymaps) {
      window.ymaps.ready(() => resolve(window.ymaps ?? null))
      return
    }

    const script = document.createElement('script')
    let settled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const settle = (api: YmapsApi | null) => {
      if (settled) {
        return
      }
      settled = true
      if (timer) {
        clearTimeout(timer)
      }
      script.onload = null
      script.onerror = null
      resolve(api)
    }

    timer = setTimeout(() => {
      script.remove()
      settle(null)
    }, SDK_TIMEOUT_MS)

    script.src = SDK_URL
    script.async = true
    script.onload = () => {
      const api = window.ymaps
      if (!api) {
        settle(null)
        return
      }
      api.ready(() => settle(api))
    }
    script.onerror = () => {
      script.remove()
      settle(null)
    }
    document.head.appendChild(script)
  })
}

/** Загружает SDK один раз; ошибка не кешируется — после сбоя можно ретраить. */
export function loadYmapsSdk(): Promise<YmapsApi | null> {
  sdkPromise ??= loadSdkScript()
  return sdkPromise
}

export function resetYmapsSdk(): void {
  sdkPromise = null
}
