import { useRef, useState } from 'react'
import { useAuth, API } from '../context/AuthContext'
import RepoList from '../components/RepoList'
import ProjectTable from '../components/ProjectTable'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('repos')
  const projectsRef = useRef(null)

  function connectGithub() {
    window.location.href = `${API}/auth/github`
  }

  function onProjectCreated() {
    projectsRef.current?.reload()
    setTab('projects')
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-base font-semibold tracking-tight">Simple App</h1>
          <div className="flex items-center gap-3">
            {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt=""
                className="w-8 h-8 rounded-full border border-zinc-200"
              />
            )}
            <div className="text-right leading-tight">
              <div className="text-sm font-medium">{user.name || user.email}</div>
              <div className="text-xs text-zinc-500">{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center gap-1 border-b border-zinc-200 mb-6">
          {['repos', 'projects'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize transition-colors ${
                tab === t
                  ? 'border-emerald-500 text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={tab === 'repos' ? '' : 'hidden'}>
          <RepoList
            hasGithub={user.has_github}
            onConnectGithub={connectGithub}
            onProjectCreated={onProjectCreated}
          />
        </div>
        <div className={tab === 'projects' ? '' : 'hidden'}>
          <ProjectTable ref={projectsRef} />
        </div>
      </main>
    </div>
  )
}
