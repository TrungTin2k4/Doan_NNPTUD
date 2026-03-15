import { useEffect, useState } from 'react'
import { getAdminUsersRequest } from '../../api/admin'
import FeedbackMessage from '../../components/common/FeedbackMessage.jsx'
import PageHero from '../../components/common/PageHero.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getAdminUsersRequest({ page: 0, size: 20 })
        setUsers(data?.users ?? [])
      } catch (error) {
        setErrorMessage(error.message)
      }
    }

    loadUsers()
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Admin users"
        title="Review the user list and assigned roles"
        description="Keep an eye on account status, role assignments, and overall enrollment activity from one place."
        aside={<div className="surface-panel"><p className="type-title-lg text-ink-950">{users.length}</p><p className="type-caption text-ink-500">users loaded</p></div>}
      />

      <section className="section-shell">
        <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
        <div className="admin-list-grid">
          {users.map((user) => (
            <article key={user.id} className="admin-list-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="type-title-lg text-ink-950">{user.fullName}</h2>
                  <p className="type-body-sm text-ink-700">{user.email}</p>
                </div>
                <StatusBadge value={user.role} />
              </div>
              <div className="summary-row"><span>Enabled</span><strong>{user.enabled ? 'Yes' : 'No'}</strong></div>
              <div className="summary-row"><span>Enrolled courses</span><strong>{user.enrolledCoursesCount}</strong></div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default AdminUsersPage
