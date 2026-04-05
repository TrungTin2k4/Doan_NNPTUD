function PageHero({ eyebrow, title, description, aside }) {
  return (
    <section className="section-shell courses-hero">
      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
        <div className="space-y-5">
          <p className="type-label text-brand-600">{eyebrow}</p>
          <h1 className="type-display-3xl text-ink-950">{title}</h1>
          <p className="type-body-lg text-ink-700">{description}</p>
        </div>
        <div>{aside}</div>
      </div>
    </section>
  )
}

export default PageHero
