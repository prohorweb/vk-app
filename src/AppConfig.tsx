import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import vkBridge, { parseURLSearchParamsForGetLaunchParams } from '@vkontakte/vk-bridge'
import { useAdaptivity, useAppearance, useInsets } from '@vkontakte/vk-bridge-react'
import { AdaptivityProvider, AppRoot, Banner, Button, ConfigProvider } from '@vkontakte/vkui'
import { getAuthError, signInWithVk, subscribeAuthError } from './api/auth.ts'
import { hasApiUrl } from './api/client.ts'
import { useBrowserAdaptivity } from './hooks/useBrowserAdaptivity.ts'
import { transformVKBridgeAdaptivity } from './lib/transformVKBridgeAdaptivity.ts'

type AppConfigProps = {
  children: ReactNode
}

export function AppConfig({ children }: AppConfigProps) {
  const appearance = useAppearance() || undefined
  const insets = useInsets() || undefined
  const bridgeAdaptivity = useAdaptivity()
  const browserAdaptivity = useBrowserAdaptivity()
  const { vk_platform } = parseURLSearchParamsForGetLaunchParams(window.location.search)
  const inClient = vkBridge.isWebView()
  const authError = useSyncExternalStore(subscribeAuthError, getAuthError, () => null)
  const [authPending, setAuthPending] = useState(false)
  const adaptivity = bridgeAdaptivity.type
    ? transformVKBridgeAdaptivity(bridgeAdaptivity)
    : browserAdaptivity

  const startAuth = useCallback(() => {
    setAuthPending(true)
    void signInWithVk()
      .catch(() => {
        // Сообщение уже опубликовано в signInWithVk и показано в баннере.
      })
      .finally(() => {
        setAuthPending(false)
      })
  }, [])

  useEffect(() => {
    void signInWithVk().catch(() => {
      // Сообщение уже опубликовано в signInWithVk и показано в баннере.
    })
  }, [])

  return (
    <ConfigProvider
      colorScheme={appearance}
      platform={vk_platform === 'desktop_web' ? 'vkcom' : undefined}
      isWebView={inClient}
      hasCustomPanelHeaderAfter
    >
      <AdaptivityProvider {...adaptivity}>
        <AppRoot mode="full" safeAreaInsets={insets} className={inClient ? undefined : 'app-frame'}>
          <div className="app-shell">
            {!hasApiUrl ? (
              <Banner
                title="Адрес API не задан"
                subtitle="Укажите VITE_API_URL в файле .env"
              />
            ) : null}
            {authError ? (
              <Banner
                title="Не удалось войти"
                subtitle={authError}
                actions={
                  <Button size="s" mode="primary" loading={authPending} onClick={startAuth}>
                    Повторить
                  </Button>
                }
              />
            ) : null}
            <div className="app-shell__body">{children}</div>
          </div>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  )
}
