
import { useState, useRef, useCallback, useEffect } from 'react'
import rough from 'roughjs'
import HopscotchCanvas from './components/HopscotchCanvas'
import HandDrawnMap from './components/HandDrawnMap'
import StampsPanel from "./components/StampsPanel"
import { stickerRecipes } from './components/StickerRecipes'
import MapStampsPanel from "./components/MapStampsPanel"
import { recipes } from './components/IconGallery'
import ThreadView from './components/ThreadView'
import CompassView from './components/CompassView'
import LocationCard from './components/LocationCard'
import WeatherCell from './components/WeatherCell'
import CardsPanel from './components/CardsPanel'
import NotesCell from './components/NotesCell'
import MapCell from './components/MapCell'
import RoofCell from './components/RoofCell'
import NotesView from './components/NotesView'
import GardenCell from './components/GardenCell'
import GardenView from './components/GardenView'
import { grid } from './lib/tokens'
import { initSupabase } from './lib/supabase'
import { supaGet, supaPost, supaPatch, supaDelete, isConnected } from './lib/supabase'

const INITIAL = [
  { id: 'home', label: '\u5bb6', icon_type: 'house', color: '#E8A87C', lux_x: 50, lux_y: 50, scale: 1.2, errands: 9, lat: 30.33, lng: 120.06, weather: 'warm', ink_name: 'Home', inf_t: 0.127, inf_w: 0.94, story: 'The place where mornings start slow and the light is always golden.' },
  { id: 'office', label: '\u65b0\u516c\u53f8', icon_type: 'building', color: '#7BA7BC', lux_x: 75, lux_y: 35, scale: 0.9, errands: 5, lat: 30.30, lng: 120.04, weather: 'cloudy', ink_name: 'Office', inf_t: 0.456, inf_w: 0.52, story: 'Busy bees. Coffee machine hums at 2pm.' },
  { id: 'metro', label: '\u5730\u9435\u7ad9', icon_type: 'train', color: '#9BB89C', lux_x: 35, lux_y: 65, scale: 0.8, errands: 3, lat: 30.28, lng: 120.33, weather: 'drizzle', ink_name: 'Metro', inf_t: 0.831, inf_w: 0.33, story: 'Always raining here somehow.' },
]
const CONNS = [['home','office'],['home','metro']]
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
  ctx.font = "20px serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("✎", ICO / 2, ICO / 2 + 1)
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
  var [input, setInput] = useState('')
  var [results, setResults] = useState([])
  var [searching, setSearching] = useState(false)

  useEffect(function() {
    if (!open) { setInput(''); setResults([]); setSearching(false) }
  }, [open])

  useEffect(function() {
    if (!open || !borderRef.current) return
    var cvs = borderRef.current
    var W = 224, H = 300
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
    padding: '7px 14px', fontSize: 12,
    border: '1.5px solid rgba(46,148,185,0.25)',
    background: 'rgba(240,244,248,0.5)', color: '#5A6A7A',
    cursor: 'pointer', fontFamily: font,
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200 }} />
      <div style={{ position: 'fixed', top: 58, right: 12, zIndex: 201, width: 224, height: 300 }}>
        <canvas ref={borderRef} style={{ position: 'absolute', top: 0, left: 0 }} />
        <div style={{ position: 'relative', padding: '18px 20px', zIndex: 1 }}>

          <div style={{ fontSize: 14, color: '#6A7A8A', letterSpacing: 3, fontFamily: font, marginBottom: 20 }}>
            Settings
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={label}>{'City \u00b7 ' + cityName}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={input} onChange={function(e) { setInput(e.target.value) }}
                placeholder="city name" style={inputS} />
              <button onClick={doSearch} style={btnS}>{searching ? '...' : 'GO'}</button>
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

