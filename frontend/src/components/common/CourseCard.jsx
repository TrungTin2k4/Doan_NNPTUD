import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useAuthStore } from '../../store/authStore'
import { resolveMediaUrl } from '../../lib/mediaUrl'

function CourseCard({ course }) {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'ADMIN'
  const detailHref = course.slug ? `/courses/${course.slug}` : null
  const detailLabel = 'View details'
  const thumbUrl = course.thumbnail ? resolveMediaUrl(course.thumbnail) : null

  return (
    <article className="group overflow-hidden rounded-xl border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/9] overflow-hidden bg-[#eee8ff]">
        {thumbUrl ? (
          <img alt={course.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" src={thumbUrl} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f1e6ff] via-[#ddd8ff] to-[#d9efff]">
            <Icon name="play" className="h-8 w-8 text-[#3a2a6a]" />
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {course.level}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#5d4aa3]">{course.tag}</p>
        <h3 className="course-title-clamp text-lg font-bold leading-snug text-ink-950">{course.title}</h3>
        <p className="course-summary-clamp text-sm text-ink-700">{course.summary}</p>
        {course.stats ? <p className="text-xs text-ink-500">{course.stats}</p> : null}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-extrabold text-ink-950">{course.price}</span>
          {detailHref ? (
            <Link className="inline-flex items-center gap-1 text-sm font-semibold text-[#5d2abf] no-underline" to={detailHref}>
              {detailLabel}
              <Icon name="chart" className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        {!isAdmin ? (
          <div className="flex items-center gap-2 border-t border-line pt-3 text-xs text-ink-600">
            <Icon name="users" className="h-4 w-4" />
            <span>Popular with learners this week</span>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default CourseCard
