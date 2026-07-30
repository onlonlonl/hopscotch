
import { useState, useRef, useCallback, useEffect, lazy } from 'react'
import rough from 'roughjs'
import HopscotchCanvas from './components/HopscotchCanvas'
import HandDrawnMap from './components/HandDrawnMap'
const StampsPanel = lazy(() => import('./components/StampsPanel'))
import { stickerRecipes } from './components/StickerRecipes'
import { renderPatternFill } from './components/PatternLib'
const MapStampsPanel = lazy(() => import('./components/MapStampsPanel'))
import { recipes } from './components/IconGallery'
const ThreadView = lazy(() => import('./components/ThreadView'))
const CompassView = lazy(() => import('./components/CompassView'))
import LocationCard from './components/LocationCard'
import WeatherCell from './components/WeatherCell'
const CardsPanel = lazy(() => import('./components/CardsPanel'))
import NotesCell from './components/NotesCell'
import MapCell from './components/MapCell'
import RoofCell from './components/RoofCell'
const NotesView = lazy(() => import('./components/NotesView'))
import GardenCell from './components/GardenCell'
const GardenView = lazy(() => import('./components/GardenView'))
import { grid } from './lib/tokens'
import { initSupabase } from './lib/supabase'
import ConnectPage from './components/ConnectPage'
import { supaGet, supaPost, supaPatch, supaDelete, isConnected } from './lib/supabase'

const nodeColors = ['#E8A87C','#7BA7BC','#9BB89C','#C4A6D0','#D4B896','#B8C4D0','#D0A0A0','#A8B89A']
const stampLabels = {
  house:'\u5bb6',building:'\u516c\u53f8',train:'\u5730\u9435',plane:'\u6a5f\u5834',
  shop:'\u5546\u5e97',school:'\u5b78\u6821',hospital:'\u91ab\u9662',
  cafe:'\u5496\u5561',restaurant:'\u9910\u5ef3',bar:'\u9152\u5427',
  park:'\u516c\u5712',mountain:'\u5c71',beach:'\u6d77\u7058',hotel:'\u9152\u5e97',
  cinema:'\u96fb\u5f71\u9662',torii:'\u9ce5\u5c45',temple:'\u5bfa\u5edf',
  church:'\u6559\u5802',flag:'\u65d7\u5b50',heart:'\u2764',
}

/* draw the 3 dimension tab icons on a canvas */
function drawTabs(cvs, active) {
  var IW = 32, IH = 32, GAP = 6, TH = IH * 3 + GAP * 2
  var dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = IW * dpr; cvs.height = TH * dpr
  cvs.style.width = IW + 'px'; cvs.style.height = TH + 'px'
  var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  var rc = rough.canvas(cvs)
  var ro = { roughness: 0.5, bowing: 0.8, disableMultiStroke: true }

  for (var i = 0; i < 3; i++) {
    var y = i * (IH + GAP), cx = IW / 2, cy = y + IH / 2
    var ac = i === active, sc = ac ? '#2E94B9' : '#B8B0A0', sw = ac ? 1.2 : 0.7

    /* background pill */
    if (ac) rc.rectangle(2, y + 2, IW - 4, IH - 4, { stroke: '#2E94B9', strokeWidth: 0.6, roughness: 0.4, fill: 'rgba(46,148,185,0.06)', fillStyle: 'solid', disableMultiStroke: true, seed: 50 + i })

    if (i === 0) {
      /* Ink: small rectangle frame with a dot */
      rc.rectangle(cx - 8, cy - 6, 16, 12, { stroke: sc, strokeWidth: sw, ...ro, seed: 10 })
      ctx.fillStyle = sc; ctx.globalAlpha = ac ? 1 : 0.5
      ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1
    } else if (i === 1) {
      /* Thread: infinity/lemniscate */
      ctx.strokeStyle = sc; ctx.lineWidth = sw; ctx.globalAlpha = ac ? 1 : 0.6
      ctx.beginPath()
      for (var t = 0; t <= 60; t++) { var a = t / 60 * Math.PI * 2, s = Math.sin(a), c2 = Math.cos(a), d = 1 + s * s; var px = cx + 10 * c2 / d, py = cy + 6 * s * c2 / d; t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py) }
      ctx.stroke(); ctx.globalAlpha = 1
    } else {
      /* Compass: circle + crosshairs */
      rc.circle(cx, cy, 18, { stroke: sc, strokeWidth: sw, ...ro, seed: 30 })
      rc.line(cx, cy - 5, cx, cy + 5, { stroke: sc, strokeWidth: sw * 0.7, ...ro, seed: 31 })
      rc.line(cx - 5, cy, cx + 5, cy, { stroke: sc, strokeWidth: sw * 0.7, ...ro, seed: 32 })
    }
  }
}

/* draw rough back arrow on canvas */
function drawBack(cvs) {
  var S = 36, dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = S * dpr; cvs.height = S * dpr
  cvs.style.width = S + 'px'; cvs.style.height = S + 'px'
  var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  var rc = rough.canvas(cvs)
  rc.rectangle(2, 2, S - 4, S - 4, { stroke: '#D0C8C0', strokeWidth: 1, roughness: 0.5, fill: 'rgba(255,255,255,0.85)', fillStyle: 'solid', disableMultiStroke: true, seed: 77 })
  rc.line(22, 12, 12, 18, { stroke: '#8A7A68', strokeWidth: 1.3, roughness: 0.4, disableMultiStroke: true, seed: 78 })
  rc.line(12, 18, 22, 24, { stroke: '#8A7A68', strokeWidth: 1.3, roughness: 0.4, disableMultiStroke: true, seed: 79 })
}


/* === Home toolbar icons (white, in rounded frames) === */
var ICO = 38, ICO_RO = { roughness: 0.5, bowing: 0.8, disableMultiStroke: true }

function _icoSetup(cvs) {
  var dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = ICO * dpr; cvs.height = ICO * dpr
  cvs.style.width = ICO + 'px'; cvs.style.height = ICO + 'px'
  var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { ctx: ctx, rc: rough.canvas(cvs) }
}

function _icoFrame(rc) {
  rc.rectangle(2, 2, ICO - 4, ICO - 4, {
    stroke: 'rgba(255,255,255,0.7)', strokeWidth: 1.2, roughness: 0.4,
    fill: 'rgba(255,255,255,0.08)', fillStyle: 'solid',
    disableMultiStroke: true, seed: 70
  })
}

function drawGear(cvs) {
  var { ctx, rc } = _icoSetup(cvs)
  _icoFrame(rc)
  var cx = ICO / 2, cy = ICO / 2, pts = []
  for (var i = 0; i < 6; i++) {
    var a = (i / 6) * Math.PI * 2 - Math.PI / 2, da = Math.PI * 2 / 6
    pts.push([cx + 12 * Math.cos(a), cy + 12 * Math.sin(a)])
    pts.push([cx + 12 * Math.cos(a + da * 0.3), cy + 12 * Math.sin(a + da * 0.3)])
    pts.push([cx + 8 * Math.cos(a + da * 0.4), cy + 8 * Math.sin(a + da * 0.4)])
    pts.push([cx + 8 * Math.cos(a + da * 0.9), cy + 8 * Math.sin(a + da * 0.9)])
  }
  var d = 'M ' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1)
  for (var j = 1; j < pts.length; j++) d += ' L ' + pts[j][0].toFixed(1) + ' ' + pts[j][1].toFixed(1)
  d += ' Z'
  rc.path(d, { stroke: 'rgba(255,255,255,0.9)', strokeWidth: 1.5, fill: 'rgba(255,255,255,0.9)', fillStyle: 'solid', ...ICO_RO, seed: 88 })
  /* center hole */
  rc.circle(cx, cy, 7, { stroke: '#E0E8F0', strokeWidth: 1.2, fill: '#E0E8F0', fillStyle: 'solid', roughness: 0.3, disableMultiStroke: true, seed: 89 })
}

