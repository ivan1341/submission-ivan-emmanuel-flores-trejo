import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { fetchProject, addComment, deleteProject, type Project, type Comment } from '@/lib/api'

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState<(Project & { comments?: Comment[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!id) return
    fetchProject(id)
      .then(setProject)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !commentText.trim()) return
    setSubmittingComment(true)
    try {
      const newComment = await addComment(id, commentText.trim())
      setProject((prev) => prev ? { ...prev, comments: [...(prev.comments ?? []), newComment] } : null)
      setCommentText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar comentario')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !isAdmin || !confirm('¿Eliminar este proyecto?')) return
    try {
      await deleteProject(id)
      navigate(isAdmin ? '/admin/projects' : '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  if (loading) return <div className="text-gray-600">Cargando proyecto...</div>
  if (error && !project) return <div className="rounded bg-red-100 p-4 text-red-700">{error}</div>
  if (!project) return null

  const comments = project.comments ?? []

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          {isAdmin && (
            <Link to="/admin/projects" className="text-sm text-blue-600 hover:underline">← Proyectos</Link>
          )}
          {!isAdmin && (
            <Link to="/" className="text-sm text-blue-600 hover:underline">← Mis proyectos</Link>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link
              to={`/admin/projects/${id}/edit`}
              className="rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Editar
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
        <p className="mt-2 text-gray-600">{project.description ?? 'Sin descripción'}</p>
        <p className="mt-2">
          <span className={`rounded px-2 py-1 text-sm font-medium ${
            project.status === 'active' ? 'bg-green-100 text-green-800' :
            project.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {project.status}
          </span>
        </p>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Comentarios</h2>
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escribe un comentario..."
            rows={3}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={submittingComment || !commentText.trim()}
            className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submittingComment ? 'Enviando...' : 'Enviar comentario'}
          </button>
        </form>
        <ul className="space-y-3">
          {comments.length === 0 && <p className="text-gray-500">Sin comentarios aún.</p>}
          {[...comments].reverse().map((c) => (
            <li key={c.id} className="rounded border bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-700">{c.user?.email ?? c.userId}</p>
              <p className="text-gray-800">{c.content}</p>
              <p className="mt-1 text-xs text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
