// StampsPanel v5 — Stickers + Patterns, Rough.js UI throughout
import { useState, useRef, useEffect, useCallback } from 'react'
import rough from 'roughjs'
import { stickerCategories, stickerRecipes, stickerColors } from './StickerRecipes'
import { patternTypes, colorPresets, renderPattern } from './PatternLib'

var RO = { roughness: 0.5, bowing: 0.8, disableMultiStroke: true }
var FONT = "'-apple-system', 'PingFang SC', sans-serif"

function RoughHandle({ width }) {
  var ref = useRef(null)
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    var w = width || 40, h = 8
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.line(4, 3, w - 4, 3, { stroke: '#C0B8A8', strokeWidth: 1.5, roughness: 0.8, bowing: 0.6, disableMultiStroke: true, seed: 11 })
  }, [width])
  return <canvas ref={ref} style={{ display: 'block' }} />
}

function RoughClose({ size, onClick }) {
  var ref = useRef(null)
  var sz = size || 32
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.line(10, 10, sz - 10, sz - 10, { stroke: '#B0A898', strokeWidth: 1.3, ...RO, seed: 20 })
    rc.line(sz - 10, 10, 10, sz - 10, { stroke: '#B0A898', strokeWidth: 1.3, ...RO, seed: 21 })
  }, [sz])
  return <canvas ref={ref} onClick={onClick} style={{ display: 'block', cursor: 'pointer' }} />
}

function RoughTabLine({ width, active }) {
  var ref = useRef(null)
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var w = width || 50, h = 4
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (active) {
      var rc = rough.canvas(cvs)
      rc.line(4, 2, w - 4, 2, { stroke: '#5A4A38', strokeWidth: 1.5, roughness: 0.7, bowing: 0.5, disableMultiStroke: true, seed: 33 })
    }
  }, [width, active])
  return <canvas ref={ref} style={{ display: 'block' }} />
}

function RoughPlusCircle({ size, onClick }) {
  var ref = useRef(null)
  var sz = size || 36
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    var cx = sz / 2, cy = sz / 2
    rc.circle(cx, cy, sz - 8, { stroke: '#C0B8A8', strokeWidth: 0.8, roughness: 0.5, disableMultiStroke: true, seed: 44 })
    rc.line(cx, cy - 6, cx, cy + 6, { stroke: '#B0A898', strokeWidth: 1.2, roughness: 0.4, disableMultiStroke: true, seed: 45 })
    rc.line(cx - 6, cy, cx + 6, cy, { stroke: '#B0A898', strokeWidth: 1.2, roughness: 0.4, disableMultiStroke: true, seed: 46 })
  }, [])
  return <canvas ref={ref} onClick={onClick} style={{ display: 'block', cursor: 'pointer' }} />
}


function RoughTrashSmall({ size, active, onClick }) {
  var ref = useRef(null)
  var sz = size || 36
  useEffect(function() {
    if (!ref.current) return
    var cvs = ref.current
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, sz, sz)
    var rc = rough.canvas(cvs)
    var col = active ? '#C48A7A' : '#B0A898'
    if (active) rc.circle(sz/2, sz/2, sz-2, { stroke: col, fill: '#FFF0EC', fillStyle: 'solid', strokeWidth: 1, roughness: 0.5, disableMultiStroke: true, seed: 30 })
    var o = { stroke: col, strokeWidth: 1.2, roughness: 0.5, disableMultiStroke: true }
    rc.line(10, 12, 26, 12, { ...o, seed: 31 })
    rc.line(15, 12, 15, 9, { ...o, seed: 32 })
    rc.line(15, 9, 21, 9, { ...o, seed: 33 })
    rc.line(21, 9, 21, 12, { ...o, seed: 34 })
    rc.line(12, 12, 13, 27, { ...o, seed: 35 })
    rc.line(24, 12, 23, 27, { ...o, seed: 36 })
    rc.line(13, 27, 23, 27, { ...o, seed: 37 })
  }, [sz, active])
  return <canvas ref={ref} onClick={onClick} style={{ display: 'block', cursor: 'pointer' }} />
}

function RoughBtn({ width, label, color, disabled, onClick }) {
  var ref = useRef(null)
  var w = width || 120, h = 38
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    var c = disabled ? '#D0C8C0' : (color || '#2E94B9')
    rc.rectangle(3, 3, w - 6, h - 6, { stroke: c, strokeWidth: 1.2, ...RO, seed: 60, fill: c, fillStyle: 'solid' })
    ctx.fillStyle = '#fff'
    ctx.font = "600 12px " + FONT
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(label || 'Generate', w / 2, h / 2)
  }, [w, label, color, disabled])
  return <canvas ref={ref} onClick={disabled ? undefined : onClick} style={{ display: 'block', cursor: disabled ? 'default' : 'pointer' }} />
}

