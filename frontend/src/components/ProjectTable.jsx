import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { API } from '../context/AuthContext'

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    deployed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
  }
  const cls = styles[status] || 'bg-zinc-50 text-zinc-700 border-zinc-200'
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${cls}`}>
      {status}
    </span>
  )
}

const ProjectTable = forwardRef(function ProjectTable(_, ref) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deployingId, setDeployingId] = useState(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/projects`, { credentials: 'include' })
      if (!res.ok) throw new Error()
      setProjects(await res.json())
    } catch {
      setError('Could not load your projects.')
    } finally {
      setLoading(false)
    }
  }

  async function deploy(p) {
    setDeployingId(p.id)
    setError('')
    try {
      const res = await fetch(`${API}/projects/${p.id}/deploy`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error()
      await load()
    } catch {
      setError('Could not deploy.')
    } finally {
      setDeployingId(null)
    }
  }

  useImperativeHandle(ref, () => ({ reload: load }))

  useEffect(() => {
    load()
  }, [])

  return (
    <div>
      <h2 className="text-lg font-medium mb-3">Projects</h2>

      {error && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {loading && projects.length === 0 ? (
        <div className="text-sm text-zinc-500">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-sm text-zinc-500 bg-white border border-dashed border-zinc-300 rounded-xl p-6 text-center">
          No projects yet. Add one from the Repos tab.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-zinc-200 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="text-left font-medium px-4 py-2">Name</th>
                <th className="text-left font-medium px-4 py-2">Repo</th>
                <th className="text-left font-medium px-4 py-2">Branch</th>
                <th className="text-left font-medium px-4 py-2">Status</th>
                <th className="text-right font-medium px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-zinc-900">{p.name}</td>
                  <td className="px-4 py-3">
                    {p.repo_url ? (
                      <a
                        href={p.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-700 hover:underline"
                      >
                        {p.repo_full_name}
                      </a>
                    ) : (
                      <span className="text-zinc-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{p.branch}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deploy(p)}
                      disabled={deployingId === p.id}
                      className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
                    >
                      {deployingId === p.id ? 'Deploying...' : 'Deploy to K8S'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
})

export default ProjectTable
