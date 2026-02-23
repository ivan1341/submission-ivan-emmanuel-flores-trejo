import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProjects, type Project } from '@/lib/api'

export function ClientDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-600">Cargando mis proyectos...</div>
  if (error) return <div className="rounded bg-red-100 p-4 text-red-700">{error}</div>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Mis proyectos</h1>
      {projects.length === 0 ? (
        <p className="rounded-lg border bg-white p-6 text-gray-500">No tienes proyectos asignados.</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                to={`/projects/${p.id}`}
                className="block rounded-lg border bg-white p-4 shadow-sm transition hover:bg-gray-50"
              >
                <span className="font-medium text-gray-800">{p.name}</span>
                <span className={`ml-2 rounded px-2 py-0.5 text-xs font-medium ${
                  p.status === 'active' ? 'bg-green-100 text-green-800' :
                  p.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {p.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
