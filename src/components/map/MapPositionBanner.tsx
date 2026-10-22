type MapPositionBannerProps = {
  label: string
}

export function MapPositionBanner({ label }: MapPositionBannerProps) {
  return (
    <div className="map-position-banner" role="status">
      <p className="map-position-banner__text">{label}</p>
    </div>
  )
}