function RoughInput({ value, onChange, placeholder }) {
  var borderRef = useRef(null)
  useEffect(function() {
    var cvs = borderRef.current; if (!cvs) return
    var w = cvs.parentElement ? cvs.parentElement.clientWidth : 260
    var h = 42
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.rectangle(3, 3, w - 6, h - 6, { stroke: '#D0C8C0', strokeWidth: 1.2, ...RO, seed: 90, fill: '#FAFAF6', fillStyle: 'solid' })
  }, [])
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <canvas ref={borderRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%' }} />
      <input type="text" value={value} onChange={onChange} placeholder={placeholder}
        style={{ position: 'relative', width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit', color: '#5A4A38', outline: 'none', boxSizing: 'border-box', height: 42 }} />
    </div>
  )
}

function RoughFrame({ size }) {
  var ref = useRef(null)
  var sz = size || 100
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.rectangle(4, 4, sz - 8, sz - 8, { stroke: '#D0C8C0', strokeWidth: 1, ...RO, seed: 80, fill: '#F5F2EC', fillStyle: 'solid' })
    ctx.fillStyle = '#C0B8A8'
    ctx.font = '11px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('preview', sz / 2, sz / 2)
  }, [sz])
  return <canvas ref={ref} style={{ display: 'block', margin: '0 auto 12px' }} />
}

function RoughBack({ onClick }) {
  var ref = useRef(null)
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var w = 44, h = 24
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.line(4, h / 2, 13, h / 2 - 5, { stroke: '#B0A898', strokeWidth: 1, roughness: 0.5, disableMultiStroke: true, seed: 70 })
    rc.line(4, h / 2, 13, h / 2 + 5, { stroke: '#B0A898', strokeWidth: 1, roughness: 0.5, disableMultiStroke: true, seed: 71 })
    ctx.fillStyle = '#B0A898'; ctx.font = '13px ' + FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText('back', 15, h / 2 + 1)
  }, [])
  return <canvas ref={ref} onClick={onClick} style={{ display: 'block', cursor: 'pointer' }} />
}


function drawAiShapes(rc, ctx, shapes, cx, cy, s, mainColor) {
  var BGC = '#FAF6F0'
  for (var i = 0; i < shapes.length; i++) {
    var sh = shapes[i]
    var opts = { roughness: 0.5, disableMultiStroke: true, seed: 650 + i * 3 }
    if (sh.fill) { opts.fill = sh.fill === 'BG' ? BGC : mainColor; opts.fillStyle = 'solid' }
    if (sh.stroke) opts.stroke = sh.stroke === 'BG' ? BGC : mainColor
    opts.strokeWidth = (sh.sw || 1) * s
    if (sh.t === 'circle') rc.circle(cx + sh.x * s, cy + sh.y * s, (sh.r || 3) * 2 * s, opts)
    else if (sh.t === 'ellipse') rc.ellipse(cx + sh.x * s, cy + sh.y * s, (sh.w || 6) * s, (sh.h || 3) * s, opts)
    else if (sh.t === 'line') rc.line(cx + sh.x1 * s, cy + sh.y1 * s, cx + sh.x2 * s, cy + sh.y2 * s, opts)
    else if (sh.t === 'rect') rc.rectangle(cx + sh.x * s, cy + sh.y * s, (sh.w || 4) * s, (sh.h || 4) * s, opts)
  }
}

function AiThumb({ shapes, color, size }) {
  var ref = useRef(null)
  var sz = size || 58
  useEffect(function() {
    if (!ref.current || !shapes) return
    var cvs = ref.current
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, sz, sz)
    var rc = rough.canvas(cvs)
    drawAiShapes(rc, ctx, shapes, sz/2, sz/2, sz/40, color || '#D0A0A0')
  }, [shapes, color, sz])
  return <canvas ref={ref} style={{ display: 'block' }} />
}

function StickerThumb({ recipeFn, color, size }) {
  var ref = useRef(null)
  var sz = size || 58
  useEffect(function() {
    if (!ref.current || !recipeFn) return
    var cvs = ref.current
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, sz, sz)
    var rc = rough.canvas(cvs)
    recipeFn(rc, ctx, sz / 2, sz / 2, sz / 56, color || '#A09080')
  }, [recipeFn, color, sz])
  return <canvas ref={ref} style={{ display: 'block' }} />
}

function PatternThumb({ patternId, colorId }) {
  var ref = useRef(null)
  useEffect(function() { renderPattern(ref.current, patternId, colorId, 2) }, [patternId, colorId])
  return <canvas ref={ref} style={{ display: 'block', borderRadius: 4 }} />
}

function GenPreview({ shapes, size }) {
  var ref = useRef(null)
  var sz = size || 100
  useEffect(function() {
    if (!ref.current || !shapes) return
    var cvs = ref.current
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, sz, sz)
    var rc2 = rough.canvas(cvs)
    rc2.rectangle(4, 4, sz - 8, sz - 8, { stroke: '#D0C8C0', strokeWidth: 1, ...RO, seed: 80, fill: '#F5F2EC', fillStyle: 'solid' })
    // drawFromJSON for AI-generated stickers
    if (shapes && shapes.length) {
      for (var i = 0; i < shapes.length; i++) {
        var sh = shapes[i], s = sz / 32, cx = sz/2, cy = sz/2
        var opts = { roughness: 0.5, disableMultiStroke: true, seed: 650 + i * 3 }
        var MAIN = '#D0A0A0', BGC = '#F5F2EC'
        if (sh.fill) { opts.fill = sh.fill === 'BG' ? BGC : (sh.fill === 'MAIN' ? MAIN : sh.fill); opts.fillStyle = 'solid' }
        if (sh.stroke) opts.stroke = sh.stroke === 'BG' ? BGC : (sh.stroke === 'MAIN' ? MAIN : sh.stroke)
        opts.strokeWidth = (sh.sw || 1) * s
        if (sh.t === 'circle') rc2.circle(cx + sh.x * s, cy + sh.y * s, (sh.r || 3) * 2 * s, opts)
        else if (sh.t === 'ellipse') rc2.ellipse(cx + sh.x * s, cy + sh.y * s, (sh.w || 6) * s, (sh.h || 3) * s, opts)
        else if (sh.t === 'line') rc2.line(cx + sh.x1 * s, cy + sh.y1 * s, cx + sh.x2 * s, cy + sh.y2 * s, opts)
        else if (sh.t === 'rect') rc2.rectangle(cx + sh.x * s, cy + sh.y * s, (sh.w || 4) * s, (sh.h || 4) * s, opts)
      }
    }
  }, [shapes, sz])
  return <canvas ref={ref} style={{ display: 'block', margin: '0 auto 12px' }} />
}


