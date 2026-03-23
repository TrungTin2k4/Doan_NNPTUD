function UploadField({ id, label, accept = 'image/*', helper, onChange, uploading }) {
  return (
    <label className="field-stack" htmlFor={id}>
      <span className="type-label text-ink-600">{label}</span>
      <label className="upload-field-shell" htmlFor={id}>
        <span className="upload-field-copy">{uploading ? 'Uploading...' : 'Choose image'}</span>
        <span className="upload-field-helper">{helper}</span>
      </label>
      <input className="sr-only" id={id} type="file" accept={accept} onChange={onChange} />
    </label>
  )
}

export default UploadField
