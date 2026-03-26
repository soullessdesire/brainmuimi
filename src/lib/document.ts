// src/lib/documents.ts
// Single source of truth for the document catalogue.
// Price is in KES. Swap currency symbol in PdfPage if needed.

import type { Document } from '../types'

export const DOCUMENTS: Document[] = [
  {
    id:          'doc-1',
    title:       'The Complete Business Strategy Guide',
    description: 'A 120-page guide covering market analysis, competitive positioning, and growth frameworks used by Fortune 500 companies.',
    pages:       120,
    size:        '4.2 MB',
    category:    'Business',
    price:       1500,
    preview:     'This guide covers the fundamentals of business strategy, from SWOT analysis to Blue Ocean frameworks…',
    storagePath: ''
  },
  {
    id:          'doc-2',
    title:       'Advanced Financial Modelling',
    description: 'Master DCF, LBO, and M&A models with step-by-step walkthroughs and real-world case studies.',
    pages:       85,
    size:        '3.1 MB',
    category:    'Finance',
    price:       2500,
    preview:     'Financial modelling is the backbone of investment decision-making. This document walks through…',
    storagePath: ''
  },
  {
    id:          'doc-3',
    title:       'Digital Marketing Playbook 2024',
    description: 'Proven tactics for SEO, paid ads, email campaigns, and conversion rate optimisation.',
    pages:       64,
    size:        '2.7 MB',
    category:    'Marketing',
    price:       1200,
    preview:     'The digital landscape has fundamentally shifted. This playbook equips you with data-driven strategies…',
    storagePath: ''
  },
  {
    id:          'doc-4',
    title:       'Leadership & Team Dynamics',
    description: 'Evidence-based frameworks for building high-performance teams, managing conflict, and developing leadership presence.',
    pages:       98,
    size:        '3.6 MB',
    category:    'Leadership',
    price:       1800,
    preview:     'Great teams are built on psychological safety, clear accountability, and deliberate leadership practices…',
    storagePath: ''
  },
  {
    id:          'doc-5',
    title:       'Data Science Fundamentals',
    description: 'From statistics basics to machine learning pipelines — a practical primer for analysts and engineers.',
    pages:       140,
    size:        '5.1 MB',
    category:    'Technology',
    price:       3000,
    preview:     'Data science is no longer optional for modern businesses. This primer covers the entire workflow…',
    storagePath: ''
  },
  {
    id:          'doc-6',
    title:       'Legal Contracts for Entrepreneurs',
    description: 'Plain-English breakdowns of NDAs, shareholder agreements, employment contracts, and SaaS terms.',
    pages:       72,
    size:        '2.4 MB',
    category:    'Legal',
    price:       2000,
    preview:     'Understanding the contracts you sign protects your business and your relationships. This guide covers…',
    storagePath: ''
  },
]

export const CURRENCY_SYMBOL = 'KES'

export function formatPrice(price: number): string {
  return `${CURRENCY_SYMBOL} ${price.toLocaleString()}`
}

export function getDocById(id: string): Document | undefined {
  return DOCUMENTS.find(d => d.id === id)
}