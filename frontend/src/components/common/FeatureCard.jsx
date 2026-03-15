import Icon from './Icon.jsx'

function FeatureCard({ feature }) {
  return (
    <article className="feature-card">
      <div className="feature-icon-wrap">
        <Icon name={feature.icon} className="h-6 w-6" />
      </div>
      <div className="space-y-3">
        <h3 className="type-title-lg text-ink-950">{feature.title}</h3>
        <p className="type-body-md text-ink-700">{feature.description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {feature.actions.map((action) => (
          <span key={action} className="pill-neutral">
            {action}
          </span>
        ))}
      </div>
    </article>
  )
}

export default FeatureCard