/* Square photo crop overlay — drag to pan, slider to zoom */
function PhotoCropOverlay({ src, onConfirm, onCancel }) {
  var [img, setImg] = useState(null)
  var [off, setOff] = useState({ x: 0, y: 0 })
  var [zoom, setZoom] = useState(1)
  var canvasRef = useRef(null)
  var BOXW = 264, BOXH = 176

  useEffect(function() {
    var im = new Image()
    im.onload = function() { setImg(im) }
    im.src = src
  }, [src])

  useEffect(function() {
    if (!img || !canvasRef.current) return
    var cvs = canvasRef.current
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = BOXW * dpr; cvs.height = BOXH * dpr
    cvs.style.width = BOXW + 'px'; cvs.style.height = BOXH + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#F0ECE6'; ctx.fillRect(0, 0, BOXW, BOXH)
    var base = Math.max(BOXW / img.width, BOXH / img.height)
    var sc = base * zoom
    var dw = img.width * sc, dh = img.height * sc
    ctx.drawImage(img, (BOXW - dw) / 2 + off.x, (BOXH - dh) / 2 + off.y, dw, dh)
    var rc = rough.canvas(cvs)
    rc.rectangle(2, 2, BOXW - 4, BOXH - 4, { stroke: '#fff', strokeWidth: 2, roughness: 0.5, disableMultiStroke: true, seed: 42 })
  }, [img, off, zoom])

  function handleTouch(e) {
    e.preventDefault()
    var t = e.touches[0], sx = t.clientX, sy = t.clientY
    var startOff = { x: off.x, y: off.y }
    function onMove(ev) {
      ev.preventDefault()
      var t2 = ev.touches[0]
      setOff({ x: startOff.x + (t2.clientX - sx), y: startOff.y + (t2.clientY - sy) })
    }
    function onEnd() { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd) }
    window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onEnd)
  }

  function doConfirm() {
    if (!img) return
    var OUTW = 300, OUTH = 200
    var out = document.createElement('canvas')
    out.width = OUTW; out.height = OUTH
    var octx = out.getContext('2d')
    octx.fillStyle = '#FAF6F0'; octx.fillRect(0, 0, OUTW, OUTH)
    var k = OUTW / BOXW
    var base = Math.max(BOXW / img.width, BOXH / img.height)
    var sc = base * zoom * k
    var dw = img.width * sc, dh = img.height * sc
    octx.drawImage(img, (OUTW - dw) / 2 + off.x * k, (OUTH - dh) / 2 + off.y * k, dw, dh)
    onConfirm(out.toDataURL('image/jpeg', 0.78))
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <canvas ref={canvasRef} onTouchStart={handleTouch} style={{ touchAction: 'none', borderRadius: 4 }} />
      {/* zoom bar */}
      <canvas ref={function(cvs) {
        if (!cvs || cvs._d) return; cvs._d = true
        var w = 200, h = 30, dpr = Math.min(window.devicePixelRatio || 1, 3)
        cvs.width = w * dpr; cvs.height = h * dpr; cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
        var c2 = cvs.getContext('2d'); c2.setTransform(dpr, 0, 0, dpr, 0, 0)
        var rc2 = rough.canvas(cvs)
        var o = { stroke: '#fff', strokeWidth: 2, roughness: 0.4, disableMultiStroke: true }
        rc2.line(6, 15, 18, 15, { ...o, seed: 1 })
        rc2.line(28, 15, w - 28, 15, { ...o, strokeWidth: 2.5, seed: 2 })
        rc2.line(w - 18, 15, w - 6, 15, { ...o, seed: 3 })
        rc2.line(w - 12, 9, w - 12, 21, { ...o, seed: 4 })
      }} onTouchStart={function(e) {
        e.preventDefault()
        var t0 = e.touches[0], sx = t0.clientX, sz = zoom
        function onMove(ev) {
          ev.preventDefault(); var t2 = ev.touches[0]
          setZoom(Math.max(1, Math.min(3, sz + (t2.clientX - sx) * 0.01)))
        }
        function onEnd() { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd) }
        window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onEnd)
      }} style={{ marginTop: 20, touchAction: 'none' }} />
      {/* buttons */}
      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        <canvas ref={function(cvs) {
          if (!cvs || cvs._d) return; cvs._d = true
          var sz = 44, dpr = Math.min(window.devicePixelRatio || 1, 3)
          cvs.width = sz * dpr; cvs.height = sz * dpr; cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
          var c2 = cvs.getContext('2d'); c2.setTransform(dpr, 0, 0, dpr, 0, 0)
          var rc2 = rough.canvas(cvs)
          rc2.circle(sz/2, sz/2, sz-8, { stroke: '#C48A7A', fill: '#FFF5F0', fillStyle: 'solid', strokeWidth: 1.5, roughness: 0.5, disableMultiStroke: true, seed: 4 })
          rc2.line(15, 15, 29, 29, { stroke: '#C48A7A', strokeWidth: 2, roughness: 0.4, disableMultiStroke: true, seed: 5 })
          rc2.line(29, 15, 15, 29, { stroke: '#C48A7A', strokeWidth: 2, roughness: 0.4, disableMultiStroke: true, seed: 6 })
        }} onClick={onCancel} style={{ cursor: 'pointer' }} />
        <canvas ref={function(cvs) {
          if (!cvs || cvs._d) return; cvs._d = true
          var sz = 44, dpr = Math.min(window.devicePixelRatio || 1, 3)
          cvs.width = sz * dpr; cvs.height = sz * dpr; cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
          var c2 = cvs.getContext('2d'); c2.setTransform(dpr, 0, 0, dpr, 0, 0)
          var rc2 = rough.canvas(cvs)
          rc2.circle(sz/2, sz/2, sz-8, { stroke: '#9BB89C', fill: '#F0F5F0', fillStyle: 'solid', strokeWidth: 1.5, roughness: 0.5, disableMultiStroke: true, seed: 1 })
          rc2.line(13, 22, 20, 30, { stroke: '#9BB89C', strokeWidth: 2.5, roughness: 0.4, disableMultiStroke: true, seed: 2 })
          rc2.line(20, 30, 31, 14, { stroke: '#9BB89C', strokeWidth: 2.5, roughness: 0.4, disableMultiStroke: true, seed: 3 })
        }} onClick={doConfirm} style={{ cursor: 'pointer' }} />
      </div>
    </div>
  )
}

