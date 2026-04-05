function SelectField({ id, label, error, registration, options, className = '' }) {
  return (
    <label className={`field-stack ${className}`.trim()} htmlFor={id}>
      <span className="type-label text-ink-600">{label}</span>
      <select className={`field-select ${error ? 'field-input-error' : ''}`.trim()} id={id} {...registration}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  )
}

export default SelectField
