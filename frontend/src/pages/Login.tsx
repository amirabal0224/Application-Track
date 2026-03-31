import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiForm } from '../api'
import { setToken } from '../auth'
import type { TokenResponse } from '../types'

const ENABLE_REGISTER = ((import.meta as any).env?.VITE_ENABLE_REGISTER ?? 'false') === 'true'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const form = new URLSearchParams()
      form.set('username', email)
      form.set('password', password)

      const data = await apiForm<TokenResponse>('/auth/jwt/login', form, {
        skipAuth: true,
      })
      setToken(data.access_token)
      navigate('/applications')
    } catch (err: any) {
      setError(err?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={onSubmit} className="form">
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        {error ? <div className="error">{error}</div> : null}
        <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      {ENABLE_REGISTER ? (
        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      ) : null}
    </div>
  )
}
