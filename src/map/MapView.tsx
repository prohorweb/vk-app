import { useConfigProvider } from '@vkontakte/vkui'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Picture } from '../components/Picture.tsx'
import { publicImage } from '../lib/publicImage.ts'
import type { MapCheckpoint, MapParticipantMarker, MapTrack, MapViewHandle, MapViewProps } from './mapTypes.ts'
import { hasVkMapsKey, readVkMapsKey } from './vkMapsKey.ts'
import mmrgl from 'mmr-gl'
import 'mmr-gl/dist/mmr-gl.css'

const TRACK_SOURCE = 'avacha-track'
const TRACK_LAYER = 'avacha-track-line'
const CHECKPOINTS_SOURCE = 'avacha-checkpoints'
const CHECKPOINTS_LAYER = 'avacha-checkpoints-circle'
const MARKERS_SOURCE = 'avacha-participants'
const MARKERS_LAYER = 'avacha-participants-circle'

function trackToGeoJson(track?: MapTrack) {
  if (!track?.coordinates.length) {
    return { type: 'FeatureCollection' as const, features: [] }
  }
  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: { id: track.id, color: track.color ?? '#e64646' },
        geometry: {
          type: 'LineString' as const,
          coordinates: track.coordinates,
        },
      },
    ],
  }
}

function checkpointsToGeoJson(checkpoints?: MapCheckpoint[]) {
  return {
    type: 'FeatureCollection' as const,
    features: (checkpoints ?? []).map((cp) => ({
      type: 'Feature' as const,
      properties: { id: cp.id, kind: cp.kind, label: cp.label ?? '' },
      geometry: {
        type: 'Point' as const,
        coordinates: [cp.lng, cp.lat],
      },
    })),
  }
}

function markersToGeoJson(markers?: MapParticipantMarker[]) {
  return {
    type: 'FeatureCollection' as const,
    features: (markers ?? []).map((marker) => ({
      type: 'Feature' as const,
      properties: {
        id: marker.id,
        participantId: marker.participantId,
        status: marker.status,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [marker.lng, marker.lat],
      },
    })),
  }
}

function collectBounds(
  track?: MapTrack,
  checkpoints?: MapCheckpoint[],
  markers?: MapParticipantMarker[],
): mmrgl.LngLatBounds | null {
  const bounds = new mmrgl.LngLatBounds()
  let hasPoint = false
  for (const [lng, lat] of track?.coordinates ?? []) {
    bounds.extend([lng, lat])
    hasPoint = true
  }
  for (const cp of checkpoints ?? []) {
    bounds.extend([cp.lng, cp.lat])
    hasPoint = true
  }
  for (const marker of markers ?? []) {
    bounds.extend([marker.lng, marker.lat])
    hasPoint = true
  }
  return hasPoint ? bounds : null
}

function styleForScheme(scheme: 'light' | 'dark'): string {
  return scheme === 'dark' ? 'mmr://api/styles/dark_style.json' : 'mmr://api/styles/light_style.json'
}