/* Photo sticker thumbnail */
function PhotoThumb({ dataUrl, size }) {
  var ref = useRef(null)
  var w = size || 84, h = Math.round((size || 84) * 2 / 3)
  useEffect(function() {
    if (!ref.current || !dataUrl) return
    var cvs = ref.current
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var im = new Image()
    im.onload = function() {
      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(3, 3, w-6, h-6, 3); else ctx.rect(3, 3, w-6, h-6)
      ctx.clip()
      ctx.drawImage(im, 3, 3, w-6, h-6)
      ctx.restore()
      var rc = rough.canvas(cvs)
      rc.rectangle(2, 2, w-4, h-4, { stroke: '#D0C8C0', strokeWidth: 1, roughness: 0.6, disableMultiStroke: true, seed: 42 })
    }
    im.src = dataUrl
  }, [dataUrl, w, h])
  return <canvas ref={ref} style={{ display: 'block' }} />
}


var AI_SYSTEM = "You design tiny hand-drawn sticker icons rendered by Rough.js. House style: SINGLE-COLOR SILHOUETTE plus NEGATIVE SPACE, like a paper cut-out where details show through as background-colored gaps.\n\nOUTPUT: a single JSON array of shapes. No markdown, no prose.\n\nCOORDINATES: center (0,0). X -14..14, Y -14..14. Centered.\n\nSHAPES (only these 4):\n{\"t\":\"circle\",\"x\":0,\"y\":0,\"r\":3,\"fill\":\"MAIN\",\"stroke\":\"MAIN\"}\n{\"t\":\"ellipse\",\"x\":0,\"y\":0,\"w\":8,\"h\":4,\"fill\":\"MAIN\",\"stroke\":\"MAIN\"}\n{\"t\":\"line\",\"x1\":0,\"y1\":0,\"x2\":5,\"y2\":5,\"stroke\":\"MAIN\",\"sw\":1}\n{\"t\":\"rect\",\"x\":-2,\"y\":-1,\"w\":4,\"h\":3,\"fill\":\"MAIN\",\"stroke\":\"MAIN\"}\n\nCOLORS — ONLY TWO VALUES:\n\"MAIN\" = the sticker color. \"BG\" = paper color, used to carve details out of the silhouette.\nNever output hex codes.\n\nMETHOD:\n1. Silhouette first: 2-6 filled MAIN shapes that read as the object at 50px.\n2. Carve details with thin BG lines on top (veins, rims, holes, panes).\n3. Optional 1-3 small MAIN accents outside the body.\n\nSTROKE WEIGHT: sw between 0.6 and 1.2 only. Thick strokes look clumsy.\n\nRULES: 5-12 shapes. Recognizable at 50x50. Leave breathing room. Prefer circles and ellipses.\n\nEXAMPLE — a leaf:\n[{\"t\":\"ellipse\",\"x\":0,\"y\":-2,\"w\":12,\"h\":20,\"fill\":\"MAIN\",\"stroke\":\"MAIN\",\"sw\":0.8},{\"t\":\"line\",\"x1\":0,\"y1\":-12,\"x2\":0,\"y2\":8,\"stroke\":\"BG\",\"sw\":1.1},{\"t\":\"line\",\"x1\":-4,\"y1\":-5,\"x2\":0,\"y2\":-2,\"stroke\":\"BG\",\"sw\":0.7},{\"t\":\"line\",\"x1\":4,\"y1\":-6,\"x2\":0,\"y2\":-3,\"stroke\":\"BG\",\"sw\":0.7},{\"t\":\"line\",\"x1\":0,\"y1\":8,\"x2\":0,\"y2\":13,\"stroke\":\"MAIN\",\"sw\":1}]\n\nEXAMPLE — a teacup:\n[{\"t\":\"rect\",\"x\":-6,\"y\":-3,\"w\":12,\"h\":10,\"fill\":\"MAIN\",\"stroke\":\"MAIN\",\"sw\":0.8},{\"t\":\"ellipse\",\"x\":0,\"y\":7,\"w\":10,\"h\":3,\"fill\":\"MAIN\",\"stroke\":\"MAIN\",\"sw\":0.8},{\"t\":\"ellipse\",\"x\":0,\"y\":-3,\"w\":12,\"h\":3,\"fill\":\"BG\",\"stroke\":\"BG\",\"sw\":0.6},{\"t\":\"circle\",\"x\":8,\"y\":1,\"r\":3,\"stroke\":\"MAIN\",\"sw\":1},{\"t\":\"line\",\"x1\":-2,\"y1\":-7,\"x2\":-1,\"y2\":-10,\"stroke\":\"MAIN\",\"sw\":0.6},{\"t\":\"line\",\"x1\":2,\"y1\":-8,\"x2\":1,\"y2\":-11,\"stroke\":\"MAIN\",\"sw\":0.6}]\n\nOUTPUT: only the JSON array."

