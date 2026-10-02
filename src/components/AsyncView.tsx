import type { ReactNode } from 'react'
import { Icon56ErrorOutline, Icon56InboxOutline, Icon56WifiOutline } from '@vkontakte/icons'
import { Placeholder, Spinner } from '@vkontakte/vkui'
import { useOnline } from '../hooks/useOnline.ts'

type AsyncViewProps = {
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  children: ReactNode
}

export function AsyncView({ isLoading, isError, isEmpty, children }: AsyncViewProps) {
  const online = useOnline()

  if (!online) {
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
