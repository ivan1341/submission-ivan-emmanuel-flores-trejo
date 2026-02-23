import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-6xl font-bold text-gray-400">404</h1>
      <p className="mt-2 text-lg text-gray-600">Página no encontrada</p>
      <Link to="/" className="mt-6 rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
        Ir al inicio
      </Link>
    </div>
  )
}
