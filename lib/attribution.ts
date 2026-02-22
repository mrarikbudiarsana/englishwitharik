export interface AttributionData {
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
  gclid?: string | null
  fbclid?: string | null
  msclkid?: string | null
}

export interface AttributionBundle {
  first: AttributionData
  last: AttributionData
}

function sanitizeParam(value: string | null, maxLength = 200): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLength)
}

function getAttributionFromSearch(search: URLSearchParams): AttributionData {
  return {
    utm_source: sanitizeParam(search.get('utm_source')),
    utm_medium: sanitizeParam(search.get('utm_medium')),
    utm_campaign: sanitizeParam(search.get('utm_campaign')),
    utm_term: sanitizeParam(search.get('utm_term')),
    utm_content: sanitizeParam(search.get('utm_content')),
    gclid: sanitizeParam(search.get('gclid')),
    fbclid: sanitizeParam(search.get('fbclid')),
    msclkid: sanitizeParam(search.get('msclkid')),
  }
}

function hasAttribution(data: AttributionData): boolean {
  return Boolean(
    data.utm_source
    || data.utm_medium
    || data.utm_campaign
    || data.utm_term
    || data.utm_content
    || data.gclid
    || data.fbclid
    || data.msclkid
  )
}

function readAttributionKey(key: string): AttributionData {
  if (typeof window === 'undefined') return {}
  const raw = localStorage.getItem(key)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as AttributionData
  } catch {
    return {}
  }
}

export function getAttributionBundle(): AttributionBundle {
  if (typeof window === 'undefined') return { first: {}, last: {} }

  const firstKey = 'ewa_attr_first'
  const lastKey = 'ewa_attr_last'
  const fromUrl = getAttributionFromSearch(new URLSearchParams(window.location.search))
  const hasFromUrl = hasAttribution(fromUrl)

  let first = readAttributionKey(firstKey)
  let last = readAttributionKey(lastKey)

  if (!hasAttribution(first) && hasFromUrl) {
    first = fromUrl
    localStorage.setItem(firstKey, JSON.stringify(first))
  }

  if (hasFromUrl) {
    last = fromUrl
    localStorage.setItem(lastKey, JSON.stringify(last))
  }

  if (!hasAttribution(first) && !hasAttribution(last)) {
    const legacy = readAttributionKey('ewa_attr')
    if (hasAttribution(legacy)) {
      first = legacy
      last = legacy
      localStorage.setItem(firstKey, JSON.stringify(first))
      localStorage.setItem(lastKey, JSON.stringify(last))
    }
  }

  return {
    first: hasAttribution(first) ? first : {},
    last: hasAttribution(last) ? last : {},
  }
}
