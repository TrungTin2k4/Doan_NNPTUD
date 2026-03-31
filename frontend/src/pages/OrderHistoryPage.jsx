import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { getOrdersRequest } from '../api/orders'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import PageHero from '../components/common/PageHero.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import { formatPrice } from '../lib/courseUi'
import { useAuthStore } from '../store/authStore'

function OrderHistoryPage() {
  const user = useAuthStore((state) => state.user)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      return
    }

    async function loadOrders() {
      setLoading(true)
      setErrorMessage('')

      try {
        const data = await getOrdersRequest()
        setOrders(data ?? [])
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [user?.role])

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/orders" replace />
  }

  return (
    <>
      <PageHero
        eyebrow="Orders"
        title="Order history for the signed-in account"
        description="Review your past purchases, payment methods, and current order status at a glance."
        aside={<div className="surface-panel"><p className="type-title-lg text-ink-950">{orders.length}</p><p className="type-caption text-ink-500">orders found</p></div>}
      />

      <section className="section-shell">
        <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
        {loading ? <div className="loading-panel">Loading order history...</div> : null}
        {!loading && !errorMessage ? (
          <div className="order-history-list">
            {orders.length > 0 ? (
              orders.map((order) => (
                <article key={order.id} className="surface-panel space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="type-label text-brand-600">Order #{order.id}</p>
                      <p className="type-body-sm text-ink-700">Payment: {order.paymentMethod}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge value={order.status} />
                      <span className="type-title-sm text-ink-950">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="order-item-list">
                    {(order.items ?? []).map((item) => (
                      <div key={`${order.id}-${item.courseId}`} className="order-item-row">
                        <div>
                          <p className="type-title-sm text-ink-950">{item.courseTitle}</p>
                          <p className="type-body-sm text-ink-700">Course ID: {item.courseId}</p>
                        </div>
                        <span className="type-body-sm text-ink-700">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>
                  <Link className="text-link" to={`/orders/${order.id}`}>View details</Link>
                </article>
              ))
            ) : (
              <div className="empty-panel">No orders are available yet. Create one from Checkout to test this page.</div>
            )}
          </div>
        ) : null}
      </section>
    </>
  )
}

export default OrderHistoryPage
