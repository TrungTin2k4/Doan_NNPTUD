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

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function getPlayableMedia(videoUrl) {
  if (!videoUrl) {
    return null
  }

  try {
    const parsed = new URL(videoUrl)
    const host = parsed.hostname.replace(/^www\./, '')
    const path = parsed.pathname
    const ext = path.split('.').pop()?.toLowerCase()

    if (host === 'youtu.be') {
      const id = path.slice(1)
      return id ? { type: 'youtube', src: `https://www.youtube.com/embed/${id}`, videoId: id } : { type: 'iframe', src: videoUrl }
    }

    if (host.includes('youtube.com')) {
      let id = parsed.searchParams.get('v')
      if (!id && path.startsWith('/embed/')) {
        id = path.split('/')[2]
      }
      if (!id && path.startsWith('/shorts/')) {
        id = path.split('/')[2]
      }
      return id ? { type: 'youtube', src: `https://www.youtube.com/embed/${id}`, videoId: id } : { type: 'iframe', src: videoUrl }
    }

    if (host.includes('vimeo.com')) {
      const id = path.split('/').filter(Boolean).pop()
      return id ? { type: 'iframe', src: `https://player.vimeo.com/video/${id}` } : { type: 'iframe', src: videoUrl }
    }

    if (['mp4', 'webm', 'ogg', 'mov', 'm4v'].includes(ext || '')) {
      return { type: 'video', src: videoUrl }
    }

    return { type: 'iframe', src: videoUrl }
  } catch {
    return { type: 'iframe', src: videoUrl }
  }
}

let youtubeApiPromise

function loadYouTubeApi() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not available'))
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT)
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise
  }

  youtubeApiPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-youtube-api="true"]')

    if (!existing) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.dataset.youtubeApi = 'true'
      script.onerror = () => reject(new Error('Unable to load YouTube player API'))
      document.body.appendChild(script)
    }

    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      resolve(window.YT)
    }

    window.setTimeout(() => {
      if (!window.YT?.Player) {
        reject(new Error('YouTube player API did not initialize in time'))
      }
    }, 10000)
  })

  return youtubeApiPromise
}

