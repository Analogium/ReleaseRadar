import { useEffect } from 'react'

const SITE_URL = 'https://releaseradarapp.com'

interface SeoProps {
  /** Titre de l'onglet / balise <title> (unique par page). */
  title: string
  /** Meta description (unique par page) — omise pour les pages non indexables. */
  description?: string
  /** Chemin canonique (ex. '/login'). Omis pour les pages transitoires. */
  path?: string
  /** Empêche l'indexation (pages privées / transitoires). */
  noindex?: boolean
}

/**
 * Gère les balises meta par page pour le SEO. Plutôt que d'ajouter des balises
 * (au risque de doublons avec celles d'`index.html`), on **met à jour en place**
 * les balises existantes de manière impérative — déterministe et sans dépendance.
 */
export default function Seo({ title, description, path, noindex }: SeoProps) {
  useEffect(() => {
    document.title = title
    upsertMeta('property', 'og:title', title)

    if (description) {
      upsertMeta('name', 'description', description)
      upsertMeta('property', 'og:description', description)
    }

    if (path) {
      const url = SITE_URL + path
      upsertCanonical(url)
      upsertMeta('property', 'og:url', url)
    }

    if (noindex) upsertMeta('name', 'robots', 'noindex, nofollow')
    else removeMeta('name', 'robots')
  }, [title, description, path, noindex])

  return null
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function removeMeta(attr: 'name' | 'property', key: string) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}
