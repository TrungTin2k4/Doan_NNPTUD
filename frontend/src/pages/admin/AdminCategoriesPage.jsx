import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  createAdminCategoryRequest,
  deleteAdminCategoryRequest,
  getAdminCategoriesRequest,
  updateAdminCategoryRequest,
} from '../../api/admin'
import FeedbackMessage from '../../components/common/FeedbackMessage.jsx'
import FormField from '../../components/common/FormField.jsx'
import PageHero from '../../components/common/PageHero.jsx'
import TextareaField from '../../components/common/TextareaField.jsx'

function toCategoryPayload(values) {
  return {
    name: values.name,
    description: values.description || null,
    isActive: values.isActive === 'true',
  }
}

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [editingCategory, setEditingCategory] = useState(null)
  const [activeFilter, setActiveFilter] = useState('')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      isActive: 'true',
    },
  })

  const loadCategories = useCallback(async () => {
    setErrorMessage('')
    try {
      const data = await getAdminCategoriesRequest({
        page: 0,
        size: 20,
        search,
        isActive: activeFilter,
      })
      setCategories(data?.categories ?? [])
    } catch (error) {
      setErrorMessage(error.message)
    }
  }, [activeFilter, search])

  useEffect(() => {
    async function syncCategories() {
      await loadCategories()
    }

    syncCategories()
  }, [loadCategories])

  function resetFormState() {
    setEditingCategory(null)
    form.reset({ name: '', description: '', isActive: 'true' })
  }

  function startEdit(category) {
    setEditingCategory(category)
    form.reset({
      name: category.name || '',
      description: category.description || '',
      isActive: category.isActive ? 'true' : 'false',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function onSubmit(values) {
    setMessage('')
    setErrorMessage('')

    try {
      if (editingCategory) {
        await updateAdminCategoryRequest(editingCategory.id, toCategoryPayload(values))
        setMessage('Category updated successfully.')
      } else {
        await createAdminCategoryRequest(toCategoryPayload(values))
        setMessage('Category created successfully.')
      }

      resetFormState()
      await loadCategories()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleDelete(id) {
    setMessage('')
    setErrorMessage('')
    try {
      await deleteAdminCategoryRequest(id)
      setMessage('Category deleted successfully.')
      await loadCategories()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Admin categories"
        title="Manage frontend category options"
        description="Create clean category names, keep descriptions organized, and control active status used by course filters."
        aside={<div className="surface-panel"><p className="type-title-lg text-ink-950">{categories.length}</p><p className="type-caption text-ink-500">categories loaded</p></div>}
      />

      <section className="section-shell">
        <div className="admin-two-col-grid">
          <div className="auth-form-panel">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="type-label text-brand-600">Category form</p>
                <h2 className="type-display-2xl text-ink-950">{editingCategory ? 'Edit category' : 'Create category'}</h2>
              </div>
              {editingCategory ? <button className="btn-ghost" type="button" onClick={resetFormState}>Cancel edit</button> : null}
            </div>

            <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
            <FeedbackMessage type="success">{message}</FeedbackMessage>

            <form className="auth-form-grid" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                id="category-name"
                label="Name"
                placeholder="Web Development"
                registration={form.register('name', { required: 'Category name is required' })}
                error={form.formState.errors.name?.message}
              />
              <TextareaField
                id="category-description"
                label="Description"
                placeholder="Optional description"
                registration={form.register('description')}
              />
              <div className="field-group">
                <label className="field-label" htmlFor="category-active">Status</label>
                <select id="category-active" className="field-select" {...form.register('isActive')}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <button className="btn-primary w-full justify-center" type="submit">
                {editingCategory ? 'Update category' : 'Create category'}
              </button>
            </form>
          </div>

          <div className="surface-panel space-y-5">
            <div className="admin-toolbar">
              <input className="field-input field-input-square" type="text" placeholder="Search category name" value={search} onChange={(event) => setSearch(event.target.value)} />
              <select className="field-select" value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}>
                <option value="">All status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="admin-list-grid">
              {categories.map((category) => (
                <article key={category.id} className="admin-list-card space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="type-title-lg text-ink-950">{category.name}</h3>
                    <span className={category.isActive ? 'pill-accent' : 'pill-neutral'}>{category.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                  </div>
                  <p className="type-body-sm text-ink-700">{category.description || 'No description'}</p>
                  <div className="summary-row"><span>Slug</span><strong>{category.slug}</strong></div>
                  <div className="flex flex-wrap gap-3">
                    <button className="btn-secondary" type="button" onClick={() => startEdit(category)}>Edit</button>
                    <button className="btn-ghost" type="button" onClick={() => handleDelete(category.id)}>Delete</button>
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

export default AdminCategoriesPage
