import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { changePasswordRequest } from '../api/auth'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import FormField from '../components/common/FormField.jsx'
import PageHero from '../components/common/PageHero.jsx'

function ChangePasswordPage() {
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  })

  async function onSubmit(values) {
    setMessage('')
    setErrorMessage('')

    try {
      await changePasswordRequest(values)
      setMessage('Password updated successfully. Older tokens may become invalid after the backend revokes them.')
      form.reset()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Account security"
        title="Change your password while signed in"
        description="This page connects to `PUT /api/auth/change-password` and keeps the same form system used on Login and Register."
        aside={<div className="surface-panel"><p className="type-body-md text-ink-700">After a successful password change, the backend may increment `tokenVersion` to revoke older tokens.</p></div>}
      />

      <section className="section-shell">
        <div className="auth-form-panel auth-form-panel-narrow">
          <form className="auth-form-grid" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              id="current-password"
              label="Current password"
              type="password"
              placeholder="Enter your current password"
              registration={form.register('currentPassword', { required: 'Current password is required' })}
              error={form.formState.errors.currentPassword?.message}
            />
            <FormField
              id="new-password"
              label="New password"
              type="password"
              placeholder="Enter your new password"
              registration={form.register('newPassword', { required: 'New password is required' })}
              error={form.formState.errors.newPassword?.message}
            />
            <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
            <FeedbackMessage type="success">{message}</FeedbackMessage>
            <button className="btn-primary w-full justify-center" type="submit">Update password</button>
          </form>
        </div>
      </section>
    </>
  )
}

export default ChangePasswordPage
