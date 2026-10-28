import { useCallback, useEffect, useRef } from 'react'
import { Icon24Cancel } from '@vkontakte/icons'
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router'
import { SimpleCell } from '@vkontakte/vkui'
import { setMoreMenuReturn } from '../lib/moreMenuReturn.ts'
import { PATH } from '../routes.ts'
import { BottomSheet } from './BottomSheet.tsx'
import { MoreMenuIcon, type MoreMenuIconId } from './MoreMenuIcon.tsx'

type MoreMenuSheetProps = {
  open: boolean
  onClose: () => void
}

const items: { path: string; label: string; icon: MoreMenuIconId }[] = [
  { path: PATH.profile, label: 'Профиль', icon: 'profile' },
  { path: PATH.about, label: 'О гонке', icon: 'about' },
  { path: PATH.route, label: 'Маршрут', icon: 'route' },
  { path: PATH.guests, label: 'Гостям', icon: 'guests' },
  { path: PATH.media, label: 'Новости', icon: 'news' },
]

export function MoreMenuSheet({ open, onClose }: MoreMenuSheetProps) {
  const routeNavigator = useRouteNavigator()
  const ignorePopStateRef = useRef(false)

  useEffect(() => {
    if (!open) {
      return
    }

    history.pushState({ moreMenu: true }, '')

    const onPopState = () => {
      if (ignorePopStateRef.current) {
        ignorePopStateRef.current = false
        return
      }
      onClose()
    }

    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      return
    }
    if (history.state?.moreMenu) {
      ignorePopStateRef.current = true
      history.back()
    }
  }, [open])

  const requestClose = useCallback(() => {
    onClose()
  }, [onClose])

  const openSection = (path: string) => {
    const returnPath = window.location.hash.replace(/^#/, '') || '/'
    setMoreMenuReturn(returnPath)
    requestClose()
    // replace, а не push: служебная запись history от открытой шторки не должна
    // оставаться в стеке — иначе возврат из раздела проскакивает через неё.
    void routeNavigator.replace(path)
  }

  return (
    <BottomSheet
      open={open}
      onClose={requestClose}
      ariaLabel="Дополнительное меню"
      sheetClassName="more-menu-sheet"
      panelClassName="more-menu-sheet__panel"
      hideTabbar
    >
      <button
        type="button"
        className="more-menu-sheet__close"
        aria-label="Закрыть"
        onClick={requestClose}
      >
        <Icon24Cancel />
      </button>
      {items.map(({ path, label, icon }) => (
        <SimpleCell
          key={path}
          className="more-menu-sheet__cell"
          before={<MoreMenuIcon id={icon} />}
          onClick={() => openSection(path)}
        >
          {label}
        </SimpleCell>
      ))}
    </BottomSheet>
  )
}