async function callAI(desc, prevRecipe, feedback) {
  var key = localStorage.getItem('hopscotch_ai_key')
  if (!key) throw new Error('no key')
  var msgs = [{ role: 'system', content: AI_SYSTEM }, { role: 'user', content: 'Create a sticker element: "' + desc + '"' }]
  if (prevRecipe && feedback) {
    msgs.push({ role: 'assistant', content: JSON.stringify(prevRecipe) })
    msgs.push({ role: 'user', content: 'Modify based on feedback: ' + feedback })
  }
  var res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-chat', temperature: 0.7, max_tokens: 3000, messages: msgs })
  })
  var data = await res.json()
  if (data.error) throw new Error(data.error.message || 'api error')
  var text = (data.choices[0].message.content || '').trim()
  if (text.indexOf('```') === 0) {
    text = text.slice(text.indexOf('\n') + 1)
    if (text.indexOf('```') >= 0) text = text.slice(0, text.lastIndexOf('```')).trim()
  }
  var shapes = JSON.parse(text)
  if (!Array.isArray(shapes)) throw new Error('bad shape')
  shapes.forEach(function(s) {
    if (s.fill && s.fill !== 'BG') s.fill = 'MAIN'
    if (s.stroke && s.stroke !== 'BG') s.stroke = 'MAIN'
    if (s.sw) s.sw = Math.max(0.5, Math.min(1.3, s.sw))
  })
  return shapes
}


