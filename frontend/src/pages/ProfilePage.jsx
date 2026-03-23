import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { changePasswordRequest } from '../api/auth'
import { uploadMediaRequest } from '../api/upload'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import FormField from '../components/common/FormField.jsx'
import PageHero from '../components/common/PageHero.jsx'
import UploadField from '../components/common/UploadField.jsx'
import { useAuthStore } from '../store/authStore'

function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const logout = useAuthStore((state) => state.logout)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [uploading, setUploading] = useState(false)

  const profileForm = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      avatarUrl: user?.avatarUrl || '',
    },
  })

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  })

  useEffect(() => {
    profileForm.reset({
      fullName: user?.fullName || '',
      avatarUrl: user?.avatarUrl || '',
    })
  }, [profileForm, user?.avatarUrl, user?.fullName])

  async function submitProfile(values) {
    setProfileMessage('')
    setProfileError('')

    try {
      await updateProfile(values)
      setProfileMessage('Profile updated successfully.')
    } catch (error) {
      setProfileError(error.message)
    }
  }

  async function submitPassword(values) {
    setPasswordError('')

    try {
      await changePasswordRequest(values)
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setPasswordError(error.message)
    }
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploading(true)
    setProfileError('')
    setProfileMessage('')
    try {
      const media = await uploadMediaRequest({ file, purpose: 'AVATAR' })
      profileForm.setValue('avatarUrl', media.publicUrl, { shouldDirty: true })
      setProfileMessage('Avatar uploaded. Save profile to apply the new image.')
    } catch (error) {
      setProfileError(error.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Profile settings"
        title="Manage your personal details"
        description="Update your display name, refresh your avatar, and keep your account secure from one place."
        aside={
          <div className="surface-panel profile-hero-card">
            {user?.avatarUrl ? (
              <img alt={user.fullName} className="profile-hero-avatar" src={user.avatarUrl} />
            ) : (
              <div className="profile-hero-avatar profile-hero-avatar-fallback">
                {(user?.fullName || 'U')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() || '')
                  .join('')}
              </div>
            )}
            <div className="space-y-1">
              <p className="type-title-lg text-ink-950">{user?.fullName}</p>
              <p className="type-body-sm text-ink-700">{user?.email}</p>
            </div>
          </div>
        }
      />

      <section className="section-shell">
        <div className="profile-grid">
          <div className="auth-form-panel">
            <div className="space-y-3">
              <p className="type-label text-brand-600">Profile</p>
              <h2 className="type-display-2xl text-ink-950">Update your public account details</h2>
            </div>
            <form className="auth-form-grid" onSubmit={profileForm.handleSubmit(submitProfile)}>
              <FormField
                id="profile-name"
                label="Full name"
                placeholder="Your full name"
                registration={profileForm.register('fullName', { required: 'Full name is required' })}
                error={profileForm.formState.errors.fullName?.message}
              />
              <FormField
                id="profile-avatar"
                label="Avatar URL"
                placeholder="https://example.com/avatar.jpg"
                registration={profileForm.register('avatarUrl')}
                error={profileForm.formState.errors.avatarUrl?.message}
              />
              <UploadField id="profile-avatar-upload" label="Upload avatar" helper="PNG, JPG, WEBP, or GIF" onChange={handleAvatarUpload} uploading={uploading} />
              <FeedbackMessage type="error">{profileError}</FeedbackMessage>
              <FeedbackMessage type="success">{profileMessage}</FeedbackMessage>
              <button className="btn-primary w-full justify-center" type="submit" disabled={loading}>
                {loading ? 'Saving profile...' : 'Save profile'}
              </button>
            </form>
          </div>

          <div className="auth-form-panel">
            <div className="space-y-3">
              <p className="type-label text-brand-600">Security</p>
              <h2 className="type-display-2xl text-ink-950">Change your password</h2>
            </div>
            <form className="auth-form-grid" onSubmit={passwordForm.handleSubmit(submitPassword)}>
              <FormField
                id="profile-current-password"
                label="Current password"
                type="password"
                placeholder="Enter your current password"
                registration={passwordForm.register('currentPassword', { required: 'Current password is required' })}
                error={passwordForm.formState.errors.currentPassword?.message}
              />
              <FormField
                id="profile-new-password"
                label="New password"
                type="password"
                placeholder="Enter a new password"
                registration={passwordForm.register('newPassword', { required: 'New password is required' })}
                error={passwordForm.formState.errors.newPassword?.message}
              />
              <FeedbackMessage type="error">{passwordError}</FeedbackMessage>
              <button className="btn-secondary w-full justify-center" type="submit">
                Update password
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default ProfilePage
