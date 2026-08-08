import { useEffect } from 'react'

const SITE_URL = 'https://immicalc.org'

/**
 * Per-route SEO metadata: document title, meta description, canonical URL and
 * JSON-LD structured data. Rendered client-side.
 */
export function Seo({ title, description, path }: { title: string; description: string; path: string }) {
  useEffect(() => {
    document.title = title

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', `${SITE_URL}${path}`)

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `${SITE_URL}${path}`)

    document.querySelector('script#seo-jsonld')?.remove()
    const script = document.createElement('script')
    script.id = 'seo-jsonld'
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: title,
      url: `${SITE_URL}${path}`,
      applicationCategory: 'UtilitiesApplication',
      description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
    })
    document.head.appendChild(script)
  }, [title, description, path])

  return null
}
