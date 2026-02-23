import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Footer } from '@/components/Footer'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to={isAdmin ? '/admin' : '/'} className="text-lg font-semibold text-gray-800">
              Client Portal
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link to="/admin/projects" className="text-gray-600 hover:text-gray-900">Proyectos</Link>
                <Link to="/admin/projects/new" className="text-gray-600 hover:text-gray-900">Nuevo proyecto</Link>
              </>
            )}
            {!isAdmin && (
              <Link to="/" className="text-gray-600 hover:text-gray-900">Mis proyectos</Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto flex-1 max-w-6xl px-4 py-6">{children}</main>
      <Footer />
    </div>
  )
}
