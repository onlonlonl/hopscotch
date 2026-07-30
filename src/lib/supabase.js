// Supabase connection — credentials read from URL hash at runtime
// URL format: ...#key=ANON_KEY

let SUPA_URL = null
let SUPA_KEY = null
let HEADERS = null

const KEY_STORE = 'hopscotch_supa_key'
const URL_STORE = 'hopscotch_supa_url'

export function saveConn(url, k) {
  try {
    localStorage.setItem(URL_STORE, url)
    localStorage.setItem(KEY_STORE, k)
  } catch (e) {}
}

export function saveKey(k) {
  try { localStorage.setItem(KEY_STORE, k) } catch (e) {}
}

export function clearConn() {
  try {
    localStorage.removeItem(KEY_STORE)
    localStorage.removeItem(URL_STORE)
  } catch (e) {}
}

export function initSupabase() {
  const hash = window.location.hash.slice(1)
  const params = new URLSearchParams(hash)
  let key = params.get('key')
  let url = params.get('url')
  // 带 hash 打开时记住，之后裸链接也能用
  if (key) {
    if (!url) return false
    saveConn(url, key)
  } else {
    try {
      key = localStorage.getItem(KEY_STORE)
      url = localStorage.getItem(URL_STORE)
    } catch (e) { key = null; url = null }
  }
  if (!key) return false

  if (!url) return false
  SUPA_URL = url.replace(/\/+$/, '')
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

export async function supaDelete(table, match) {
  if (!HEADERS) return null
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}?${match}`, {
    method: 'DELETE', headers: HEADERS,
  })
  return res.ok ? res.json() : null
}
