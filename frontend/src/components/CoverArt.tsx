import { useState } from 'react'
import { Disc3 } from 'lucide-react'

interface CoverArtProps {
  mbid: string
  alt: string
}

/**
 * Pochette récupérée depuis la Cover Art Archive à partir du MBID de la release.
 * Fallback sur une tuile dégradée si absente (404) ou en erreur.
 */
export default function CoverArt({ mbid, alt }: CoverArtProps) {
  const [failed, setFailed] = useState(false)

  if (!mbid || failed) {
    return (
      <div className="gradient-brand flex h-full w-full items-center justify-center">
        <Disc3 className="h-10 w-10 text-white/70" />
      </div>
    )
  }

  return (
    <img
      src={`https://coverartarchive.org/release/${mbid}/front-250`}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  )
}
