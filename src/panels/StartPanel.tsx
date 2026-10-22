import { useEffect, useRef, useState } from 'react'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Button, Checkbox, Link, Panel } from '@vkontakte/vkui'
import startBg from '../assets/start/bg.jpg'
import startLogo from '../assets/start/logo.png'
import { isStartSeen, markStartConsent, markStartSeen } from '../lib/startGate.ts'
import { PATH } from '../routes.ts'

const POLICY_URL = 'https://vk.com/privacy'

type StartPanelProps = {
  id: string
  onBegin: () => void
}

export function StartPanel({ id, onBegin }: StartPanelProps) {
  const routeNavigator = useRouteNavigator()
  const [consentChecked, setConsentChecked] = useState(false)
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
    if (!consentChecked || pending) {
      return
    }
    setPending(true)
    try {
      markStartConsent()
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
          checked={consentChecked}
          onChange={(event) => setConsentChecked(event.target.checked)}
        >
          <span className="start-screen__consent-text">
            Принимаю условия{' '}
            <Link
              className="start-screen__consent-link"
              href={POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              политики конфиденциальности
            </Link>
          </span>
        </Checkbox>
        <Button
          className="start-screen__begin"
          stretched
          size="l"
          mode="primary"
          loading={pending}
          disabled={!consentChecked || pending}
          onClick={handleBegin}
        >
          Продолжить
        </Button>
      </div>
    </Panel>
  )
}
