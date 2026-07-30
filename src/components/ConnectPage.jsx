import React, { useRef, useEffect, useState } from 'react'
import rough from 'roughjs'
import { saveConn, DEFAULT_URL } from '../lib/supabase'

var FONT = "-apple-system, 'PingFang SC', sans-serif"
var INK = '#5A7A8C'
var TEXT = '#3A4A5A'
var MUTE = '#9AAABB'
var BG = '#FAF6F0'
var ICON = import.meta.env.BASE_URL + 'icon-180.png'

function RoughField({ label, value, onChange, placeholder, type, seed, width }) {
  var ref = useRef(null)
  var W = width || 300
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
      stroke: '#C8BFB2', fill: '#FFFFFF', fillStyle: 'solid',
      strokeWidth: 1.3, roughness: 0.9, bowing: 0.7,
      disableMultiStroke: true, seed: seed || 41
    })
  }, [W, seed])

  return <div style={{ width: W, marginBottom: 14 }}>
    <div style={{
      fontSize: 10, color: MUTE, letterSpacing: 1,
      fontFamily: FONT, marginBottom: 5, paddingLeft: 2
    }}>{label}</div>
    <div style={{ position: 'relative', width: W, height: H }}>
      <canvas ref={ref} style={{ position: 'absolute', left: 0, top: 0 }} />
      <input
        value={value}
        onChange={function (e) { onChange(e.target.value) }}
        placeholder={placeholder}
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

function RoughButton({ text, onClick, width, busy }) {
  var ref = useRef(null)
  var W = width || 300
  var H = 44
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
      stroke: INK, fill: busy ? '#EEF4F8' : '#DCEAF2', fillStyle: 'solid',
      strokeWidth: 1.6, roughness: 0.8, bowing: 0.8,
      disableMultiStroke: true, seed: 51
    })
  }, [W, busy])

  return <div onClick={busy ? undefined : onClick}
    style={{ position: 'relative', width: W, height: H, cursor: busy ? 'default' : 'pointer' }}>
    <canvas ref={ref} style={{ position: 'absolute', left: 0, top: 0 }} />
    <div style={{
      position: 'absolute', left: 0, top: 0, width: W, height: H,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14, color: INK, fontFamily: FONT, letterSpacing: 2
    }}>{text}</div>
  </div>
}

export default function ConnectPage() {
  var [url, setUrl] = useState(DEFAULT_URL)
  var [key, setKey] = useState('')
  var [msg, setMsg] = useState(null)
  var [busy, setBusy] = useState(false)
  var W = Math.min(300, (typeof window !== 'undefined' ? window.innerWidth : 360) - 48)

  function connect() {
    var u = url.trim().replace(/\/+$/, '')
    var k = key.trim()
    if (!/^https?:\/\/.+/.test(u)) { setMsg({ ok: false, text: 'URL \u9700\u8981\u4ee5 https:// \u5f00\u5934' }); return }
    if (k.length < 20) { setMsg({ ok: false, text: '\u8fd9\u770b\u8d77\u6765\u4e0d\u50cf\u4e00\u4e2a anon key' }); return }
    setBusy(true)
    setMsg({ ok: true, text: '\u6b63\u5728\u9a8c\u8bc1\u2026' })
    fetch(u + '/rest/v1/locations?select=id&limit=1', {
      headers: { apikey: k, Authorization: 'Bearer ' + k }
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status)
      saveConn(u, k)
      setMsg({ ok: true, text: '\u8fde\u4e0a\u4e86\uff0c\u6b63\u5728\u8fdb\u5165\u2026' })
      setTimeout(function () { window.location.reload() }, 500)
    }).catch(function (e) {
      setBusy(false)
      setMsg({ ok: false, text: '\u8fde\u63a5\u5931\u8d25\uff1a' + e.message })
    })
  }

  return <div style={{
    position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
    background: BG, zIndex: 500, overflowY: 'auto',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '32px 24px', fontFamily: FONT
  }}>
    <img src={ICON} alt="" width={112} height={112}
      style={{ display: 'block', borderRadius: 24 }} />

    <div style={{ fontSize: 15, color: TEXT, marginTop: 10, marginBottom: 4, letterSpacing: 1 }}>
      Hopscotch
    </div>
    <div style={{
      fontSize: 11, color: MUTE, marginBottom: 22,
      textAlign: 'center', lineHeight: 1.7, maxWidth: 280
    }}>
      {'\u586b\u5165\u8fde\u63a5\u4fe1\u606f\u5c31\u80fd\u8fdb\u5c4b\u3002\u53ea\u5b58\u5728\u8fd9\u53f0\u8bbe\u5907\u4e0a\uff0c\u4e0d\u4f1a\u4e0a\u4f20\u3002'}
    </div>

    <RoughField label="SUPABASE URL" value={url} onChange={setUrl}
      placeholder="https://xxx.supabase.co" seed={41} width={W} />
    <RoughField label="ANON KEY" value={key} onChange={setKey}
      placeholder="eyJ..." type="password" seed={42} width={W} />

    <RoughButton text={busy ? '\u2026' : '\u8fdb \u5c4b'} onClick={connect} width={W} busy={busy} />

    <div style={{
      marginTop: 12, fontSize: 11, minHeight: 16, textAlign: 'center',
      color: msg ? (msg.ok ? '#5C9E6E' : '#C48A7A') : 'transparent'
    }}>
      {msg ? msg.text : '.'}
    </div>

    <div style={{
      marginTop: 18, fontSize: 10, color: '#B8C2CC',
      textAlign: 'center', lineHeight: 1.7, maxWidth: 280
    }}>
      {'\u8d34\u7eb8\u548c\u7167\u7247\u5b58\u5728\u6d4f\u89c8\u5668\u672c\u5730\uff0c\u6362\u7f51\u5740\u4e0d\u4e92\u901a\u3002\u65e7\u7f51\u5740\u7684\u5185\u5bb9\u53ef\u5728\u8bbe\u7f6e\u91cc EXPORT \u540e\u5230\u8fd9\u8fb9 IMPORT\u3002'}
    </div>
  </div>
}
