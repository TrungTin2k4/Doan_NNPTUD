import Icon from './Icon.jsx'

function TestCard({ item }) {
  return (
    <article className="surface-panel space-y-5">
      <div className="flex items-center gap-3">
        <div className="feature-icon-wrap feature-icon-soft">
          <Icon name={item.icon} className="h-5 w-5" />
        </div>
        <h3 className="type-title-sm text-ink-950">{item.title}</h3>
      </div>
      <ul className="stack-list">
        {item.bullets.map((bullet) => (
          <li key={bullet}>
            <span className="list-dot" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export default TestCard
