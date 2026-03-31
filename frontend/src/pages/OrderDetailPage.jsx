import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrderDetailRequest } from '../api/orders'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import PageHero from '../components/common/PageHero.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import { formatPrice } from '../lib/courseUi'

function OrderDetailPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadOrder() {
      setLoading(true)
      setErrorMessage('')
      try {
        const data = await getOrderDetailRequest(orderId)
        setOrder(data)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId])

  return (
    <>
      <PageHero
        eyebrow="Order detail"
        title={order ? `Order #${order.id}` : 'Order detail'}
        description="Review every item, payment method, and status for this order in one place."
        aside={order ? <div className="surface-panel"><StatusBadge value={order.status} /></div> : null}
      />

      <section className="section-shell space-y-5">
        <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
        {loading ? <div className="loading-panel">Loading order detail...</div> : null}
        {!loading && order ? (
          <div className="surface-panel space-y-5">
            <div className="summary-row"><span>Payment method</span><strong>{order.paymentMethod}</strong></div>
            <div className="summary-row"><span>Total amount</span><strong>{formatPrice(order.totalAmount)}</strong></div>
            <div className="order-item-list">
              {(order.items ?? []).map((item) => (
                <div key={item.courseId} className="order-item-row">
                  <div>
                    <p className="type-title-sm text-ink-950">{item.courseTitle}</p>
                    <p className="type-body-sm text-ink-700">Course ID: {item.courseId}</p>
                  </div>
                  <span>{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
            <Link className="text-link" to="/orders">Back to order history</Link>
          </div>
        ) : null}
      </section>
    </>
  )
}

export default OrderDetailPage
