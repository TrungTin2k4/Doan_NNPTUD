function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-4">
        <p className="type-label text-brand-600">{eyebrow}</p>
        <h2 className="type-display-2xl text-ink-950">{title}</h2>
        <p className="type-body-lg text-ink-700">{description}</p>
      </div>
      {action ? <button className="btn-ghost" type="button">{action}</button> : null}
    </div>
  )
}

export default SectionHeading