export default function StampsPanel({ open, onClose, onStickerPlace, onPatternPlace, supaGet, supaPost, supaPatch }) {
  var [topTab, setTopTab] = useState('stickers')
  var [stickerTab, setStickerTab] = useState('flora')
  var [stickerColor, setStickerColor] = useState("#D0A0A0")
  var [selSticker, setSelSticker] = useState(null)
  var [selPattern, setSelPattern] = useState('polka')
  var [selColor, setSelColor] = useState('rose')
  var [genOpen, setGenOpen] = useState(false)
  var [genInput, setGenInput] = useState('')
  var [genLoading, setGenLoading] = useState(false)
  var [genResult, setGenResult] = useState(null)
  var [genId, setGenId] = useState(null)
  var [feedbackInput, setFeedbackInput] = useState('')
  var [genError, setGenError] = useState('')
  var [photoStickers, setPhotoStickers] = useState(function() {
    try { return JSON.parse(localStorage.getItem('hopscotch_photo_stickers') || '[]') } catch(e) { return [] }
  })
  var [aiStickers, setAiStickers] = useState(function() {
    try { return JSON.parse(localStorage.getItem('hopscotch_ai_stickers') || '[]') } catch(e) { return [] }
  })
  var [cropSrc, setCropSrc] = useState(null)
  var [photoDeleteMode, setPhotoDeleteMode] = useState(false)
  var fileRef = useRef(null)

  useEffect(function() {
    localStorage.setItem('hopscotch_photo_stickers', JSON.stringify(photoStickers))
  }, [photoStickers])

  function handleFileSelect(e) {
    var f = e.target.files && e.target.files[0]
    if (!f) return
    var reader = new FileReader()
    reader.onload = function() { setCropSrc(reader.result) }
    reader.readAsDataURL(f)
    e.target.value = ''
  }

  var [customStickers, setCustomStickers] = useState([])
  var [customLoaded, setCustomLoaded] = useState(false)
  var panelRef = useRef(null)
  var dragCanvasRef = useRef(null)
  var [dragging, setDragging] = useState(null)
  var [dragPos, setDragPos] = useState(null)

  function startDrag(e, item) {
    var touch = e.touches ? e.touches[0] : e
    var sx = touch.clientX, sy = touch.clientY, started = false
    function onMove(ev) {
      var t = ev.touches ? ev.touches[0] : ev
      var dy = t.clientY - sy
      if (!started && dy < -25 && selSticker === item.type) {
        started = true
        setDragging(item)
      }
      if (started) { ev.preventDefault(); setDragPos({ x: t.clientX - 30, y: t.clientY - 30 }) }
    }
    function onEnd(ev) {
      if (started) {
        var t = ev.changedTouches ? ev.changedTouches[0] : ev
        var panelTop = panelRef.current ? panelRef.current.getBoundingClientRect().top : window.innerHeight
        if (t.clientY < panelTop && onStickerPlace) {
          onStickerPlace(item.type, item.label, stickerColor, t.clientX, t.clientY, item.photoUrl, item.aiRecipe)
        }
        setDragging(null); setDragPos(null)
      } else {
        setSelSticker(item.type)
      }
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
  }

  useEffect(function() {
    if (!open || customLoaded || !supaGet) return
    supaGet('hopscotch_stickers', 'status=eq.done&order=created_at.desc').then(function(rows) {
      if (rows) setCustomStickers(rows); setCustomLoaded(true)
    }).catch(function() { setCustomLoaded(true) })
  }, [open, customLoaded, supaGet])

  useEffect(function() {
    if (!open) return
    function handleClick(e) { if (panelRef.current && !panelRef.current.contains(e.target)) onClose() }
    var timer = setTimeout(function() { document.addEventListener('click', handleClick) }, 100)
    return function() { clearTimeout(timer); document.removeEventListener('click', handleClick) }
  }, [open, onClose])

  function handleGenerate() {
    if (!genInput.trim() || genLoading) return
    var key = localStorage.getItem('hopscotch_ai_key')
    if (!key) { setGenError('Add your AI key in Settings first'); return }
    setGenLoading(true); setGenResult(null); setGenError('')
    callAI(genInput.trim(), null, null).then(function(shapes) {
      setGenResult(shapes); setGenLoading(false)
    }).catch(function(e) {
      setGenError(String(e.message || e)); setGenLoading(false)
    })
  }

  function handleIterate() {
    if (!feedbackInput.trim() || genLoading || !genResult) return
    setGenLoading(true); setGenError('')
    callAI(genInput.trim(), genResult, feedbackInput.trim()).then(function(shapes) {
      setGenResult(shapes); setGenLoading(false); setFeedbackInput('')
    }).catch(function(e) {
      setGenError(String(e.message || e)); setGenLoading(false)
    })
  }

  if (!open) return null

  // draw drag ghost
  if (dragging && dragCanvasRef.current && dragging.type === '__pattern__') {
    var _cvs = dragCanvasRef.current
    var _dpr = Math.min(window.devicePixelRatio || 1, 3)
    var _sz = 60
    _cvs.width = _sz * _dpr; _cvs.height = _sz * _dpr
    _cvs.style.width = _sz + 'px'; _cvs.style.height = _sz + 'px'
    var _ctx = _cvs.getContext('2d'); _ctx.setTransform(_dpr, 0, 0, _dpr, 0, 0)
    renderPattern(_cvs, dragging.patternId, dragging.colorId, 2)
  } else if (dragging && dragCanvasRef.current && dragging.photoUrl) {
    var _c = dragCanvasRef.current
    var _d = Math.min(window.devicePixelRatio || 1, 3)
    var _s = 60
    _c.width = _s * _d; _c.height = _s * _d
    _c.style.width = _s + 'px'; _c.style.height = _s + 'px'
    var _x = _c.getContext('2d'); _x.setTransform(_d, 0, 0, _d, 0, 0)
    var _im = new Image()
    _im.onload = function() { _x.clearRect(0,0,_s,_s); _x.drawImage(_im, 2, 2, _s-4, _s-4) }
    _im.src = dragging.photoUrl
  } else if (dragging && dragCanvasRef.current && dragging.aiRecipe) {
    var _ac = dragCanvasRef.current
    var _ad = Math.min(window.devicePixelRatio || 1, 3)
    var _as = 60
    _ac.width = _as * _ad; _ac.height = _as * _ad
    _ac.style.width = _as + 'px'; _ac.style.height = _as + 'px'
    var _ax = _ac.getContext('2d'); _ax.setTransform(_ad, 0, 0, _ad, 0, 0)
    _ax.clearRect(0, 0, _as, _as)
    drawAiShapes(rough.canvas(_ac), _ax, dragging.aiRecipe, _as/2, _as/2, _as/40, stickerColor)
  } else if (dragging && dragCanvasRef.current && dragging.recipeFn) {
    var _cvs = dragCanvasRef.current
    var _dpr = Math.min(window.devicePixelRatio || 1, 3)
    var _sz = 60
    _cvs.width = _sz * _dpr; _cvs.height = _sz * _dpr
    _cvs.style.width = _sz + 'px'; _cvs.style.height = _sz + 'px'
    var _ctx = _cvs.getContext('2d'); _ctx.setTransform(_dpr, 0, 0, _dpr, 0, 0)
    _ctx.clearRect(0, 0, _sz, _sz)
    var _rc = rough.canvas(_cvs)
    dragging.recipeFn(_rc, _ctx, _sz/2, _sz/2, _sz/56, stickerColor)
  }

  var currentItems = []
  var cat = stickerCategories[stickerTab]
  if (cat) currentItems = cat.items.map(function(item) { return { type: item.type, label: item.label, recipeFn: stickerRecipes[item.type] } })
  aiStickers.filter(function(a) { return a.category === stickerTab }).forEach(function(a) {
    currentItems.push({ type: 'ai_' + a.id, label: a.name, aiRecipe: a.recipe })
  })
  var customForTab = customStickers.filter(function(s) { return s.category === stickerTab && s.recipe })
  customForTab.forEach(function(s) { currentItems.push({ type: 'custom_' + s.id, label: s.name, shapes: s.recipe }) })
  var catEntries = Object.entries(stickerCategories)

  return (<>
    {dragging && dragPos && (
        <canvas ref={dragCanvasRef} style={{
          position: 'fixed', left: dragPos.x, top: dragPos.y,
          pointerEvents: 'none', zIndex: 200, opacity: 0.85,
        }} />
      )}
    {cropSrc && <PhotoCropOverlay src={cropSrc}
      onConfirm={function(dataUrl) {
        setPhotoStickers(function(prev) { return prev.concat([{ id: 'ph_' + Date.now(), dataUrl: dataUrl }]) })
        setCropSrc(null); setGenOpen(false)
      }}
      onCancel={function() { setCropSrc(null) }} />}
    <div ref={panelRef} style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FAF6F0',
      opacity: dragging ? 0.3 : 1,
      borderRadius: '16px 16px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      zIndex: 100, height: genOpen ? '85vh' : '42vh', transition: 'height 0.3s ease',
      display: 'flex', flexDirection: 'column', fontFamily: FONT, overflow: 'hidden',
    }} onClick={function(e) { e.stopPropagation() }}>

      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 4px', justifyContent: 'center', position: 'relative' }}>
        <RoughHandle width={40} />
        <div style={{ position: 'absolute', right: 10, top: 8 }}>
          <RoughClose size={32} onClick={genOpen ? function() { setGenOpen(false); setGenResult(null); setGenId(null); setGenInput('') } : onClose} />
        </div>
      </div>

      {!genOpen ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, padding: '0 0 2px' }}>
            {[{ k: 'stickers', l: 'Stickers' }, { k: 'patterns', l: 'Patterns' }, { k: 'photos', l: 'Photos' }].map(function(t) {
              return (
                <div key={t.k} onClick={function() { setTopTab(t.k) }} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 16px 0', cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 13, letterSpacing: 1.2, color: topTab === t.k ? '#5A4A38' : '#B0A898', fontWeight: topTab === t.k ? 700 : 400 }}>{t.l}</span>
                  <RoughTabLine width={60} active={topTab === t.k} />
                </div>
              )
            })}
          </div>

          {topTab === 'stickers' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '2px 8px 4px' }}>
                {catEntries.map(function(entry) {
                  var key = entry[0], c = entry[1]
                  return (
                    <div key={key} onClick={function() { setStickerTab(key) }} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 14px 0', cursor: 'pointer',
                    }}>
                      <span style={{ fontSize: 11, letterSpacing: 0.5, color: stickerTab === key ? '#5A4A38' : '#B0A898', fontWeight: stickerTab === key ? 600 : 400 }}>{c.label}</span>
                      <RoughTabLine width={44} active={stickerTab === key} />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '2px 0 6px', flexWrap: 'wrap' }}>
                {stickerColors.map(function(sc) {
                  var active = stickerColor === sc.c
                  return (
                    <div key={sc.id} onClick={function() { setStickerColor(sc.c) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                      <div style={{ width: 22, height: 22, borderRadius: 11, background: sc.c, border: active ? '2px solid #5A4A38' : '2px solid transparent' }} />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 4, padding: '6px 16px', flex: 1, overflowY: 'auto', alignContent: 'start', justifyItems: 'center' }}>
                {currentItems.map(function(item) {
                  return (
                    <div key={item.type}
                      onTouchStart={function(e) { startDrag(e, item) }}
                      onMouseDown={function(e) { startDrag(e, item) }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 4px', cursor: 'grab', userSelect: 'none', WebkitUserSelect: 'none', outline: selSticker === item.type ? '2px solid #2E94B9' : 'none', borderRadius: 6 }}>
                      {item.aiRecipe ? <AiThumb shapes={item.aiRecipe} color={stickerColor} /> : <StickerThumb recipeFn={item.recipeFn} color={stickerColor} />}
                      <span style={{ fontSize: 9, color: '#8A7A68', marginTop: 3, textAlign: 'center' }}>{item.label}</span>
                    </div>
                  )
                })}
                <div onClick={function() { setGenOpen(true) }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 4px', cursor: 'pointer' }}>
                  <RoughPlusCircle size={40} onClick={function() { setGenOpen(true) }} />
                  <span style={{ fontSize: 9, color: '#A89888', marginTop: 3, textAlign: 'center' }}>new</span>
                </div>
              </div>
            </>
          ) : topTab === 'patterns' ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px' }}>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '4px 0 10px', flexWrap: 'wrap' }}>
                {colorPresets.map(function(cp) {
                  var active = selColor === cp.id
                  return (
                    <div key={cp.id} onClick={function() { setSelColor(cp.id) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                      <div style={{ width: 22, height: 22, borderRadius: 11, background: cp.fg, border: active ? '2px solid #5A4A38' : '2px solid transparent' }} />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, alignContent: 'start' }}>
                {patternTypes.map(function(pt) {
                  var active = selPattern === pt.id
                  return (
                    <div key={pt.id}
                      onTouchStart={function(e) {
                        var touch = e.touches[0]
                        var sx = touch.clientX, sy = touch.clientY, started = false
                        function onMove(ev) {
                          var t = ev.touches[0]
                          var dy = t.clientY - sy; if (!started && dy < -25 && selPattern === pt.id) {
                            started = true
                            setDragging({ type: '__pattern__', patternId: pt.id, colorId: selColor })
                          }
                          if (started) { ev.preventDefault(); setDragPos({ x: t.clientX - 30, y: t.clientY - 30 }) }
                        }
                        function onEnd(ev) {
                          if (started) {
                            var t = ev.changedTouches[0]
                            var panelTop = panelRef.current ? panelRef.current.getBoundingClientRect().top : window.innerHeight
                            if (t.clientY < panelTop && onPatternPlace) onPatternPlace(pt.id, selColor, t.clientX, t.clientY)
                            setDragging(null); setDragPos(null)
                          } else {
                            setSelPattern(pt.id)
                          }
                          window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd)
                        }
                        window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onEnd)
                      }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4, cursor: 'grab', outline: active ? '2px solid #2E94B9' : 'none', borderRadius: 6 }}>
                      <PatternThumb patternId={pt.id} colorId={selColor} />
                      <span style={{ fontSize: 9, color: '#8A7A68', marginTop: 3 }}>{pt.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Photos tab */
            <div style={{ flex: 1, overflowY: 'auto', padding: '6px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, alignContent: 'start', justifyItems: 'center' }}>
                {photoStickers.map(function(ps) {
                  var active = selSticker === 'photo_' + ps.id
                  return (
                    <div key={ps.id}
                      onClick={photoDeleteMode ? function() {
                        setPhotoStickers(function(prev) { return prev.filter(function(x) { return x.id !== ps.id }) })
                      } : undefined}
                      onTouchStart={photoDeleteMode ? undefined : function(e) { startDrag(e, { type: 'photo_' + ps.id, label: 'photo', photoUrl: ps.dataUrl }) }}
                      style={{ padding: 3, position: 'relative', cursor: photoDeleteMode ? 'pointer' : 'grab', outline: active ? '2px solid #2E94B9' : 'none', borderRadius: 5, userSelect: 'none', WebkitUserSelect: 'none', opacity: photoDeleteMode ? 0.6 : 1 }}>
                      <PhotoThumb dataUrl={ps.dataUrl} size={84} />
                      {photoDeleteMode && <div style={{ position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderRadius: 10, background: '#C48A7A', color: '#fff', fontSize: 13, lineHeight: '20px', textAlign: 'center' }}>x</div>}
                    </div>
                  )
                })}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 84, height: 58 }}>
                  <RoughPlusCircle size={36} onClick={function() { fileRef.current && fileRef.current.click() }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 84, height: 58 }}>
                  <RoughTrashSmall size={36} active={photoDeleteMode} onClick={function() { setPhotoDeleteMode(!photoDeleteMode) }} />
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '8px 16px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          </div>
          {genResult ? <GenPreview shapes={genResult} size={100} /> : <RoughFrame size={100} />}
          {!genResult ? (
            <>
              <RoughInput value={genInput} onChange={function(e) { setGenInput(e.target.value) }} placeholder="describe: cherry blossom, wax seal..." />
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                <RoughBtn width={200} label={genLoading ? 'generating...' : 'Generate'} disabled={genLoading || !genInput.trim()} onClick={handleGenerate} />
              </div>
              {genError && <div style={{ fontSize: 11, color: '#C48A7A', textAlign: 'center', marginTop: 8 }}>{genError}</div>}
            </>
          ) : (
            <>
              <RoughInput value={feedbackInput} onChange={function(e) { setFeedbackInput(e.target.value) }} placeholder="feedback: bigger petals, add leaves..." />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
                <RoughBtn width={140} label={genLoading ? 'generating...' : 'Iterate'} disabled={genLoading || !feedbackInput.trim()} onClick={handleIterate} />
                <RoughBtn width={100} label="Done" color="#4AAF5C" onClick={function() {
                  if (genResult) {
                    var saved = []
                    try { saved = JSON.parse(localStorage.getItem('hopscotch_ai_stickers') || '[]') } catch(e) {}
                    saved.push({ id: 'ai_' + Date.now(), name: genInput.trim().slice(0, 20), recipe: genResult, category: stickerTab })
                    localStorage.setItem('hopscotch_ai_stickers', JSON.stringify(saved))
                    setAiStickers(saved)
                  }
                  setGenOpen(false); setGenResult(null); setGenId(null); setGenInput(''); setFeedbackInput('')
                }} />
              </div>
            </>
          )}
          {genResult && (
            <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: '#B0A898', width: '100%', textAlign: 'center', marginBottom: 2 }}>save to:</span>
              {catEntries.map(function(entry) {
                var key = entry[0], c = entry[1]
                return (
                  <div key={key} onClick={function() {
                    if (genId && supaPatch) supaPatch('hopscotch_stickers', 'id=eq.' + genId, { category: key })
                    setCustomStickers(function(prev) { return prev.map(function(s) { return s.id === genId ? Object.assign({}, s, { category: key }) : s }) })
                    setStickerTab(key)
                  }} style={{ padding: '4px 12px', fontSize: 11, cursor: 'pointer', color: '#5A4A38', background: '#F0ECE6', borderRadius: 10 }}>{c.label}</div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  </>)
}