function drawBrush(cvs) {
  var { ctx, rc } = _icoSetup(cvs)
  _icoFrame(rc)
  var c = 'rgba(255,255,255,0.9)'
  /* pencil glyph */
  ctx.fillStyle = "rgba(255,255,255,0.9)"
  ctx.font = "bold 22px serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("✎", ICO / 2, ICO / 2 + 1); ctx.strokeStyle = "rgba(255,255,255,1)"; ctx.lineWidth = 1.2; ctx.strokeText("✎", ICO / 2, ICO / 2 + 1)
}

function drawCards(cvs) {
  var { ctx, rc } = _icoSetup(cvs)
  _icoFrame(rc)
  var c = 'rgba(255,255,255,0.9)'
  /* back card (offset) */
  rc.rectangle(13, 10, 16, 18, { stroke: c, strokeWidth: 1.2, roughness: 0.4, disableMultiStroke: true, seed: 95 })
  /* front card (larger, overlapping) */
  rc.rectangle(9, 13, 16, 18, { stroke: c, strokeWidth: 1.4, fill: 'rgba(255,255,255,0.15)', fillStyle: 'solid', roughness: 0.4, disableMultiStroke: true, seed: 96 })
  /* lines on front card */
  rc.line(12, 19, 22, 19, { stroke: c, strokeWidth: 0.8, roughness: 0.3, disableMultiStroke: true, seed: 97 })
  rc.line(12, 23, 20, 23, { stroke: c, strokeWidth: 0.8, roughness: 0.3, disableMultiStroke: true, seed: 98 })
}

/* Ink view: blue filled brush button */
function drawInkBrush(cvs) {
  var S = 44, dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = S * dpr; cvs.height = S * dpr
  cvs.style.width = S + 'px'; cvs.style.height = S + 'px'
  var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  var rc = rough.canvas(cvs)
  /* blue filled rounded frame */
  rc.rectangle(2, 2, S - 4, S - 4, {
    stroke: '#2E94B9', strokeWidth: 1.5, fill: '#2E94B9', fillStyle: 'solid',
    roughness: 0.5, bowing: 0.8, disableMultiStroke: true, seed: 100
  })
  var c = 'rgba(255,255,255,0.95)'
  /* pencil glyph */
  ctx.fillStyle = c
  ctx.font = '24px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✎', S / 2, S / 2 + 1)
}

