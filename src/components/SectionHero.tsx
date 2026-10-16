import { Picture } from './Picture.tsx'

type SectionHeroProps = {
  alt: string
}

export function SectionHero({ alt }: SectionHeroProps) {
  return <Picture className="section-hero" alt={alt} ratio="16 / 9" />
}
