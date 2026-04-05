import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import FormField from '../components/common/FormField.jsx'
import { applyServerFieldErrors } from '../lib/formErrors'
import { useAuthStore } from '../store/authStore'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (user) {
      navigate(location.state?.from ?? '/', { replace: true })
    }
  }, [location.state, navigate, user])

  async function onSubmit(values) {
    setFormError('')

    try {
      await login(values)
      navigate(location.state?.from ?? '/', { replace: true })
    } catch (error) {
      applyServerFieldErrors(error, setError)
      setFormError(error.message)
    }
  }

  return (
    <section className="auth-page-shell">
      <div className="auth-form-panel auth-form-panel-centered">
          <div className="space-y-3">
            <p className="type-label text-brand-600">Login form</p>
            <h1 className="type-display-2xl text-ink-950">Sign in to your account</h1>
            <p className="type-body-md text-ink-700">Welcome back. Sign in to continue with your saved courses and account settings.</p>
          </div>

          <form className="auth-form-grid" onSubmit={handleSubmit(onSubmit)}>
            <FormField
              id="login-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              registration={register('email', { required: 'Email is required' })}
              error={errors.email?.message}
            />

            <FormField
              id="login-password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              registration={register('password', { required: 'Password is required' })}
              error={errors.password?.message}
            />

            <FeedbackMessage type="error">{formError}</FeedbackMessage>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="check-row">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link className="text-link" to="/forgot-password">Forgot password?</Link>
            </div>

            <button className="btn-primary w-full justify-center" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="type-body-sm text-ink-700">
            Need an account?{' '}
            <Link className="text-link" to="/register">
              Create one here
            </Link>
          </p>
      </div>
    </section>
  )
}

export default LoginPage
