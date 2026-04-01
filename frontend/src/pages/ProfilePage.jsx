import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { changePasswordRequest } from '../api/auth'
import { uploadMediaRequest } from '../api/upload'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import FormField from '../components/common/FormField.jsx'
import PageHero from '../components/common/PageHero.jsx'
import UploadField from '../components/common/UploadField.jsx'
import { resolveMediaUrl } from '../lib/media'
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
  const [failedAvatarPreviewSrc, setFailedAvatarPreviewSrc] = useState('')
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null)
  const [localAvatarPreviewUrl, setLocalAvatarPreviewUrl] = useState('')

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

  const profileName = profileForm.watch('fullName') || user?.fullName || ''
  const avatarPreviewUrl = profileForm.watch('avatarUrl') || ''
  const resolvedAvatarPreviewUrl = localAvatarPreviewUrl || resolveMediaUrl(avatarPreviewUrl)
  const shouldShowAvatarPreview = resolvedAvatarPreviewUrl && failedAvatarPreviewSrc !== resolvedAvatarPreviewUrl
  const profileInitials = (profileName || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')

  useEffect(() => {
    profileForm.reset({
      fullName: user?.fullName || '',
      avatarUrl: user?.avatarUrl || '',
    })
  }, [profileForm, user?.avatarUrl, user?.fullName])

  useEffect(
    () => () => {
      if (localAvatarPreviewUrl) {
        URL.revokeObjectURL(localAvatarPreviewUrl)
      }
    },
    [localAvatarPreviewUrl],
  )

  async function submitProfile(values) {
    setProfileMessage('')
    setProfileError('')

    try {
      let nextAvatarUrl = values.avatarUrl

      if (selectedAvatarFile) {
        setUploading(true)
        const media = await uploadMediaRequest({ file: selectedAvatarFile, purpose: 'AVATAR' })
        nextAvatarUrl = media.publicUrl
      }

      const profile = await updateProfile({
        ...values,
        avatarUrl: nextAvatarUrl,
      })

      profileForm.reset({
        fullName: profile?.fullName || values.fullName,
        avatarUrl: profile?.avatarUrl || nextAvatarUrl || '',
      })
      setSelectedAvatarFile(null)
      setLocalAvatarPreviewUrl('')
      setProfileMessage('Profile updated successfully.')
    } catch (error) {
      setProfileError(error.message)
    } finally {
      setUploading(false)
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

    setProfileError('')
    setProfileMessage('Selected image. Save profile to apply the new avatar.')
    setSelectedAvatarFile(file)
    setLocalAvatarPreviewUrl((currentValue) => {
      if (currentValue) {
        URL.revokeObjectURL(currentValue)
      }

      return URL.createObjectURL(file)
    })
    event.target.value = ''
  }

  function clearSelectedAvatar() {
    setSelectedAvatarFile(null)
    setLocalAvatarPreviewUrl('')
    setProfileMessage('')
    setProfileError('')
    setFailedAvatarPreviewSrc('')
    profileForm.setValue('avatarUrl', user?.avatarUrl || '', { shouldDirty: true })
  }

  const avatarHelper = selectedAvatarFile ? `Selected: ${selectedAvatarFile.name}` : 'PNG, JPG, WEBP, or GIF'

  const avatarDescription = selectedAvatarFile
    ? 'New avatar selected. Save profile to update your account image.'
    : 'Choose an image from your device and save the profile to apply it.'

  const isSavingProfile = loading || uploading

  function renderAvatarPreview() {
    if (shouldShowAvatarPreview) {
      return <img alt="" className="profile-avatar-preview-media" src={resolvedAvatarPreviewUrl} onError={() => setFailedAvatarPreviewSrc(resolvedAvatarPreviewUrl)} />
    }

    return <div className="profile-avatar-preview-media profile-avatar-preview-fallback">{profileInitials}</div>
  }

  return (
    <>
      <PageHero
        eyebrow="Profile settings"
        title="Manage your personal details"
        description="Update your display name, refresh your avatar, and keep your account secure from one place."
        aside={
          <div className="surface-panel profile-hero-card">
            {shouldShowAvatarPreview ? (
              <img alt="" className="profile-hero-avatar" src={resolvedAvatarPreviewUrl} onError={() => setFailedAvatarPreviewSrc(resolvedAvatarPreviewUrl)} />
            ) : (
              <div className="profile-hero-avatar profile-hero-avatar-fallback">
                {profileInitials}
              </div>
            )}
            <div className="space-y-1">
              <p className="type-title-lg text-ink-950">{profileName || 'User'}</p>
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
              <input type="hidden" {...profileForm.register('avatarUrl')} />
              <div className="profile-avatar-preview">
                {renderAvatarPreview()}
                <div className="space-y-1">
                  <p className="type-label text-brand-600">Avatar preview</p>
                  <p className="type-body-sm text-ink-700">{avatarDescription}</p>
                </div>
              </div>
              <UploadField id="profile-avatar-upload" label="Avatar image" helper={avatarHelper} onChange={handleAvatarUpload} uploading={uploading} valueLabel={selectedAvatarFile?.name} />
              {selectedAvatarFile ? <button className="btn-ghost w-full justify-center" type="button" onClick={clearSelectedAvatar}>Remove selected image</button> : null}
              <FeedbackMessage type="error">{profileError}</FeedbackMessage>
              <FeedbackMessage type="success">{profileMessage}</FeedbackMessage>
              <button className="btn-primary w-full justify-center" type="submit" disabled={isSavingProfile}>
                {uploading ? 'Uploading avatar...' : loading ? 'Saving profile...' : 'Save profile'}
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
