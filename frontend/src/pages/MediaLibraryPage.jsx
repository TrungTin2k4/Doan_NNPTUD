import { useEffect, useState } from 'react'
import { deleteUploadRequest, getUploadsRequest, uploadMediaRequest } from '../api/upload'
import FeedbackMessage from '../components/common/FeedbackMessage.jsx'
import PageHero from '../components/common/PageHero.jsx'
import UploadField from '../components/common/UploadField.jsx'
import { resolveMediaUrl } from '../lib/media'

function MediaLibraryPage() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [message, setMessage] = useState('')

  async function loadAssets() {
    setLoading(true)
    setErrorMessage('')
    try {
      const data = await getUploadsRequest({ page: 0, size: 30 })
      setAssets(data?.assets ?? [])
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [])

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    setUploading(true)
    setMessage('')
    setErrorMessage('')
    try {
      await uploadMediaRequest({ file, purpose: 'GENERAL' })
      setMessage('Media uploaded successfully.')
      await loadAssets()
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  async function handleDelete(id) {
    setMessage('')
    setErrorMessage('')
    try {
      await deleteUploadRequest(id)
      setMessage('Media deleted successfully.')
      await loadAssets()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Media library"
        title="Upload and manage image assets"
        description="Store avatars, course thumbnails, and general media in one reusable library."
        aside={<div className="surface-panel"><p className="type-title-lg text-ink-950">{assets.length}</p><p className="type-caption text-ink-500">assets</p></div>}
      />

      <section className="section-shell space-y-6">
        <UploadField id="media-library-upload" label="Upload media" helper="PNG, JPG, WEBP, GIF" onChange={handleUpload} uploading={uploading} />
        <FeedbackMessage type="error">{errorMessage}</FeedbackMessage>
        <FeedbackMessage type="success">{message}</FeedbackMessage>
        {loading ? <div className="loading-panel">Loading media assets...</div> : null}
        {!loading ? (
          <div className="media-grid">
            {assets.map((asset) => (
              <article key={asset.id} className="media-card">
                <img alt={asset.originalName} className="media-thumb" src={resolveMediaUrl(asset.publicUrl)} />
                <div className="space-y-2">
                  <p className="type-title-sm text-ink-950">{asset.originalName}</p>
                  <p className="type-body-sm text-ink-700">{asset.purpose}</p>
                  <p className="type-caption text-ink-500">{asset.publicUrl}</p>
                </div>
                <button className="btn-ghost" type="button" onClick={() => handleDelete(asset.id)}>Delete</button>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </>
  )
}

export default MediaLibraryPage
