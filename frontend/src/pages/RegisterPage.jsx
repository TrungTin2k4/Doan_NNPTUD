import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import FormField from '../components/common/FormField.jsx'
import { applyServerFieldErrors } from '../lib/formErrors'
import { useAuthStore } from '../store/authStore'

function RegisterPage() {
  const navigate = useNavigate()
  const registerUser = useAuthStore((state) => state.register)
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [navigate, user])

  async function onSubmit(values) {
    setFormError('')

    try {
      await registerUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      })
      navigate('/', { replace: true })
    } catch (error) {
      applyServerFieldErrors(error, setError)
      setFormError(error.message)
    }
  }

  return (
    <section className="auth-page-shell">
      <div className="auth-form-panel auth-form-panel-wide">
          <div className="space-y-3">
            <p className="type-label text-brand-600">Create account</p>
            <h1 className="type-display-2xl text-ink-950">Create a new account and start learning</h1>
            <p className="type-body-md text-ink-700">Join EduLearn to access useful courses, simple navigation, and a clean modern learning experience.</p>
          </div>

          <form className="auth-form-grid auth-form-grid-2col" onSubmit={handleSubmit(onSubmit)}>
            <FormField
              id="register-name"
              label="Full name"
              placeholder="Jane Doe"
              registration={register('fullName', { required: 'Full name is required' })}
              error={errors.fullName?.message}
            />

            <FormField
              id="register-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              registration={register('email', { required: 'Email is required' })}
              error={errors.email?.message}
            />

            <FormField
              id="register-password"
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              registration={register('password', { required: 'Password is required' })}
              error={errors.password?.message}
            />

            <FormField
              id="register-confirm"
              label="Confirm password"
              type="password"
              placeholder="Re-enter your password"
              registration={register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === getValues('password') || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />

            <FeedbackMessage type="error">{formError}</FeedbackMessage>

            <label className="check-row auth-grid-span-2">
              <input type="checkbox" required />
              <span>I agree to the terms, privacy policy, and usage guidelines.</span>
            </label>

            <button className="btn-primary auth-grid-span-2 w-full justify-center" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="type-body-sm text-ink-700">
            Already have an account?{' '}
            <Link className="text-link" to="/login">
              Sign in now
            </Link>
          </p>
      </div>
    </section>
  )
}

export default RegisterPage
