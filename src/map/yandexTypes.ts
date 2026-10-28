/**
 * Минимальные типы Yandex Maps JS API 2.1: описан только используемый нами
 * объём API. Официальные типы идут отдельным пакетом, которого в проекте нет;
 * при расширении работы с картой дополняйте интерфейсы здесь.
 */

/** Координаты в формате Yandex Maps: [lat, lng]. */
export type YmapsLatLng = [number, number]

export type YmapsEventObject = {
  get(key: string): unknown
}

export interface YmapsEventManager {
  add(event: string, handler?: (event: YmapsEventObject) => void): void
  remove(event: string, handler?: (event: YmapsEventObject) => void): void
}

export interface YmapsGeoObject {
  events: YmapsEventManager
}

export interface YmapsGeometry {
  getBounds(): [YmapsLatLng, YmapsLatLng] | null
}

export interface YmapsPolyline extends YmapsGeoObject {
  geometry: YmapsGeometry
}

export type YmapsSetBoundsOptions = {
  checkZoomRange?: boolean
  zoomMargin?: number
  duration?: number
}

export type YmapsMapAnimationOptions = {
  duration?: number
}

export type YmapsMapState = {
  center: YmapsLatLng
  zoom: number
  controls?: readonly string[]
  margin?: number[]
}

export type YmapsMapOptions = {
  suppressMapOpenBlock?: boolean
}

export type YmapsBehaviorName = 'drag' | 'scrollZoom' | 'dblClickZoom' | 'multiTouch'

export interface YmapsMap {
  behaviors: {
    disable(name: YmapsBehaviorName | string): void
    enable(name: YmapsBehaviorName | string): void
  }
  geoObjects: {
    add(object: YmapsGeoObject): YmapsGeoObjectCollection
    remove(object: YmapsGeoObject): YmapsGeoObjectCollection
    removeAll(): YmapsGeoObjectCollection
  }
  getZoom(): number
  setZoom(zoom: number, options?: YmapsMapAnimationOptions): void
  panTo(center: YmapsLatLng, options?: { flying?: boolean; duration?: number }): void
  setBounds(bounds: readonly [YmapsLatLng, YmapsLatLng], options?: YmapsSetBoundsOptions): void
  destroy(): void
}

export interface YmapsGeoObjectCollection {
  add: (object: YmapsGeoObject) => YmapsGeoObjectCollection
  remove: (object: YmapsGeoObject) => YmapsGeoObjectCollection
  removeAll: () => YmapsGeoObjectCollection
}

export type YmapsPlacemarkOptions = {
  preset?: string
  iconColor?: string
  cursor?: string
}

export type YmapsPlacemarkProperties = {
  hintContent?: string
  iconContent?: string
}

export type YmapsPolylineOptions = {
  strokeColor?: string
  strokeWidth?: number
  strokeOpacity?: number
}

export interface YmapsApi {
  ready(callback: () => void): void
  Map: new (element: HTMLElement, state: YmapsMapState, options?: YmapsMapOptions) => YmapsMap
  Polyline: new (
    coordinates: readonly YmapsLatLng[],
    properties?: Record<string, unknown>,
    options?: YmapsPolylineOptions,
  ) => YmapsPolyline
  Placemark: new (
    coordinates: YmapsLatLng,
    properties?: YmapsPlacemarkProperties,
    options?: YmapsPlacemarkOptions,
  ) => YmapsGeoObject
}

declare global {
  interface Window {
    ymaps?: YmapsApi
  }
}
