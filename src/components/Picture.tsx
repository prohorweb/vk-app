import { useState, type ReactNode } from 'react'

type PictureProps = {
  src?: string | null
  alt: string
  ratio: string
  fallback?: ReactNode
  className?: string
  fit?: 'cover' | 'contain'
  position?: string
}

export function Picture({ src, ...rest }: PictureProps) {
  if (!src) {
    return <PictureFrame {...rest} />
  }
  return <LoadingPicture key={src} src={src} {...rest} />
}

function PictureFrame({
  alt,
  ratio,
  fallback,
  className,
  children,
}: Pick<PictureProps, 'alt' | 'ratio' | 'fallback' | 'className'> & { children?: ReactNode }) {
  return (
    <div className={['picture', className].filter(Boolean).join(' ')} style={{ aspectRatio: ratio }}>
      {children ?? (
        <div className="picture__fallback" role="img" aria-label={alt}>
          {fallback}
        </div>
      )}
    </div>
  )
}

function LoadingPicture({
  src,
  alt,
  ratio,
  fallback,
  className,
  fit = 'cover',
  position = 'center',
}: PictureProps & { src: string }) {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading')

  return (
    <PictureFrame alt={alt} ratio={ratio} fallback={fallback} className={className}>
      {phase === 'loading' ? <div className="picture__skeleton" aria-hidden /> : null}
      {phase === 'error' ? (
        <div className="picture__fallback" role="img" aria-label={alt}>
          {fallback}
        </div>
      ) : (
        <img
          className="picture__img"
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{ objectFit: fit, objectPosition: position, opacity: phase === 'ready' ? 1 : 0 }}
          onLoad={() => setPhase('ready')}
          onError={() => setPhase('error')}
        />
      )}
    </PictureFrame>
  )
}
