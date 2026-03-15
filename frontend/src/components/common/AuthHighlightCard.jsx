import Icon from './Icon.jsx'

function AuthHighlightCard({ item }) {
  return (
    <article className="surface-panel space-y-4">
      <div className="feature-icon-wrap">
        <Icon name={item.icon} className="h-5 w-5" />
      </div>
      <div className="space-y-2">
        <h3 className="type-title-sm text-ink-950">{item.title}</h3>
        <p className="type-body-sm text-ink-700">{item.description}</p>
      </div>
    </article>
  )
}

export default AuthHighlightCard
