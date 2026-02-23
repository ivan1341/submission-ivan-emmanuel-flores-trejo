const API_URL = import.meta.env.VITE_API_URL ?? '/api'
const TOKEN_KEY = 'portal_token'

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message ?? data.error ?? `Request failed: ${res.status}`)
  return data as T
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'on-hold'
  clientId?: string
  createdAt?: string
  updatedAt?: string
}

export interface Comment {
  id: string
  projectId: string
  userId: string
  content: string
  createdAt?: string
  user?: { email: string; name?: string }
}

export interface ClientUser {
  id: string
  email: string
  name?: string
  role?: 'admin' | 'client'
}

export function fetchProjects(): Promise<Project[]> {
  return api<Project[]>('/projects')
}

export function fetchProject(id: string): Promise<Project & { comments?: Comment[] }> {
  return api<Project & { comments?: Comment[] }>(`/projects/${id}`)
}

export function createProject(body: { name: string; description?: string; status?: string; clientId?: string }): Promise<Project> {
  return api<Project>('/projects', { method: 'POST', body: JSON.stringify(body) })
}

export function updateProject(id: string, body: Partial<Project>): Promise<Project> {
  return api<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
}

export function deleteProject(id: string): Promise<void> {
  return api<void>(`/projects/${id}`, { method: 'DELETE' })
}

export function addComment(projectId: string, content: string): Promise<Comment> {
  return api<Comment>(`/projects/${projectId}/comments`, { method: 'POST', body: JSON.stringify({ content }) })
}

export function fetchStats(): Promise<{ active: number; completed: number; onHold: number }> {
  return api<{ active: number; completed: number; onHold: number }>('/projects/stats').catch(() => ({ active: 0, completed: 0, onHold: 0 }))
}

export function fetchClients(): Promise<ClientUser[]> {
  return api<ClientUser[]>('/users?role=client')
}
