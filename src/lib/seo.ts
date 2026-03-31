// src/lib/seo.ts
// Centralised SEO defaults for react-helmet-async

export const SEO_BASE = {
  siteName:    'Brian M Muimi Books and Publications',
  siteUrl:     'https://brianmmuimi.web.app',
  description: 'Free educational books by Brian M Muimi — history, science, health, ethics and more. Read online, no payment required.',
  image:        'https://brianmmuimi.web.app/logo.svg',
  twitterHandle: '@brianmuimi',
  locale:      'en_KE',
}

export interface SEOProps {
  title?:       string
  description?: string
  path?:        string
  noIndex?:     boolean
}

export function buildTitle(page?: string): string {
  return page
    ? `${page} — ${SEO_BASE.siteName}`
    : SEO_BASE.siteName
}