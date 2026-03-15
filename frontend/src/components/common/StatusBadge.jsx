function StatusBadge({ value }) {
  const normalized = String(value ?? '').toUpperCase()

  let className = 'status-badge status-badge-neutral'
  if (normalized === 'COMPLETED' || normalized === 'PUBLISHED' || normalized === 'ADMIN') {
    className = 'status-badge status-badge-success'
  }
  if (normalized === 'PENDING' || normalized === 'DRAFT') {
    className = 'status-badge status-badge-warning'
  }
  if (normalized === 'CANCELLED' || normalized === 'REFUNDED') {
    className = 'status-badge status-badge-danger'
  }

  return <span className={className}>{normalized || 'UNKNOWN'}</span>
}

export default StatusBadge
