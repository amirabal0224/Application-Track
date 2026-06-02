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

const STATUS_PRIORITY = new Map([
  ['Offer', 0],
  ['Interview', 1],
  ['Applied', 2],
  ['Rejected', 3],
  ['Withdrawn', 4],
])

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

  const sortedApps = useMemo(() => {
    const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true })

    const getStatusRank = (application: Application) => {
      const statusName = statusById.get(application.status_id)?.name
      if (!statusName) return STATUS_PRIORITY.size
      return STATUS_PRIORITY.get(statusName) ?? STATUS_PRIORITY.size
    }

    return [...apps].sort((left, right) => {
      switch (sortOption) {
        case 'name-asc':
          return collator.compare(left.company, right.company) || collator.compare(left.role, right.role)
        case 'name-desc':
          return collator.compare(right.company, left.company) || collator.compare(right.role, left.role)
        case 'applied-asc': {
          const leftApplied = left.applied_date ? new Date(left.applied_date).getTime() : Number.POSITIVE_INFINITY
          const rightApplied = right.applied_date ? new Date(right.applied_date).getTime() : Number.POSITIVE_INFINITY
          return leftApplied - rightApplied || collator.compare(left.company, right.company)
        }
        case 'applied-desc': {
          const leftApplied = left.applied_date ? new Date(left.applied_date).getTime() : Number.NEGATIVE_INFINITY
          const rightApplied = right.applied_date ? new Date(right.applied_date).getTime() : Number.NEGATIVE_INFINITY
          return rightApplied - leftApplied || collator.compare(left.company, right.company)
        }
        case 'status-priority':
          return getStatusRank(left) - getStatusRank(right) || collator.compare(left.company, right.company)
        case 'updated-desc':
        default:
          return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime() || collator.compare(left.company, right.company)
      }
    })
  }, [apps, sortOption, statusById])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [st, ap] = await Promise.all([
        apiJson<Status[]>('/statuses'),
        apiJson<Application[]>('/applications'),
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
    void load()
  }, [])

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
      <div className="row">
        <h1>Applications</h1>
        <div className="row">
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
          <Link to="/applications/new" className="linkBtn">New</Link>
          <button onClick={onLogout} type="button">Logout</button>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {loading ? (
        <p>Loading…</p>
      ) : apps.length === 0 ? (
        <p>No applications yet.</p>
      ) : (
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
            {sortedApps.map((a) => (
              <tr key={a.id}>
                <td>{a.company}</td>
                <td>{a.role}</td>
                <td>{statusById.get(a.status_id)?.name ?? '—'}</td>
                <td>{new Date(a.updated_at).toLocaleString()}</td>
                <td className="actions">
                  <Link to={`/applications/${a.id}/edit`}>Edit</Link>
                  <button type="button" onClick={() => onDelete(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
