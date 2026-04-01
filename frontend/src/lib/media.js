const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')

export function resolveMediaUrl(value) {
  if (typeof value !== 'string') {
    return ''
  }

  const normalizedValue = value.trim()
  if (!normalizedValue) {
    return ''
  }

  if (/^(https?:|data:|blob:)/i.test(normalizedValue)) {
    return normalizedValue
  }

  if (normalizedValue.startsWith('/')) {
    return `${apiBaseUrl}${normalizedValue}`
  }

  return normalizedValue
}
