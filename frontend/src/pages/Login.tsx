import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AuthHeader } from '@/components/AuthHeader'
import { Footer } from '@/components/Footer'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, error, setError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) return
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/')
    } catch {
      // error set in context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-red-50">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-md sm:p-8 md:max-w-xl border border-red-100">
        <AuthHeader title="Bienvenido al Client Portal" subtitle="Inicia sesión para ver tus proyectos y comentarios." />
        <h1 className="mb-6 text-2xl font-bold text-red-700">Iniciar sesión</h1>
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-red-800">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-red-200 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-400"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-red-800">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-red-200 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-400"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-red-600 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-red-700">
          ¿No tienes cuenta? <Link to="/register" className="font-medium text-red-600 hover:text-red-700 hover:underline">Regístrate</Link>
        </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
