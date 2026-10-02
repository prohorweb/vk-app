import { useEffect, useState } from 'react'
import {
  type AdaptivityProps,
  getViewHeightByViewportHeight,
  getViewWidthByViewportWidth,
} from '@vkontakte/vkui'
import { APP_FRAME_WIDTH } from '../lib/appFrame.ts'

export function useBrowserAdaptivity(): AdaptivityProps {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))

  useEffect(() => {
    const update = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return {
    viewWidth: getViewWidthByViewportWidth(Math.min(size.width, APP_FRAME_WIDTH)),
    viewHeight: getViewHeightByViewportHeight(size.height),
  }
}
