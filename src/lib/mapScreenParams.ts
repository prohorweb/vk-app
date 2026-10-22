export function readMapMarkerFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('mapMarker')
}
