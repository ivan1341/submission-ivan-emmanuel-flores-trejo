import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchStats } from '@/lib/api'

export function AdminDashboard() {
  const [stats, setStats] = useState({ active: 0, completed: 0, onHold: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-600">Cargando estadísticas...</div>
  if (error) return <div className="rounded bg-red-100 p-4 text-red-700">{error}</div>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Dashboard (Admin)</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Activos</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Completados</p>
          <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">En pausa</p>
          <p className="text-3xl font-bold text-amber-600">{stats.onHold}</p>
        </div>
      </div>
      <div className="mt-8">
        <Link
          to="/admin/projects"
          className="inline-block rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Ver todos los proyectos
        </Link>
      </div>
    </div>
  )
}
