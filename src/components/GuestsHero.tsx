import { Picture } from './Picture.tsx'

type GuestsHeroProps = {
  src: string
  alt: string
  title?: string
}

/** Обложка экранов раздела «Гостям»: фото, у списка — ещё и заголовок поверх. */
export function GuestsHero({ src, alt, title }: GuestsHeroProps) {
  return (
    <div className="guests-hero">
      <Picture src={src} alt={alt} ratio="16 / 9" />
      {title ? <span className="guests-hero__title">{title}</span> : null}
    </div>
  )
}
