import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { getCourseProgressRequest, getProgressCoursesRequest } from '../api/progress'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import PageHero from '../components/common/PageHero.jsx'
import { useAuthStore } from '../store/authStore'

function MyLearningPage() {
  const user = useAuthStore((state) => state.user)
  const [courses, setCourses] = useState([])
  const [progressByCourse, setProgressByCourse] = useState({})
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      return
    }

    async function loadLearning() {
      setLoading(true)
      setErrorMessage('')

      try {
        const learningCourses = await getProgressCoursesRequest()
        setCourses(learningCourses ?? [])

        const progressEntries = await Promise.all(
          (learningCourses ?? []).map(async (course) => {
            try {
              const progress = await getCourseProgressRequest(course.id)
              return [course.id, progress]
            } catch {
              return [course.id, null]
            }
          }),
        )

        setProgressByCourse(Object.fromEntries(progressEntries))
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadLearning()
  }, [user?.role])

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  return (
    <>
      <PageHero
        eyebrow="My learning"
        title="Track the courses already unlocked for learning"
        description="Pick up where you left off, keep your progress in view, and move through each lesson at your own pace."
        aside={
          <div className="surface-panel space-y-4">
            <p className="type-label text-accent-600">Overview</p>
            <div className="mini-stat">
              <span className="type-title-lg text-ink-950">{courses.length}</span>
              <span className="type-caption text-ink-500">active courses</span>
            </div>
          </div>
        }
      />

      <section className="section-shell">
        <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>

        {loading ? <div className="loading-panel">Loading your learning library...</div> : null}

        {!loading && !errorMessage ? (
          <div className="learning-grid">
            {courses.length > 0 ? (
              courses.map((course) => {
                const progress = progressByCourse[course.id]

                return (
                  <article key={course.id} className="surface-panel space-y-4">
                    <div className="space-y-2">
                      <p className="type-label text-brand-600">{course.category || 'Learning course'}</p>
                      <h2 className="type-title-lg text-ink-950">{course.title}</h2>
                      <p className="type-body-sm text-ink-700">Instructor: {course.instructor || 'Updating soon'}</p>
                    </div>

                    <div className="progress-shell">
                      <div className="progress-bar"><span style={{ width: `${course.progress || 0}%` }} /></div>
                      <div className="summary-row"><span>Progress</span><strong>{course.progress || 0}%</strong></div>
                    </div>

                    <div className="stack-list">
                      <li><span className="list-dot" /><span>Current lesson: {progress?.currentLessonId || course.currentLessonId || 'Not started yet'}</span></li>
                      <li><span className="list-dot" /><span>Completed lessons: {progress?.completedLessonIds?.length || 0}</span></li>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Link className="text-link" to={`/learn/${course.slug}`}>Open player</Link>
                      <Link className="text-link" to={`/courses/${course.slug}`}>View course details</Link>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="empty-panel">No courses are available in My Learning yet. Complete an order and move it to `COMPLETED` from admin to unlock this flow.</div>
            )}
          </div>
        ) : null}
      </section>
    </>
  )
}

export default MyLearningPage
