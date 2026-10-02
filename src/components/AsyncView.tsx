import type { ReactNode } from 'react'
import { Icon56ErrorOutline, Icon56InboxOutline, Icon56WifiOutline } from '@vkontakte/icons'
import { Placeholder, Spinner } from '@vkontakte/vkui'
import { useOnline } from '../hooks/useOnline.ts'
import { formatClock } from '../lib/labels.ts'

type AsyncViewProps = {
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  updatedAt?: number
  children: ReactNode
}

export function AsyncView({ isLoading, isError, isEmpty, updatedAt, children }: AsyncViewProps) {
  const online = useOnline()
  const hasData = Boolean(updatedAt) && !isEmpty

  if (!online) {
    if (hasData) {
      return (
        <>
          <div className="offline-stamp">данные от {formatClock(updatedAt ?? 0)}</div>
          {children}
        </>
      )
    }

    return (
      <Placeholder icon={<Icon56WifiOutline />} title="Нет сети" stretched>
        Проверьте подключение и попробуйте снова
      </Placeholder>
    )
  }

  if (isLoading) {
    return (
      <div className="async-view">
        <Spinner size="l" />
      </div>
    )
  }

  if (isError) {
    return (
      <Placeholder icon={<Icon56ErrorOutline />} title="Ошибка" stretched>
        Не удалось загрузить данные
      </Placeholder>
    )
  }

  if (isEmpty) {
    return (
      <Placeholder icon={<Icon56InboxOutline />} title="Пусто" stretched>
        Здесь пока ничего нет
      </Placeholder>
    )
  }

  return children
}
