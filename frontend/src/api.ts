import { getToken } from './auth'

const DEFAULT_BASE_URL = 'http://localhost:8000'

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL || DEFAULT_BASE_URL

export type ApiError = {
  status: number
  message: string
}

async function parseError(res: Response): Promise<ApiError> {
  const status = res.status
  try {
    const data = await res.json()
    const message = typeof data?.detail === 'string' ? data.detail : res.statusText
    return { status, message }
  } catch {
    return { status, message: res.statusText }
  }
}

export async function apiJson<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  const hasBody = options.body !== undefined && options.body !== null
  if (hasBody && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (!options.skipAuth && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  if (res.status === 204) {
    return undefined as unknown as T
  }

  return (await res.json()) as T
}

export async function apiForm<T>(
  path: string,
  form: URLSearchParams,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  headers.set('Content-Type', 'application/x-www-form-urlencoded')

  if (!options.skipAuth && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method: options.method ?? 'POST',
    headers,
    body: form.toString(),
  })

  if (!res.ok) {
    throw await parseError(res)
  }

  return (await res.json()) as T
}
