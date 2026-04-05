import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCourseDetailRequest } from '../api/courses'
import { getMyLearningRequest } from '../api/progress'
import { deleteReviewRequest, getCourseReviewsRequest, upsertReviewRequest } from '../api/reviews'
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
  const [reviews, setReviews] = useState([])
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [hasLearningAccess, setHasLearningAccess] = useState(false)

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

  useEffect(() => {
    if (!course?.id) {
      return
    }

    async function loadReviews() {
      try {
        const data = await getCourseReviewsRequest(course.id, { page: 0, size: 6 })
        setReviews(data?.reviews ?? [])
        setReviewsTotal(data?.totalItems ?? 0)
      } catch {
        setReviews([])
        setReviewsTotal(0)
      }
    }

    loadReviews()
  }, [course?.id])

  useEffect(() => {
    if (!token || !course?.id || user?.role === 'ADMIN') {
      setHasLearningAccess(false)
      return
    }

    async function checkAccess() {
      try {
        const learningCourses = await getMyLearningRequest()
        const canLearn = (learningCourses ?? []).some((item) => item.id === course.id || item.slug === course.slug)
        setHasLearningAccess(canLearn)
      } catch {
        setHasLearningAccess(false)
      }
    }

    checkAccess()
  }, [course?.id, course?.slug, token, user?.role])

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
  const canManageReview = (review) => user && (user.role === 'ADMIN' || user.id === review.userId)

  async function handleAddToCart() {
    if (!course) {
      return
    }

    try {
      const added = await addCourse(
        {
          id: course.id,
          slug: course.slug,
          title: course.title,
          price: course.price,
          category: course.category,
        },
        token,
      )

      setNotice(added ? 'The course was added to checkout.' : 'This course is already in checkout.')
    } catch (error) {
      setNotice(error.message)
    }
  }

  async function handleBuyNow() {
    await handleAddToCart()
    if (!token) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }

    navigate('/checkout')
  }

  async function refreshCourseAndReviews() {
    if (!course?.id) {
      return
    }

    const [nextCourse, nextReviews] = await Promise.all([
      getCourseDetailRequest(slug),
      getCourseReviewsRequest(course.id, { page: 0, size: 6 }),
    ])

    setCourse(nextCourse)
    setReviews(nextReviews?.reviews ?? [])
    setReviewsTotal(nextReviews?.totalItems ?? 0)
  }

  async function handleSubmitReview(event) {
    event.preventDefault()
    if (!course?.id) {
      return
    }

    setReviewSubmitting(true)
    setReviewMessage('')
    setReviewError('')

    try {
      await upsertReviewRequest({
        courseId: course.id,
        rating: Number(reviewRating),
        comment: reviewComment,
      })
      setReviewMessage('Your review was saved successfully.')
      await refreshCourseAndReviews()
    } catch (error) {
      setReviewError(error.message)
    } finally {
      setReviewSubmitting(false)
    }
  }

  async function handleDeleteReview(reviewId) {
    setReviewMessage('')
    setReviewError('')

    try {
      await deleteReviewRequest(reviewId)
      setReviewMessage('Review deleted successfully.')
      await refreshCourseAndReviews()
    } catch (error) {
      setReviewError(error.message)
    }
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

            <div className="surface-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="type-label text-accent-600">Reviews</p>
                  <h3 className="type-title-lg text-ink-950">Learner feedback</h3>
                </div>
                <p className="type-body-sm text-ink-700">
                  Rating: <strong>{course.rating || 0}</strong> / 5 ({reviewsTotal} review{reviewsTotal === 1 ? '' : 's'})
                </p>
              </div>

              {!isAdmin && token ? (
                <form className="grid gap-3 md:grid-cols-4" onSubmit={handleSubmitReview}>
                  <select
                    className="field-select"
                    value={reviewRating}
                    onChange={(event) => setReviewRating(Number(event.target.value))}
                  >
                    <option value={5}>5 stars</option>
                    <option value={4}>4 stars</option>
                    <option value={3}>3 stars</option>
                    <option value={2}>2 stars</option>
                    <option value={1}>1 star</option>
                  </select>
                  <textarea
                    className="field-textarea md:col-span-2"
                    rows={3}
                    placeholder="Share your learning experience"
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                  />
                  <button className="btn-primary justify-center" type="submit" disabled={reviewSubmitting}>
                    {reviewSubmitting ? 'Saving...' : 'Save review'}
                  </button>
                </form>
              ) : null}

              <FeedbackMessage type="error">{reviewError}</FeedbackMessage>
              <FeedbackMessage type="success">{reviewMessage}</FeedbackMessage>

              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <article key={review.id} className="curriculum-card space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="type-title-sm text-ink-950">{review.userName}</p>
                          <p className="type-caption text-ink-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="pill-accent">{review.rating} / 5</span>
                          {canManageReview(review) ? (
                            <button className="text-link" type="button" onClick={() => handleDeleteReview(review.id)}>
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </div>
                      {review.comment ? <p className="type-body-sm text-ink-700">{review.comment}</p> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-panel">No reviews yet. Be the first learner to leave feedback.</div>
              )}
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
                    {hasLearningAccess ? (
                      <Link className="btn-primary no-underline" to={`/learn/${course.slug}`}>
                        Study now
                      </Link>
                    ) : (
                      <>
                        <button className="btn-primary" type="button" onClick={handleBuyNow}>Buy now</button>
                        <button className="btn-ghost" type="button" onClick={handleAddToCart}>Add to checkout</button>
                      </>
                    )}
                  </div>
                )}
                <div className="stack-list">
                  <li><span className="list-dot" /><span>Instructor: {course.instructor || 'Coming soon'}</span></li>
                  <li><span className="list-dot" /><span>Category: {course.category || 'General'}</span></li>
                  <li><span className="list-dot" /><span>Original price: {course.originalPrice ? formatPrice(course.originalPrice) : 'No discount'}</span></li>
                </div>
                {!isAdmin && token && hasLearningAccess ? <Link className="text-link" to={`/learn/${course.slug}`}>Open learning player</Link> : null}
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
