import { useEffect, useState } from 'react'
import { API } from '../context/AuthContext'

export default function RepoList({ hasGithub, onConnectGithub, onProjectCreated }) {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [creatingId, setCreatingId] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/repos`, { credentials: 'include' })
      if (!res.ok) throw new Error()
      setRepos(await res.json())
    } catch {
      setError('Could not load your repos.')
    } finally {
      setLoading(false)
    }
  }

  async function refresh() {
    setRefreshing(true)
    setError('')
    try {
      const res = await fetch(`${API}/repos/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error()
      await load()
    } catch {
      setError('Could not refresh from GitHub.')
    } finally {
      setRefreshing(false)
    }
  }

  async function createProject(repo) {
    setCreatingId(repo.id)
    setError('')
    try {
      const res = await fetch(`${API}/projects`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_id: repo.id }),
      })
      if (!res.ok) throw new Error()
      onProjectCreated()
    } catch {
      setError('Could not create the project.')
    } finally {
      setCreatingId(null)
    }
  }

  useEffect(() => {
    if (hasGithub) load()
  }, [hasGithub])

  if (!hasGithub) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
        <h3 className="text-lg font-medium">Connect your GitHub</h3>
        <p className="text-sm text-zinc-500 mt-1">
          Link your GitHub account to load your repos.
        </p>
        <button
          onClick={onConnectGithub}
          className="mt-4 inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md hover:bg-zinc-800"
        >
          Connect GitHub
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Your repos</h2>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="text-sm px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {loading && repos.length === 0 ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : repos.length === 0 ? (
        <div className="text-sm text-gray-500">
          No repos found. Try clicking Refresh.
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 bg-white border border-zinc-200 rounded-xl">
          {repos.map((r) => (
            <li
              key={r.id}
              className="flex items-start justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <a
                  href={r.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-gray-900 hover:underline truncate block"
                >
                  {r.full_name}
                </a>
                {r.description && (
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                    {r.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  {r.language && <span>{r.language}</span>}
                  <span>★ {r.stars}</span>
                </div>
              </div>
              <button
                onClick={() => createProject(r)}
                disabled={creatingId === r.id}
                className="shrink-0 text-sm px-3 py-1.5 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {creatingId === r.id ? 'Adding...' : 'Add as project'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
