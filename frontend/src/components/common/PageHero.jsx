function PageHero({ eyebrow, title, description, aside }) {
  return (
    <section className="page-hero-shell">
      <div className="page-hero-grid">
        <div className="space-y-4">
          <p className="type-label text-brand-600">{eyebrow}</p>
          <h1 className="type-display-3xl text-ink-950">{title}</h1>
          <p className="type-body-lg text-ink-700">{description}</p>
        </div>
        {aside ? <div>{aside}</div> : null}
      </div>
    </section>
  )
}

export default PageHero
