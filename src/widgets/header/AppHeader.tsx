import { Menu } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { env } from '../../shared/config/env'
import { routes } from '../../shared/config/routes'
import { useAuthStore } from '../../shared/store/useAuthStore'
import { Button } from '../../shared/ui/Button'

export function AppHeader() {
  const appName = env.appName
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const userNavItems = isAuthenticated
    ? [
        { to: `${routes.home}?section=projects`, label: '프로젝트' },
        { to: `${routes.home}?section=voice-samples`, label: '보이스 샘플' },
        { to: `${routes.home}?section=guide`, label: '이용 가이드' },
        { to: `${routes.home}?section=support`, label: '문의' },
      ]
    : []

  return (
    <header className="border-surface-3 bg-surface-1/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link to={routes.home} className="flex items-center gap-3">
          <span className="bg-primary text-primary-foreground shadow-primary/40 inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg">
            <Menu className="h-6 w-6" />
          </span>
          <div className="flex flex-col">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Front Wireframe
            </span>
            <span className="text-foreground text-base font-medium">{appName}</span>
          </div>
        </Link>
        {userNavItems.length > 0 ? (
          <nav className="hidden items-center gap-4 md:flex">
            {userNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? 'text-primary' : 'text-muted hover:text-foreground'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : (
          <span className="hidden md:block" />
        )}
        {isAuthenticated ? (
          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="secondary" size="sm">
              <Link to={`${routes.home}?section=support`}>문의하기</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to={routes.login}>로그인</Link>
            </Button>
            <Button asChild size="sm">
              <Link to={routes.signup}>회원가입</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
