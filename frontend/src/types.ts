export type Status = {
  id: string
  name: string
  user_id: string | null
}

export type Application = {
  id: string
  company: string
  role: string
  location: string | null
  job_url: string | null
  applied_date: string | null
  status_id: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type TokenResponse = {
  access_token: string
  token_type: string
}
