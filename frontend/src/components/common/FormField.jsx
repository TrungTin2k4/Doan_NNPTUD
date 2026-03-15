function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  registration,
  className = '',
}) {
  return (
    <label className={`field-stack ${className}`.trim()} htmlFor={id}>
      <span className="type-label text-ink-600">{label}</span>
      <input
        className={`field-input field-input-square ${error ? 'field-input-error' : ''}`.trim()}
        id={id}
        type={type}
        placeholder={placeholder}
        {...registration}
      />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  )
}

export default FormField
