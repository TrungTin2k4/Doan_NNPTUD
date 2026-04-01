import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useAuthStore } from '../../store/authStore'
import { resolveMediaUrl } from '../../lib/media'

function CourseCard({ course }) {
  const user = useAuthStore((state) => state.user)
  const toneClass =
    course.tone === 'accent'
      ? 'course-thumb-accent'
      : course.tone === 'ink'
        ? 'course-thumb-ink'
        : 'course-thumb-brand'

  const iconName = course.tone === 'accent' ? 'spark' : course.tone === 'ink' ? 'chart' : 'play'
  const isAdmin = user?.role === 'ADMIN'
  const detailHref = isAdmin && course.id ? `/admin/courses?edit=${course.id}` : course.slug ? `/courses/${course.slug}` : null
  const detailLabel = isAdmin ? 'Edit course' : 'View details'
  const shouldShowMore = (course.title?.length ?? 0) > 42 || (course.summary?.length ?? 0) > 120
  const thumbnailUrl = resolveMediaUrl(course.thumbnail)
  const thumbStyle = thumbnailUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(16, 22, 39, 0.04), rgba(16, 22, 39, 0.28)), url(${thumbnailUrl})`,
      }
    : undefined

  return (
    <article className="course-card course-card-lg">
      <div className={`course-thumb ${toneClass} ${thumbnailUrl ? 'course-thumb-image' : ''}`} style={thumbStyle}>
        <div className="thumb-chip">
          <Icon name={iconName} className="h-4 w-4" />
          <span>{course.level}</span>
        </div>
      </div>
      <div className="course-card-body">
        {course.stats ? <p className="type-caption text-brand-600">{course.stats}</p> : null}
        <h3 className="type-title-lg text-ink-950 course-title-clamp">{course.title}</h3>
        {course.instructor ? <p className="course-instructor-line">{course.instructor}</p> : null}
        {course.rating ? (
          <div className="course-rating-row">
            <span className="course-rating-value">{Number(course.rating).toFixed(1)}</span>
            <span className="course-rating-star">★</span>
            <span className="course-rating-count">{course.reviewsCount.toLocaleString()} ratings</span>
          </div>
        ) : null}
        <p className="type-body-md text-ink-700 course-summary-clamp">{course.summary}</p>
        <div className="course-card-footer">
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="pill-neutral">{course.tag}</span>
            {course.price ? <span className="type-title-sm text-ink-950">{course.price}</span> : null}
          </div>
          <div className="course-card-link-row">
            {detailHref ? (
              <Link className="text-link" to={detailHref}>
                {detailLabel}
              </Link>
            ) : null}
            {shouldShowMore && detailHref ? (
              <Link className="course-more-link" to={detailHref}>
                See more
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

export default CourseCard
