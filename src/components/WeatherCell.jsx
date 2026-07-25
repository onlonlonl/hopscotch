import { useRef, useEffect, useState, useCallback } from 'react'
import rough from 'roughjs'
import { supaGet, isConnected } from '../lib/supabase'

var FRAMES = 4, FPS = 3
var RO = { roughness: 1, bowing: 0.5, disableMultiStroke: true }
var C = {
  sun: '#D4A030', sunB: '#ECC44E',
  cloud: '#B0B8C4', cloudD: '#8898A8', cloudL: '#CCD4DC',
  drop: '#4870A0', bolt: '#ECC44E',
  wind: '#5898A0',
  flake: '#7090B0', flakeL: '#A0B8D0',
  houseWall: '#E8A87C', houseRoof: '#C07850', houseDoor: '#7A5C3C',
}

function drawSun(rc, ctx, level, f, seed, w, h) {
  var s = Math.min(w, h) / 88, cx = w / 2, cy = h / 2 - 4 * s
  var cfg = level === 'light' ? { r: 10, rays: 5, len: 8 } : level === 'heavy' ? { r: 18, rays: 10, len: 16 } : { r: 14, rays: 7, len: 12 }
  var r = cfg.r * s
  rc.circle(cx, cy, r * 2, { ...RO, stroke: C.sun, fill: C.sunB, fillStyle: 'solid', seed: seed })
  var ao = f * (Math.PI / 6)
  for (var i = 0; i < cfg.rays; i++) {
    var a = ao + (Math.PI * 2 / cfg.rays) * i
    rc.line(cx + Math.cos(a) * (r + 3 * s), cy + Math.sin(a) * (r + 3 * s), cx + Math.cos(a) * (r + cfg.len * s), cy + Math.sin(a) * (r + cfg.len * s), { ...RO, stroke: C.sun, strokeWidth: 1.5, seed: seed + i + 1 })
  }
}

function drawOneCloud(rc, cx, cy, rw, rh, color, seed) {
  rc.ellipse(cx, cy, rw, rh, { ...RO, stroke: color, fill: color, fillStyle: 'solid', seed: seed })
  rc.ellipse(cx - rw * 0.3, cy + rh * 0.15, rw * 0.7, rh * 0.7, { ...RO, stroke: color, fill: color, fillStyle: 'solid', seed: seed + 1 })
  rc.ellipse(cx + rw * 0.3, cy + rh * 0.1, rw * 0.6, rh * 0.65, { ...RO, stroke: color, fill: color, fillStyle: 'solid', seed: seed + 2 })
}

function drawCloud(rc, ctx, level, f, seed, w, h) {
  var s = Math.min(w, h) / 88, d = f * 2 * s, cx = w / 2, cy = h / 2 - 2 * s
  if (level === 'light') { drawOneCloud(rc, cx + d, cy, 28 * s, 16 * s, C.cloudL, seed) }
  else if (level === 'medium') { drawOneCloud(rc, cx - 10 * s + d, cy - 4 * s, 26 * s, 14 * s, C.cloudL, seed); drawOneCloud(rc, cx + 12 * s + d, cy + 4 * s, 22 * s, 12 * s, C.cloud, seed + 10) }
  else { drawOneCloud(rc, cx - 12 * s + d, cy - 6 * s, 28 * s, 16 * s, C.cloudL, seed); drawOneCloud(rc, cx + 8 * s + d, cy, 24 * s, 14 * s, C.cloud, seed + 10); drawOneCloud(rc, cx - 2 * s + d, cy + 8 * s, 20 * s, 12 * s, C.cloudD, seed + 20) }
}

function drawDrop(rc, cx, cy, r, seed) {
  var pts = []
  for (var i = 0; i < 12; i++) { var a = (Math.PI * 2 / 12) * i - Math.PI / 2, rx = r * 0.6, ry = r; if (i < 3 || i > 9) ry *= 0.6; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]) }
  rc.polygon(pts, { ...RO, roughness: 0.6, stroke: C.drop, fill: C.drop, fillStyle: 'solid', seed: seed })
}

