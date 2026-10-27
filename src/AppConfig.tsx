import { useEffect, type ReactNode } from 'react'
import vkBridge, { parseURLSearchParamsForGetLaunchParams } from '@vkontakte/vk-bridge'
import { useAdaptivity, useAppearance, useInsets } from '@vkontakte/vk-bridge-react'
import { AdaptivityProvider, AppRoot, Banner, ConfigProvider } from '@vkontakte/vkui'
import { signInWithVk } from './api/auth.ts'
import { hasApiUrl } from './api/client.ts'
import { useBrowserAdaptivity } from './hooks/useBrowserAdaptivity.ts'
import { transformVKBridgeAdaptivity } from './lib/transformVKBridgeAdaptivity.ts'

type AppConfigProps = {
  children: ReactNode
}

function appearanceFromSearchParams(): 'light' | 'dark' | undefined {
  const value = new URLSearchParams(window.location.search).get('appearance')
  if (value === 'light' || value === 'dark') {
    return value
  }
  return undefined
}

export function AppConfig({ children }: AppConfigProps) {
  const bridgeAppearance = useAppearance()
  const appearance = bridgeAppearance ?? appearanceFromSearchParams() ?? 'light'
  const insets = useInsets() || undefined
  const bridgeAdaptivity = useAdaptivity()
  const browserAdaptivity = useBrowserAdaptivity()
  const { vk_platform } = parseURLSearchParamsForGetLaunchParams(window.location.search)
  const inClient = vkBridge.isWebView()
  const adaptivity = bridgeAdaptivity.type
    ? transformVKBridgeAdaptivity(bridgeAdaptivity)
    : browserAdaptivity

  useEffect(() => {
    void signInWithVk().catch(() => {
      // Вне VK авторизация не проходит — экран работает на публичном API.
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
              <Banner title="Адрес API не задан" subtitle="Укажите VITE_API_URL в файле .env" />
            ) : null}
            <div className="app-shell__body">{children}</div>
          </div>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  )
}
