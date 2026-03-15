import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCourseDetailRequest } from '../api/courses'
import {
  completeLessonRequest,
  getCourseProgressRequest,
  getVideoPositionRequest,
  saveVideoPositionRequest,
} from '../api/progress'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import PageHero from '../components/common/PageHero.jsx'

function flattenLessons(course) {
  return (course?.sections ?? []).flatMap((section) =>
    (section.lessons ?? []).map((lesson) => ({
      ...lesson,
      sectionId: section.id,
      sectionTitle: section.title,
    })),
  )
}

function LearnCoursePage() {
  const { slug } = useParams()
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState(null)
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const [videoPosition, setVideoPosition] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const lessons = useMemo(() => flattenLessons(course), [course])
  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0] ?? null,
    [lessons, selectedLessonId],
  )

  useEffect(() => {
    async function loadPlayerData() {
      setLoading(true)
      setErrorMessage('')

      try {
        const courseDetail = await getCourseDetailRequest(slug)
        const courseProgress = await getCourseProgressRequest(courseDetail.id)
        setCourse(courseDetail)
        setProgress(courseProgress)
        setSelectedLessonId(courseProgress?.currentLessonId || flattenLessons(courseDetail)[0]?.id || '')
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadPlayerData()
  }, [slug])

  useEffect(() => {
    async function loadPosition() {
      if (!selectedLesson?.id) {
        setVideoPosition(0)
        return
      }

      try {
        const data = await getVideoPositionRequest(selectedLesson.id)
        setVideoPosition(Number(data?.position ?? 0))
      } catch {
        setVideoPosition(0)
      }
    }

    loadPosition()
  }, [selectedLesson?.id])

  async function handleSavePosition() {
    if (!selectedLesson?.id) {
      return
    }

    setMessage('')
    setErrorMessage('')

    try {
      await saveVideoPositionRequest(selectedLesson.id, { position: Math.floor(videoPosition) })
      setMessage('Video position saved to the backend.')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleCompleteLesson() {
    if (!selectedLesson?.id || !course?.id) {
      return
    }

    setMessage('')
    setErrorMessage('')

    try {
      const nextProgress = await completeLessonRequest(course.id, selectedLesson.id)
      setProgress(nextProgress)
      setMessage('Lesson marked as complete.')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  if (loading) {
    return <section className="loading-panel">Loading the learning player...</section>
  }

  if (errorMessage || !course) {
    return <section className="empty-panel">{errorMessage || 'Unable to load course data.'}</section>
  }

  return (
    <>
      <PageHero
        eyebrow="Learn course"
        title={course.title}
        description="Stay focused with a clean player layout, clear lesson navigation, and progress that updates as you learn."
        aside={
          <div className="surface-panel space-y-4">
            <p className="type-label text-accent-600">Current progress</p>
            <div className="progress-shell">
              <div className="progress-bar"><span style={{ width: `${progress?.progressPercent || 0}%` }} /></div>
              <div className="summary-row"><span>Completion</span><strong>{progress?.progressPercent || 0}%</strong></div>
            </div>
          </div>
        }
      />

      <section className="section-shell">
        <div className="player-grid">
          <div className="surface-panel space-y-5">
            <div className="player-stage">
              <div className="player-screen">
                <div className="space-y-3">
                  <p className="type-label text-brand-600">{selectedLesson?.sectionTitle || 'Lesson'}</p>
                  <h2 className="type-display-2xl text-ink-950">{selectedLesson?.title || 'Choose a lesson to begin'}</h2>
                  <p className="type-body-sm text-ink-700">
                    {selectedLesson?.videoUrl
                      ? 'This lesson includes preview media so you can start right away.'
                      : 'This lesson is part of the main course flow and keeps your place saved as you continue.'}
                  </p>
                </div>
              </div>
            </div>

            <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
            <FeedbackMessage type="success">{message}</FeedbackMessage>

            <div className="surface-card space-y-4">
              <div className="summary-row"><span>Saved position</span><strong>{Math.floor(videoPosition)}s</strong></div>
              <input
                className="player-slider"
                type="range"
                min="0"
                max="600"
                value={videoPosition}
                onChange={(event) => setVideoPosition(Number(event.target.value))}
              />
              <div className="flex flex-wrap gap-3">
                <button className="btn-secondary" type="button" onClick={handleSavePosition}>Save position</button>
                <button className="btn-primary" type="button" onClick={handleCompleteLesson}>Mark complete</button>
              </div>
            </div>
          </div>

          <aside className="surface-panel space-y-4 player-sidebar">
            <div className="space-y-2">
              <p className="type-label text-brand-600">Lesson list</p>
              <h3 className="type-title-lg text-ink-950">{lessons.length} lessons</h3>
            </div>

            <div className="lesson-list-panel">
              {lessons.map((lesson) => {
                const active = lesson.id === selectedLesson?.id
                const completed = progress?.completedLessonIds?.includes(lesson.id)

                return (
                  <button
                    key={lesson.id}
                    className={active ? 'lesson-picker lesson-picker-active' : 'lesson-picker'}
                    type="button"
                    onClick={() => setSelectedLessonId(lesson.id)}
                  >
                    <div className="space-y-1 text-left">
                      <p className="type-title-sm text-ink-950">{lesson.title}</p>
                      <p className="type-body-sm text-ink-700">{lesson.duration || 0} min / {lesson.sectionTitle}</p>
                    </div>
                    <span className={completed ? 'pill-accent' : 'pill-neutral'}>{completed ? 'Done' : 'Todo'}</span>
                  </button>
                )
              })}
            </div>

            <Link className="text-link" to="/my-learning">Back to My Learning</Link>
          </aside>
        </div>
      </section>
    </>
  )
}

export default LearnCoursePage
