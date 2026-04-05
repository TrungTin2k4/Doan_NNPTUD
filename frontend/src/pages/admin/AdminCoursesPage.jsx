import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import {
  createAdminCourseRequest,
  deleteAdminCourseRequest,
  getAdminCoursesRequest,
  updateAdminCourseRequest,
} from '../../api/admin'
import FeedbackMessage from '../../components/common/FeedbackMessage.jsx'
import FormField from '../../components/common/FormField.jsx'
import PageHero from '../../components/common/PageHero.jsx'
import SelectField from '../../components/common/SelectField.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import TextareaField from '../../components/common/TextareaField.jsx'
import { formatPrice } from '../../lib/courseUi'
import { getCourseCategoriesRequest } from '../../api/courses'

function normalizeSections(sections) {
  return (sections ?? [])
    .map((section) => ({
      title: section.title?.trim() || '',
      lessons: (section.lessons ?? [])
        .map((lesson) => ({
          title: lesson.title?.trim() || '',
          videoUrl: lesson.videoUrl?.trim() || null,
          duration: Number(lesson.duration ?? 0),
          isPreview: lesson.isPreview === true,
        }))
        .filter((lesson) => lesson.title),
    }))
    .filter((section) => section.title)
}

function toPayload(values, sections) {
  return {
    title: values.title,
    description: values.description || null,
    thumbnail: values.thumbnail || null,
    category: values.category || null,
    level: values.level || null,
    instructor: values.instructor || null,
    price: Number(values.price),
    originalPrice: values.originalPrice ? Number(values.originalPrice) : null,
    isPublished: values.status === 'PUBLISHED',
    sections: normalizeSections(sections),
  }
}

function AdminCoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState([])
  const [editingCourse, setEditingCourse] = useState(null)
  const [sections, setSections] = useState([
    {
      title: '',
      lessons: [{ title: '', videoUrl: '', duration: 0, isPreview: false }],
    },
  ])
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      thumbnail: '',
      category: '',
      level: 'beginner',
      instructor: '',
      price: '',
      originalPrice: '',
      status: 'DRAFT',
    },
  })

  const editId = searchParams.get('edit')

  const applyCourseToForm = useCallback(
    (course) => {
      setEditingCourse(course)
      form.reset({
        title: course.title || '',
        description: course.description || '',
        thumbnail: course.thumbnail || '',
        category: course.category || '',
        level: course.level || 'beginner',
        instructor: course.instructor || '',
        price: String(course.price ?? ''),
        originalPrice: course.originalPrice ? String(course.originalPrice) : '',
        status: course.status || 'DRAFT',
      })

      setSections(
        course.sections?.length
          ? course.sections.map((section) => ({
              title: section.title || '',
              lessons:
                section.lessons?.length
                  ? section.lessons.map((lesson) => ({
                      title: lesson.title || '',
                      videoUrl: lesson.videoUrl || '',
                      duration: lesson.duration ?? 0,
                      isPreview: lesson.isPreview === true,
                    }))
                  : [{ title: '', videoUrl: '', duration: 0, isPreview: false }],
            }))
          : [{ title: '', lessons: [{ title: '', videoUrl: '', duration: 0, isPreview: false }] }],
      )
    },
    [form],
  )

  const loadCourses = useCallback(async () => {
    setErrorMessage('')
    try {
      const data = await getAdminCoursesRequest({ page: 0, size: 20, status: statusFilter, search })
      const nextCourses = data?.courses ?? []
      setCourses(nextCourses)

      if (editId) {
        const matchedCourse = nextCourses.find((course) => course.id === editId)
        if (matchedCourse) {
          applyCourseToForm(matchedCourse)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
    } catch (error) {
      setErrorMessage(error.message)
    }
  }, [applyCourseToForm, editId, search, statusFilter])

  useEffect(() => {
    async function syncCourses() {
      await loadCourses()
    }

    syncCourses()
  }, [loadCourses])

  useEffect(() => {
    async function loadCategories() {
      try {
        const names = await getCourseCategoriesRequest()
        setCategories(names)
      } catch {
        setCategories([])
      }
    }

    loadCategories()
  }, [])

  function startEdit(course) {
    applyCourseToForm(course)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('edit', course.id)
    setSearchParams(nextParams, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetFormState() {
    setEditingCourse(null)
    form.reset({
      title: '',
      description: '',
      thumbnail: '',
      category: '',
      level: 'beginner',
      instructor: '',
      price: '',
      originalPrice: '',
      status: 'DRAFT',
    })
    setSections([{ title: '', lessons: [{ title: '', videoUrl: '', duration: 0, isPreview: false }] }])
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('edit')
    setSearchParams(nextParams, { replace: true })
  }

  async function onSubmit(values) {
    setMessage('')
    setErrorMessage('')

    try {
      if (editingCourse) {
        await updateAdminCourseRequest(editingCourse.id, toPayload(values, sections))
        setMessage('Course updated successfully.')
      } else {
        await createAdminCourseRequest(toPayload(values, sections))
        setMessage('Course created successfully.')
      }

      resetFormState()
      await loadCourses()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  function addSection() {
    setSections((current) => [...current, { title: '', lessons: [{ title: '', videoUrl: '', duration: 0, isPreview: false }] }])
  }

  function removeSection(sectionIndex) {
    setSections((current) => current.filter((_, index) => index !== sectionIndex))
  }

  function updateSectionTitle(sectionIndex, value) {
    setSections((current) =>
      current.map((section, index) => (index === sectionIndex ? { ...section, title: value } : section)),
    )
  }

  function addLesson(sectionIndex) {
    setSections((current) =>
      current.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              lessons: [...section.lessons, { title: '', videoUrl: '', duration: 0, isPreview: false }],
            }
          : section,
      ),
    )
  }

  function removeLesson(sectionIndex, lessonIndex) {
    setSections((current) =>
      current.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              lessons: section.lessons.filter((_, idx) => idx !== lessonIndex),
            }
          : section,
      ),
    )
  }

  function updateLesson(sectionIndex, lessonIndex, key, value) {
    setSections((current) =>
      current.map((section, sIndex) =>
        sIndex === sectionIndex
          ? {
              ...section,
              lessons: section.lessons.map((lesson, lIndex) =>
                lIndex === lessonIndex ? { ...lesson, [key]: value } : lesson,
              ),
            }
          : section,
      ),
    )
  }

  async function handleDelete(id) {
    setMessage('')
    setErrorMessage('')
    try {
      await deleteAdminCourseRequest(id)
      setMessage('Course deleted successfully.')
      await loadCourses()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Admin courses"
        title="Manage course records from the admin workspace"
        description="Create, edit, and maintain your course catalog with a straightforward workflow built for daily admin use."
        aside={<div className="surface-panel"><p className="type-title-lg text-ink-950">{courses.length}</p><p className="type-caption text-ink-500">loaded courses</p></div>}
      />

      <section className="section-shell">
        <div className="admin-two-col-grid">
          <div className="auth-form-panel">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="type-label text-brand-600">Course form</p>
                <h2 className="type-display-2xl text-ink-950">{editingCourse ? 'Edit course' : 'Create course'}</h2>
              </div>
              {editingCourse ? <button className="btn-ghost" type="button" onClick={resetFormState}>Cancel edit</button> : null}
            </div>

            {editingCourse ? (
              <div className="admin-edit-preview">
                <div className="space-y-2">
                  <p className="type-label text-brand-600">Opened from course details</p>
                  <h3 className="type-title-lg text-ink-950">{editingCourse.title}</h3>
                  <p className="type-body-sm text-ink-700">{editingCourse.category || 'General'} / {editingCourse.level || 'All level'} / {formatPrice(editingCourse.price)}</p>
                </div>
                <StatusBadge value={editingCourse.status} />
              </div>
            ) : null}

            <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
            <FeedbackMessage type="success">{message}</FeedbackMessage>

            <form className="auth-form-grid auth-form-grid-2col" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField id="course-title" label="Title" placeholder="React basics" registration={form.register('title', { required: 'Title is required' })} error={form.formState.errors.title?.message} className="auth-grid-span-2" />
              <TextareaField id="course-description" label="Description" placeholder="Short course description" registration={form.register('description')} className="auth-grid-span-2" />
              <FormField id="course-thumbnail" label="Thumbnail URL" placeholder="https://..." registration={form.register('thumbnail')} error={form.formState.errors.thumbnail?.message} className="auth-grid-span-2" />
              <SelectField
                id="course-category"
                label="Category"
                registration={form.register('category')}
                options={[{ value: '', label: 'Select category' }, ...categories.map((item) => ({ value: item, label: item }))]}
              />
              <FormField id="course-instructor" label="Instructor" placeholder="Jane Doe" registration={form.register('instructor')} />
              <SelectField id="course-level" label="Level" registration={form.register('level')} options={[{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }]} />
              <SelectField id="course-status" label="Status" registration={form.register('status')} options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'PUBLISHED', label: 'Published' }]} />
              <FormField id="course-price" label="Price" type="number" placeholder="29" registration={form.register('price', { required: 'Price is required' })} error={form.formState.errors.price?.message} />
              <FormField id="course-original-price" label="Original price" type="number" placeholder="49" registration={form.register('originalPrice')} />

              <div className="auth-grid-span-2 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="type-label text-brand-600">Course sections and lessons</p>
                  <button className="btn-secondary" type="button" onClick={addSection}>Add section</button>
                </div>

                {sections.map((section, sectionIndex) => (
                  <div key={`section-${sectionIndex}`} className="surface-card space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        className="field-input field-input-square"
                        type="text"
                        placeholder={`Section ${sectionIndex + 1} title`}
                        value={section.title}
                        onChange={(event) => updateSectionTitle(sectionIndex, event.target.value)}
                      />
                      <button className="btn-ghost" type="button" onClick={() => removeSection(sectionIndex)}>
                        Remove section
                      </button>
                    </div>

                    <div className="space-y-3">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div key={`lesson-${sectionIndex}-${lessonIndex}`} className="rounded-xl border border-line p-3 space-y-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <input
                              className="field-input field-input-square"
                              type="text"
                              placeholder="Lesson title"
                              value={lesson.title}
                              onChange={(event) => updateLesson(sectionIndex, lessonIndex, 'title', event.target.value)}
                            />
                            <input
                              className="field-input field-input-square"
                              type="text"
                              placeholder="YouTube or video URL"
                              value={lesson.videoUrl}
                              onChange={(event) => updateLesson(sectionIndex, lessonIndex, 'videoUrl', event.target.value)}
                            />
                          </div>

                          <div className="grid gap-3 md:grid-cols-3 md:items-center">
                            <input
                              className="field-input field-input-square"
                              type="number"
                              min="0"
                              placeholder="Duration (minutes)"
                              value={lesson.duration}
                              onChange={(event) => updateLesson(sectionIndex, lessonIndex, 'duration', Number(event.target.value || 0))}
                            />
                            <label className="type-body-sm text-ink-700 inline-flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={lesson.isPreview}
                                onChange={(event) => updateLesson(sectionIndex, lessonIndex, 'isPreview', event.target.checked)}
                              />
                              Preview lesson
                            </label>
                            <button className="btn-ghost" type="button" onClick={() => removeLesson(sectionIndex, lessonIndex)}>
                              Remove lesson
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button className="btn-secondary" type="button" onClick={() => addLesson(sectionIndex)}>
                      Add lesson
                    </button>
                  </div>
                ))}
              </div>

              <button className="btn-primary auth-grid-span-2 w-full justify-center" type="submit">{editingCourse ? 'Update course' : 'Create course'}</button>
            </form>
          </div>

          <div className="surface-panel space-y-5">
            <div className="admin-toolbar">
              <input className="field-input field-input-square" type="text" placeholder="Search by title" value={search} onChange={(event) => setSearch(event.target.value)} />
              <select className="field-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">All status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div className="admin-list-grid">
              {courses.map((course) => (
                <article key={course.id} className="admin-list-card">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="type-title-lg text-ink-950">{course.title}</h3>
                      <p className="type-body-sm text-ink-700">{course.category || 'General'} / {course.level || 'All level'}</p>
                    </div>
                    <StatusBadge value={course.status} />
                  </div>
                  <div className="summary-row"><span>Price</span><strong>{formatPrice(course.price)}</strong></div>
                  <div className="flex flex-wrap gap-3">
                    <button className="btn-secondary" type="button" onClick={() => startEdit(course)}>Edit</button>
                    <button className="btn-ghost" type="button" onClick={() => handleDelete(course.id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default AdminCoursesPage
