function UploadField({ id, label, accept = 'image/*', helper, onChange, uploading, valueLabel }) {
  return (
    <label className="field-stack" htmlFor={id}>
      <span className="type-label text-ink-600">{label}</span>
      <div className="upload-field-shell">
        <span className="upload-field-copy">{uploading ? 'Uploading...' : valueLabel || 'Choose image'}</span>
        <span className="upload-field-helper">{helper}</span>
      </div>
      <input className="sr-only" id={id} type="file" accept={accept} onChange={onChange} />
    </label>
  )
}

export default UploadField
