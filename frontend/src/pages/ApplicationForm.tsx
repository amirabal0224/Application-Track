import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiJson } from '../api'
import type { Application, Status } from '../types'

type Mode = 'create' | 'edit'

export default function ApplicationFormPage(props: { mode: Mode }) {
  const navigate = useNavigate()
  const params = useParams()
  const applicationId = params.id as string | undefined

  const [statuses, setStatuses] = useState<Status[]>([])
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [appliedDate, setAppliedDate] = useState('')
  const [statusId, setStatusId] = useState('')
  const [notes, setNotes] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const st = await apiJson<Status[]>('/statuses')
      setStatuses(st)

      if (props.mode === 'create') {
        const defaultStatus = st.find((s) => s.name === 'Applied') ?? st[0]
        setStatusId(defaultStatus?.id ?? '')
      } else {
        if (!applicationId) throw new Error('Missing application id')
        const app = await apiJson<Application>(`/applications/${applicationId}`)
        setCompany(app.company)
        setRole(app.role)
        setLocation(app.location ?? '')
        setJobUrl(app.job_url ?? '')
        setAppliedDate(app.applied_date ? app.applied_date.slice(0, 10) : '')
        setStatusId(app.status_id)
        setNotes(app.notes ?? '')
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [props.mode, applicationId])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload: any = {
      company,
      role,
      location: location || null,
      job_url: jobUrl || null,
      applied_date: appliedDate ? new Date(appliedDate).toISOString() : null,
      status_id: statusId,
      notes: notes || null,
    }

    try {
      if (props.mode === 'create') {
        await apiJson('/applications', { method: 'POST', body: JSON.stringify(payload) })
      } else {
        await apiJson(`/applications/${applicationId}`, { method: 'PATCH', body: JSON.stringify(payload) })
      }
      navigate('/applications')
    } catch (err: any) {
      setError(err?.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container">
      <div className="row">
        <h1>{props.mode === 'create' ? 'New application' : 'Edit application'}</h1>
        <Link to="/applications">Back</Link>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <form onSubmit={onSubmit} className="form">
          <label>
            Company
            <input value={company} onChange={(e) => setCompany(e.target.value)} required />
          </label>
          <label>
            Role
            <input value={role} onChange={(e) => setRole(e.target.value)} required />
          </label>
          <label>
            Location
            <input value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>
          <label>
            Job URL
            <input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} type="url" />
          </label>
          <label>
            Applied date
            <input value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} type="date" />
          </label>
          <label>
            Status
            <select value={statusId} onChange={(e) => setStatusId(e.target.value)} required>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} />
          </label>

          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </form>
      )}
    </div>
  )
}
