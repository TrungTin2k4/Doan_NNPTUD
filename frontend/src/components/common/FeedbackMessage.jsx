function FeedbackMessage({ type = 'info', children }) {
  if (!children) {
    return null
  }

  const className = type === 'error' ? 'feedback-error' : 'feedback-success'
  return <div className={className}>{children}</div>
}

export default FeedbackMessage
