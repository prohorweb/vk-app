import { forwardRef, useEffect, useState } from 'react'
import { Picture } from '../components/Picture.tsx'
import { publicImage } from '../lib/publicImage.ts'
import type { MapViewHandle, MapViewProps } from './mapTypes.ts'
import { YandexMapView } from './YandexMapView.tsx'
import { loadYmapsSdk } from './yandexSdk.ts'
import type { YmapsApi } from './yandexTypes.ts'

type SdkState =
  | { status: 'loading'; api: null }
  | { status: 'ready'; api: YmapsApi }
  | { status: 'failed'; api: null }

function useYmapsSdk(): SdkState {
  const [state, setState] = useState<SdkState>({ status: 'loading', api: null })

  useEffect(() => {
    let cancelled = false
    void loadYmapsSdk().then((api) => {
      if (cancelled) {
        return
      }
      setState(api ? { status: 'ready', api } : { status: 'failed', api: null })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(props, ref) {
  const sdk = useYmapsSdk()

  if (sdk.status !== 'ready') {
    return (
      <div
        className={['map-view', 'map-view--placeholder', props.className].filter(Boolean).join(' ')}
      >
        <Picture
          className="map-view__fallback"
          src={publicImage('map-base.png')}
          alt=""
          ratio="1 / 1"
          fit="cover"
          position="center center"
        />
      </div>
    )
  }

  return <YandexMapView ref={ref} ymaps={sdk.api} {...props} />
})
