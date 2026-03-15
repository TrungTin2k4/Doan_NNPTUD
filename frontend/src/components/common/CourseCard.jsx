import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useAuthStore } from '../../store/authStore'

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

  return (
    <article className="course-card course-card-lg">
      <div className={`course-thumb ${toneClass}`}>
        <div className="thumb-chip">
          <Icon name={iconName} className="h-4 w-4" />
          <span>{course.level}</span>
        </div>
      </div>
      <div className="space-y-3">
        {course.stats ? <p className="type-caption text-brand-600">{course.stats}</p> : null}
        <h3 className="type-title-lg text-ink-950">{course.title}</h3>
        <p className="type-body-md text-ink-700">{course.summary}</p>
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="pill-neutral">{course.tag}</span>
          {course.price ? <span className="type-title-sm text-ink-950">{course.price}</span> : null}
        </div>
        {detailHref ? (
          <div className="pt-2">
            <Link className="text-link" to={detailHref}>
              {detailLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default CourseCard
