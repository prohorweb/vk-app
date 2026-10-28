import vkBridge from '@vkontakte/vk-bridge'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type {
  MapCheckpoint,
  MapParticipantMarker,
  MapPlacemark,
  MapTrack,
  MapViewHandle,
} from './mapTypes.ts'
import type { YmapsApi, YmapsLatLng, YmapsMap } from './yandexTypes.ts'
import { PARTICIPANT_COLOR_BY_STATUS, TRACK_COLOR_BY_KIND } from './yandexColors.ts'
import {
  PLACEMARK_GLYPH_BY_KIND,
  PLACEMARK_PIN_OFFSET,
  PLACEMARK_PIN_SIZE,
  placemarkPinHref,
} from './placemarkPins.ts'

/** Центр по умолчанию — Петропавловск-Камчатский. */
const DEFAULT_CENTER: YmapsLatLng = [53.04, 158.82]
const DEFAULT_ZOOM = 10
const FIT_PADDING = 30
/** Одна точка не даёт рамки: `setBounds` ушёл бы в максимальный зум без тайлов. */
const SINGLE_POINT_ZOOM = 14

type YandexMapViewProps = {
  ymaps: YmapsApi
  track?: MapTrack
  tracks?: MapTrack[]
  checkpoints?: MapCheckpoint[]
  markers?: MapParticipantMarker[]
  placemarks?: MapPlacemark[]
  fitBounds?: boolean
  fitKey?: string | number
  onMarkerClick?: (markerId: string) => void
  onPlacemarkClick?: (placemarkId: string) => void
  className?: string
}

/** GeoJSON хранит пары [lon, lat], Yandex Maps ждёт [lat, lng] — переворачиваем. */
function toYandexCoords(coordinates: [number, number][]): YmapsLatLng[] {
  return coordinates.map(([lng, lat]) => [lat, lng])
}

type DataBounds = [YmapsLatLng, YmapsLatLng]

function collectBounds(
  tracks: readonly MapTrack[],
  checkpoints: readonly MapCheckpoint[],
  markers: readonly MapParticipantMarker[],
  placemarks: readonly MapPlacemark[],
): DataBounds | null {
  let south: number | null = null
  let north: number | null = null
  let west: number | null = null
  let east: number | null = null

  for (const [lng, lat] of tracks.flatMap((track) => track.coordinates)) {
    south = south === null ? lat : Math.min(south, lat)
    north = north === null ? lat : Math.max(north, lat)
    west = west === null ? lng : Math.min(west, lng)
    east = east === null ? lng : Math.max(east, lng)
  }
  for (const point of [
    ...checkpoints.map((checkpoint) => ({ lat: checkpoint.lat, lng: checkpoint.lng })),
    ...markers.map((marker) => ({ lat: marker.lat, lng: marker.lng })),
    ...placemarks.map((placemark) => ({ lat: placemark.lat, lng: placemark.lng })),
  ]) {
    south = south === null ? point.lat : Math.min(south, point.lat)
    north = north === null ? point.lat : Math.max(north, point.lat)
    west = west === null ? point.lng : Math.min(west, point.lng)
    east = east === null ? point.lng : Math.max(east, point.lng)
  }

  return south === null || north === null || west === null || east === null
    ? null
    : [
        [south, west],
        [north, east],
      ]
}

function toTrackList(props: YandexMapViewProps): MapTrack[] {
  if (props.tracks && props.tracks.length > 0) {
    return props.tracks
  }
  return props.track ? [props.track] : []
}

function drawContent(map: YmapsMap, props: YandexMapViewProps, ymaps: YmapsApi) {
  map.geoObjects.removeAll()

  const lines = toTrackList(props)
  const multipleTracks = lines.length > 1
  for (const line of lines) {
    if (line.coordinates.length < 2) {
      continue
    }
    map.geoObjects.add(
      new ymaps.Polyline(
        toYandexCoords(line.coordinates),
        {},
        {
          strokeColor: line.color ?? '#e64646',
          strokeWidth: line.width ?? (multipleTracks ? 3 : 4),
          strokeOpacity: 0.7,
        },
      ),
    )
  }

  for (const checkpoint of props.checkpoints ?? []) {
    map.geoObjects.add(
      new ymaps.Placemark(
        [checkpoint.lat, checkpoint.lng],
        { hintContent: checkpoint.label ?? '' },
        {
          preset: 'islands#circleDotIcon',
          iconColor: TRACK_COLOR_BY_KIND[checkpoint.kind],
          cursor: 'default',
        },
      ),
    )
  }

  for (const marker of props.markers ?? []) {
    const label = marker.bib !== undefined ? String(marker.bib) : ''
    const placemark = new ymaps.Placemark(
      [marker.lat, marker.lng],
      { hintContent: label ? `№${label}` : '', iconContent: label },
      {
        preset: 'islands#circleIcon',
        iconColor: PARTICIPANT_COLOR_BY_STATUS[marker.status],
        cursor: 'pointer',
      },
    )
    placemark.events.add('click', () => props.onMarkerClick?.(marker.id))
    map.geoObjects.add(placemark)
  }

  for (const placemark of props.placemarks ?? []) {
    // Метка — SVG-капля из макета; кончик хвоста совпадает с координатой точки.
    const pin = new ymaps.Placemark(
      [placemark.lat, placemark.lng],
      { hintContent: placemark.label },
      {
        iconLayout: 'default#image',
        iconImageHref: placemarkPinHref(placemark.glyph ?? PLACEMARK_GLYPH_BY_KIND[placemark.kind]),
        iconImageSize: [...PLACEMARK_PIN_SIZE],
        iconImageOffset: [...PLACEMARK_PIN_OFFSET],
        zIndex: placemark.selected ? 1 : 0,
        cursor: 'pointer',
      },
    )
    pin.events.add('click', () => props.onPlacemarkClick?.(placemark.id))
    map.geoObjects.add(pin)
  }
}