// Render a placed sticker — supports long-press drag
function PlacedSticker({ el, x, y, size, onDragStart }) {
  var ref = useRef(null)
  var longRef = useRef(null)
  useEffect(function() {
    if (!ref.current) return
    var recipe = stickerRecipes[el.sticker_type]
    if (!recipe) return
    var cvs = ref.current
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = size * dpr; cvs.height = size * dpr
    cvs.style.width = size + 'px'; cvs.style.height = size + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)
    var rc = rough.canvas(cvs)
    recipe(rc, ctx, size / 2, size / 2, size / 56, el.color || '#D0A0A0')
  }, [el, size])
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
    style={{ position: "absolute", left: x - 5, top: y - 5, width: size + 10, height: size + 10, pointerEvents: "auto", touchAction: "none", zIndex: 10 }} />
}

export default function App() {
  const [view, setView] = useState('home')
  const [expanding, setExpanding] = useState(false)
  const [collapsing, setCollapsing] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [placedStickers, setPlacedStickers] = useState(function() {
    try { return JSON.parse(localStorage.getItem('hopscotch_stickers') || '[]') } catch(e) { return [] }
  })

  // persist to localStorage whenever stickers change
  useEffect(function() {
    localStorage.setItem('hopscotch_stickers', JSON.stringify(placedStickers))
  }, [placedStickers])
  const [locations, setLocations] = useState(INITIAL)
  const [card, setCard] = useState(null)
  const [dimIndex, setDimIndex] = useState(0)
  const [flipping, setFlipping] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [cardsOpen, setCardsOpen] = useState(false)
  const [notesView, setNotesView] = useState(false)
  const [gardenView, setGardenView] = useState(false)
  const [garden, setGarden] = useState(null)
    const [cityName, setCityName] = useState('Hangzhou')
  const [cityCenter, setCityCenter] = useState([30.27, 120.15])
  const [weatherColor, setWeatherColor] = useState('#E8A87C')

  // fetch weather color
  useEffect(function () {
    if (!isConnected()) return
    supaGet('service_requests', 'service=eq.amap&action=eq.weather&status=eq.done&order=id.desc&limit=1')
      .then(function(rows) {
        if (!rows || !rows[0] || !rows[0].result) return
        try {
          var res = typeof rows[0].result === 'string' ? JSON.parse(rows[0].result) : rows[0].result
          var w = res.casts && res.casts[0] ? res.casts[0].day_weather : ''
          var wMap = {
            '晴': '#E8A87C', '多云': '#B8C4D0', '阴': '#9AA0A8',
            '小雨': '#7BA7BC', '中雨': '#6A8A9A', '大雨': '#5A7A8A',
            '雷阵雨': '#8A7ABC', '雪': '#C8D0D8', '雾': '#C0C0B8',
            '阵雨': '#7BA7BC',
          }
          setWeatherColor(wMap[w] || '#E8A87C')
        } catch(e) {}
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
  // --- init supabase ---
  useEffect(function () { initSupabase() }, [])
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

  const enterInk = useCallback(() => {
    setExpanding(true)
    setTimeout(() => { setView('ink'); setExpanding(false) }, 350)
  }, [])

  const exitInk = useCallback(() => {
    setCollapsing(true)
    setPanelOpen(false)
    setCard(null)
    setTimeout(() => { setView('home'); setCollapsing(false) }, 350)
  }, [])


  // place sticker on homepage zone
  // placed sticker drag state
  var [movingEl, setMovingEl] = useState(null)
  var [movePos, setMovePos] = useState(null)
  var moveGhostRef = useRef(null)

  function handleStickerPlace(type, label, color, cx, cy) {
    var W = window.innerWidth, H = window.innerHeight
    var el = { id: 's_' + Date.now(), sticker_type: type, color: color, offset_x: cx / W, offset_y: cy / H }
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
    setLocations(prev => [...prev, {
      id: 'loc_' + Date.now(), label: cLabel, ink_name: cLabel,
      icon_type: type,
      color: nodeColors[locations.length % nodeColors.length],
      lux_x, lux_y, scale: 0.85, errands: 0,
    }])
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
        <RoofCell tri={roofTri} />
        {placedStickers.map(function(el) {
          if (movingEl && movingEl.id === el.id) return null
          var W = window.innerWidth, H = window.innerHeight
          var sz = 54
          var px = el.offset_x * W - sz / 2
          var py = el.offset_y * H - sz / 2
          return <PlacedSticker key={el.id} el={el} x={px} y={py} size={sz} onDragStart={handlePlacedDragStart} />
        })}
        {movingEl && movePos && (
          <canvas style={{ position: 'fixed', left: movePos.x, top: movePos.y, pointerEvents: 'none', zIndex: 200, opacity: 0.8 }}
            ref={function(cvs) {
              if (!cvs || !stickerRecipes[movingEl.sticker_type]) return
              var sz = 60, dpr = Math.min(window.devicePixelRatio || 1, 3)
              cvs.width = sz * dpr; cvs.height = sz * dpr
              cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
              var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
              ctx.clearRect(0, 0, sz, sz)
              var rc = rough.canvas(cvs)
              stickerRecipes[movingEl.sticker_type](rc, ctx, sz/2, sz/2, sz/50, movingEl.color || '#D0A0A0')
            }} />
        )}
        <RoughTrash visible={!!movingEl} />
        {dragFrom && zoneNames.map(function (zn) {
          var r = zoneRects[zn]; if (!r) return null
          return <div key={zn} style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h,
            border: dragFrom === zn ? '2px solid #2E94B9' : dragOver === zn ? '2px dashed #2E94B9' : 'none',
            background: dragFrom === zn ? 'rgba(46,148,185,0.08)' : dragOver === zn ? 'rgba(46,148,185,0.12)' : 'transparent',
            borderRadius: 4, pointerEvents: 'none', boxSizing: 'border-box' }} />
        })}
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)}
          cityName={cityName}
          onCityChange={function(name, lat, lng) { setCityName(name); setCityCenter([lat, lng]) }} />
        <CardsPanel open={cardsOpen} onClose={() => setCardsOpen(false)} locations={locations} setLocations={setLocations} cityName={cityName}
          onFocus={function(loc) { setCardsOpen(false); setCityCenter([loc.lat, loc.lng]); setDimIndex(2); setView('ink'); setTimeout(function(){ setFlipping(false) }, 10) }} />
        {notesView && <NotesView onExit={() => setNotesView(false)} />}
        {gardenView && <GardenView onExit={() => setGardenView(false)} />}
        <StampsPanel open={panelOpen} onClose={() => setPanelOpen(false)} onStickerPlace={handleStickerPlace} onPatternPlace={(pid, cid) => console.log("pattern:", pid, cid)} supaGet={supaGet} supaPost={supaPost} supaPatch={supaPatch} />
        <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 10, display: 'flex', gap: 8 }}>
          <canvas ref={el => { if (el && !el._drawn) { drawGear(el); el._drawn = true } }}
            onClick={() => { setSettingsOpen(!settingsOpen); setCardsOpen(false) }} style={{ cursor: 'pointer' }} />
          <canvas ref={el => { if (el && !el._drawn) { drawBrush(el); el._drawn = true } }}
            onClick={() => { setPanelOpen(!panelOpen); setSettingsOpen(false); setCardsOpen(false) }} style={{ cursor: 'pointer' }} />
          <canvas ref={el => { if (el && !el._drawn) { drawCards(el); el._drawn = true } }}
            onClick={() => { setCardsOpen(!cardsOpen); setSettingsOpen(false) }} style={{ cursor: 'pointer' }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      overflow: 'hidden',
      opacity: collapsing ? 0 : 1,
      transition: 'opacity 0.35s ease',
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
          <HandDrawnMap ref={mapRef} locations={locations} connections={CONNS}
            fullscreen={true} onLocationTap={handleLocationTap} />
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
          {dimIndex === 2 && <CompassView locations={locations} center={cityCenter} />}
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
          />
        </>
      )}

      {!panelOpen && !card && dimIndex === 0 && (
        <canvas ref={el => { if (el && !el._drawn) { drawInkBrush(el); el._drawn = true } }}
          onClick={() => setPanelOpen(true)}
          style={{
            position:'fixed', bottom:16, right:16,
            zIndex:101, cursor:'pointer',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
          }} />
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