function ensureLayers(map: mmrgl.Map) {
  if (!map.getSource(TRACK_SOURCE)) {
    map.addSource(TRACK_SOURCE, { type: 'geojson', data: trackToGeoJson() })
    map.addLayer({
      id: TRACK_LAYER,
      type: 'line',
      source: TRACK_SOURCE,
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 4,
      },
    })
  }
  if (!map.getSource(CHECKPOINTS_SOURCE)) {
    map.addSource(CHECKPOINTS_SOURCE, { type: 'geojson', data: checkpointsToGeoJson() })
    map.addLayer({
      id: CHECKPOINTS_LAYER,
      type: 'circle',
      source: CHECKPOINTS_SOURCE,
      paint: {
        'circle-radius': ['match', ['get', 'kind'], 'checkpoint', 5, 7],
        'circle-color': ['match', ['get', 'kind'], 'checkpoint', '#f59824', '#1a3a6e'],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })
  }
  if (!map.getSource(MARKERS_SOURCE)) {
    map.addSource(MARKERS_SOURCE, { type: 'geojson', data: markersToGeoJson() })
    map.addLayer({
      id: MARKERS_LAYER,
      type: 'circle',
      source: MARKERS_SOURCE,
      paint: {
        'circle-radius': 8,
        'circle-color': [
          'match',
          ['get', 'status'],
          'confirmed',
          '#2fc26e',
          'estimated',
          '#f59824',
          '#9aa0a6',
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })
  }
}

function syncData(
  map: mmrgl.Map,
  track?: MapTrack,
  checkpoints?: MapCheckpoint[],
  markers?: MapParticipantMarker[],
) {
  ensureLayers(map)
  const trackSource = map.getSource(TRACK_SOURCE) as mmrgl.GeoJSONSource | undefined
  trackSource?.setData(trackToGeoJson(track))
  const cpSource = map.getSource(CHECKPOINTS_SOURCE) as mmrgl.GeoJSONSource | undefined
  cpSource?.setData(checkpointsToGeoJson(checkpoints))
  const markerSource = map.getSource(MARKERS_SOURCE) as mmrgl.GeoJSONSource | undefined
  markerSource?.setData(markersToGeoJson(markers))
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  { track, checkpoints, markers, fitBounds = true, onMarkerClick, className },
  ref,
) {
  const { colorScheme = 'light' } = useConfigProvider()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mmrgl.Map | null>(null)
  const onMarkerClickRef = useRef(onMarkerClick)
  onMarkerClickRef.current = onMarkerClick
  const propsRef = useRef({ track, checkpoints, markers, fitBounds })
  propsRef.current = { track, checkpoints, markers, fitBounds }

  const mapsEnabled = hasVkMapsKey()

  useImperativeHandle(ref, () => ({
    zoomIn: () => mapRef.current?.zoomIn({ duration: 200 }),
    zoomOut: () => mapRef.current?.zoomOut({ duration: 200 }),
    fitToContent: () => {
      const map = mapRef.current
      if (!map) {
        return
      }
      const bounds = collectBounds(
        propsRef.current.track,
        propsRef.current.checkpoints,
        propsRef.current.markers,
      )
      if (bounds) {
        map.fitBounds(bounds, { padding: 48, duration: 400, maxZoom: 14 })
      }
    },
    flyToUserLocation: () => {
      const map = mapRef.current
      if (!map) {
        return
      }
      if (!navigator.geolocation) {
        map.flyTo({ center: [158.82, 53.04], zoom: 11 })
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 13,
          })
        },
        () => {
          map.flyTo({ center: [158.82, 53.04], zoom: 11 })
        },
        { enableHighAccuracy: false, timeout: 8000 },
      )
    },
  }))

  useEffect(() => {
    if (!mapsEnabled || !containerRef.current) {
      return
    }
    const token = readVkMapsKey()
    if (token) {
      mmrgl.accessToken = token
    }
    const scheme = colorScheme === 'dark' ? 'dark' : 'light'
    const map = new mmrgl.Map({
      container: containerRef.current,
      style: styleForScheme(scheme),
      center: [158.82, 53.04],
      zoom: 10,
      attributionControl: true,
      logoPosition: 'bottom-left',
    })
    mapRef.current = map

    const onLoad = () => {
      syncData(map, propsRef.current.track, propsRef.current.checkpoints, propsRef.current.markers)
      if (propsRef.current.fitBounds) {
        const bounds = collectBounds(
          propsRef.current.track,
          propsRef.current.checkpoints,
          propsRef.current.markers,
        )
        if (bounds) {
          map.fitBounds(bounds, { padding: 48, maxZoom: 14 })
        }
      }
    }

    const onMarkerLayerClick = (event: mmrgl.MapLayerMouseEvent) => {
      const feature = event.features?.[0]
      const id = feature?.properties?.id
      if (typeof id === 'string') {
        onMarkerClickRef.current?.(id)
      }
    }

    map.on('load', onLoad)
    map.on('click', MARKERS_LAYER, onMarkerLayerClick)
    map.on('mouseenter', MARKERS_LAYER, () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', MARKERS_LAYER, () => {
      map.getCanvas().style.cursor = ''
    })

    return () => {
      map.off('load', onLoad)
      map.off('click', MARKERS_LAYER, onMarkerLayerClick)
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- карта создаётся один раз
  }, [mapsEnabled])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapsEnabled) {
      return
    }
    const scheme = colorScheme === 'dark' ? 'dark' : 'light'
    map.setStyle(styleForScheme(scheme))
    map.once('styledata', () => {
      syncData(
        map,
        propsRef.current.track,
        propsRef.current.checkpoints,
        propsRef.current.markers,
      )
    })
  }, [colorScheme, mapsEnabled])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) {
      return
    }
    syncData(map, track, checkpoints, markers)
    if (fitBounds) {
      const bounds = collectBounds(track, checkpoints, markers)
      if (bounds) {
        map.fitBounds(bounds, { padding: 48, duration: 400, maxZoom: 14 })
      }
    }
  }, [track, checkpoints, markers, fitBounds])

  if (!mapsEnabled) {
    return (
      <div className={['map-view', 'map-view--placeholder', className].filter(Boolean).join(' ')}>
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

  return (
    <div
      ref={containerRef}
      className={['map-view', className].filter(Boolean).join(' ')}
      aria-label="Карта маршрута"
    />
  )
})
