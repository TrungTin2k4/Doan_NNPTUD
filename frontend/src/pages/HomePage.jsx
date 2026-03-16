import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCourseCategoriesRequest, getFeaturedCoursesRequest } from '../api/courses'
import CourseCard from '../components/common/CourseCard.jsx'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import Icon from '../components/common/Icon.jsx'
import { homeFeatures, homeTests } from '../data/content'
import { buildCourseCardModel, formatPrice } from '../lib/courseUi'
import { useAuthStore } from '../store/authStore'

const trustedBrands = ['Samsung', 'Cisco', 'Vimeo', 'P&G', 'HPE', 'Citi']

function HomePage() {
  const user = useAuthStore((state) => state.user)
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
    }, 4200)

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

  const activeCourse = featuredCourses[activeIndex] ?? null
  const activeCard = activeCourse
    ? buildCourseCardModel(activeCourse, {
        tone: ['brand', 'accent', 'ink'][activeIndex % 3],
        tag: activeCourse.category || 'Featured',
        stats: `${activeCourse.duration || 0} min / ${(activeCourse.reviewsCount ?? 0) || 0} reviews`,
      })
    : null

  const isAdmin = user?.role === 'ADMIN'
  const heroHref = activeCourse
    ? isAdmin
      ? `/admin/courses?edit=${activeCourse.id}`
      : `/courses/${activeCourse.slug}`
    : '/courses'

  const tabs = useMemo(() => ['All', ...categories.slice(0, 5)], [categories])

  const visibleCourseCards = useMemo(() => {
    const source = activeTab === 'All' ? courseCards : courseCards.filter((course) => course.tag === activeTab)
    return source.slice(0, 4)
  }, [activeTab, courseCards])

  const spotlightCards = homeFeatures.slice(0, 3)
  const darkPromoCards = homeFeatures.slice(3, 6)

  return (
    <div className="space-y-16 lg:space-y-20">
      <section className="home-hero-shell">
        <div className="home-hero-grid">
          <div className="home-hero-copy-block">
            <div className="home-hero-copy-card">
              <span className="home-hero-kicker">Today only</span>
              <h1 className="type-display-3xl text-ink-950">Save 25% on useful courses built for modern careers.</h1>
              <p className="type-body-lg text-ink-700">
                Learn with affordable pricing, practical topics, and a cleaner visual flow from the very first section.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link className="btn-primary no-underline" to={heroHref}>
                  {isAdmin ? 'Edit featured course' : 'View details'}
                </Link>
                <Link className="btn-secondary no-underline" to="/courses">
                  Explore courses
                </Link>
              </div>
            </div>

            <div className="home-hero-meta-row">
              <div className="stat-item">
                <p className="type-caption text-ink-500">Offer</p>
                <p className="type-title-sm text-ink-950">25% off today</p>
              </div>
              <div className="stat-item">
                <p className="type-caption text-ink-500">Categories</p>
                <p className="type-title-sm text-ink-950">{Math.max(categories.length, 5)} areas</p>
              </div>
              <div className="stat-item">
                <p className="type-caption text-ink-500">Featured picks</p>
                <p className="type-title-sm text-ink-950">{featuredCourses.length || 0} courses</p>
              </div>
            </div>
          </div>

          <div className="home-hero-visual-shell">
            <div className="home-hero-image-stage">
              <div className="home-hero-price-badge">25% OFF</div>
              <div className="home-hero-tag home-hero-tag-left">
                <Icon name="catalog" className="h-4 w-4" />
                <span>{activeCourse?.category || 'Popular pick'}</span>
              </div>
              <div className="home-hero-tag home-hero-tag-right">
                <span>{featuredCourses.length > 0 ? `${activeIndex + 1} / ${featuredCourses.length}` : 'Top course'}</span>
              </div>
              {activeCard?.thumbnail ? (
                <div
                  className="home-hero-photo"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(19, 24, 39, 0.08), rgba(19, 24, 39, 0.22)), url(${activeCard.thumbnail})`,
                  }}
                />
              ) : (
                <div className={`home-hero-orb home-hero-orb-${activeCard?.tone || 'brand'}`} />
              )}
              <div className="home-hero-course-card">
                <p className="type-label text-brand-600">Featured now</p>
                <h2 className="type-title-lg text-ink-950">{activeCourse?.title || 'Practical course spotlight'}</h2>
                <p className="type-body-sm text-ink-700">
                  {activeCourse
                    ? `${activeCourse.instructor || 'EduLearn Team'} / ${formatPrice(activeCourse.price)} / ${activeCourse.category || 'Course'}`
                    : 'Clean design, clear pricing, and practical content for everyday learning.'}
                </p>
                <div className="hero-carousel-dots">
                  {featuredCourses.map((course, index) => (
                    <button
                      key={course.id}
                      className={index === activeIndex ? 'hero-carousel-dot hero-carousel-dot-active' : 'hero-carousel-dot'}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Show ${course.title}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-flow-section">
        <div className="home-editorial-grid">
          <div className="home-editorial-copy">
            <p className="type-label text-brand-600">Learn more</p>
            <h2 className="type-display-2xl text-ink-950">Practical topics, simple pricing, and a modern learning experience.</h2>
            <p className="type-body-lg text-ink-700">
              Every section keeps the same visual rhythm, while each block changes layout just enough to stay fresh and easy to browse.
            </p>
          </div>

          <div className="home-editorial-card-grid">
            {spotlightCards.map((item, index) => (
              <article key={item.title} className="home-promo-card">
                <div className={`home-promo-thumb home-promo-thumb-${['brand', 'accent', 'ink'][index % 3]}`}>
                  <div className="home-promo-icon-wrap">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </div>
                </div>
                <div className="home-promo-content">
                  <h3 className="type-title-lg text-ink-950">{item.title}</h3>
                  <p className="type-body-sm text-ink-700">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-flow-section">
        <div className="space-y-6">
          <div className="home-section-head">
            <div className="space-y-3">
              <p className="type-label text-brand-600">Trending courses</p>
              <h2 className="type-display-2xl text-ink-950">Browse useful courses by category</h2>
              <p className="type-body-lg text-ink-700">
                Switch between tags to discover in-demand lessons with the same clean marketplace-style cards.
              </p>
            </div>
            <Link className="home-inline-link" to="/courses">
              Show all courses
            </Link>
          </div>

          <div className="home-tab-row">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={tab === activeTab ? 'home-tab home-tab-active' : 'home-tab'}
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
            <div className="home-course-grid">
              {visibleCourseCards.length > 0 ? (
                visibleCourseCards.map((course) => <CourseCard key={course.id} course={course} />)
              ) : (
                <div className="empty-panel">No featured courses match this category yet.</div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="home-dark-promo-shell">
        <div className="home-dark-promo-grid">
          <div className="home-dark-copy">
            <p className="type-label text-brand-600">Premium focus</p>
            <h2 className="type-display-2xl text-white">A strong visual break that still keeps the page layout consistent.</h2>
            <p className="type-body-lg text-white/80">
              Use this darker section to highlight premium value, top career outcomes, and the most useful product benefits.
            </p>
            <Link className="home-dark-link" to="/courses">
              Browse all featured courses
            </Link>
          </div>

          <div className="home-dark-card-grid">
            {darkPromoCards.map((item, index) => (
              <article key={item.title} className="home-dark-card">
                <div className={`home-dark-card-thumb home-dark-card-thumb-${['brand', 'accent', 'ink'][index % 3]}`}>
                  <Icon name={item.icon} className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="type-title-sm text-white">{item.title}</h3>
                  <p className="type-body-sm text-white/70">{item.actions.join(' / ')}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-trust-strip">
        <p className="type-body-lg text-ink-700">Trusted by learners who want practical, modern, and affordable skills.</p>
        <div className="home-logo-row">
          {trustedBrands.map((brand) => (
            <span key={brand} className="home-logo-chip">
              {brand}
            </span>
          ))}
        </div>
      </section>

      <section className="home-flow-section">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="type-label text-brand-600">Contact</p>
            <h2 className="type-display-2xl text-ink-950">You can contact me through these channels</h2>
            <p className="type-body-lg text-ink-700">
              Reach out through social, direct call, business email, or LinkedIn whenever you want to talk about courses or collaboration.
            </p>
          </div>

          <div className="home-contact-grid">
            {homeTests.map((item) => (
              <article key={item.title} className="home-contact-card">
                <div className="feature-icon-wrap feature-icon-soft">
                  <Icon name={item.icon} className="h-5 w-5" />
                </div>
                <div className="space-y-3">
                  <h3 className="type-title-sm text-ink-950">{item.title}</h3>
                  <div className="stack-list">
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>
                        <span className="list-dot" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
