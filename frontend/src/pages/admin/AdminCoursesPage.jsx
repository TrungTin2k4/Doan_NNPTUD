import { useCallback, useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import {
  createAdminCourseRequest,
  deleteAdminCourseRequest,
  getAdminCoursesRequest,
  updateAdminCourseRequest,
} from '../../api/admin'
import { getAdminCategoriesRequest } from '../../api/categories'
import { uploadMediaRequest } from '../../api/upload'
import FeedbackMessage from '../../components/common/FeedbackMessage.jsx'
import FormField from '../../components/common/FormField.jsx'
import PageHero from '../../components/common/PageHero.jsx'
import SelectField from '../../components/common/SelectField.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import TextareaField from '../../components/common/TextareaField.jsx'
import UploadField from '../../components/common/UploadField.jsx'
import { formatPrice } from '../../lib/courseUi'

function normalizeSections(sections = []) {
  return sections.map((section) => ({
    title: section.title || '',
    lessons: (section.lessons ?? []).map((lesson) => ({
      title: lesson.title || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration ?? 0,
      isPreview: lesson.isPreview === true,
    })),
  }))
}

function toPayload(values) {
  const sections = (values.sections ?? [])
    .filter((section) => (section.title || '').trim().length > 0)
    .map((section) => ({
      title: section.title.trim(),
      lessons: (section.lessons ?? [])
        .filter((lesson) => (lesson.title || '').trim().length > 0)
        .map((lesson) => ({
          title: lesson.title.trim(),
          videoUrl: (lesson.videoUrl || '').trim() || null,
          duration: Number(lesson.duration ?? 0),
          isPreview: lesson.isPreview === true,
        })),
    }))

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
    sections,
  }
}

function LessonFields({ control, register, sectionIndex }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.lessons`,
  })

  return (
    <div className="space-y-3 rounded-[1rem] border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="type-title-sm text-ink-950">Lessons</p>
        <button className="btn-ghost" type="button" onClick={() => append({ title: '', videoUrl: '', duration: 0, isPreview: false })}>
          Add lesson
        </button>
      </div>
      <div className="space-y-3">
        {fields.map((field, lessonIndex) => (
          <div key={field.id} className="rounded-[1rem] border p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <FormField
                id={`section-${sectionIndex}-lesson-${lessonIndex}-title`}
                label="Lesson title"
                placeholder="Introduction"
                registration={register(`sections.${sectionIndex}.lessons.${lessonIndex}.title`)}
              />
              <FormField
                id={`section-${sectionIndex}-lesson-${lessonIndex}-duration`}
                label="Duration (min)"
                type="number"
                placeholder="12"
                registration={register(`sections.${sectionIndex}.lessons.${lessonIndex}.duration`)}
              />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <FormField
                id={`section-${sectionIndex}-lesson-${lessonIndex}-video`}
                label="Video URL"
                placeholder="https://..."
                registration={register(`sections.${sectionIndex}.lessons.${lessonIndex}.videoUrl`)}
              />
              <label className="check-row">
                <input type="checkbox" {...register(`sections.${sectionIndex}.lessons.${lessonIndex}.isPreview`)} />
                <span>Preview lesson</span>
              </label>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="btn-ghost" type="button" onClick={() => remove(lessonIndex)}>
                Remove lesson
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminCoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [editingCourse, setEditingCourse] = useState(null)
  const [categoryOptions, setCategoryOptions] = useState([])
  const [uploading, setUploading] = useState(false)
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
      sections: [],
    },
  })
  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: 'sections',
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
        sections: normalizeSections(course.sections),
      })
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
    async function loadCategoryOptions() {
      try {
        const data = await getAdminCategoriesRequest({ page: 0, size: 100, isActive: 'true' })
        setCategoryOptions((data?.categories ?? []).map((item) => item.name))
      } catch {
        setCategoryOptions([])
      }
    }

    loadCategoryOptions()
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
      sections: [],
    })
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('edit')
    setSearchParams(nextParams, { replace: true })
  }

  async function onSubmit(values) {
    setMessage('')
    setErrorMessage('')

    try {
      if (editingCourse) {
        await updateAdminCourseRequest(editingCourse.id, toPayload(values))
        setMessage('Course updated successfully.')
      } else {
        await createAdminCourseRequest(toPayload(values))
        setMessage('Course created successfully.')
      }

      resetFormState()
      await loadCourses()
    } catch (error) {
      setErrorMessage(error.message)
    }
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

  async function handleThumbnailUpload(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploading(true)
    setErrorMessage('')
    try {
      const media = await uploadMediaRequest({ file, purpose: 'COURSE_THUMBNAIL' })
      form.setValue('thumbnail', media.publicUrl, { shouldDirty: true })
      setMessage('Thumbnail uploaded successfully.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setUploading(false)
      event.target.value = ''
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
              <UploadField id="course-thumbnail-upload" label="Upload thumbnail" helper="PNG, JPG, WEBP, or GIF" onChange={handleThumbnailUpload} uploading={uploading} />
              <SelectField id="course-category" label="Category" registration={form.register('category')} options={[{ value: '', label: 'Select category' }, ...categoryOptions.map((item) => ({ value: item, label: item }))]} />
              <FormField id="course-instructor" label="Instructor" placeholder="Jane Doe" registration={form.register('instructor')} />
              <SelectField id="course-level" label="Level" registration={form.register('level')} options={[{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }]} />
              <SelectField id="course-status" label="Status" registration={form.register('status')} options={[{ value: 'DRAFT', label: 'Draft' }, { value: 'PUBLISHED', label: 'Published' }]} />
              <FormField id="course-price" label="Price" type="number" placeholder="29" registration={form.register('price', { required: 'Price is required' })} error={form.formState.errors.price?.message} />
              <FormField id="course-original-price" label="Original price" type="number" placeholder="49" registration={form.register('originalPrice')} />
              <div className="auth-grid-span-2 space-y-4 rounded-[1rem] border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="type-title-lg text-ink-950">Course content</p>
                    <p className="type-body-sm text-ink-700">Add sections, lessons, durations, and video URLs for the learning player.</p>
                  </div>
                  <button className="btn-secondary" type="button" onClick={() => appendSection({ title: '', lessons: [] })}>
                    Add section
                  </button>
                </div>
                <div className="space-y-4">
                  {sectionFields.map((section, sectionIndex) => (
                    <div key={section.id} className="space-y-4 rounded-[1rem] border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <FormField
                          id={`section-${sectionIndex}-title`}
                          label={`Section ${sectionIndex + 1}`}
                          placeholder="Section title"
                          registration={form.register(`sections.${sectionIndex}.title`)}
                          className="w-full"
                        />
                        <button className="btn-ghost" type="button" onClick={() => removeSection(sectionIndex)}>
                          Remove section
                        </button>
                      </div>
                      <LessonFields control={form.control} register={form.register} sectionIndex={sectionIndex} />
                    </div>
                  ))}
                  {sectionFields.length === 0 ? <div className="empty-panel">No sections yet. Add a section to make the course watchable in the player.</div> : null}
                </div>
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