function fitToData(map: YmapsMap, props: YandexMapViewProps) {
  const bounds = collectBounds(
    toTrackList(props),
    props.checkpoints ?? [],
    props.markers ?? [],
    props.placemarks ?? [],
  )
  if (!bounds) {
    return
  }
  const [[south, west], [north, east]] = bounds
  if (south === north && west === east) {
    map.setZoom(SINGLE_POINT_ZOOM, { duration: 300 })
    map.panTo([south, west], { duration: 300 })
    return
  }
  map.setBounds(bounds, { checkZoomRange: true, zoomMargin: FIT_PADDING, duration: 400 })
}

export const YandexMapView = forwardRef<MapViewHandle, YandexMapViewProps>(function YandexMapView(
  {
    ymaps,
    track,
    tracks,
    checkpoints,
    markers,
    placemarks,
    fitBounds = true,
    fitKey,
    onMarkerClick,
    onPlacemarkClick,
    className,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<YmapsMap | null>(null)
  const lastFitKeyRef = useRef<string | number | null>(null)
  const propsRef = useRef<YandexMapViewProps>({
    ymaps,
    track,
    tracks,
    checkpoints,
    markers,
    placemarks,
    fitBounds,
    fitKey,
    onMarkerClick,
    onPlacemarkClick,
    className,
  })
  propsRef.current = {
    ymaps,
    track,
    tracks,
    checkpoints,
    markers,
    placemarks,
    fitBounds,
    fitKey,
    onMarkerClick,
    onPlacemarkClick,
    className,
  }

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const map = mapRef.current
      if (map) {
        map.setZoom(map.getZoom() + 1, { duration: 200 })
      }
    },
    zoomOut: () => {
      const map = mapRef.current
      if (map) {
        map.setZoom(map.getZoom() - 1, { duration: 200 })
      }
    },
    fitToContent: () => {
      const props = propsRef.current
      const map = mapRef.current
      if (map) {
        fitToData(map, props)
      }
    },
    flyToUserLocation: () => {
      void resolveUserCoords().then((coords) => {
        mapRef.current?.panTo(coords ?? DEFAULT_CENTER, { flying: true, duration: 400 })
      })
    },
  }))

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }
    const map = new ymaps.Map(
      container,
      { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, controls: [] },
      { suppressMapOpenBlock: true },
    )
    mapRef.current = map
    // В VK iframe жест страницы конфликтует со скроллом карты: зум только по кнопкам.
    map.behaviors.disable('scrollZoom')

    const props = propsRef.current
    drawContent(map, props, ymaps)
    if (props.fitBounds) {
      fitToData(map, props)
    }

    return () => {
      map.destroy()
      mapRef.current = null
    }
  }, [ymaps])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }
    drawContent(map, propsRef.current, ymaps)
    if (!fitBounds || fitKey === undefined || lastFitKeyRef.current === fitKey) {
      return
    }
    lastFitKeyRef.current = fitKey
    fitToData(map, propsRef.current)
  }, [ymaps, track, tracks, checkpoints, markers, placemarks, fitBounds, fitKey])

  return (
    <div
      ref={containerRef}
      className={['map-view', className].filter(Boolean).join(' ')}
      aria-label="Карта маршрута (Яндекс Карты)"
    />
  )
})

async function resolveUserCoords(): Promise<YmapsLatLng | null> {
  // В клиенте VK геолокация только через bridge, navigator.geolocation недоступен.
  try {
    const data = await vkBridge.send('VKWebAppGetGeodata')
    if (data.available === 1) {
      return [data.lat, data.long]
    }
  } catch {
    // Вне клиента VK — браузерная геолокация как временный fallback.
  }
  if (!navigator.geolocation) {
    return null
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.latitude, position.coords.longitude])
      },
      () => {
        resolve(null)
      },
      { enableHighAccuracy: false, timeout: 8000 },
    )
  })
}
