// src/components/SEO.tsx
import { Helmet } from 'react-helmet-async'
import { SEO_BASE, buildTitle, type SEOProps } from '@/lib/seo'

export function SEO({ title, description, path, noIndex = false }: SEOProps) {
  const fullTitle = buildTitle(title)
  const desc      = description ?? SEO_BASE.description
  const canonical = path ? `${SEO_BASE.siteUrl}${path}` : SEO_BASE.siteUrl

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description"  content={desc} />
      <link rel="canonical"     href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content={SEO_BASE.siteName} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:image"       content={SEO_BASE.image} />
      <meta property="og:locale"      content={SEO_BASE.locale} />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image"       content={SEO_BASE.image} />
    </Helmet>
  )
}