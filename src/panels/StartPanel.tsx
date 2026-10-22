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

const startHeroSrc = publicImage('start-hero.png')

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
        <Picture
          src={startHeroSrc}
          alt=""
          ratio="1 / 1"
          className="start-screen__bg-picture"
          fit="cover"
          position="center top"
        />
      </div>
      <div className="start-screen__gradient" aria-hidden />
      <div className="start-screen__content">
        <div className="start-screen__logo">
          <Picture
            src={startHeroSrc}
            alt="Эмблема всероссийской гонки «Авача»"
            ratio="1 / 1"
            className="start-screen__logo-picture"
            fit="cover"
            position="center 34%"
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
      </div>
    </Panel>
  )
}
