import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCourseDetailRequest } from '../api/courses'
import { deleteReviewRequest, getCourseReviewsRequest, upsertReviewRequest } from '../api/reviews'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import FormField from '../components/common/FormField.jsx'
import PageHero from '../components/common/PageHero.jsx'
import TextareaField from '../components/common/TextareaField.jsx'
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
  const [reviewsData, setReviewsData] = useState({ reviews: [], totalItems: 0 })
  const [reviewError, setReviewError] = useState('')

  const reviewForm = useForm({
    defaultValues: {
      rating: '5',
      comment: '',
    },
  })

  const isAdmin = user?.role === 'ADMIN'
  const myReview = reviewsData.reviews.find((item) => item.userId === user?.id)

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
    async function loadReviews() {
      if (!course?.id) {
        return
      }

      try {
        const data = await getCourseReviewsRequest(course.id, { page: 0, size: 20 })
        setReviewsData({ reviews: data?.reviews ?? [], totalItems: data?.totalItems ?? 0 })
      } catch (error) {
        setReviewError(error.message)
      }
    }

    loadReviews()
  }, [course?.id])

  useEffect(() => {
    if (myReview) {
      reviewForm.reset({
        rating: String(myReview.rating),
        comment: myReview.comment || '',
      })
      return
    }

    reviewForm.reset({ rating: '5', comment: '' })
  }, [myReview, reviewForm])

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

  async function submitReview(values) {
    if (!course?.id) {
      return
    }

    setReviewError('')
    setNotice('')
    try {
      await upsertReviewRequest({
        courseId: course.id,
        rating: Number(values.rating),
        comment: values.comment || null,
      })
      const data = await getCourseReviewsRequest(course.id, { page: 0, size: 20 })
      setReviewsData({ reviews: data?.reviews ?? [], totalItems: data?.totalItems ?? 0 })
      setNotice('Review saved successfully.')
    } catch (error) {
      setReviewError(error.message)
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!course?.id) {
      return
    }

    setReviewError('')
    try {
      await deleteReviewRequest(reviewId)
      const data = await getCourseReviewsRequest(course.id, { page: 0, size: 20 })
      setReviewsData({ reviews: data?.reviews ?? [], totalItems: data?.totalItems ?? 0 })
      reviewForm.reset({ rating: '5', comment: '' })
      setNotice('Review deleted successfully.')
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

            {!isAdmin ? (
              <div className="space-y-5 border-t border-line pt-6">
                <div className="space-y-2">
                  <h2 className="type-display-2xl text-ink-950">Reviews</h2>
                  <p className="type-body-sm text-ink-700">{reviewsData.totalItems} review(s) from enrolled learners.</p>
                </div>

                <FeedbackMessage type="error">{reviewError}</FeedbackMessage>

                {token ? (
                  <form className="auth-form-grid" onSubmit={reviewForm.handleSubmit(submitReview)}>
                    <FormField
                      id="review-rating"
                      label="Rating"
                      type="number"
                      placeholder="1 to 5"
                      registration={reviewForm.register('rating', { required: 'Rating is required', min: 1, max: 5 })}
                      error={reviewForm.formState.errors.rating?.message}
                    />
                    <TextareaField
                      id="review-comment"
                      label="Comment"
                      placeholder="Share your thoughts about this course"
                      registration={reviewForm.register('comment')}
                    />
                    <div className="flex flex-wrap gap-3">
                      <button className="btn-primary" type="submit">{myReview ? 'Update review' : 'Submit review'}</button>
                      {myReview ? <button className="btn-ghost" type="button" onClick={() => handleDeleteReview(myReview.id)}>Delete review</button> : null}
                    </div>
                  </form>
                ) : (
                  <div className="empty-panel">Sign in and enroll in this course to leave a review.</div>
                )}

                <div className="review-list-grid">
                  {reviewsData.reviews.length > 0 ? (
                    reviewsData.reviews.map((review) => (
                      <article key={review.id} className="review-card">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="type-title-sm text-ink-950">{review.userName}</p>
                            <p className="course-rating-row"><span className="course-rating-value">{review.rating.toFixed(1)}</span><span className="course-rating-star">★</span></p>
                          </div>
                        </div>
                        <p className="type-body-sm text-ink-700">{review.comment || 'No written comment provided.'}</p>
                      </article>
                    ))
                  ) : (
                    <div className="empty-panel">No reviews yet for this course.</div>
                  )}
                </div>
              </div>
            ) : null}
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
