import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchProject, createProject, updateProject, type Project } from '@/lib/api'

export function ProjectForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'completed' | 'on-hold'>('active')
  const [clientId, setClientId] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadProject, setLoadProject] = useState(!!id)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetchProject(id)
      .then((p) => {
        setName(p.name)
        setDescription(p.description ?? '')
        setStatus(p.status)
        setClientId(p.clientId ?? '')
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoadProject(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setLoading(true)
    try {
      if (isEdit && id) {
        await updateProject(id, { name: name.trim(), description: description.trim() || undefined, status, clientId: clientId.trim() || undefined })
        navigate(`/admin/projects/${id}`)
      } else {
        const created = await createProject({ name: name.trim(), description: description.trim() || undefined, status, clientId: clientId.trim() || undefined })
        navigate(`/admin/projects/${created.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  if (loadProject) return <div className="text-gray-600">Cargando proyecto...</div>

  return (
    <div>
      <Link to={id ? `/admin/projects/${id}` : '/admin/projects'} className="text-sm text-blue-600 hover:underline">← Volver</Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-gray-800">{isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}</h1>
      {error && <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">Nombre *</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Project['status'])}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="active">active</option>
            <option value="completed">completed</option>
            <option value="on-hold">on-hold</option>
          </select>
        </div>
        <div>
          <label htmlFor="clientId" className="mb-1 block text-sm font-medium text-gray-700">ID del cliente (opcional)</label>
          <input
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="UUID del cliente asignado"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear proyecto'}
        </button>
      </form>
    </div>
  )
}
