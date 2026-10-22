import { useState } from 'react'
import { Panel, PanelHeader, PanelHeaderBack, Group, Cell, Switch } from '@vkontakte/vkui'
import { useMoreSectionBack } from '../hooks/useMoreSectionBack.ts'
import {
  NOTIFICATION_PREFERENCES,
  isPreferenceEnabled,
  readNotificationSettings,
  setNotificationPreference,
  setNotificationsAllowed,
  type NotificationSettingsState,
} from '../lib/notificationSettings.ts'

type ProfilePanelProps = {
  id: string
}

export function ProfilePanel({ id }: ProfilePanelProps) {
  const goBack = useMoreSectionBack()
  const [settings, setSettings] = useState<NotificationSettingsState>(() => readNotificationSettings())

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={goBack} />}>Профиль</PanelHeader>
      <Group header="Уведомления">
        <Cell
          Component="label"
          after={
            <Switch
              checked={settings.notifications_allowed}
              onChange={(event) => {
                setSettings(setNotificationsAllowed(event.target.checked))
              }}
            />
          }
        >
          Push-уведомления
        </Cell>
        {NOTIFICATION_PREFERENCES.map((item) => (
          <Cell
            key={item.event_type}
            Component="label"
            after={
              <Switch
                checked={isPreferenceEnabled(settings, item.event_type)}
                disabled={!settings.notifications_allowed}
                onChange={(event) => {
                  setSettings(setNotificationPreference(item.event_type, event.target.checked))
                }}
              />
            }
          >
            {item.title}
          </Cell>
        ))}
      </Group>
    </Panel>
  )
}
