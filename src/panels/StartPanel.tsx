import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Button, Checkbox, Panel } from '@vkontakte/vkui'
import startBg from '../assets/start/bg.jpg'
import startLogo from '../assets/start/logo.png'
import { applyDevScenario } from '../api/devScenarios.ts'
import { applyStartNotificationConsent } from '../lib/notificationSettings.ts'
import { isStartSeen, markStartConsent, markStartSeen } from '../lib/startGate.ts'
import { PATH } from '../routes.ts'

type StartPanelProps = {
  id: string
  onBegin: () => void
}

export function StartPanel({ id, onBegin }: StartPanelProps) {
  const routeNavigator = useRouteNavigator()
  const queryClient = useQueryClient()
  const [pushChecked, setPushChecked] = useState(false)
  const [pending, setPending] = useState(false)
  const skipStartRedirected = useRef(false)

  useEffect(() => {
    if (!isStartSeen() || skipStartRedirected.current) {
      return
    }
    skipStartRedirected.current = true
    void routeNavigator.replace(PATH.map)
  }, [routeNavigator])

  if (isStartSeen()) {
    return <Panel id={id} />
  }

  const handleBegin = () => {
    if (pending) {
      return
    }
    setPending(true)
    void (async () => {
      try {
        applyStartNotificationConsent(pushChecked)
        if (pushChecked) {
          markStartConsent()
        }
        // Сценарий 1: после старта — «до гонки ~3 мес», не finished/live.
        try {
          await applyDevScenario('upcoming')
          sessionStorage.removeItem('avacha-vk-app.map-filters')
          await queryClient.invalidateQueries()
        } catch {
          // Вне ENV=dev сценарии недоступны — идём на карту как есть.
        }
        markStartSeen()
        onBegin()
        void routeNavigator.replace(PATH.map)
      } finally {
        setPending(false)
      }
    })()
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
          checked={pushChecked}
          onChange={(event) => setPushChecked(event.target.checked)}
        >
          <span className="start-screen__consent-text">
            Согласен(а) на получение push-уведомлений
          </span>
        </Checkbox>
        <Button
          className="start-screen__begin"
          stretched
          size="l"
          mode="primary"
          loading={pending}
          disabled={pending}
          onClick={handleBegin}
        >
          Начать
        </Button>
      </div>
    </Panel>
  )
}
