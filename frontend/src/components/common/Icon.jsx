function Icon({ name, className = 'h-5 w-5' }) {
  const props = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  }

  switch (name) {
    case 'search':
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.2-4.2" />
        </svg>
      )
    case 'auth':
      return (
        <svg {...props}>
          <path d="M12 3 5 6v5c0 4.5 2.9 8.6 7 10 4.1-1.4 7-5.5 7-10V6l-7-3Z" />
          <path d="M9.5 12.5 11 14l3.5-3.5" />
        </svg>
      )
    case 'catalog':
      return (
        <svg {...props}>
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v14H6.5A2.5 2.5 0 0 0 4 20.5v-14Z" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      )
    case 'checkout':
      return (
        <svg {...props}>
          <path d="M3 5h2l2.2 9.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H7" />
          <circle cx="10" cy="19" r="1" />
          <circle cx="17" cy="19" r="1" />
        </svg>
      )
    case 'progress':
      return (
        <svg {...props}>
          <path d="M4 12a8 8 0 1 0 8-8" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    case 'admin':
      return (
        <svg {...props}>
          <path d="M12 3 4 7v5c0 5 3.4 7.9 8 9 4.6-1.1 8-4 8-9V7l-8-4Z" />
          <path d="M9 12h6" />
          <path d="M12 9v6" />
        </svg>
      )
    case 'ui':
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M3 9h18" />
          <path d="M8 14h3" />
          <path d="M14 14h2" />
        </svg>
      )
    case 'play':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="m10 9 5 3-5 3V9Z" />
        </svg>
      )
    case 'spark':
      return (
        <svg {...props}>
          <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...props}>
          <path d="M4 19h16" />
          <path d="M7 15v-4" />
          <path d="M12 15V8" />
          <path d="M17 15v-7" />
        </svg>
      )
    case 'star':
      return (
        <svg {...props}>
          <path d="m12 3 2.5 5.1 5.6.8-4 3.9 1 5.6L12 15.8 6.9 18.4l1-5.6-4-3.9 5.6-.8L12 3Z" />
        </svg>
      )
    case 'users':
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="3" />
          <path d="M20 8v6" />
          <path d="M23 11h-6" />
        </svg>
      )
    case 'facebook':
      return (
        <svg {...props}>
          <path d="M14 8h2V4h-2a4 4 0 0 0-4 4v3H7v4h3v5h4v-5h3l1-4h-4V8a1 1 0 0 1 1-1Z" />
        </svg>
      )
    case 'phone':
      return (
        <svg {...props}>
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5A2 2 0 0 1 22 16.9Z" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 10v7" />
          <path d="M8 7h.01" />
          <path d="M12 17v-4a2 2 0 0 1 4 0v4" />
          <path d="M12 10v7" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      )
  }
}

export default Icon