/* === Settings Panel === */
function SettingsPanel({ open, onClose, cityName, onCityChange }) {
  var borderRef = useRef(null)
  var [apiKey, setApiKey] = useState(function() { return localStorage.getItem('hopscotch_ai_key') || '' })
  var [keySaved, setKeySaved] = useState(false)
  var [keyMsg, setKeyMsg] = useState(null)
  var [input, setInput] = useState('')
  var [results, setResults] = useState([])
  var [searching, setSearching] = useState(false)
  var [bak, setBak] = useState('')
  var [bakMsg, setBakMsg] = useState(null)

  useEffect(function() {
    if (!open) { setInput(''); setResults([]); setSearching(false); setKeyMsg(null); setKeySaved(false) }
  }, [open])

  useEffect(function() {
    if (!open || !borderRef.current) return
    var cvs = borderRef.current
    var W = 224, H = 366
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = W * dpr; cvs.height = H * dpr
    cvs.style.width = W + 'px'; cvs.style.height = H + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.rectangle(3, 3, W - 6, H - 6, {
      stroke: 'rgba(46,148,185,0.3)', strokeWidth: 1.8,
      fill: '#FFFFFF', fillStyle: 'solid',
      roughness: 0.5, bowing: 0.6, disableMultiStroke: true, seed: 200
    })
  }, [open, results])

  async function doSearch() {
    if (!input.trim()) return
    if (!isConnected() || searching) return
    setSearching(true)
    setResults([])
    try {
      await supaPost('service_requests', { service: 'amap', action: 'geocode', params: { address: input.trim() } })
      await new Promise(function(r) { setTimeout(r, 1500) })
      var rows = await supaGet('service_requests', 'service=eq.amap&action=eq.geocode&order=id.desc&limit=1')
      if (rows && rows[0] && rows[0].result) {
        var raw = rows[0].result
        var res = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (res && res.results && res.results.length > 0) setResults(res.results)
      }
    } catch(e) { console.error('city search', e) }
    setSearching(false)
  }

  async function pickCity(r) {
    if (!r.location) return
    var loc = r.location.split(',')
    var lng = parseFloat(loc[0]), lat = parseFloat(loc[1])
    var name = r.city || r.formatted_address || input.trim()
    await supaPatch('settings', 'key=eq.hopscotch_city', { value: JSON.stringify({ name: name, lat: lat, lng: lng }) })
    onCityChange(name, lat, lng)
    onClose()
  }

  if (!open) return null

  var font = "-apple-system, 'PingFang SC', sans-serif"
  var label = { fontSize: 11, color: '#8A9AAA', letterSpacing: 1, fontFamily: font, marginBottom: 8 }
  var txt = { fontSize: 12, color: '#6A7A8A', fontFamily: font, lineHeight: 1.6 }
  var inputS = {
    flex: 1, minWidth: 0, boxSizing: 'border-box',
    padding: '7px 10px', fontSize: 13,
    border: '1.5px solid rgba(46,148,185,0.25)',
    background: 'rgba(240,244,248,0.6)', color: '#5A6A7A',
    outline: 'none', fontFamily: font,
  }
  var btnS = {
    padding: '7px 6px', fontSize: 12, textAlign: 'center', boxSizing: 'border-box',
    border: '1.5px solid rgba(46,148,185,0.25)',
    background: 'rgba(240,244,248,0.5)', color: '#5A6A7A',
    cursor: 'pointer', fontFamily: font,
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200 }} />
      <div style={{ position: 'fixed', top: 58, right: 12, zIndex: 201, width: 224, height: 366 }}>
        <canvas ref={borderRef} style={{ position: 'absolute', top: 0, left: 0 }} />
        <div style={{ position: 'relative', padding: '18px 20px', zIndex: 1,
          height: 366, boxSizing: 'border-box', overflowY: 'auto',
          overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>

          <div style={{ fontSize: 14, color: '#6A7A8A', letterSpacing: 3, fontFamily: font, marginBottom: 20 }}>
            Settings
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={label}>{'City \u00b7 ' + cityName}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={input} onChange={function(e) { setInput(e.target.value) }}
                placeholder="city name" style={inputS} />
              <button onClick={doSearch} style={{...btnS, width:56, flexShrink:0}}>{searching ? '...' : 'GO'}</button>
            </div>
            {results.length > 0 && <div style={{ marginTop: 6 }}>
              {results.map(function(r, i) {
                return <div key={i} onClick={function() { pickCity(r) }}
                  style={{ padding: '6px 4px', fontSize: 12, color: '#5A6A7A', fontFamily: font,
                    cursor: 'pointer', borderBottom: '1px solid rgba(200,210,220,0.3)' }}>
                  {r.formatted_address || r.city}
                </div>
              })}
            </div>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={label}>Sticker AI key</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={apiKey} onChange={function(e) { setApiKey(e.target.value); setKeySaved(false); setKeyMsg(null) }}
                placeholder="sk-..." type="password" style={inputS} />
              <button onClick={function() {
                var k = apiKey.trim()
                if (!k) { setKeyMsg({ ok: false, text: 'Enter a key first' }); return }
                localStorage.setItem('hopscotch_ai_key', k)
                setKeySaved(true)
                setKeyMsg({ ok: true, text: 'Saved \u2713' })
                setTimeout(function() { onClose() }, 800)
              }} style={{...btnS, width:56, flexShrink:0}}>{keySaved ? '\u2713' : 'SAVE'}</button>
            </div>
            <div style={{ ...txt, fontSize: 10, marginTop: 4,
              color: keyMsg ? (keyMsg.ok ? '#4AAF5C' : '#C48A7A') : '#9AAABB' }}>
              {keyMsg ? keyMsg.text : 'AI key, stored on this device'}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={label}>Backup</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={function() {
                var keys = ['hopscotch_stickers', 'hopscotch_patterns', 'hopscotch_photo_stickers',
                  'hopscotch_ai_stickers', 'hopscotch_roof_pattern', 'hopscotch_ai_key']
                var out = {}
                keys.forEach(function(kk) {
                  var v = localStorage.getItem(kk)
                  if (v !== null) out[kk] = v
                })
                var n = Object.keys(out).length
                setBak(JSON.stringify(out))
                setBakMsg(n ? { ok: true, text: '\u5df2\u5bfc\u51fa ' + n + ' \u9879\uff0c\u957f\u6309\u4e0b\u65b9\u6587\u672c\u6846\u5168\u9009\u590d\u5236' }
                             : { ok: false, text: '\u672c\u673a\u6ca1\u6709\u53ef\u5bfc\u51fa\u7684\u5185\u5bb9' })
              }} style={{ ...btnS, flex: 1 }}>EXPORT</button>
              <button onClick={function() {
                var raw = bak.trim()
                if (!raw) { setBakMsg({ ok: false, text: '\u5148\u7c98\u8d34\u8981\u5bfc\u5165\u7684\u5185\u5bb9' }); return }
                var obj = null
                try { obj = JSON.parse(raw) } catch (e) { obj = null }
                if (!obj || typeof obj !== 'object') {
                  setBakMsg({ ok: false, text: '\u89e3\u6790\u5931\u8d25\uff0c\u4e0d\u662f\u5408\u6cd5 JSON' }); return
                }
                var n = 0
                Object.keys(obj).forEach(function(kk) {
                  if (kk.indexOf('hopscotch_') === 0 && typeof obj[kk] === 'string') {
                    localStorage.setItem(kk, obj[kk]); n++
                  }
                })
                if (!n) { setBakMsg({ ok: false, text: '\u6ca1\u6709\u8bc6\u522b\u5230\u53ef\u5bfc\u5165\u7684\u9879' }); return }
                setBakMsg({ ok: true, text: '\u5df2\u5bfc\u5165 ' + n + ' \u9879\uff0c\u6b63\u5728\u91cd\u8f7d' })
                setTimeout(function() { window.location.reload() }, 700)
              }} style={{ ...btnS, flex: 1 }}>IMPORT</button>
            </div>
            <textarea value={bak} onChange={function(e) { setBak(e.target.value); setBakMsg(null) }}
              placeholder="EXPORT \u540e\u5185\u5bb9\u51fa\u73b0\u5728\u8fd9\u91cc\uff1b\u6216\u7c98\u8d34\u8fdb\u6765\u540e\u6309 IMPORT"
              style={{ width: '100%', height: 60, marginTop: 6, fontSize: 10, padding: 6,
                border: '1px solid #D8CFC4', borderRadius: 4, fontFamily: font,
                boxSizing: 'border-box', resize: 'none' }} />
            <div style={{ ...txt, fontSize: 10, marginTop: 2,
              color: bakMsg ? (bakMsg.ok ? '#4AAF5C' : '#C48A7A') : '#9AAABB' }}>
              {bakMsg ? bakMsg.text : '\u8d34\u7eb8/\u56fe\u6848/\u7167\u7247\u5b58\u5728\u672c\u673a\uff0c\u6362\u57df\u540d\u4e0d\u4e92\u901a'}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={label}>Cache</div>
            <button onClick={function() {
              if ('caches' in window) caches.keys().then(function(n) { n.forEach(function(k) { caches.delete(k) }) })
              if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(function(r) { r.forEach(function(s) { s.unregister() }) })
              setTimeout(function() { window.location.reload() }, 300)
            }} style={{ ...btnS, width: '100%', padding: '8px 0' }}>Clear & Reload</button>
          </div>

          <div>
            <div style={label}>About</div>
            <div style={txt}>Hopscotch v0.1</div>
            <div style={{ ...txt, fontSize: 11, color: '#9AAABB', marginTop: 2 }}>
              A living handbook.
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
/* Ink view: blue filled brush button */


// Roof pattern crop overlay
function RoofCropOverlay({ crop, tri, onConfirm, onCancel }) {
  var [off, setOff] = useState({ x: crop.offX || 0, y: crop.offY || 0 })
  var [tile, setTile] = useState(crop.tile || 18)
  var previewRef = useRef(null)
  var dragRef = useRef(null)

  useEffect(function() {
    if (!previewRef.current || !tri) return
    var p = tri
    var minX = Math.min(p[0].x, p[1].x, p[2].x), minY = Math.min(p[0].y, p[1].y, p[2].y)
    var maxX = Math.max(p[0].x, p[1].x, p[2].x), maxY = Math.max(p[0].y, p[1].y, p[2].y)
    var w = maxX - minX, h = maxY - minY
    var cvs = previewRef.current
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + "px"; cvs.style.height = h + "px"
    var ctx = cvs.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var lp = p.map(function(v) { return { x: v.x - minX, y: v.y - minY } })
    var cx2 = (lp[0].x + lp[1].x + lp[2].x) / 3, cy2 = (lp[0].y + lp[1].y + lp[2].y) / 3
    var ip = lp.map(function(v) { return { x: cx2 + (v.x - cx2) * 0.88, y: cy2 + (v.y - cy2) * 0.88 } })
    ctx.save()
    ctx.beginPath(); ctx.moveTo(ip[0].x, ip[0].y); ctx.lineTo(ip[1].x, ip[1].y); ctx.lineTo(ip[2].x, ip[2].y); ctx.closePath(); ctx.clip()
    var pCvs = document.createElement("canvas")
    renderPatternFill(pCvs, crop.patternId, crop.colorId, Math.round(w), Math.round(h), off.x, off.y, tile)
    ctx.drawImage(pCvs, 0, 0)
    ctx.restore()
    // border
    var rc = rough.canvas(cvs)
    var path = "M " + lp[0].x + " " + lp[0].y + " L " + lp[1].x + " " + lp[1].y + " L " + lp[2].x + " " + lp[2].y + " Z"
    rc.path(path, { stroke: "rgba(255,255,255,0.6)", strokeWidth: 2, roughness: 0.5, disableMultiStroke: true, seed: 42 })
  }, [tri, crop, off, tile])

  function handleTouch(e) {
    e.preventDefault()
    var t = e.touches[0], sx = t.clientX, sy = t.clientY, startOff = { x: off.x, y: off.y }
    function onMove(ev) {
      ev.preventDefault()
      var t2 = ev.touches[0]
      setOff({ x: startOff.x + (t2.clientX - sx), y: startOff.y + (t2.clientY - sy) })
    }
    function onEnd() { window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd) }
    window.addEventListener("touchmove", onMove, { passive: false }); window.addEventListener("touchend", onEnd)
  }

  if (!tri) return null
  var p = tri
  var minX = Math.min(p[0].x, p[1].x, p[2].x), minY = Math.min(p[0].y, p[1].y, p[2].y)

  return <>
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)", zIndex: 50 }} />
    <canvas ref={previewRef} onTouchStart={handleTouch}
      style={{ position: "absolute", left: minX, top: minY, zIndex: 51, touchAction: "none" }} />
    <canvas ref={function(cvs) {
        if (!cvs || cvs._d) return; cvs._d = true
        var w = 34, h = 170, dpr = Math.min(window.devicePixelRatio || 1, 3)
        cvs.width = w * dpr; cvs.height = h * dpr; cvs.style.width = w + "px"; cvs.style.height = h + "px"
        var ctx2 = cvs.getContext("2d"); ctx2.setTransform(dpr, 0, 0, dpr, 0, 0)
        var rc2 = rough.canvas(cvs)
        var o = { stroke: "#fff", strokeWidth: 2, roughness: 0.4, bowing: 0.5, disableMultiStroke: true }
        rc2.line(10, 13, 24, 13, { ...o, seed: 20 })
        rc2.line(17, 6, 17, 20, { ...o, seed: 21 })
        rc2.line(17, 28, 17, h - 28, { ...o, strokeWidth: 2.5, seed: 22 })
        rc2.line(10, h - 13, 24, h - 13, { ...o, seed: 23 })
      }} onTouchStart={function(e) {
        e.preventDefault()
        var t0 = e.touches[0], startY = t0.clientY, startTile = tile
        function onMove(ev) {
          ev.preventDefault(); var t2 = ev.touches[0]
          setTile(Math.max(10, Math.min(40, Math.round(startTile + (startY - t2.clientY) * 0.2))))
        }
        function onEnd() { window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd) }
        window.addEventListener("touchmove", onMove, { passive: false }); window.addEventListener("touchend", onEnd)
      }} style={{ position: "fixed", right: 12, top: "12%", zIndex: 52, touchAction: "none", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }} />
    <div style={{ position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 52, display: "flex", gap: 16 }}>
      <canvas ref={function(cvs) {
        if (!cvs || cvs._d) return; cvs._d = true
        var sz = 44, dpr = Math.min(window.devicePixelRatio || 1, 3)
        cvs.width = sz * dpr; cvs.height = sz * dpr; cvs.style.width = sz + "px"; cvs.style.height = sz + "px"
        var ctx2 = cvs.getContext("2d"); ctx2.setTransform(dpr, 0, 0, dpr, 0, 0)
        var rc2 = rough.canvas(cvs)
        rc2.circle(sz/2, sz/2, sz-8, { stroke: "#C48A7A", fill: "#FFF5F0", fillStyle: "solid", strokeWidth: 1.5, roughness: 0.5, disableMultiStroke: true, seed: 4 })
        rc2.line(15, 15, 29, 29, { stroke: "#C48A7A", strokeWidth: 2, roughness: 0.4, disableMultiStroke: true, seed: 5 })
        rc2.line(29, 15, 15, 29, { stroke: "#C48A7A", strokeWidth: 2, roughness: 0.4, disableMultiStroke: true, seed: 6 })
      }} onClick={onCancel} style={{ cursor: "pointer" }} />
      <canvas ref={function(cvs) {
        if (!cvs || cvs._d) return; cvs._d = true
        var sz = 44, dpr = Math.min(window.devicePixelRatio || 1, 3)
        cvs.width = sz * dpr; cvs.height = sz * dpr; cvs.style.width = sz + "px"; cvs.style.height = sz + "px"
        var ctx2 = cvs.getContext("2d"); ctx2.setTransform(dpr, 0, 0, dpr, 0, 0)
        var rc2 = rough.canvas(cvs)
        rc2.circle(sz/2, sz/2, sz-8, { stroke: "#9BB89C", fill: "#F0F5F0", fillStyle: "solid", strokeWidth: 1.5, roughness: 0.5, disableMultiStroke: true, seed: 1 })
        rc2.line(13, 22, 20, 30, { stroke: "#9BB89C", strokeWidth: 2.5, roughness: 0.4, disableMultiStroke: true, seed: 2 })
        rc2.line(20, 30, 31, 14, { stroke: "#9BB89C", strokeWidth: 2.5, roughness: 0.4, disableMultiStroke: true, seed: 3 })
      }} onClick={function() { onConfirm(off, tile) }} style={{ cursor: "pointer" }} />
    </div>
  </>
}

