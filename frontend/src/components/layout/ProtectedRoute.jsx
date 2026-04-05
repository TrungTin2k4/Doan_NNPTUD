import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

function ProtectedRoute({ children }) {
  const location = useLocation()
  const initialized = useAuthStore((state) => state.initialized)
  const token = useAuthStore((state) => state.token)

  if (!initialized) {
    return <section className="loading-panel">Loading user session...</section>
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute
