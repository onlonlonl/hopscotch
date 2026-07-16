// Supabase connection — credentials read from URL hash at runtime
// URL format: ...#key=ANON_KEY

let SUPA_URL = null
let SUPA_KEY = null
let HEADERS = null

export function initSupabase() {
  const hash = window.location.hash.slice(1)
  const params = new URLSearchParams(hash)
  const key = params.get('key')
  if (!key) return false

  SUPA_URL = 'https://bqzuoqeaqqhylukicvqa.supabase.co'
  SUPA_KEY = key
  HEADERS = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
  return true
}

export function isConnected() {
  return !!SUPA_KEY
}

export async function supaGet(table, params = '') {
  if (!HEADERS) return []
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}?${params}`, { headers: HEADERS })
  return res.ok ? res.json() : []
}

export async function supaPost(table, data) {
  if (!HEADERS) return null
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
    method: 'POST', headers: HEADERS, body: JSON.stringify(data),
  })
  return res.ok ? res.json() : null
}

export async function supaPatch(table, match, data) {
  if (!HEADERS) return null
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}?${match}`, {
    method: 'PATCH', headers: HEADERS, body: JSON.stringify(data),
  })
  return res.ok ? res.json() : null
}