function drawRain(rc, ctx, level, f, seed, w, h) {
  var s = Math.min(w, h) / 88, count = level === 'light' ? 3 : level === 'medium' ? 7 : 15
  for (var i = 0; i < count; i++) { var bx = (w / (count + 1)) * (i + 1) + (i % 3 - 1) * 4 * s, by = ((i * 17 + 7) % (h * 0.7)) + 6 * s, y = by + f * 8 * s; if (y > h - 6 * s) y -= h * 0.7; drawDrop(rc, bx, y, 4 * s, seed + i * 3) }
}

function drawStorm(rc, ctx, level, f, seed, w, h) {
  var s = Math.min(w, h) / 88; drawRain(rc, ctx, level, f, seed, w, h)
  var ff = level === 'light' ? [0] : level === 'medium' ? [0, 2] : [0, 1, 2, 3]
  if (ff.indexOf(f) >= 0) {
    var bx = w * 0.3 + f * w * 0.12, by = h * 0.1 + (f % 2) * 4 * s
    rc.line(bx, by, bx + 4 * s, by + 8 * s, { ...RO, stroke: C.bolt, strokeWidth: 2.8, roughness: 0.8, seed: seed + 100 })
    rc.line(bx + 4 * s, by + 8 * s, bx + 1 * s, by + 10 * s, { ...RO, stroke: C.bolt, strokeWidth: 2.8, roughness: 0.8, seed: seed + 101 })
    rc.line(bx + 1 * s, by + 10 * s, bx + 5 * s, by + 18 * s, { ...RO, stroke: C.bolt, strokeWidth: 2.8, roughness: 0.8, seed: seed + 102 })
    ctx.fillStyle = 'rgba(255,250,220,0.18)'; ctx.fillRect(0, 0, w, h)
  }
}

function drawFogHouse(rc, ctx, level, f, seed, w, h) {
  var s = Math.min(w, h) / 88, cx = w / 2, by = h * 0.55, hw = 14 * s, hh = 12 * s
  rc.line(cx - 24 * s, by + hh, cx + 24 * s, by + hh, { ...RO, stroke: '#C0B8A8', strokeWidth: 1, seed: seed })
  rc.rectangle(cx - hw / 2, by, hw, hh, { ...RO, stroke: C.houseWall, fill: C.houseWall, fillStyle: 'solid', seed: seed + 1 })
  rc.line(cx - hw / 2 - 3 * s, by, cx, by - 8 * s, { ...RO, stroke: C.houseRoof, strokeWidth: 2, seed: seed + 2 })
  rc.line(cx, by - 8 * s, cx + hw / 2 + 3 * s, by, { ...RO, stroke: C.houseRoof, strokeWidth: 2, seed: seed + 3 })
  rc.rectangle(cx - 2.5 * s, by + hh - 6 * s, 5 * s, 6 * s, { ...RO, stroke: C.houseDoor, fill: C.houseDoor, fillStyle: 'solid', seed: seed + 4 })
  rc.rectangle(cx + 3 * s, by + 3 * s, 4 * s, 3 * s, { ...RO, stroke: '#7A5C3C', strokeWidth: 1, seed: seed + 5 })
}

function drawWind(rc, ctx, level, f, seed, w, h) {
  var s = Math.min(w, h) / 88, cx = w / 2, cy = h / 2
  var cfgs = level === 'light' ? [{ x: cx, y: cy, r: 16 }] : level === 'medium' ? [{ x: cx - 10 * s, y: cy - 6 * s, r: 14 }, { x: cx + 12 * s, y: cy + 6 * s, r: 12 }] : [{ x: cx - 12 * s, y: cy - 8 * s, r: 16 }, { x: cx + 10 * s, y: cy, r: 13 }, { x: cx - 4 * s, y: cy + 10 * s, r: 11 }]
  var ao = f * (Math.PI / 3)
  for (var si = 0; si < cfgs.length; si++) { var c = cfgs[si]; for (var i = 1; i <= 40; i++) { var t = i / 40, tp = (i - 1) / 40, a1 = ao + tp * Math.PI * 2.5, a2 = ao + t * Math.PI * 2.5; ctx.globalAlpha = 0.4 + 0.5 * t; ctx.strokeStyle = C.wind; ctx.lineWidth = 1.5 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(c.x + Math.cos(a1) * c.r * s * tp, c.y + Math.sin(a1) * c.r * s * tp); ctx.lineTo(c.x + Math.cos(a2) * c.r * s * t, c.y + Math.sin(a2) * c.r * s * t); ctx.stroke() } ctx.globalAlpha = 1 }
}

