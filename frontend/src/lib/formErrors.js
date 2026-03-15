export function applyServerFieldErrors(error, setError) {
  if (!error?.data || typeof error.data !== 'object') {
    return
  }

  Object.entries(error.data).forEach(([field, message]) => {
    if (typeof message === 'string') {
      setError(field, { type: 'server', message })
    }
  })
}