// Rough.js trash — appears at bottom during placed-sticker drag
function RoughTrash({ visible }) {
  var ref = useRef(null)
  useEffect(function() {
    if (!ref.current || !visible) return
    var w = 80, h = 60
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    ref.current.width = w * dpr; ref.current.height = h * dpr
    ref.current.style.width = w + 'px'; ref.current.style.height = h + 'px'
    var ctx = ref.current.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(ref.current)
    // bg circle
    rc.circle(w/2, 24, 40, { stroke: '#7BA7BC', fill: '#EEF4F8', fillStyle: 'solid', strokeWidth: 1.2, roughness: 0.5, disableMultiStroke: true, seed: 1 })
    var o = { stroke: '#7BA7BC', strokeWidth: 1.5, roughness: 0.5, disableMultiStroke: true }
    // lid
    rc.line(27, 14, 53, 14, { ...o, seed: 2 })
    rc.line(34, 14, 34, 11, { ...o, seed: 3 })
    rc.line(34, 11, 46, 11, { ...o, seed: 4 })
    rc.line(46, 11, 46, 14, { ...o, seed: 5 })
    // body
    rc.line(29, 14, 30, 36, { ...o, seed: 6 })
    rc.line(51, 14, 50, 36, { ...o, seed: 7 })
    rc.line(30, 36, 50, 36, { ...o, seed: 8 })
    // lines
    rc.line(36, 17, 36, 33, { ...o, strokeWidth: 0.8, seed: 9 })
    rc.line(44, 17, 44, 33, { ...o, strokeWidth: 0.8, seed: 10 })
    // label
    ctx.fillStyle = '#7BA7BC'
    ctx.font = "10px '-apple-system', sans-serif"
    ctx.textAlign = 'center'
    ctx.fillText('drop to delete', w/2, 54)
  }, [visible])
  if (!visible) return null
  return <canvas ref={ref} style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 150 }} />
}


// Placed pattern — supports long-press drag
function PlacedPattern({ pp, x, y, w, h, onDragStart }) {
  var ref = useRef(null)
  var longRef = useRef(null)
  useEffect(function() {
    if (!ref.current) return
    renderPatternFill(ref.current, pp.patternId, pp.colorId, w, h, pp.offX || 0, pp.offY || 0, pp.tile || 18)
  }, [pp, w, h])
  function handleTouchStart(e) {
    e.stopPropagation()
    var startEvt = e
    longRef.current = setTimeout(function() {
      try { startEvt.preventDefault() } catch(ex) {}
      if (onDragStart) onDragStart(pp)
    }, 400)
  }
  function clear() { clearTimeout(longRef.current) }
  return <canvas ref={ref}
    onTouchStart={handleTouchStart} onTouchEnd={clear} onTouchMove={clear}
    style={{ position: 'absolute', left: x, top: y, pointerEvents: 'auto', touchAction: 'none', borderRadius: 4, zIndex: 5 }} />
}

