import { useCallback, useEffect, useState } from 'react'
import { getAdminOrdersRequest, updateAdminOrderStatusRequest } from '../../api/admin'
import FeedbackMessage from '../../components/common/FeedbackMessage.jsx'
import PageHero from '../../components/common/PageHero.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import { adminOrderStatuses } from '../../data/content'
import { formatPrice } from '../../lib/courseUi'

function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const loadOrders = useCallback(async () => {
    setErrorMessage('')
    try {
      const data = await getAdminOrdersRequest({ page: 0, size: 20, status })
      setOrders(data?.orders ?? [])
    } catch (error) {
      setErrorMessage(error.message)
    }
  }, [status])

  useEffect(() => {
    async function syncOrders() {
      await loadOrders()
    }

    syncOrders()
  }, [loadOrders])

  async function updateStatus(orderId, nextStatus) {
    setMessage('')
    setErrorMessage('')

    try {
      await updateAdminOrderStatusRequest(orderId, { status: nextStatus })
      setMessage(`Order status updated to ${nextStatus}.`)
      await loadOrders()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Admin orders"
        title="Manage orders and unlock access when payment is approved"
        description="Review incoming orders, approve payments, and control when learners gain access to purchased courses."
        aside={<div className="surface-panel"><p className="type-title-lg text-ink-950">{orders.length}</p><p className="type-caption text-ink-500">orders loaded</p></div>}
      />

      <section className="section-shell space-y-5">
        <div className="admin-toolbar">
          <select className="field-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All status</option>
            {adminOrderStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
        <FeedbackMessage type="success">{message}</FeedbackMessage>

        <div className="admin-list-grid">
          {orders.map((order) => (
            <article key={order.id} className="admin-list-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="type-label text-brand-600">Order #{order.id}</p>
                  <p className="type-body-sm text-ink-700">{order.userName} / {order.userEmail}</p>
                </div>
                <StatusBadge value={order.status} />
              </div>
              <div className="summary-row"><span>Total amount</span><strong>{formatPrice(order.totalAmount)}</strong></div>
              <div className="order-item-list">
                {(order.items ?? []).map((item) => <div key={item.courseId} className="order-item-row"><span>{item.courseTitle}</span><span>{formatPrice(item.price)}</span></div>)}
              </div>
              <div className="flex flex-wrap gap-2">
                {adminOrderStatuses.map((item) => (
                  <button key={item} className={item === order.status ? 'btn-secondary' : 'btn-ghost'} type="button" onClick={() => updateStatus(order.id, item)}>
                    {item}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default AdminOrdersPage
