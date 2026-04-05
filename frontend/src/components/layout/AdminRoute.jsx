import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

function AdminRoute({ children }) {
  const initialized = useAuthStore((state) => state.initialized)
  const user = useAuthStore((state) => state.user)

  if (!initialized) {
    return <section className="loading-panel">Checking admin access...</section>
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
