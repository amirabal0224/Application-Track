import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiJson } from '../api'
import { clearToken } from '../auth'
import type { Application, Status } from '../types'

type SortOption =
  | 'updated-desc'
  | 'name-asc'
  | 'name-desc'
  | 'applied-asc'
  | 'applied-desc'
  | 'status-priority'

export default function ApplicationsListPage() {
  const navigate = useNavigate()
  const [apps, setApps] = useState<Application[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortOption, setSortOption] = useState<SortOption>('updated-desc')

  const statusById = useMemo(() => {
    const map = new Map<string, Status>()
    for (const s of statuses) map.set(s.id, s)
    return map
  }, [statuses])

  async function load(currentSort: SortOption) {
    setLoading(true)
    setError(null)
    try {
      const [st, ap] = await Promise.all([
        apiJson<Status[]>('/statuses'),
        apiJson<Application[]>(`/applications?sort=${currentSort}`),
      ])
      setStatuses(st)
      setApps(ap)
    } catch (err: any) {
      if (err?.status === 401) {
        clearToken()
        navigate('/login')
        return
      }
      setError(err?.message ?? 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(sortOption)
  }, [sortOption])

  async function onDelete(id: string) {
    if (!confirm('Delete this application?')) return
    setError(null)
    try {
      await apiJson<void>(`/applications/${id}`, { method: 'DELETE' })
      setApps((prev) => prev.filter((a) => a.id !== id))
    } catch (err: any) {
      setError(err?.message ?? 'Delete failed')
    }
  }

  function onLogout() {
    clearToken()
    navigate('/login')
  }

  return (
    <div className="container">
      <header className="pageHeader">
        <div>
          <h1>Applications</h1>
          <p className="muted">Track every role you&apos;ve applied to.</p>
        </div>
        <div className="pageHeaderActions">
          <label className="sortControl">
            <span className="sortControlLabel">Sort by</span>
            <select value={sortOption} onChange={(event) => setSortOption(event.target.value as SortOption)}>
              <option value="updated-desc">Updated newest</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="applied-asc">Date applied oldest</option>
              <option value="applied-desc">Date applied newest</option>
              <option value="status-priority">Status priority</option>
            </select>
          </label>
          <Link to="/applications/new" className="linkBtn">New application</Link>
          <button onClick={onLogout} type="button">Logout</button>
        </div>
      </header>

      {error ? <div className="error">{error}</div> : null}
      {loading ? (
        <p className="stateText">Loading…</p>
      ) : apps.length === 0 ? (
        <div className="emptyCard">
          <p>No applications yet.</p>
          <Link to="/applications/new" className="linkBtn">Add your first application</Link>
        </div>
      ) : (
        <>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id}>
                    <td className="cellCompany">{a.company}</td>
                    <td>{a.role}</td>
                    <td>
                      <span className="badge">{statusById.get(a.status_id)?.name ?? '—'}</span>
                    </td>
                    <td className="cellMuted">{new Date(a.updated_at).toLocaleDateString()}</td>
                    <td className="actions">
                      <Link to={`/applications/${a.id}/edit`} className="editLink">Edit</Link>
                      <button type="button" className="iconBtn danger" onClick={() => onDelete(a.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cardList">
            {apps.map((a) => (
              <article key={a.id} className="appCard">
                <div className="appCardTop">
                  <div>
                    <div className="appCardCompany">{a.company}</div>
                    <div className="appCardRole">{a.role}</div>
                  </div>
                  <span className="badge">{statusById.get(a.status_id)?.name ?? '—'}</span>
                </div>
                <div className="appCardMeta">Updated {new Date(a.updated_at).toLocaleDateString()}</div>
                <div className="appCardActions">
                  <Link to={`/applications/${a.id}/edit`} className="editLink">Edit</Link>
                  <button type="button" className="iconBtn danger" onClick={() => onDelete(a.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
