import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Footer } from '@/components/Footer'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              to={isAdmin ? '/admin' : '/'}
              className="text-lg font-semibold text-gray-800"
              onClick={() => setMenuOpen(false)}
            >
              Client Portal
            </Link>
            {/* Desktop links */}
            <div className="hidden items-center gap-4 md:flex">
              {isAdmin ? (
                <>
                  <Link to="/admin" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                  <Link to="/admin/projects" className="text-gray-600 hover:text-gray-900">Proyectos</Link>
                  <Link to="/admin/projects/new" className="text-gray-600 hover:text-gray-900">Nuevo proyecto</Link>
                </>
              ) : (
                <Link to="/" className="text-gray-600 hover:text-gray-900">Mis proyectos</Link>
              )}
            </div>
          </div>
          {/* Desktop user section */}
          <div className="hidden items-center gap-4 md:flex">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Cerrar sesión
            </button>
          </div>
          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Abrir menú</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="border-t bg-white md:hidden">
            <div className="mx-auto max-w-6xl px-4 py-3 space-y-3">
              <div className="flex flex-col gap-2">
                {isAdmin ? (
                  <>
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-gray-900"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/projects"
                      className="text-gray-700 hover:text-gray-900"
                      onClick={() => setMenuOpen(false)}
                    >
                      Proyectos
                    </Link>
                    <Link
                      to="/admin/projects/new"
                      className="text-gray-700 hover:text-gray-900"
                      onClick={() => setMenuOpen(false)}
                    >
                      Nuevo proyecto
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-gray-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mis proyectos
                  </Link>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <span className="text-sm text-gray-600 truncate">{user?.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <main className="w-full mx-auto flex-1 max-w-6xl px-4 py-6"  style={{ }}>{children}</main>
      <Footer />
    </div>
  )
}