// Render a placed sticker — supports long-press drag
function PlacedSticker({ el, x, y, size, onDragStart }) {
  var ref = useRef(null)
  var longRef = useRef(null)
  var isPhoto = !!el.photoUrl
  var cw = isPhoto ? Math.round(size * 1.7) : size
  var ch = isPhoto ? Math.round(size * 1.13) : size
  useEffect(function() {
    if (!ref.current) return
    var cvs = ref.current
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = cw * dpr; cvs.height = ch * dpr
    cvs.style.width = cw + 'px'; cvs.style.height = ch + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cw, ch)
    var rc = rough.canvas(cvs)
    if (el.photoUrl) {
      var im = new Image()
      im.onload = function() {
        ctx.clearRect(0, 0, cw, ch)
        ctx.save()
        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(3, 3, cw-6, ch-6, 3); else ctx.rect(3, 3, cw-6, ch-6)
        ctx.clip()
        ctx.drawImage(im, 3, 3, cw-6, ch-6)
        ctx.restore()
        rc.rectangle(2, 2, cw-4, ch-4, { stroke: '#D0C8C0', strokeWidth: 1, roughness: 0.6, disableMultiStroke: true, seed: 42 })
      }
      im.src = el.photoUrl
      return
    }
    if (el.aiRecipe) {
      var BGC = '#FAF6F0', MC = el.color || '#D0A0A0', sc = size / 40
      for (var i = 0; i < el.aiRecipe.length; i++) {
        var sh = el.aiRecipe[i]
        var opts = { roughness: 0.5, disableMultiStroke: true, seed: 650 + i * 3 }
        if (sh.fill) { opts.fill = sh.fill === 'BG' ? BGC : MC; opts.fillStyle = 'solid' }
        if (sh.stroke) opts.stroke = sh.stroke === 'BG' ? BGC : MC
        opts.strokeWidth = (sh.sw || 1) * sc
        var ccx = size/2, ccy = size/2
        if (sh.t === 'circle') rc.circle(ccx + sh.x*sc, ccy + sh.y*sc, (sh.r||3)*2*sc, opts)
        else if (sh.t === 'ellipse') rc.ellipse(ccx + sh.x*sc, ccy + sh.y*sc, (sh.w||6)*sc, (sh.h||3)*sc, opts)
        else if (sh.t === 'line') rc.line(ccx + sh.x1*sc, ccy + sh.y1*sc, ccx + sh.x2*sc, ccy + sh.y2*sc, opts)
        else if (sh.t === 'rect') rc.rectangle(ccx + sh.x*sc, ccy + sh.y*sc, (sh.w||4)*sc, (sh.h||4)*sc, opts)
      }
      return
    }
    var recipe = stickerRecipes[el.sticker_type]
    if (!recipe) return
    recipe(rc, ctx, size / 2, size / 2, size / 56, el.color || '#D0A0A0')
  }, [el, size, cw, ch])
  function handleTouchStart(e) {
    e.stopPropagation()
    var startEvt = e
    longRef.current = setTimeout(function() {
      try { startEvt.preventDefault() } catch(ex) {}
      if (onDragStart) onDragStart(el)
    }, 400)
  }
  function handleTouchEnd() { clearTimeout(longRef.current) }
  function handleTouchMove() { clearTimeout(longRef.current) }
  return <canvas ref={ref}
    onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchMove={handleTouchMove}
    style={{ position: "absolute", left: x - 5, top: y - 5, pointerEvents: "auto", touchAction: "none", zIndex: 10 }} />
}

