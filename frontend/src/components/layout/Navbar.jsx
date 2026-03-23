import { Link, NavLink } from 'react-router-dom'
import Icon from '../common/Icon.jsx'
import { useAuthStore } from '../../store/authStore'

const publicNavItems = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Courses' },
]

function Navbar() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const isAdmin = user?.role === 'ADMIN'
  const initials = (user?.fullName || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
  const navItems = user
    ? [
        ...publicNavItems,
        ...(isAdmin
          ? [
              { to: '/admin/orders', label: 'Orders' },
              { to: '/admin', label: 'Admin' },
            ]
          : [
              { to: '/my-learning', label: 'My learning' },
              { to: '/orders', label: 'Orders' },
            ]),
      ]
    : publicNavItems

  return (
    <header className="topbar-shell">
      <div className="flex flex-wrap items-center gap-4 lg:flex-nowrap lg:gap-6">
        <Link className="brand-mark no-underline" to="/">
          <img alt="EduLearn logo" className="brand-mark-logo" src="/edulearn-logo.svg" />
          <span className="type-title-lg text-ink-950">EduLearn</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="search-shell lg:ml-auto">
          <Icon name="search" className="h-5 w-5 text-ink-500" />
          <input className="search-input" type="text" placeholder="Search for anything" />
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {!isAdmin ? (
              <Link aria-label="Checkout" className="icon-action no-underline" to="/checkout">
                  <Icon name="checkout" className="h-5 w-5" />
                </Link>
              ) : null}
              <details className="avatar-menu">
                <summary className="avatar-trigger">
                  <span className="avatar-trigger-name">{user.fullName}</span>
                  {user.avatarUrl ? (
                    <img alt={user.fullName} className="avatar-image" src={user.avatarUrl} />
                  ) : (
                    <span className="avatar-fallback">{initials}</span>
                  )}
                </summary>
                <div className="avatar-menu-panel">
                  <div className="avatar-menu-header">
                    <p className="type-title-sm text-ink-950">{user.fullName}</p>
                    <p className="type-body-sm text-ink-700">{user.email}</p>
                  </div>
                  <Link className="avatar-menu-link" to="/profile">
                    Profile settings
                  </Link>
                  <button className="avatar-menu-link avatar-menu-button" type="button" onClick={logout}>
                    Log out
                  </button>
                </div>
              </details>
            </>
          ) : (
            <>
              <Link aria-label="Checkout" className="icon-action no-underline" to="/checkout">
                <Icon name="checkout" className="h-5 w-5" />
              </Link>
              <Link className="btn-ghost no-underline" to="/login">
                Log in
              </Link>
              <Link className="btn-primary no-underline" to="/register">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
