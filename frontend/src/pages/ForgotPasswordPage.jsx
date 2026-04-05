import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { forgotPasswordRequest, resetPasswordRequest } from '../api/auth'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import FormField from '../components/common/FormField.jsx'
import PageHero from '../components/common/PageHero.jsx'

function ForgotPasswordPage() {
  const [requestMessage, setRequestMessage] = useState('')
  const [requestError, setRequestError] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetError, setResetError] = useState('')

  const emailForm = useForm({ defaultValues: { email: '' } })
  const resetForm = useForm({ defaultValues: { token: '', newPassword: '' } })

  async function submitRequest(values) {
    setRequestMessage('')
    setRequestError('')
    setResetMessage('')

    try {
      const data = await forgotPasswordRequest(values)
      setRequestMessage(data?.message || 'Password reset request submitted successfully.')
      setResetToken(data?.resetToken || '')
      if (data?.resetToken) {
        resetForm.setValue('token', data.resetToken)
      }
    } catch (error) {
      setRequestError(error.message)
    }
  }

  async function submitReset(values) {
    setResetError('')
    setResetMessage('')

    try {
      await resetPasswordRequest(values)
      setResetMessage('Password reset completed. You can sign in again with the new password.')
      resetForm.reset({ token: values.token, newPassword: '' })
    } catch (error) {
      setResetError(error.message)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Password recovery"
        title="Request a reset token and update the password from the frontend"
        description="Recover account access in two steps: request a reset token, then set a new password securely."
        aside={
          <div className="surface-panel space-y-4">
            <p className="type-label text-accent-600">Quick guide</p>
            <div className="stack-list">
              <li><span className="list-dot" /><span>Enter an existing email address to request a reset.</span></li>
              <li><span className="list-dot" /><span>If a reset token is returned, the form is filled automatically.</span></li>
              <li><span className="list-dot" /><span>After the reset succeeds, go back to Login to verify the new password.</span></li>
            </div>
          </div>
        }
      />

      <section className="section-shell">
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="auth-form-panel">
            <div className="space-y-3">
              <p className="type-label text-brand-600">Step 1</p>
              <h2 className="type-display-2xl text-ink-950">Request reset token</h2>
            </div>

            <form className="auth-form-grid" onSubmit={emailForm.handleSubmit(submitRequest)}>
              <FormField
                id="forgot-email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                registration={emailForm.register('email', { required: 'Email is required' })}
                error={emailForm.formState.errors.email?.message}
              />
              <FeedbackMessage type="error">{requestError}</FeedbackMessage>
              <FeedbackMessage type="success">{requestMessage}</FeedbackMessage>
              {resetToken ? (
                <div className="feedback-success">
                  Reset token: <strong>{resetToken}</strong>
                </div>
              ) : null}
              <button className="btn-primary w-full justify-center" type="submit">
                Request reset
              </button>
            </form>
          </div>

          <div className="auth-form-panel">
            <div className="space-y-3">
              <p className="type-label text-brand-600">Step 2</p>
              <h2 className="type-display-2xl text-ink-950">Reset password</h2>
            </div>

            <form className="auth-form-grid" onSubmit={resetForm.handleSubmit(submitReset)}>
              <FormField
                id="reset-token"
                label="Reset token"
                placeholder="Paste reset token"
                registration={resetForm.register('token', { required: 'Reset token is required' })}
                error={resetForm.formState.errors.token?.message}
              />
              <FormField
                id="reset-password"
                label="New password"
                type="password"
                placeholder="Enter your new password"
                registration={resetForm.register('newPassword', { required: 'New password is required' })}
                error={resetForm.formState.errors.newPassword?.message}
              />
              <FeedbackMessage type="error">{resetError}</FeedbackMessage>
              <FeedbackMessage type="success">{resetMessage}</FeedbackMessage>
              <button className="btn-secondary w-full justify-center" type="submit">
                Reset password
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default ForgotPasswordPage
