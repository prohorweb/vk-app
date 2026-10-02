import { useEffect, type ReactNode } from 'react'
import vkBridge, { parseURLSearchParamsForGetLaunchParams } from '@vkontakte/vk-bridge'
import { useAdaptivity, useAppearance, useInsets } from '@vkontakte/vk-bridge-react'
import { AdaptivityProvider, AppRoot, ConfigProvider } from '@vkontakte/vkui'
import { signInWithVk } from './api/auth.ts'
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

  useEffect(() => {
    void signInWithVk().catch(() => undefined)
  }, [])
  const adaptivity = bridgeAdaptivity.type
    ? transformVKBridgeAdaptivity(bridgeAdaptivity)
    : browserAdaptivity

  return (
    <ConfigProvider
      colorScheme={appearance}
      platform={vk_platform === 'desktop_web' ? 'vkcom' : undefined}
      isWebView={inClient}
      hasCustomPanelHeaderAfter
    >
      <AdaptivityProvider {...adaptivity}>
        <AppRoot mode="full" safeAreaInsets={insets} className={inClient ? undefined : 'app-frame'}>
          {children}
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  )
}
