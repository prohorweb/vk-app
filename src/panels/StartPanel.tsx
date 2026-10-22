import { useEffect, useState } from 'react'
import vkBridge from '@vkontakte/vk-bridge'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Button, Checkbox, Panel } from '@vkontakte/vkui'
import startBg from '../assets/start/bg.jpg'
import startLogo from '../assets/start/logo.png'
import { applyStartNotificationConsent } from '../lib/notificationSettings.ts'
import { isStartSeen, markStartSeen } from '../lib/startGate.ts'
import { PATH } from '../routes.ts'

type StartPanelProps = {
  id: string
  onBegin: () => void
}

type AllowNotificationsResult = {
  result?: boolean
}

async function requestPushPermission(): Promise<boolean> {
  try {
    const response = (await vkBridge.send(
      'VKWebAppAllowNotifications' as never,
    )) as AllowNotificationsResult
    return response.result === true
  } catch {
    return false
  }
}

export function StartPanel({ id, onBegin }: StartPanelProps) {
  const routeNavigator = useRouteNavigator()
  const [pushConsent, setPushConsent] = useState(false)
  const [pending, setPending] = useState(false)
  const seen = isStartSeen()

  useEffect(() => {
    if (seen) {
      void routeNavigator.replace(PATH.map)
    }
  }, [routeNavigator, seen])

  if (seen) {
    return <Panel id={id} />
  }

  const handleBegin = async () => {
    setPending(true)
    try {
      applyStartNotificationConsent(pushConsent)

      if (pushConsent) {
        const allowed = await requestPushPermission()
        if (!allowed) {
          applyStartNotificationConsent(false)
        }
      }

      markStartSeen()
      onBegin()
      void routeNavigator.replace(PATH.map)
    } finally {
      setPending(false)
    }
  }

  return (
    <Panel id={id} className="start-screen">
      <div className="start-screen__bg" aria-hidden>
        <img className="start-screen__bg-img" src={startBg} alt="" decoding="async" />
        <div className="start-screen__bg-film" />
      </div>
      <div className="start-screen__logo-wrap">
        <img
          className="start-screen__logo"
          src={startLogo}
          alt="Эмблема всероссийской гонки «Авача»"
          width={240}
          height={240}
          decoding="async"
        />
      </div>
      <div className="start-screen__form">
        <p className="start-screen__title">
          Гонка на длинные дистанции «Авача» (Камчатский край, г. Петропавловск-Камчатский)
        </p>
        <Checkbox
          className="start-screen__consent"
          checked={pushConsent}
          onChange={(event) => setPushConsent(event.target.checked)}
        >
          Согласен(а) на получение push-уведомлений
        </Checkbox>
        <Button
          className="start-screen__begin"
          stretched
          size="l"
          mode="primary"
          loading={pending}
          onClick={() => void handleBegin()}
        >
          Начать
        </Button>
      </div>
    </Panel>
  )
}
