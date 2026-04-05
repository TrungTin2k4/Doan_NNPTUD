const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')

export function resolveMediaUrl(value) {
  if (!value || typeof value !== 'string') {
    return value
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  if (value.startsWith('/')) {
    // Rewrite old /uploads/ paths to /api/uploads/ for backward compatibility
    const normalized = value.startsWith('/uploads/') && !value.startsWith('/api/')
      ? `/api${value}`
      : value
    return `${API_BASE_URL}${normalized}`
  }

  return value
}