function LearnCoursePage() {
  const { slug } = useParams()
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState(null)
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const [videoPosition, setVideoPosition] = useState(0)
  const [playerDuration, setPlayerDuration] = useState(600)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const htmlVideoRef = useRef(null)
  const youtubeContainerRef = useRef(null)
  const youtubePlayerRef = useRef(null)
  const youtubePollRef = useRef(null)
  const initialSeekAppliedRef = useRef(false)
  const pendingResumePositionRef = useRef(0)
  const lastPersistedPositionRef = useRef(0)
  const latestPositionRef = useRef(0)

  const lessons = useMemo(() => flattenLessons(course), [course])
  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0] ?? null,
    [lessons, selectedLessonId],
  )
  const playableMedia = useMemo(() => getPlayableMedia(selectedLesson?.videoUrl), [selectedLesson?.videoUrl])

  const stopYouTubePolling = useCallback(() => {
    if (youtubePollRef.current) {
      window.clearInterval(youtubePollRef.current)
      youtubePollRef.current = null
    }
  }, [])

  const syncYouTubeProgress = useCallback(() => {
    const player = youtubePlayerRef.current
    if (!player?.getCurrentTime) {
      return
    }

    try {
      const nextPosition = Math.floor(player.getCurrentTime())
      const nextDuration = Math.floor(player.getDuration?.() || 0)
      setVideoPosition(nextPosition)
      if (nextDuration > 0) {
        setPlayerDuration(nextDuration)
      }
    } catch {
      // ignore transient YouTube player sync failures
    }
  }, [])

  const persistPosition = useCallback(
    async (nextPosition, options = {}) => {
      const { silent = false } = options

      if (!course?.id || !selectedLesson?.id) {
        return
      }

      const normalized = Math.max(0, Math.floor(nextPosition || 0))
      if (normalized === lastPersistedPositionRef.current) {
        return
      }

      if (!silent) {
        setMessage('')
        setErrorMessage('')
      }

      try {
        await saveVideoPositionRequest(course.id, selectedLesson.id, normalized)
        lastPersistedPositionRef.current = normalized
        if (!silent) {
          setMessage('Video position saved to the backend.')
        }
      } catch (error) {
        if (!silent) {
          setErrorMessage(error.message)
        }
      }
    },
    [course?.id, selectedLesson?.id],
  )

  const seekToPosition = useCallback(
    (nextPosition) => {
      if (!playableMedia) {
        return
      }

      if (playableMedia.type === 'youtube' && youtubePlayerRef.current?.seekTo) {
        youtubePlayerRef.current.seekTo(nextPosition, true)
        return
      }

      if (playableMedia.type === 'video' && htmlVideoRef.current) {
        htmlVideoRef.current.currentTime = nextPosition
      }
    },
    [playableMedia],
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
    latestPositionRef.current = videoPosition
  }, [videoPosition])

  useEffect(() => {
    initialSeekAppliedRef.current = false
    setPlayerDuration(600)
    pendingResumePositionRef.current = 0
    lastPersistedPositionRef.current = 0

    async function loadPosition() {
      if (!selectedLesson?.id) {
        setVideoPosition(0)
        return
      }

      try {
        const data = await getVideoPositionRequest(selectedLesson.id)
        const savedPosition = Number(data?.position ?? 0)
        pendingResumePositionRef.current = savedPosition
        lastPersistedPositionRef.current = savedPosition
        setVideoPosition(savedPosition)
      } catch {
        setVideoPosition(0)
      }
    }

    loadPosition()
  }, [selectedLesson?.id])

  useEffect(() => {
    return () => {
      if (latestPositionRef.current > 0) {
        void persistPosition(latestPositionRef.current, { silent: true })
      }
    }
  }, [persistPosition, selectedLesson?.id])

  useEffect(() => {
    stopYouTubePolling()

    if (youtubePlayerRef.current?.destroy) {
      youtubePlayerRef.current.destroy()
      youtubePlayerRef.current = null
    }

    if (playableMedia?.type !== 'youtube' || !youtubeContainerRef.current) {
      return undefined
    }

    let cancelled = false

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !youtubeContainerRef.current) {
          return
        }

        youtubePlayerRef.current = new YT.Player(youtubeContainerRef.current, {
          videoId: playableMedia.videoId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (event) => {
              const duration = Math.floor(event.target.getDuration?.() || 0)
              if (duration > 0) {
                setPlayerDuration(duration)
              }
              if (pendingResumePositionRef.current > 0 && !initialSeekAppliedRef.current) {
                event.target.seekTo(pendingResumePositionRef.current, true)
                initialSeekAppliedRef.current = true
              }
              syncYouTubeProgress()
            },
            onStateChange: (event) => {
              const state = event.data
              if (state === YT.PlayerState.PLAYING) {
                stopYouTubePolling()
                youtubePollRef.current = window.setInterval(syncYouTubeProgress, 1000)
              } else {
                stopYouTubePolling()
                syncYouTubeProgress()
              }
            },
          },
        })
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })

    return () => {
      cancelled = true
      stopYouTubePolling()
      if (youtubePlayerRef.current?.destroy) {
        youtubePlayerRef.current.destroy()
        youtubePlayerRef.current = null
      }
    }
  }, [playableMedia?.type, playableMedia?.videoId, stopYouTubePolling, syncYouTubeProgress])

  useEffect(() => {
    if (playableMedia?.type === 'video' && htmlVideoRef.current && pendingResumePositionRef.current > 0 && !initialSeekAppliedRef.current) {
      htmlVideoRef.current.currentTime = pendingResumePositionRef.current
      initialSeekAppliedRef.current = true
    }
  }, [playableMedia?.type])

  async function handleSavePosition() {
    if (!selectedLesson?.id) {
      return
    }

    setMessage('')
    setErrorMessage('')

    try {
      await persistPosition(videoPosition)
    } catch {
      // errors are handled inside persistPosition
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
              {playableMedia ? (
                <div className="player-media-shell">
                  {playableMedia.type === 'youtube' ? (
                    <div className="player-media-frame" ref={youtubeContainerRef} />
                  ) : playableMedia.type === 'video' ? (
                    <video
                      ref={htmlVideoRef}
                      className="player-media-frame"
                      controls
                      onEnded={() => setVideoPosition(Math.floor(playerDuration))}
                      onLoadedMetadata={(event) => {
                        const duration = Math.floor(event.currentTarget.duration || 0)
                        if (duration > 0) {
                          setPlayerDuration(duration)
                        }
                        if (pendingResumePositionRef.current > 0 && !initialSeekAppliedRef.current) {
                          event.currentTarget.currentTime = pendingResumePositionRef.current
                          initialSeekAppliedRef.current = true
                        }
                      }}
                      onPause={() => {
                        void persistPosition(latestPositionRef.current, { silent: true })
                      }}
                      onTimeUpdate={(event) => setVideoPosition(Math.floor(event.currentTarget.currentTime || 0))}
                      src={playableMedia.src}
                    />
                  ) : (
                    <iframe
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="player-media-frame"
                      src={playableMedia.src}
                      title={selectedLesson.title}
                    />
                  )}
                </div>
              ) : (
                <div className="player-screen">
                  <div className="space-y-3">
                    <p className="type-label text-brand-600">{selectedLesson?.sectionTitle || 'Lesson'}</p>
                    <h2 className="type-display-2xl text-ink-950">{selectedLesson?.title || 'Choose a lesson to begin'}</h2>
                    <p className="type-body-sm text-ink-700">No video is assigned to this lesson yet. Add a lesson video URL in the admin course form to make this lesson playable.</p>
                  </div>
                </div>
              )}
            </div>

            <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
            <FeedbackMessage type="success">{message}</FeedbackMessage>

            <div className="surface-card space-y-4">
              <div className="summary-row"><span>Saved position</span><strong>{formatTime(videoPosition)} / {formatTime(playerDuration)}</strong></div>
              <input
                className="player-slider"
                type="range"
                  min="0"
                  max={Math.max(playerDuration, videoPosition, 1)}
                  value={videoPosition}
                  onChange={(event) => setVideoPosition(Number(event.target.value))}
                  onMouseUp={() => seekToPosition(videoPosition)}
                  onTouchEnd={() => seekToPosition(videoPosition)}
                  onKeyUp={() => seekToPosition(videoPosition)}
                />
                <div className="flex flex-wrap gap-3">
                  <button className="btn-secondary" type="button" onClick={handleSavePosition}>Save position</button>
                  <button className="btn-primary" type="button" onClick={handleCompleteLesson}>Mark complete</button>
                  {selectedLesson?.videoUrl ? (
                    <a className="text-link" href={selectedLesson.videoUrl} rel="noreferrer" target="_blank">
                      Open source
                    </a>
                  ) : null}
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
