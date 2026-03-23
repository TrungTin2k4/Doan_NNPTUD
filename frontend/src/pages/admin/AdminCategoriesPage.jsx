import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  createAdminCategoryRequest,
  deleteAdminCategoryRequest,
  getAdminCategoriesRequest,
  updateAdminCategoryRequest,
} from '../../api/categories'
import FeedbackMessage from '../../components/common/FeedbackMessage.jsx'
import FormField from '../../components/common/FormField.jsx'
import PageHero from '../../components/common/PageHero.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import TextareaField from '../../components/common/TextareaField.jsx'

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [editingCategory, setEditingCategory] = useState(null)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  })

  async function loadCategories() {
    setErrorMessage('')
    try {
      const data = await getAdminCategoriesRequest({ page: 0, size: 20 })
      setCategories(data?.categories ?? [])
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  useEffect(() => {
    async function syncCategories() {
      await loadCategories()
    }

    syncCategories()
  }, [])

  function resetFormState() {
    setEditingCategory(null)
    form.reset({ name: '', description: '', isActive: true })
  }

  function startEdit(category) {
    setEditingCategory(category)
    form.reset({
      name: category.name || '',
      description: category.description || '',
      isActive: category.isActive !== false,
    })
  }

  async function onSubmit(values) {
    setMessage('')
    setErrorMessage('')
    try {
      if (editingCategory) {
        await updateAdminCategoryRequest(editingCategory.id, values)
        setMessage('Category updated successfully.')
      } else {
        await createAdminCategoryRequest(values)
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
        title="Organize course tags and discovery groups"
        description="Manage the category structure used across search, filtering, and course discovery."
        aside={<div className="surface-panel"><p className="type-title-lg text-ink-950">{categories.length}</p><p className="type-caption text-ink-500">categories</p></div>}
      />

      <section className="section-shell">
        <div className="admin-two-col-grid">
          <div className="auth-form-panel">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="type-label text-brand-600">Category form</p>
                <h2 className="type-display-2xl text-ink-950">{editingCategory ? 'Edit category' : 'Create category'}</h2>
              </div>
              {editingCategory ? <button className="btn-ghost" type="button" onClick={resetFormState}>Cancel</button> : null}
            </div>
            <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
            <FeedbackMessage type="success">{message}</FeedbackMessage>
            <form className="auth-form-grid" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField id="category-name" label="Name" placeholder="AI" registration={form.register('name', { required: 'Category name is required' })} error={form.formState.errors.name?.message} />
              <TextareaField id="category-description" label="Description" placeholder="Short description" registration={form.register('description')} />
              <label className="check-row">
                <input type="checkbox" {...form.register('isActive')} />
                <span>Category is active</span>
              </label>
              <button className="btn-primary w-full justify-center" type="submit">{editingCategory ? 'Update category' : 'Create category'}</button>
            </form>
          </div>

          <div className="surface-panel space-y-4">
            <div className="admin-list-grid">
              {categories.map((category) => (
                <article key={category.id} className="admin-list-card space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="type-title-lg text-ink-950">{category.name}</h3>
                      <p className="type-body-sm text-ink-700">{category.slug}</p>
                    </div>
                    <StatusBadge value={category.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                  <p className="type-body-sm text-ink-700">{category.description || 'No description yet.'}</p>
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
