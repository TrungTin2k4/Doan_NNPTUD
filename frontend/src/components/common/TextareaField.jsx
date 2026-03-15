function TextareaField({ id, label, placeholder, error, registration, rows = 4, className = '' }) {
  return (
    <label className={`field-stack ${className}`.trim()} htmlFor={id}>
      <span className="type-label text-ink-600">{label}</span>
      <textarea
        className={`field-textarea ${error ? 'field-input-error' : ''}`.trim()}
        id={id}
        rows={rows}
        placeholder={placeholder}
        {...registration}
      />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  )
}

export default TextareaField
