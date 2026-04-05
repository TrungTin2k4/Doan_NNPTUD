import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar.jsx'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

function SiteLayout() {
  const initialize = useAuthStore((state) => state.initialize)
  const token = useAuthStore((state) => state.token)
  const syncCart = useCartStore((state) => state.syncCart)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    async function sync() {
      try {
        await syncCart(token)
      } catch {
        // keep UI usable if cart sync fails
      }
    }

    sync()
  }, [syncCart, token])

  return (
    <main className="min-h-screen bg-canvas text-ink-700">
      <div className="promo-strip">
        <p className="type-body-sm text-ink-950">
          Ends in 8h. Last call for serious skills gains. Prices stay low until today ends.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-[1340px] flex-col gap-8 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <Navbar />
        <Outlet />
      </div>
    </main>
  )
}

export default SiteLayout
