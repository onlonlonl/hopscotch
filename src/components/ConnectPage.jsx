import React, { useRef, useEffect, useState } from 'react'
import rough from 'roughjs'
import { saveConn } from '../lib/supabase'

var FONT = "-apple-system, 'PingFang SC', sans-serif"
var INK = '#5A7A8C'
var TEXT = '#3A4A5A'
var MUTE = '#A8B4BE'
var ICON = import.meta.env.BASE_URL + 'icon-180.png'

function RoughField({ label, value, onChange, type, seed, width }) {
  var ref = useRef(null)
  var W = width
  var H = 42
  useEffect(function () {
    var cvs = ref.current
    if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = W * dpr
    cvs.height = H * dpr
    cvs.style.width = W + 'px'
    cvs.style.height = H + 'px'
    var ctx = cvs.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    var rc = rough.canvas(cvs)
    rc.rectangle(2, 2, W - 4, H - 4, {
      stroke: '#D5CEC5', fill: '#FFFFFF', fillStyle: 'solid',
      strokeWidth: 1.2, roughness: 0.9, bowing: 0.7,
      disableMultiStroke: true, seed: seed
    })
  }, [W, seed])

  return <div style={{ width: W, marginBottom: 16 }}>
    <div style={{
      fontSize: 9, color: MUTE, letterSpacing: 1.5,
      fontFamily: FONT, marginBottom: 6, paddingLeft: 2
    }}>{label}</div>
    <div style={{ position: 'relative', width: W, height: H }}>
      <canvas ref={ref} style={{ position: 'absolute', left: 0, top: 0 }} />
      <input
        value={value}
        onChange={function (e) { onChange(e.target.value) }}
        type={type || 'text'}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        style={{
          position: 'absolute', left: 0, top: 0, width: W, height: H,
          background: 'transparent', border: 'none', outline: 'none',
          padding: '0 12px', fontSize: 13, color: TEXT, fontFamily: FONT,
          boxSizing: 'border-box'
        }} />
    </div>
  </div>
}

function RoughButton({ text, onClick, busy }) {
  var ref = useRef(null)
  var W = 116
  var H = 40
  useEffect(function () {
    var cvs = ref.current
    if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = W * dpr
    cvs.height = H * dpr
    cvs.style.width = W + 'px'
    cvs.style.height = H + 'px'
    var ctx = cvs.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    var rc = rough.canvas(cvs)
    rc.rectangle(2, 2, W - 4, H - 4, {
      stroke: INK, fill: busy ? '#F4F8FA' : '#FFFFFF', fillStyle: 'solid',
      strokeWidth: 1.4, roughness: 0.85, bowing: 0.8,
      disableMultiStroke: true, seed: 51
    })
  }, [busy])

  return <div onClick={busy ? undefined : onClick}
    style={{ position: 'relative', width: W, height: H, cursor: busy ? 'default' : 'pointer' }}>
    <canvas ref={ref} style={{ position: 'absolute', left: 0, top: 0 }} />
    <div style={{
      position: 'absolute', left: 0, top: 0, width: W, height: H,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, color: INK, fontFamily: FONT, letterSpacing: 2
    }}>{text}</div>
  </div>
}

export default function ConnectPage() {
  var [url, setUrl] = useState('')
  var [key, setKey] = useState('')
  var [msg, setMsg] = useState(null)
  var [busy, setBusy] = useState(false)
  var W = Math.min(288, (typeof window !== 'undefined' ? window.innerWidth : 360) - 56)

  function connect() {
    var u = url.trim().replace(/\/+$/, '')
    var k = key.trim()
    if (!u || !k) { setMsg({ ok: false, text: 'Both fields are required' }); return }
    if (!/^https?:\/\/.+/.test(u)) { setMsg({ ok: false, text: 'That URL looks off' }); return }
    setBusy(true)
    setMsg({ ok: true, text: 'Checking' })
    fetch(u + '/rest/v1/locations?select=id&limit=1', {
      headers: { apikey: k, Authorization: 'Bearer ' + k }
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status)
      saveConn(u, k)
      setMsg({ ok: true, text: 'Connected' })
      setTimeout(function () { window.location.reload() }, 400)
    }).catch(function (e) {
      setBusy(false)
      setMsg({ ok: false, text: e.message })
    })
  }

  return <div style={{
    position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
    background: '#FFFFFF', zIndex: 500, overflowY: 'auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0 24px', fontFamily: FONT
  }}>
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      paddingTop: 56, paddingBottom: 24
    }}>
      <img src={ICON} alt="" width={104} height={104}
        style={{ display: 'block', borderRadius: 22, marginBottom: 26 }} />

      <RoughField label="SUPABASE URL" value={url} onChange={setUrl} seed={41} width={W} />
      <RoughField label="ANON KEY" value={key} onChange={setKey} type="password" seed={42} width={W} />

      <div style={{ marginTop: 6 }}>
        <RoughButton text={busy ? '\u00b7\u00b7\u00b7' : 'Enter'} onClick={connect} busy={busy} />
      </div>

      <div style={{
        marginTop: 14, fontSize: 11, minHeight: 15, textAlign: 'center',
        color: msg ? (msg.ok ? '#7FA98C' : '#C99A8A') : 'transparent'
      }}>
        {msg ? msg.text : '.'}
      </div>
    </div>

    <div style={{
      paddingBottom: 34, maxWidth: 300, textAlign: 'center',
      fontSize: 10, color: '#C2CBD3', lineHeight: 1.9
    }}>
      <div>Your connection details stay on this device and are never uploaded.</div>
      <div style={{ marginTop: 6 }}>
        Stickers and photos live in this browser, so they don't follow you across addresses.
        Export them from the old one in Settings, then import here.
      </div>
    </div>
  </div>
}
