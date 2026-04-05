import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { createOrderRequest } from '../api/orders'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import PageHero from '../components/common/PageHero.jsx'
import { paymentMethods } from '../data/content'
import { formatPrice } from '../lib/courseUi'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

function CheckoutPage() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const items = useCartStore((state) => state.items)
  const removeCourse = useCartStore((state) => state.removeCourse)
  const clearCart = useCartStore((state) => state.clearCart)
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [lastOrder, setLastOrder] = useState(null)

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price ?? 0), 0),
    [items],
  )

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/orders" replace />
  }

  async function handleCheckout() {
    if (items.length === 0) {
      setErrorMessage('No courses are currently in checkout.')
      return
    }

    setSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const order = await createOrderRequest({
        courseIds: items.map((item) => item.id),
        paymentMethod,
      })

      setLastOrder(order)
      setSuccessMessage('Order created successfully. The new order is currently in PENDING status.')
      await clearCart(token)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemoveCourse(courseId) {
    try {
      await removeCourse(courseId, token)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title="Create a live order from the selected courses"
        description="Review your selected courses, choose a payment method, and complete the order in one clean step."
        aside={
          <div className="surface-panel space-y-4">
            <p className="type-label text-accent-600">Current total</p>
            <div className="detail-price">{formatPrice(total)}</div>
            <p className="type-body-sm text-ink-700">{items.length} course(s) are ready to be included in a new order.</p>
          </div>
        }
      />

      <section className="section-shell">
        <div className="checkout-grid">
          <div className="surface-panel space-y-5">
            <div className="space-y-2">
              <p className="type-label text-brand-600">Selected courses</p>
              <h2 className="type-title-lg text-ink-950">Selected courses</h2>
            </div>

            <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
            <FeedbackMessage type="success">{successMessage}</FeedbackMessage>

            {items.length > 0 ? (
              <div className="checkout-list">
                {items.map((item) => (
                  <article key={item.id} className="checkout-item">
                    <div className="space-y-2">
                      <p className="type-title-sm text-ink-950">{item.title}</p>
                      <p className="type-body-sm text-ink-700">{item.category || 'General course'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="type-title-sm text-ink-950">{formatPrice(item.price)}</span>
                      <button className="text-link" type="button" onClick={() => handleRemoveCourse(item.id)}>
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-panel">Checkout is empty. Open a course detail page and add a course first.</div>
            )}
          </div>

          <aside className="surface-panel space-y-5">
            <div className="space-y-2">
              <p className="type-label text-brand-600">Payment method</p>
              <h3 className="type-title-lg text-ink-950">Choose a payment method</h3>
            </div>

            <div className="payment-grid">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  className={paymentMethod === method ? 'payment-card payment-card-active' : 'payment-card'}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="order-summary-box">
              <div className="summary-row"><span>Total courses</span><strong>{items.length}</strong></div>
              <div className="summary-row"><span>Total amount</span><strong>{formatPrice(total)}</strong></div>
            </div>

            <button className="btn-primary w-full justify-center" type="button" disabled={submitting} onClick={handleCheckout}>
              {submitting ? 'Creating order...' : 'Place order'}
            </button>

            {lastOrder ? (
              <div className="surface-card space-y-3">
                <p className="type-label text-accent-600">Last order</p>
                <p className="type-title-sm text-ink-950">Status: {lastOrder.status}</p>
                <p className="type-body-sm text-ink-700">Order ID: {lastOrder.id}</p>
                <Link className="text-link" to="/orders">View order history</Link>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </>
  )
}

export default CheckoutPage
