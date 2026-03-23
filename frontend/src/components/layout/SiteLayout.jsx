import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar.jsx'
import { useAuthStore } from '../../store/authStore'

function SiteLayout() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <main className="min-h-screen bg-canvas text-ink-700">
      <div className="promo-strip">
        <p className="type-body-sm text-ink-950">
          Future-ready skills on your schedule. Save 25% on selected courses today.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <Navbar />
        <Outlet />
      </div>
    </main>
  )
}

export default SiteLayout
