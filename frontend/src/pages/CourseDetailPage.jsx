import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCourseDetailRequest } from '../api/courses'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import PageHero from '../components/common/PageHero.jsx'
import { buildCourseCardModel, formatPrice } from '../lib/courseUi'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

function CourseDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const addCourse = useCartStore((state) => state.addCourse)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    async function loadCourse() {
      setLoading(true)
      setErrorMessage('')

      try {
        const data = await getCourseDetailRequest(slug)
        setCourse(data)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [slug])

  const cardModel = useMemo(() => {
    if (!course) {
      return null
    }

    return buildCourseCardModel(course, {
      tone: 'brand',
      tag: course.category || 'Course',
      stats: `${course.duration || 0} min / ${course.sections?.length || 0} sections`,
    })
  }, [course])

  const isAdmin = user?.role === 'ADMIN'

  function handleAddToCart() {
    if (!course) {
      return
    }

    const added = addCourse({
      id: course.id,
      slug: course.slug,
      title: course.title,
      price: course.price,
      category: course.category,
    })

    setNotice(added ? 'The course was added to checkout.' : 'This course is already in checkout.')
  }

  function handleBuyNow() {
    handleAddToCart()
    if (!token) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }

    navigate('/checkout')
  }

  if (loading) {
    return <section className="loading-panel">Loading course details...</section>
  }

  if (errorMessage || !course) {
    return <section className="empty-panel">{errorMessage || 'Course not found.'}</section>
  }

  return (
    <>
      <PageHero
        eyebrow={course.category || 'Course detail'}
        title={course.title}
        description={course.description || 'Explore the full course outline, review the lessons, and decide whether this course is the right fit for you.'}
        aside={
          <div className="surface-panel space-y-4">
            <p className="type-label text-accent-600">Quick summary</p>
            <div className="detail-stat-grid">
              <div className="mini-stat"><span className="type-title-lg text-ink-950">{formatPrice(course.price)}</span><span className="type-caption text-ink-500">price</span></div>
              <div className="mini-stat"><span className="type-title-lg text-ink-950">{course.level || 'All'}</span><span className="type-caption text-ink-500">level</span></div>
              <div className="mini-stat"><span className="type-title-lg text-ink-950">{course.sections?.length || 0}</span><span className="type-caption text-ink-500">sections</span></div>
            </div>
          </div>
        }
      />

      <section className="section-shell">
        <div className="detail-grid">
          <div className="surface-panel space-y-6">
            <div className="course-thumb course-thumb-brand detail-hero-thumb">
              <div className="thumb-chip">{course.level || 'All level'}</div>
            </div>

            <FeedbackMessage type="success">{notice}</FeedbackMessage>

              <div className="space-y-4">
                <h2 className="type-display-2xl text-ink-950">Curriculum overview</h2>
                <div className="curriculum-list">
                {(course.sections ?? []).map((section) => (
                  <article key={section.id} className="curriculum-card">
                    <div className="space-y-2">
                      <h3 className="type-title-lg text-ink-950">{section.title}</h3>
                      <p className="type-caption text-ink-500">{section.lessons?.length || 0} lessons</p>
                    </div>

                    <div className="space-y-3">
                      {(section.lessons ?? []).map((lesson) => (
                        <div key={lesson.id} className="lesson-row">
                          <div>
                            <p className="type-title-sm text-ink-950">{lesson.title}</p>
                            <p className="type-body-sm text-ink-700">{lesson.duration || 0} min</p>
                          </div>
                          <span className={lesson.isPreview ? 'pill-accent' : 'pill-neutral'}>
                            {lesson.isPreview ? 'Preview' : 'Locked'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="surface-panel detail-side-panel">
            {cardModel ? (
              <div className="space-y-4">
                <p className="type-label text-brand-600">Order summary</p>
                <h3 className="type-title-lg text-ink-950">{cardModel.title}</h3>
                <p className="type-body-md text-ink-700">{cardModel.summary}</p>
                <div className="detail-price">{formatPrice(course.price)}</div>
                {isAdmin ? (
                  <div className="admin-course-action-box">
                    <p className="type-body-sm text-ink-700">You are viewing this course as an admin, so this screen switches into quick edit mode and hides cart and checkout actions.</p>
                    <div className="flex flex-wrap gap-3">
                      <Link className="btn-primary no-underline" to={`/admin/courses?edit=${course.id}`}>Open editor</Link>
                      <Link className="btn-ghost no-underline" to="/admin/courses">Back to admin courses</Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <button className="btn-primary" type="button" onClick={handleBuyNow}>Buy now</button>
                    <button className="btn-ghost" type="button" onClick={handleAddToCart}>Add to checkout</button>
                  </div>
                )}
                <div className="stack-list">
                  <li><span className="list-dot" /><span>Instructor: {course.instructor || 'Coming soon'}</span></li>
                  <li><span className="list-dot" /><span>Category: {course.category || 'General'}</span></li>
                  <li><span className="list-dot" /><span>Original price: {course.originalPrice ? formatPrice(course.originalPrice) : 'No discount'}</span></li>
                </div>
                {!isAdmin && token ? <Link className="text-link" to={`/learn/${course.slug}`}>Open learning player</Link> : null}
              </div>
            ) : null}

            <Link className="text-link" to="/courses">Back to courses</Link>
          </aside>
        </div>
      </section>
    </>
  )
}

export default CourseDetailPage