function drawSnow(rc, ctx, level, f, seed, w, h) {
  var s = Math.min(w, h) / 88, count = level === 'light' ? 4 : level === 'medium' ? 7 : 12, fr = (level === 'heavy' ? 5 : 4.5) * s
  for (var i = 0; i < count; i++) { var bx = (w / (count + 1)) * (i + 1), by = ((i * 19 + 5) % (h * 0.75)) + 4 * s, y = by + f * 5 * s; if (y > h - 6 * s) y -= h * 0.75; var sw = Math.sin(f * 0.8 + i * 1.2) * 4 * s, cl = i % 2 === 0 ? C.flake : C.flakeL
    for (var j = 0; j < 3; j++) { var a = (Math.PI / 3) * j; rc.line(bx + sw + Math.cos(a) * fr, y + Math.sin(a) * fr, bx + sw - Math.cos(a) * fr, y - Math.sin(a) * fr, { ...RO, stroke: cl, strokeWidth: 1.5, seed: seed + i * 20 + j }) }
  }
}

var DRAW = { clear: drawSun, cloudy: drawCloud, rain: drawRain, storm: drawStorm, fog: drawFogHouse, wind: drawWind, snow: drawSnow }

export default function WeatherCell({ cellRect }) {
  var canvasRef = useRef(null), framesRef = useRef([]), idxRef = useRef(0), timerRef = useRef(null)
  var [weather, setWeather] = useState(null)
  var [fogBlur, setFogBlur] = useState(null)

  useEffect(function () {
    if (!isConnected()) return
    supaGet('weather_cache', 'order=forecast_date.desc&limit=1')
      .then(function (r) { if (r && r.length > 0) setWeather(r[0]) })
  }, [])

  var render = useCallback(function () {
    if (!weather || !cellRect) return
    var w = cellRect.w, h = cellRect.h; if (w < 2 || h < 2) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    var type = weather.weather_type || 'clear', level = weather.weather_level || 'medium'
    var fn = DRAW[type] || DRAW.clear
    setFogBlur(type === 'fog' ? (level === 'light' ? 1 : level === 'heavy' ? 6 : 3) : null)
    var bufs = []
    for (var f = 0; f < FRAMES; f++) {
      var off = document.createElement('canvas'); off.width = w * dpr; off.height = h * dpr
      var ctx = off.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, w, h)
      try { fn(rough.canvas(off), ctx, level, f, 42 + f * 100, w, h) } catch (e) {}
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
      ctx.font = Math.max(9, Math.round(10 * Math.min(w, h) / 88)) + "px -apple-system, 'PingFang SC', sans-serif"
      var tc = {clear:'#B8942C',cloudy:'#7888A0',rain:'#4870A0',storm:'#3A4860',fog:'#9A907A',wind:'#4A8890',snow:'#6080A8'}
      ctx.fillStyle = tc[type] || 'rgba(120,110,100,0.7)'
      var t = weather.temp_high + '\u00B0'
      if (weather.temp_low != null && weather.temp_low !== weather.temp_high) t = weather.temp_low + '\u2013' + weather.temp_high + '\u00B0'
      ctx.fillText(t, w / 2, h - 2)
      bufs.push(off)
    }
    framesRef.current = bufs; idxRef.current = 0; show(0, w, h, dpr)
  }, [weather, cellRect])

  function show(i, w, h, dpr) {
    var c = canvasRef.current; if (!c || !framesRef.current[i]) return
    c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px'
    c.getContext('2d').drawImage(framesRef.current[i], 0, 0)
  }

  useEffect(function () { render() }, [render])
  useEffect(function () {
    if (!cellRect || !weather) return
    var w = cellRect.w, h = cellRect.h, dpr = Math.min(window.devicePixelRatio || 1, 3)
    timerRef.current = setInterval(function () { idxRef.current = (idxRef.current + 1) % FRAMES; show(idxRef.current, w, h, dpr) }, 1000 / FPS)
    return function () { clearInterval(timerRef.current) }
  }, [cellRect, weather])

  if (!cellRect || !weather) return null
  return <canvas ref={canvasRef} style={{ position: 'absolute', left: cellRect.x, top: cellRect.y, width: cellRect.w, height: cellRect.h, pointerEvents: 'none', filter: fogBlur ? 'blur(' + fogBlur + 'px)' : 'none' }} />
}