export default function App() {
  const [view, setView] = useState('home')
  const [expanding, setExpanding] = useState(false)
  const [collapsing, setCollapsing] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [roofCrop, setRoofCrop] = useState(null) // { patternId, colorId } while cropping

  const [roofPattern, setRoofPattern] = useState(function() {
    try { return JSON.parse(localStorage.getItem('hopscotch_roof_pattern') || 'null') } catch(e) { return null }
  })

  const [placedPatterns, setPlacedPatterns] = useState(function() {
    try { return JSON.parse(localStorage.getItem('hopscotch_patterns') || '[]') } catch(e) { return [] }
  })

  const [placedStickers, setPlacedStickers] = useState(function() {
    try { return JSON.parse(localStorage.getItem('hopscotch_stickers') || '[]') } catch(e) { return [] }
  })

  useEffect(function() {
    localStorage.setItem('hopscotch_patterns', JSON.stringify(placedPatterns))
  }, [placedPatterns])

  // persist to localStorage whenever stickers change
  useEffect(function() {
    localStorage.setItem('hopscotch_stickers', JSON.stringify(placedStickers))
  }, [placedStickers])
  const [locations, setLocations] = useState([])
  const [card, setCard] = useState(null)
  const [dimIndex, setDimIndex] = useState(0)
  const [flipping, setFlipping] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [cardsOpen, setCardsOpen] = useState(false)
  const [notesView, setNotesView] = useState(false)
  const [gardenView, setGardenView] = useState(false)
  const [garden, setGarden] = useState(null)
    const [cityName, setCityName] = useState('?')
  const [cityCenter, setCityCenter] = useState([30.27, 120.15])
  const [weatherColor, setWeatherColor] = useState(null)
  const [draggingStamp, setDraggingStamp] = useState(null)
  const [overTrash, setOverTrash] = useState(false)

  // --- init supabase (synchronous, before any effect) ---
  useState(function () { initSupabase(); return true })

  // fetch weather color from weather_cache
  useEffect(function () {
    if (!isConnected()) return
    supaGet('weather_cache', 'order=forecast_date.desc&limit=1')
      .then(function(rows) {
        if (!rows || !rows[0]) return
        var wMap = {
          'clear': '#E8A87C', 'cloudy': '#B8C4D0', 'rain': '#7BA7BC',
          'storm': '#8A7ABC', 'fog': '#C0C0B8', 'wind': '#5898A0',
          'snow': '#C8D0D8',
        }
        setWeatherColor(wMap[rows[0].weather_type] || '#E8A87C')
      })
  }, [])

  // load locations from Supabase
  const [connections, setConnections] = useState([])
  useEffect(function () {
    if (!isConnected()) return
    supaGet('locations', 'select=id,label,icon_type,lux_x,lux_y,scale,ink_name_iris,ink_name_lux,lat,lng,inf_t,inf_w,story,weather&order=created_at')
      .then(function(rows) {
        if (!rows || rows.length === 0) return
        var locs = rows.map(function(r) {
          return {
            id: r.id, label: r.label || r.id, icon_type: r.icon_type || 'heart',
            lux_x: r.lux_x || 50, lux_y: r.lux_y || 50,
            scale: r.scale || 1, ink_name_iris: r.ink_name_iris || null, ink_name_lux: r.ink_name_lux || null,
            lat: parseFloat(r.lat) || 0, lng: parseFloat(r.lng) || 0,
            inf_t: r.inf_t != null ? r.inf_t : null, inf_w: r.inf_w != null ? r.inf_w : null,
            story: r.story || '', weather: r.weather || '',
          }
        })
        setLocations(locs)
      })
    supaGet('settings', 'key=eq.hopscotch_connections')
      .then(function(rows) {
        if (rows && rows[0]) {
          try { setConnections(JSON.parse(rows[0].value)) } catch(e) {}
        }
      })
  }, [])

  useEffect(function() {
    if (!isConnected()) return
    supaGet('settings', 'key=eq.hopscotch_city').then(function(rows) {
      if (rows && rows[0]) {
        try {
          var c = JSON.parse(rows[0].value)
          if (c.name) setCityName(c.name)
          if (c.lat && c.lng) setCityCenter([c.lat, c.lng])
        } catch(e) {}
      }
    })
  }, [])
  // load garden + trip/place counts
  useEffect(function () {
    if (!isConnected()) return
    supaGet('hopscotch_garden', 'order=id.desc&limit=1').then(function(rows) {
      if (!rows || !rows[0]) return
      var g = rows[0]
      var planted = g.planted_at
      Promise.all([
        supaGet('service_requests', 'select=id&status=eq.done&created_at=gte.' + planted),
        supaGet('locations', 'select=id&created_at=gte.' + planted),
      ]).then(function(res) {
        g._trips_new = res[0] ? res[0].length : 0
        g._places_new = res[1] ? res[1].length : 0
        setGarden(g)
      })
    })
  }, [])

  // --- zone content: which cell holds what ---
  const [zoneMap, setZoneMap] = useState({ top: 'map', midLeft: 'weather', midRight: 'notes', center: 'garden' })
  const zoneNames = ['top', 'midLeft', 'midRight', 'center']

  const [zoneRects, setZoneRects] = useState({})
  const [roofTri, setRoofTri] = useState(null)
  useEffect(function () {
    function calc() {
      var W = window.innerWidth, H = window.innerHeight
      var fitW = W * 0.75 / grid.double_w, fitH = H * 0.70 / (grid.y4 - grid.y0)
      var S = Math.min(fitW, fitH), ox = W / 2 - grid.cx * S, oy = H / 2 - grid.cx * S
      setRoofTri([
          { x: ox + grid.cx * S, y: oy + grid.y0 * S },
          { x: ox + grid.d_left * S, y: oy + grid.y1 * S },
          { x: ox + grid.d_right * S, y: oy + grid.y1 * S },
        ])
        setZoneRects({
        top:      { x: ox + grid.s_left * S, y: oy + grid.y1 * S, w: (grid.s_right - grid.s_left) * S, h: (grid.y2 - grid.y1) * S },
        midLeft:  { x: ox + grid.d_left * S, y: oy + grid.y2 * S, w: (grid.cx - grid.d_left) * S, h: (grid.y3 - grid.y2) * S },
        midRight: { x: ox + grid.cx * S,     y: oy + grid.y2 * S, w: (grid.d_right - grid.cx) * S, h: (grid.y3 - grid.y2) * S },
        center:   { x: ox + grid.s_left * S, y: oy + grid.y3 * S, w: (grid.s_right - grid.s_left) * S, h: (grid.y4 - grid.y3) * S },
      })
    }
    calc(); window.addEventListener('resize', calc)
    return function () { window.removeEventListener('resize', calc) }
  }, [])

  // --- drag to swap zones ---
  const [dragFrom, setDragFrom] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const longPressRef = useRef(null)
  function findZone(cx, cy) {
    for (var i = 0; i < zoneNames.length; i++) { var r = zoneRects[zoneNames[i]]; if (r && cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) return zoneNames[i] }
    return null
  }
  function onZoneTouchStart(e) {
    var t = e.touches[0], z = findZone(t.clientX, t.clientY)
    if (!z) return
    var startEvt = e
    longPressRef.current = setTimeout(function () { setDragFrom(z); try { startEvt.preventDefault() } catch(ex){} }, 500)
  }
  function onZoneTouchMove(e) {
    if (!dragFrom) { clearTimeout(longPressRef.current); return }
    var t = e.touches[0], z = findZone(t.clientX, t.clientY)
    setDragOver(z && z !== dragFrom ? z : null)
  }
  function onZoneTouchEnd() {
    clearTimeout(longPressRef.current)
    if (dragFrom && dragOver) {
      setZoneMap(function (p) { var n = { ...p }, tmp = n[dragFrom]; n[dragFrom] = n[dragOver]; n[dragOver] = tmp; return n })
    }
    setDragFrom(null); setDragOver(null)
  }
  var wZone = null; for (var _k in zoneMap) { if (zoneMap[_k] === 'weather') { wZone = _k; break } }
  var weatherCellRect = wZone && zoneRects[wZone] ? zoneRects[wZone] : null

  var nZone = null; for (var _n in zoneMap) { if (zoneMap[_n] === 'notes') { nZone = _n; break } }
  var notesCellRect = nZone && zoneRects[nZone] ? zoneRects[nZone] : null

  var mZone = null; for (var _m in zoneMap) { if (zoneMap[_m] === 'map') { mZone = _m; break } }
  var mapCellRect = mZone && zoneRects[mZone] ? zoneRects[mZone] : null

  
  var gZone = null; for (var _g in zoneMap) { if (zoneMap[_g] === 'garden') { gZone = _g; break } }
  var gardenCellRect = gZone && zoneRects[gZone] ? zoneRects[gZone] : null

  const mapRef = useRef(null)
  const tabRef = useRef(null)
  const backRef = useRef(null)

  const TRASH_H = 96
  const inTrash = useCallback(function(cx, cy) {
    return cy > window.innerHeight - TRASH_H && Math.abs(cx - window.innerWidth / 2) < 90
  }, [])

  const handleStampDragStart = useCallback(function(id) {
    setDraggingStamp(id); setCard(null)
    if (navigator.vibrate) { try { navigator.vibrate(12) } catch(e) {} }
  }, [])

  const handleStampDrag = useCallback(function(id, lux_x, lux_y, cx, cy) {
    setLocations(function(prev) {
      return prev.map(function(l) { return l.id === id ? { ...l, lux_x: lux_x, lux_y: lux_y } : l })
    })
    setOverTrash(inTrash(cx, cy))
  }, [inTrash])

  const handleStampDragEnd = useCallback(function(id, cx, cy) {
    setDraggingStamp(null); setOverTrash(false)
    if (inTrash(cx, cy)) {
      if (isConnected()) supaDelete('locations', 'id=eq.' + id)
      setLocations(function(prev) { return prev.filter(function(l) { return l.id !== id }) })
      return
    }
    setLocations(function(prev) {
      var moved = prev.filter(function(l) { return l.id === id })[0]
      if (moved && isConnected()) {
        supaPatch('locations', 'id=eq.' + id, { lux_x: moved.lux_x, lux_y: moved.lux_y })
      }
      return prev
    })
  }, [inTrash])

  const handleLocationSave = useCallback(function(locId, patch) {
    if (isConnected()) supaPatch('locations', 'id=eq.' + locId, patch)
    setLocations(function(prev) {
      return prev.map(function(l) { return l.id === locId ? { ...l, ...patch } : l })
    })
    setCard(function(c) { return c && c.id === locId ? { ...c, ...patch } : c })
  }, [])

  const enterInk = useCallback(() => {
    if (locations.length === 0) { setCardsOpen(true); return }
    setExpanding(true)
    setTimeout(() => { setView('ink'); setExpanding(false) }, 350)
  }, [locations])

  const exitInk = useCallback(() => {
    setCollapsing(true)
    setPanelOpen(false)
    setCard(null)
    setTimeout(() => { setView('home'); setCollapsing(false) }, 350)
  }, [])


  // place sticker on homepage zone
  // placed sticker drag state
  var [movingPat, setMovingPat] = useState(null)
  var [movePatPos, setMovePatPos] = useState(null)

  function handlePatternDragStart(pp) {
    setMovingPat(pp)
    var W = window.innerWidth, H = window.innerHeight
    setMovePatPos({ x: pp.offset_x * W - 40, y: pp.offset_y * H - 27 })
    function onMove(ev) {
      ev.preventDefault()
      var t = ev.touches[0]
      setMovePatPos({ x: t.clientX - 40, y: t.clientY - 27 })
    }
    function onEnd(ev) {
      var t = ev.changedTouches[0]
      var W2 = window.innerWidth, H2 = window.innerHeight
      if (t.clientY > H2 - 100 && Math.abs(t.clientX - W2 / 2) < 60) {
        setPlacedPatterns(function(prev) { return prev.filter(function(s) { return s.id !== pp.id }) })
      } else {
        setPlacedPatterns(function(prev) { return prev.map(function(s) {
          return s.id === pp.id ? Object.assign({}, s, { offset_x: t.clientX / W2, offset_y: t.clientY / H2 }) : s
        }) })
      }
      setMovingPat(null); setMovePatPos(null)
      window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd)
    }
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
  }

  var [movingEl, setMovingEl] = useState(null)
  var [movePos, setMovePos] = useState(null)
  var moveGhostRef = useRef(null)

  function handleStickerPlace(type, label, color, cx, cy, photoUrl, aiRecipe) {
    var W = window.innerWidth, H = window.innerHeight
    var el = { id: 's_' + Date.now(), sticker_type: type, color: color, offset_x: cx / W, offset_y: cy / H }
    if (photoUrl) el.photoUrl = photoUrl
    if (aiRecipe) el.aiRecipe = aiRecipe
    setPlacedStickers(function(prev) { return prev.concat([el]) })
  }

  function handlePlacedDragStart(el) {
    setMovingEl(el)
    var W = window.innerWidth, H = window.innerHeight
    setMovePos({ x: el.offset_x * W - 30, y: el.offset_y * H - 30 })
    function onMove(ev) {
      ev.preventDefault()
      var t = ev.touches ? ev.touches[0] : ev
      setMovePos({ x: t.clientX - 30, y: t.clientY - 30 })
    }
    function onEnd(ev) {
      var t = ev.changedTouches ? ev.changedTouches[0] : ev
      var W2 = window.innerWidth, H2 = window.innerHeight
      // check if dropped on trash (bottom center)
      if (t.clientY > H2 - 100 && Math.abs(t.clientX - W2 / 2) < 60) {
        setPlacedStickers(function(prev) { return prev.filter(function(s) { return s.id !== el.id }) })
      } else {
        setPlacedStickers(function(prev) { return prev.map(function(s) {
          return s.id === el.id ? Object.assign({}, s, { offset_x: t.clientX / W2, offset_y: t.clientY / H2 }) : s
        }) })
      }
      setMovingEl(null); setMovePos(null)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
  }

  const handleZoneTap = useCallback((zone) => {
    if (dragFrom) return
    if (zoneMap[zone] === 'map') enterInk()
    if (zoneMap[zone] === 'notes') setNotesView(true)
    if (zoneMap[zone] === 'garden') setGardenView(true)
  }, [enterInk])

  const handleDragToMap = useCallback((type, sx, sy) => {
    if (!mapRef.current) return
    const { lux_x, lux_y } = mapRef.current.screenToLoc(sx, sy)
    const cLabel = stampLabels[type] || type
    const newLoc = {
      id: 'loc_' + Date.now(), label: cLabel, ink_name_iris: cLabel, ink_name_lux: null,
      icon_type: type,
      lux_x, lux_y, scale: 0.85,
    }
    setLocations(prev => [...prev, newLoc])
    if (isConnected()) {
      supaPost('locations', {
        id: newLoc.id, label: cLabel, name: cLabel, city: '', address: '',
        lng: '0', lat: '0', icon_type: type,
        lux_x: lux_x, lux_y: lux_y, scale: 0.85, ink_name_iris: cLabel,
      })
    }
  }, [locations])

  const handleLocationTap = useCallback((loc, x, y) => {
    if (!loc) { setCard(null); return }
    setCard({ ...loc, x, y })
  }, [])

  /* draw tabs + back button */
  useEffect(() => {
    if (view !== 'ink') return
    requestAnimationFrame(() => {
      if (tabRef.current) drawTabs(tabRef.current, dimIndex)
      if (backRef.current) drawBack(backRef.current)
    })
  }, [view, dimIndex, panelOpen, card])

  const handleTabClick = useCallback((e) => {
    var rect = tabRef.current.getBoundingClientRect()
    var y = e.clientY - rect.top
    var IH = 32, GAP = 6
    var idx = Math.floor(y / (IH + GAP))
    if (idx < 0) idx = 0; if (idx > 2) idx = 2
    if (idx !== dimIndex && !flipping) {
      setFlipping(true); setCard(null); setPanelOpen(false); setDimIndex(idx)
      setTimeout(() => setFlipping(false), 650)
    }
  }, [dimIndex, flipping])

  if (view === 'home') {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        opacity: expanding ? 0 : 1,
        transform: expanding ? 'scale(1.1)' : 'scale(1)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none',
      }}
      onTouchStart={onZoneTouchStart} onContextMenu={function(e){e.preventDefault()}} onTouchMove={onZoneTouchMove} onTouchEnd={onZoneTouchEnd}>
        <HopscotchCanvas onZoneTap={handleZoneTap} />
        {weatherCellRect && <WeatherCell cellRect={weatherCellRect} />}
        {notesCellRect && <NotesCell cellRect={notesCellRect} onTap={() => setNotesView(true)} />}
        {mapCellRect && <MapCell cellRect={mapCellRect} locations={locations} weatherColor={weatherColor} />}
        {gardenCellRect && <GardenCell cellRect={gardenCellRect} garden={garden} onTap={() => setGardenView(true)} />}
        <RoofCell tri={roofTri} pattern={roofPattern} />
        {roofCrop && <RoofCropOverlay crop={roofCrop} tri={roofTri}
          onConfirm={function(off, tileVal) {
            var rp = { patternId: roofCrop.patternId, colorId: roofCrop.colorId, offX: off.x, offY: off.y, tile: tileVal }
            setRoofPattern(rp); localStorage.setItem('hopscotch_roof_pattern', JSON.stringify(rp)); setRoofCrop(null)
          }}
          onCancel={function() { setRoofCrop(null) }} />}
        {placedPatterns.map(function(pp) {
          if (movingPat && movingPat.id === pp.id) return null
          var W = window.innerWidth, H = window.innerHeight
          var pw = 80, ph = 54
          return <PlacedPattern key={pp.id} pp={pp} x={pp.offset_x * W - pw/2} y={pp.offset_y * H - ph/2} w={pw} h={ph} onDragStart={handlePatternDragStart} />
        })}
        {placedStickers.map(function(el) {
          if (movingEl && movingEl.id === el.id) return null
          var W = window.innerWidth, H = window.innerHeight
          var sz = 54
          var isP = !!el.photoUrl
          var px = el.offset_x * W - (isP ? Math.round(sz * 1.7) : sz) / 2
          var py = el.offset_y * H - (isP ? Math.round(sz * 1.13) : sz) / 2
          return <PlacedSticker key={el.id} el={el} x={px} y={py} size={sz} onDragStart={handlePlacedDragStart} />
        })}
        {movingEl && movePos && (
          <canvas style={{ position: 'fixed', left: movePos.x, top: movePos.y, pointerEvents: 'none', zIndex: 200, opacity: 0.8 }}
            ref={function(cvs) {
              if (!cvs) return
              var sz = 60, dpr = Math.min(window.devicePixelRatio || 1, 3)
              cvs.width = sz * dpr; cvs.height = sz * dpr
              cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
              var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
              ctx.clearRect(0, 0, sz, sz)
              var rc = rough.canvas(cvs)
              if (movingEl.photoUrl) {
                var gw = 84, gh = 56
                cvs.width = gw * dpr; cvs.height = gh * dpr
                cvs.style.width = gw + 'px'; cvs.style.height = gh + 'px'
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
                var im = new Image()
                im.onload = function() { ctx.clearRect(0,0,gw,gh); ctx.drawImage(im, 2, 2, gw-4, gh-4) }
                im.src = movingEl.photoUrl
                return
              }
              if (!stickerRecipes[movingEl.sticker_type]) return
              stickerRecipes[movingEl.sticker_type](rc, ctx, sz/2, sz/2, sz/50, movingEl.color || '#D0A0A0')
            }} />
        )}
        {movingPat && movePatPos && (
          <canvas ref={function(cvs) {
            if (!cvs) return
            renderPatternFill(cvs, movingPat.patternId, movingPat.colorId, 80, 54, movingPat.offX || 0, movingPat.offY || 0, movingPat.tile || 18)
          }} style={{ position: 'fixed', left: movePatPos.x, top: movePatPos.y, pointerEvents: 'none', zIndex: 200, opacity: 0.8, borderRadius: 4 }} />
        )}
        <RoughTrash visible={!!movingEl || !!movingPat} />
        {dragFrom && zoneNames.map(function (zn) {
          var r = zoneRects[zn]; if (!r) return null
          return <div key={zn} style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h,
            border: dragFrom === zn ? '2px solid #2E94B9' : dragOver === zn ? '2px dashed #2E94B9' : 'none',
            background: dragFrom === zn ? 'rgba(46,148,185,0.08)' : dragOver === zn ? 'rgba(46,148,185,0.12)' : 'transparent',
            borderRadius: 4, pointerEvents: 'none', boxSizing: 'border-box' }} />
        })}
        {!isConnected() && <ConnectPage />}
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}
          cityName={cityName}
          onCityChange={function(name, lat, lng) { setCityName(name); setCityCenter([lat, lng]) }} />
        <CardsPanel open={cardsOpen} onClose={() => setCardsOpen(false)} locations={locations} setLocations={setLocations} cityName={cityName}
          onFocus={function(loc) { setCardsOpen(false); setCityCenter([loc.lat, loc.lng]); setDimIndex(2); setView('ink'); setTimeout(function(){ setFlipping(false) }, 10) }} />
        {notesView && <NotesView onExit={() => setNotesView(false)} />}
        {gardenView && <GardenView onExit={() => setGardenView(false)} />}
        <StampsPanel open={panelOpen} onClose={() => setPanelOpen(false)} onStickerPlace={handleStickerPlace} onPatternPlace={function(pid, cid, cx, cy) {
          if (roofTri && roofTri.length === 3) {
            var p = roofTri
            var minY = Math.min(p[0].y, p[1].y, p[2].y), maxY = Math.max(p[0].y, p[1].y, p[2].y)
            var minX = Math.min(p[0].x, p[1].x, p[2].x), maxX = Math.max(p[0].x, p[1].x, p[2].x)
            if (cx >= minX && cx <= maxX && cy >= minY && cy <= maxY) {
              setRoofCrop({ patternId: pid, colorId: cid, offX: 0, offY: 0 }); return
            }
          }
          var inCell = false
          for (var zi = 0; zi < zoneNames.length; zi++) {
            var zr = zoneRects[zoneNames[zi]]
            if (zr && cx >= zr.x && cx <= zr.x + zr.w && cy >= zr.y && cy <= zr.y + zr.h) { inCell = true; break }
          }
          if (inCell) return
          var W = window.innerWidth, H = window.innerHeight
          setPlacedPatterns(function(prev) { return prev.concat([{ id: 'p_' + Date.now(), patternId: pid, colorId: cid, offset_x: cx / W, offset_y: cy / H }]) })
        }} supaGet={supaGet} supaPost={supaPost} supaPatch={supaPatch} />
        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 10, display: 'flex', gap: 8 }}>
          <canvas ref={el => { if (el && !el._drawn) { drawGear(el); el._drawn = true } }}
            onClick={() => { setSettingsOpen(!settingsOpen); setCardsOpen(false) }} style={{ cursor: 'pointer' }} />
          <canvas ref={el => { if (el && !el._drawn) { drawCards(el); el._drawn = true } }}
            onClick={() => { setCardsOpen(!cardsOpen); setSettingsOpen(false) }} style={{ cursor: 'pointer' }} />
          <canvas ref={el => { if (el && !el._drawn) { drawBrush(el); el._drawn = true } }}
            onClick={() => { setPanelOpen(!panelOpen); setSettingsOpen(false); setCardsOpen(false) }} style={{ cursor: 'pointer' }} />
        </div>
      </div>
    )
  }

  return (
    <div onContextMenu={function(e){ e.preventDefault() }} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      overflow: 'hidden',
      opacity: collapsing ? 0 : 1,
      transition: 'opacity 0.35s ease',
      userSelect: 'none', WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none', WebkitTapHighlightColor: 'transparent',
    }}>
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, perspective: '1200px' }}>
      <div style={{
        width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transform: `rotateY(${dimIndex * -120}deg)`,
        transition: flipping ? 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
      }}>
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(0deg)',
          background: '#FAF6F0', overflow: 'hidden',
        }}>
          <HandDrawnMap ref={mapRef} locations={locations} connections={connections}
            fullscreen={true} onLocationTap={handleLocationTap}
            onStampDragStart={handleStampDragStart}
            onStampDrag={handleStampDrag}
            onStampDragEnd={handleStampDragEnd} />
        </div>

        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(120deg)',
        }}>
          {dimIndex === 1 && <ThreadView locations={locations} onNodeTap={handleLocationTap} />}
        </div>

        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(240deg)',
          overflow: 'hidden',
        }}>
          {dimIndex === 2 && <CompassView locations={locations} center={cityCenter} onSave={handleLocationSave} />}
        </div>
      </div>
      </div>

      {/* Left-side dimension tabs */}
      <canvas ref={tabRef} onClick={handleTabClick} style={{
        position: 'fixed', left: 10, top: '50%', transform: 'translateY(-50%)',
        zIndex: 115, cursor: 'pointer',
        display: panelOpen || card ? 'none' : 'block',
      }} />

      {/* Back button */}
      <canvas ref={backRef} onClick={exitInk} style={{
        position: 'fixed', top: 14, left: 12,
        zIndex: 110, cursor: 'pointer',
        display: panelOpen ? 'none' : 'block',
      }} />

      {card && (
        <>
          <div onClick={() => setCard(null)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 119,
          }} />
          <LocationCard
            location={card}
            position={dimIndex === 1
              ? [window.innerWidth / 2, (window.innerHeight - 100) / 2 + 20]
              : [Math.min(card.x, window.innerWidth - 120), Math.max(card.y, 130)]
            }
            onClose={() => setCard(null)}
            weatherColor={card.color}
            weatherType={card.weather || 'sun'} activeDim={dimIndex}
            onSave={handleLocationSave}
          />
        </>
      )}

      {!panelOpen && !card && dimIndex === 0 && (
        <canvas ref={el => { if (el && !el._drawn) { drawInkBrush(el); el._drawn = true } }}
          onClick={() => setPanelOpen(true)}
          style={{
            position:'fixed', top:14, right:14,
            zIndex:101, cursor:'pointer',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
          }} />
      )}

      {draggingStamp && dimIndex === 0 && (
        <div style={{
          position: 'fixed', left: '50%', bottom: 26, transform: 'translateX(-50%)',
          zIndex: 130, pointerEvents: 'none',
          transition: 'transform 0.15s ease',
        }}>
          <canvas key={overTrash ? 'on' : 'off'} ref={el => {
            if (!el) return
            var sz = overTrash ? 62 : 52
            var dpr = Math.min(window.devicePixelRatio || 1, 3)
            el.width = sz * dpr; el.height = sz * dpr
            el.style.width = sz + 'px'; el.style.height = sz + 'px'
            var ctx = el.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.clearRect(0, 0, sz, sz)
            var rc = rough.canvas(el)
            var col = overTrash ? '#C48A7A' : '#2E94B9'
            rc.circle(sz/2, sz/2, sz-3, {
              stroke: col, fill: overTrash ? '#FFF0EC' : 'rgba(240,248,252,0.94)',
              fillStyle: 'solid', strokeWidth: 1.2, roughness: 0.5,
              disableMultiStroke: true, seed: 30
            })
            var k = sz / 36, o = { stroke: col, strokeWidth: 1.4, roughness: 0.5, disableMultiStroke: true }
            function L(x1,y1,x2,y2,s){ rc.line(x1*k,y1*k,x2*k,y2*k,{ ...o, seed: s }) }
            L(10,12,26,12,31); L(15,12,15,9,32); L(15,9,21,9,33); L(21,9,21,12,34)
            L(12,12,13,27,35); L(24,12,23,27,36); L(13,27,23,27,37)
          }} style={{ display: 'block' }} />
        </div>
      )}

      <MapStampsPanel open={panelOpen} onClose={() => setPanelOpen(false)}
        onSelect={t => console.log(t)} onDragToMap={handleDragToMap} recipes={recipes} />

      <style>{`
        @keyframes cardIn {
          0% { transform: scale(0.8) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
