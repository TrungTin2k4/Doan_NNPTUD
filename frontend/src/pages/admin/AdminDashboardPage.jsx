import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboardRequest } from '../../api/admin'
import FeedbackMessage from '../../components/common/FeedbackMessage.jsx'
import PageHero from '../../components/common/PageHero.jsx'

function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getAdminDashboardRequest()
        setDashboard(data)
      } catch (error) {
        setErrorMessage(error.message)
      }
    }

    loadDashboard()
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Admin dashboard"
        title="Admin Dashboard"
        description=""
        aside={null}
      />

      <section className="section-shell">
        <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
        {dashboard ? (
          <div className="admin-dashboard-grid">
            <article className="metric-card"><p className="type-label text-brand-600">Revenue</p><p className="type-display-compact text-ink-950">{dashboard.totalRevenue}</p></article>
            <article className="metric-card metric-card-accent"><p className="type-label text-accent-700">Students</p><p className="type-display-compact text-ink-950">{dashboard.totalStudents}</p></article>
            <article className="metric-card"><p className="type-label text-brand-600">Published courses</p><p className="type-display-compact text-ink-950">{dashboard.totalCourses}</p></article>
            <article className="metric-card metric-card-accent"><p className="type-label text-accent-700">Completed orders</p><p className="type-display-compact text-ink-950">{dashboard.totalOrders}</p></article>
          </div>
        ) : (
          !errorMessage && <div className="loading-panel">Loading admin dashboard...</div>
        )}
      </section>

      <section className="section-shell">
        <div className="admin-link-grid">
          <Link className="surface-panel no-underline" to="/admin/courses"><h2 className="type-title-lg text-ink-950">Courses</h2></Link>
          <Link className="surface-panel no-underline" to="/admin/categories"><h2 className="type-title-lg text-ink-950">Categories</h2></Link>
          <Link className="surface-panel no-underline" to="/admin/orders"><h2 className="type-title-lg text-ink-950">Orders</h2></Link>
          <Link className="surface-panel no-underline" to="/admin/users"><h2 className="type-title-lg text-ink-950">Users</h2></Link>
        </div>
      </section>
    </>
  )
}

export default AdminDashboardPage
