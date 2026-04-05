import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourseCategoriesRequest, getFeaturedCoursesRequest } from '../api/courses'
import CourseCard from '../components/common/CourseCard.jsx'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import Icon from '../components/common/Icon.jsx'
import { buildCourseCardModel, formatPrice } from '../lib/courseUi'
import { resolveMediaUrl } from '../lib/mediaUrl'

const trustedBrands = ['Samsung', 'Cisco', 'Vimeo', 'P&G', 'HPE', 'Citi']

function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('All')

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true)
      setErrorMessage('')

      try {
        const [featured, nextCategories] = await Promise.all([
          getFeaturedCoursesRequest(),
          getCourseCategoriesRequest(),
        ])

        setFeaturedCourses(featured ?? [])
        setCategories(nextCategories ?? [])
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadHomeData()
  }, [])

  useEffect(() => {
    if (featuredCourses.length <= 1) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featuredCourses.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [featuredCourses.length])

  const courseCards = useMemo(
    () =>
      featuredCourses.map((course, index) =>
        buildCourseCardModel(course, {
          tone: ['brand', 'accent', 'ink'][index % 3],
          tag: course.category || 'Featured',
        }),
      ),
    [featuredCourses],
  )

  const tabs = useMemo(() => ['All', ...categories.slice(0, 7)], [categories])

  const visibleCourseCards = useMemo(() => {
    const source = activeTab === 'All' ? courseCards : courseCards.filter((course) => course.tag === activeTab)
    return source.slice(0, 8)
  }, [activeTab, courseCards])

  const activeCourse = featuredCourses[activeIndex] ?? null
  const heroHref = activeCourse ? `/courses/${activeCourse.slug}` : '/courses'

  return (
    <div className="space-y-12 lg:space-y-16">
      <section className="overflow-hidden rounded-2xl border border-[#d8d1eb] bg-gradient-to-r from-[#7d31ff] via-[#8d55ff] to-[#b36cff] text-white shadow-[0_24px_70px_rgba(73,35,149,0.35)]">
        <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.05fr,1fr] lg:gap-10">
          <div className="space-y-6">
            <div className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
              Last day offer
            </div>
            <div className="max-w-[34rem] space-y-4 rounded-2xl bg-white p-6 text-[#1f1b3d] shadow-xl md:p-7">
              <h1 className="type-display-2xl">Skills fitness starts from {formatPrice(activeCourse?.price || 339000)}</h1>
              <p className="type-body-md text-ink-700">
                Get career-ready with in-demand courses, practical projects, and a cleaner learning flow inspired by modern marketplaces.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link className="inline-flex rounded-lg bg-[#2f1c6a] px-4 py-2.5 text-sm font-semibold text-white no-underline" to={heroHref}>
                  Start learning
                </Link>
                <Link className="inline-flex rounded-lg border border-[#2f1c6a] px-4 py-2.5 text-sm font-semibold text-[#2f1c6a] no-underline" to="/courses">
                  Browse all courses
                </Link>
              </div>
            </div>
            <p className="type-body-sm text-white/90">
              Ends soon. Build serious skills with affordable learning paths and guided lessons.
            </p>
          </div>

          <div className="relative min-h-[15rem] overflow-hidden rounded-2xl border border-white/25 bg-[#b58fff]/35">
            {activeCourse?.thumbnail ? (
              <img
                alt={activeCourse.title}
                className="h-full w-full object-cover"
                src={resolveMediaUrl(activeCourse.thumbnail)}
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.35),transparent_35%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1022]/85 via-[#0f1022]/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-[#12162b]/82 p-4 text-white backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#c4b7ff]">Featured now</p>
              <h2 className="mt-1 text-2xl font-extrabold leading-tight text-white drop-shadow-sm">{activeCourse?.title || 'Practical course spotlight'}</h2>
              <p className="mt-1 text-sm text-white/85">
                {activeCourse
                  ? `${activeCourse.instructor || 'EduLearn Team'} - ${activeCourse.category || 'Course'}`
                  : 'Browse practical lessons and real-world projects.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#6b56bd]">Top picks for you</p>
          <h2 className="type-display-2xl text-ink-950">All the skills you need in one place</h2>
          <p className="type-body-md text-ink-700">From critical skills to technical topics, discover what to learn next.</p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-line pb-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={
                tab === activeTab
                  ? 'rounded-full bg-[#2f1c6a] px-4 py-2 text-sm font-bold text-white shadow-sm'
                  : 'rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:border-[#7c5ef3] hover:text-[#2f1c6a]'
              }
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
        {loading ? <div className="loading-panel">Loading featured courses...</div> : null}

        {!loading && !errorMessage ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visibleCourseCards.length > 0 ? (
              visibleCourseCards.map((course) => <CourseCard key={course.id} course={course} />)
            ) : (
              <div className="empty-panel">No featured courses match this category yet.</div>
            )}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="type-body-md text-ink-700">Trusted by teams and learners at</p>
          <div className="flex flex-wrap gap-3">
            {trustedBrands.map((brand) => (
              <span key={brand} className="rounded-full bg-[#f5f4fb] px-4 py-2 text-sm font-semibold text-[#5d5577]">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <p className="type-label text-brand-600">For learners</p>
          <h3 className="mt-2 text-2xl font-bold text-ink-950">Learn with practical outcomes</h3>
          <p className="mt-2 type-body-sm text-ink-700">Follow clear sections, track progress, and jump back into your learning instantly.</p>
          <Link className="mt-4 inline-flex text-sm font-semibold text-[#5d2abf] no-underline" to="/my-learning">
            Go to my learning
          </Link>
        </article>

        <article className="rounded-2xl border border-[#d8d1eb] bg-gradient-to-r from-[#f8f2ff] to-[#edf2ff] p-6 shadow-sm">
          <p className="type-label text-brand-600">For teams</p>
          <h3 className="mt-2 text-2xl font-bold text-ink-950">Upskill your team with role-based paths</h3>
          <p className="mt-2 type-body-sm text-ink-700">Curate courses by category and keep each learner focused on practical outcomes.</p>
          <Link className="mt-4 inline-flex text-sm font-semibold text-[#5d2abf] no-underline" to="/courses">
            Explore business-ready courses
          </Link>
        </article>
      </section>

      <section className="rounded-2xl border border-line bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr] lg:items-start">
          <div className="space-y-3">
            <p className="type-label text-brand-600">Contact</p>
            <h3 className="type-display-2xl text-ink-950">Need support or want to collaborate?</h3>
            <p className="type-body-md text-ink-700">
              Reach out for course support, partnership discussions, or platform feedback. We reply quickly during business hours.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <a className="rounded-xl border border-line bg-[#faf9ff] p-4 no-underline transition hover:shadow-md" href="mailto:support@edulearn.local">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ece8ff] text-[#5d2abf]">
                <Icon name="mail" className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-ink-950">Email support</p>
              <p className="mt-1 text-sm text-ink-600">support@edulearn.local</p>
            </a>

            <a className="rounded-xl border border-line bg-[#faf9ff] p-4 no-underline transition hover:shadow-md" href="tel:+84000000000">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ece8ff] text-[#5d2abf]">
                <Icon name="phone" className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-ink-950">Hotline</p>
              <p className="mt-1 text-sm text-ink-600">(+84) 000 000 000</p>
            </a>

            <a className="rounded-xl border border-line bg-[#faf9ff] p-4 no-underline transition hover:shadow-md" href="https://linkedin.com" target="_blank" rel="noreferrer">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ece8ff] text-[#5d2abf]">
                <Icon name="linkedin" className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-ink-950">LinkedIn</p>
              <p className="mt-1 text-sm text-ink-600">EduLearn team updates</p>
            </a>

            <a className="rounded-xl border border-line bg-[#faf9ff] p-4 no-underline transition hover:shadow-md" href="https://facebook.com" target="_blank" rel="noreferrer">
              <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ece8ff] text-[#5d2abf]">
                <Icon name="facebook" className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-ink-950">Community</p>
              <p className="mt-1 text-sm text-ink-600">Join our learner group</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
