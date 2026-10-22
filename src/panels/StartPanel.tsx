import { useEffect, useState } from 'react'
import vkBridge from '@vkontakte/vk-bridge'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Button, Checkbox, Panel } from '@vkontakte/vkui'
import { Picture } from '../components/Picture.tsx'
import { applyStartNotificationConsent } from '../lib/notificationSettings.ts'
import { publicImage } from '../lib/publicImage.ts'
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
      <div className="start-screen__hero">
        <Picture
          src={publicImage('start-hero.png')}
          alt="Эмблема всероссийской гонки «Авача» на фоне камчатского склона"
          ratio="5 / 6"
          position="center 42%"
        />
      </div>
      <div className="start-screen__body">
        <p className="start-screen__title">
          Гонка на длинные дистанции «Авача» (Камчатский край, г. Петропавловск-Камчатский)
        </p>
        <Checkbox checked={pushConsent} onChange={(event) => setPushConsent(event.target.checked)}>
          Согласен(а) на получение push-уведомлений
        </Checkbox>
        <Button stretched size="l" mode="primary" loading={pending} onClick={() => void handleBegin()}>
          Начать
        </Button>
      </div>
    </Panel>
  )
}
