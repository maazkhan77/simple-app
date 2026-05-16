import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Github } from 'lucide-react'
import { API } from '../context/AuthContext'

export default function Login() {
  const [params, setParams] = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const e = params.get('error')
    if (e) {
      setError('Login failed. Try again.')
      params.delete('error')
      setParams(params, { replace: true })
    }
  }, [])

  return (
    <div className="min-h-full flex items-center justify-center px-4 bg-zinc-50">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-center">Simple App</h1>
        <p className="text-center text-sm text-gray-500 mt-2">
          Sign in to see your repos and projects
        </p>

        {error && (
          <div className="mt-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <a
            href={`${API}/auth/github`}
            className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-2.5 rounded-md hover:bg-gray-800 transition"
          >
            <Github size={18} />
            <span>Continue with GitHub</span>
          </a>

          <a
            href={`${API}/auth/google`}
            className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-800 py-2.5 rounded-md hover:bg-gray-50 transition"
          >
            <span>Continue with Google</span>
          </a>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          We read your public and private GitHub repos.
        </p>
      </div>
    </div>
  )
}
