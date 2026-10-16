import { useEffect, useState } from 'react'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { Button, Checkbox, Panel } from '@vkontakte/vkui'
import { Picture } from '../components/Picture.tsx'
import { publicImage } from '../lib/publicImage.ts'
import { isStartSeen, markStartSeen } from '../lib/startGate.ts'
import { PATH } from '../routes.ts'

type StartPanelProps = {
  id: string
  onBegin: () => void
}

export function StartPanel({ id, onBegin }: StartPanelProps) {
  const routeNavigator = useRouteNavigator()
  const [pushConsent, setPushConsent] = useState(false)
  const seen = isStartSeen()

  useEffect(() => {
    if (seen) {
      void routeNavigator.replace(PATH.map)
    }
  }, [routeNavigator, seen])

  if (seen) {
    return <Panel id={id} />
  }

  return (
    <Panel id={id} className="start-screen">
      <div className="start-screen__hero">
        <Picture
          src={publicImage('start-hero.png')}
          alt="Эмблема всероссийской гонки «Авача» на фоне камчатского склона"
          ratio="5 / 6"
          position="center top"
        />
      </div>
      <div className="start-screen__body">
        <p className="start-screen__title">
          Гонка на длинные дистанции «Авача» (Камчатский край, г. Петропавловск-Камчатский)
        </p>
        <Checkbox checked={pushConsent} onChange={(event) => setPushConsent(event.target.checked)}>
          Согласен(а) на получение push-уведомлений
        </Checkbox>
        <Button
          stretched
          size="l"
          mode="primary"
          onClick={() => {
            markStartSeen(pushConsent)
            onBegin()
            void routeNavigator.replace(PATH.map)
          }}
        >
          Начать
        </Button>
      </div>
    </Panel>
  )
}
