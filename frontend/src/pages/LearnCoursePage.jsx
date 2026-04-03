import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

function getYoutubeVideoId(url) {
  if (!url) {
    return null
  }

  const text = String(url).trim()
  const match = text.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i,
  )
  return match?.[1] ?? null
}

function loadYoutubeIframeApi() {
  if (globalThis.YT?.Player) {
    return Promise.resolve(globalThis.YT)
  }

  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-youtube-iframe-api="true"]')
    if (!existing) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.dataset.youtubeIframeApi = 'true'
      document.body.appendChild(script)
    }

    const previous = globalThis.onYouTubeIframeAPIReady
    globalThis.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(globalThis.YT)
    }

    const timer = globalThis.setInterval(() => {
      if (globalThis.YT?.Player) {
        globalThis.clearInterval(timer)
        resolve(globalThis.YT)
      }
    }, 120)
  })
}

function LearnCoursePage() {
  const { slug } = useParams()
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState(null)
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const [savedPosition, setSavedPosition] = useState(0)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const videoRef = useRef(null)
  const youtubeContainerRef = useRef(null)
  const youtubePlayerRef = useRef(null)
  const youtubeTickerRef = useRef(null)

  const lessons = useMemo(() => flattenLessons(course), [course])
  const completedSet = useMemo(() => new Set(progress?.completedLessonIds ?? []), [progress?.completedLessonIds])

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId],
  )

  const youtubeVideoId = getYoutubeVideoId(selectedLesson?.videoUrl)

  const isLessonUnlocked = useCallback((index) => {
    if (index <= 0) {
      return true
    }

    const lessonId = lessons[index]?.id
    const prevLessonId = lessons[index - 1]?.id

    return completedSet.has(prevLessonId) || completedSet.has(lessonId)
  }, [completedSet, lessons])

  useEffect(() => {
    async function loadPlayerData() {
      setLoading(true)
      setErrorMessage('')

      try {
        const courseDetail = await getCourseDetailRequest(slug)
        const courseProgress = await getCourseProgressRequest(courseDetail.id)
        const allLessons = flattenLessons(courseDetail)
        const fallbackLessonId = allLessons[0]?.id ?? ''
        const currentLessonId = allLessons.some((lesson) => lesson.id === courseProgress?.currentLessonId)
          ? courseProgress.currentLessonId
          : fallbackLessonId

        setCourse(courseDetail)
        setProgress(courseProgress)
        setSelectedLessonId(currentLessonId)
      } catch (error) {
        setErrorMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadPlayerData()
  }, [slug])

  useEffect(() => {
    if (!lessons.length || !selectedLessonId) {
      return
    }

    const index = lessons.findIndex((lesson) => lesson.id === selectedLessonId)
    if (index === -1 || isLessonUnlocked(index)) {
      return
    }

    const firstUnlocked = lessons.findIndex((_, idx) => isLessonUnlocked(idx))
    if (firstUnlocked >= 0) {
      setSelectedLessonId(lessons[firstUnlocked].id)
    }
  }, [isLessonUnlocked, lessons, selectedLessonId, progress?.completedLessonIds])

  useEffect(() => {
    async function loadPosition() {
      if (!selectedLesson?.id) {
        setSavedPosition(0)
        setPlaybackPosition(0)
        return
      }

      try {
        const data = await getVideoPositionRequest(selectedLesson.id)
        const nextPosition = Number(data?.position ?? 0)
        setSavedPosition(nextPosition)
        setPlaybackPosition(nextPosition)
      } catch {
        setSavedPosition(0)
        setPlaybackPosition(0)
      }
    }

    loadPosition()
  }, [selectedLesson?.id])

  useEffect(() => {
    const video = videoRef.current
    if (!video || youtubeVideoId || !selectedLesson?.videoUrl) {
      return
    }

    function handleLoadedMetadata() {
      video.currentTime = savedPosition
    }

    function handleTimeUpdate() {
      setPlaybackPosition(video.currentTime)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [selectedLesson?.id, selectedLesson?.videoUrl, savedPosition, youtubeVideoId])

  useEffect(() => {
    if (!youtubeVideoId || !youtubeContainerRef.current) {
      if (youtubeTickerRef.current) {
        globalThis.clearInterval(youtubeTickerRef.current)
        youtubeTickerRef.current = null
      }
      if (youtubePlayerRef.current?.destroy) {
        youtubePlayerRef.current.destroy()
        youtubePlayerRef.current = null
      }
      return
    }

    let cancelled = false

    async function initYoutubePlayer() {
      const YT = await loadYoutubeIframeApi()
      if (cancelled || !youtubeContainerRef.current) {
        return
      }

      if (youtubePlayerRef.current?.destroy) {
        youtubePlayerRef.current.destroy()
      }

      youtubePlayerRef.current = new YT.Player(youtubeContainerRef.current, {
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          start: Math.floor(savedPosition),
        },
        events: {
          onReady: (event) => {
            if (savedPosition > 0) {
              event.target.seekTo(Math.floor(savedPosition), true)
            }
          },
        },
      })

      if (youtubeTickerRef.current) {
        globalThis.clearInterval(youtubeTickerRef.current)
      }

      youtubeTickerRef.current = globalThis.setInterval(() => {
        const player = youtubePlayerRef.current
        if (!player?.getCurrentTime) {
          return
        }
        const current = Number(player.getCurrentTime())
        if (!Number.isNaN(current)) {
          setPlaybackPosition(current)
        }
      }, 1000)
    }

    initYoutubePlayer()

    return () => {
      cancelled = true
      if (youtubeTickerRef.current) {
        globalThis.clearInterval(youtubeTickerRef.current)
        youtubeTickerRef.current = null
      }
      if (youtubePlayerRef.current?.destroy) {
        youtubePlayerRef.current.destroy()
        youtubePlayerRef.current = null
      }
    }
  }, [youtubeVideoId, selectedLesson?.id, savedPosition])

  async function handleSavePosition() {
    if (!selectedLesson?.id) {
      return
    }

    setMessage('')
    setErrorMessage('')

    try {
      const position = Math.floor(playbackPosition)
      await saveVideoPositionRequest(selectedLesson.id, { position })
      setSavedPosition(position)
      setMessage('Saved your watch position successfully.')
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

      const currentIndex = lessons.findIndex((lesson) => lesson.id === selectedLesson.id)
      const nextLesson = lessons[currentIndex + 1]
      if (nextLesson) {
        setSelectedLessonId(nextLesson.id)
      }
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
        description="Watch lesson videos, save your exact position, and unlock lessons in sequence."
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
              <div className="space-y-3">
                <p className="type-label text-brand-600">{selectedLesson?.sectionTitle || 'Lesson'}</p>
                <h2 className="type-display-2xl text-ink-950">{selectedLesson?.title || 'Choose a lesson to begin'}</h2>
                <p className="type-body-sm text-ink-700">{selectedLesson?.duration || 0} min</p>
              </div>

              <div className="mt-4 overflow-hidden rounded-[1.2rem] border border-line bg-black">
                {selectedLesson?.videoUrl ? (
                  youtubeVideoId ? (
                    <div className="aspect-video w-full">
                      <div ref={youtubeContainerRef} className="h-full w-full" />
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      className="aspect-video w-full"
                      controls
                      src={selectedLesson.videoUrl}
                    />
                  )
                ) : (
                  <div className="player-screen">
                    <p className="type-body-md text-white/85">This lesson does not have a video URL yet.</p>
                  </div>
                )}
              </div>
            </div>

            <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
            <FeedbackMessage type="success">{message}</FeedbackMessage>

            <div className="surface-card space-y-4">
              <div className="summary-row"><span>Saved position</span><strong>{Math.floor(savedPosition)}s</strong></div>
              <div className="summary-row"><span>Current position</span><strong>{Math.floor(playbackPosition)}s</strong></div>
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
              {lessons.map((lesson, index) => {
                const active = lesson.id === selectedLesson?.id
                const completed = completedSet.has(lesson.id)
                const unlocked = isLessonUnlocked(index)

                return (
                  <button
                    key={lesson.id}
                    className={active ? 'lesson-picker lesson-picker-active' : 'lesson-picker'}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => setSelectedLessonId(lesson.id)}
                  >
                    <div className="space-y-1 text-left">
                      <p className="type-title-sm text-ink-950">{lesson.title}</p>
                      <p className="type-body-sm text-ink-700">{lesson.duration || 0} min / {lesson.sectionTitle}</p>
                    </div>
                    <span className={completed ? 'pill-accent' : unlocked ? 'pill-neutral' : 'pill-neutral opacity-60'}>
                      {completed ? 'Done' : unlocked ? 'Todo' : 'Locked'}
                    </span>
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
