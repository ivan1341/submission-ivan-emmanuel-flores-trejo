import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { Role } from '@/contexts/AuthContext'
import { Layout } from '@/components/Layout'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { ClientDashboard } from '@/pages/ClientDashboard'
import { ProjectList } from '@/pages/ProjectList'
import { ProjectDetail } from '@/pages/ProjectDetail'
import { ProjectForm } from '@/pages/ProjectForm'
import { NotFound } from '@/pages/NotFound'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: Role[] }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  return <>{children}</>
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/" element={<ProtectedRoute><Layout><ClientDashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={['admin']}><Layout><ProjectList /></Layout></ProtectedRoute>} />
      <Route path="/admin/projects/new" element={<ProtectedRoute allowedRoles={['admin']}><Layout><ProjectForm /></Layout></ProtectedRoute>} />
      <Route path="/admin/projects/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><Layout><ProjectForm /></Layout></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><Layout><ProjectDetail /></Layout></ProtectedRoute>} />
      <Route path="/admin/projects/:id" element={<ProtectedRoute allowedRoles={['admin']}><Layout><ProjectDetail /></Layout></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
