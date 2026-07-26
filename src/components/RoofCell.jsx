import { useRef, useEffect, useState, useCallback } from 'react'
import rough from 'roughjs'
import { supaGet, supaPatch, isConnected } from '../lib/supabase'
import { grid, HOPSCOTCH_BG } from '../lib/tokens'
import { renderPatternFill } from './PatternLib'

/* real triangle proportions from grid */
var TRI_W = grid.d_right - grid.d_left   /* 64 */
var TRI_H = grid.y1 - grid.y0            /* 24 */
var TRI_APEX_X = (grid.cx - grid.d_left) / TRI_W  /* ~0.5 */

/* crop window scale */
var CROP_SCALE = 4
var CW = TRI_W * CROP_SCALE   /* ~256 */
var CH = TRI_H * CROP_SCALE   /* ~96 */
/* output resolution */
var OUT_W = TRI_W * 6   /* ~384 */
var OUT_H = TRI_H * 6   /* ~144 */

/* triangle points at given w,h */
function triPts(w, h) {
  return [
    { x: w * TRI_APEX_X, y: 0 },
    { x: 0, y: h },
    { x: w, y: h },
  ]
}

export default function RoofCell({ tri, pattern }) {
  var canvasRef = useRef(null)
  var inputRef = useRef(null)
  var [photo, setPhoto] = useState(null)
  var [cropping, setCropping] = useState(null)

  useEffect(function () {
    if (!isConnected()) return
    supaGet('hopscotch_roof', 'id=eq.1').then(function (r) {
      if (r && r[0] && r[0].photo_base64) setPhoto(r[0].photo_base64)
    })
  }, [])

  var paint = useCallback(function () {
    if (!tri || !canvasRef.current) return
    var p = tri
    var minX = Math.min(p[0].x, p[1].x, p[2].x)
    var minY = Math.min(p[0].y, p[1].y, p[2].y)
    var maxX = Math.max(p[0].x, p[1].x, p[2].x)
    var maxY = Math.max(p[0].y, p[1].y, p[2].y)
    var w = maxX - minX, h = maxY - minY
    if (w < 2 || h < 2) return

    var cvs = canvasRef.current
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    var lp = p.map(function (v) { return { x: v.x - minX, y: v.y - minY } })
    var cx = (lp[0].x + lp[1].x + lp[2].x) / 3
    var cy = (lp[0].y + lp[1].y + lp[2].y) / 3
    var ip = lp.map(function (v) {
      return { x: cx + (v.x - cx) * 0.88, y: cy + (v.y - cy) * 0.88 }
    })

    if (photo) {
      var img = new Image()
      img.onload = function () {
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(ip[0].x, ip[0].y); ctx.lineTo(ip[1].x, ip[1].y); ctx.lineTo(ip[2].x, ip[2].y)
        ctx.closePath(); ctx.clip()
        var sc = Math.max(w / img.width, h / img.height)
        var dw = img.width * sc, dh = img.height * sc
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
        ctx.restore()
        drawBorder(cvs, lp)
      }
      img.src = photo
    } else if (pattern && pattern.patternId) {
      // render pattern clipped to triangle
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(ip[0].x, ip[0].y); ctx.lineTo(ip[1].x, ip[1].y); ctx.lineTo(ip[2].x, ip[2].y)
      ctx.closePath(); ctx.clip()
      // draw pattern on an offscreen canvas then paste
      var pCvs = document.createElement('canvas')
      renderPatternFill(pCvs, pattern.patternId, pattern.colorId, Math.round(w), Math.round(h), pattern.offX || 0, pattern.offY || 0)
      ctx.drawImage(pCvs, 0, 0)
      ctx.restore()
      drawBorder(cvs, lp)
    } else {
      drawBorder(cvs, lp)
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = Math.round(h * 0.35) + "px -apple-system, sans-serif"
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('+', cx, cy + 2)
    }
  }, [tri, photo, pattern])

  useEffect(function () { paint() }, [paint])

  function drawBorder(cvs, lp) {
    var rc = rough.canvas(cvs)
    var d = 'M ' + lp[0].x + ' ' + lp[0].y + ' L ' + lp[1].x + ' ' + lp[1].y + ' L ' + lp[2].x + ' ' + lp[2].y + ' Z'
    rc.path(d, { stroke: 'rgba(255,255,255,0.55)', strokeWidth: 2.5, roughness: 0.5, bowing: 0.8, fill: 'none', disableMultiStroke: true, seed: 99 })
  }

  function handleFile(e) {
    var file = e.target.files && e.target.files[0]
    if (!file) return
    e.target.value = ''
    var reader = new FileReader()
    reader.onload = function () {
      var img = new Image()
      img.onload = function () { setCropping({ src: reader.result, imgW: img.width, imgH: img.height }) }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  function handleCropDone(b64) {
    setCropping(null); setPhoto(b64)
    if (isConnected()) supaPatch('hopscotch_roof', 'id=eq.1', { photo_base64: b64, updated_at: new Date().toISOString() })
  }

  if (!tri) return null
  var minX = Math.min(tri[0].x, tri[1].x, tri[2].x)
  var minY = Math.min(tri[0].y, tri[1].y, tri[2].y)

  return <>
    <canvas ref={canvasRef}
      onClick={function () { inputRef.current && inputRef.current.click() }}
      style={{ position: 'absolute', left: minX, top: minY, cursor: 'pointer', zIndex: 2 }} />
    <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
    {cropping && <CropOverlay src={cropping.src} imgW={cropping.imgW} imgH={cropping.imgH}
      onConfirm={handleCropDone} onCancel={function () { setCropping(null) }} />}
  </>
}

/* ── Crop overlay ── */
function CropOverlay({ src, imgW, imgH, onConfirm, onCancel }) {
  var [pos, setPos] = useState({ x: 0, y: 0 })
  var [scale, setScale] = useState(1)
  var dragRef = useRef(null)
  var pinchRef = useRef(null)
  var borderRef = useRef(null)

  useEffect(function () {
    var s = Math.max(CW / imgW, CH / imgH) * 1.3
    setScale(s)
    setPos({ x: -(imgW * s - CW) / 2, y: -(imgH * s - CH) / 2 })
  }, [imgW, imgH])

  var cancelRef = useRef(null)
  var confirmRef = useRef(null)
  var sliderRef = useRef(null)
  var sliderDrag = useRef(null)
  var SLIDER_H = 120, SLIDER_W = 28, KNOB = 10
  var MIN_S = Math.max(CW / imgW, CH / imgH) * 0.8
  var MAX_S = MIN_S * 5

  /* draw rough.js triangle border + button borders */
  useEffect(function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 3)

    /* triangle */
    var cvs = borderRef.current; if (!cvs) return
    cvs.width = CW * dpr; cvs.height = CH * dpr
    cvs.style.width = CW + 'px'; cvs.style.height = CH + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    var p = triPts(CW, CH)
    var d = 'M ' + p[0].x + ' ' + p[0].y + ' L ' + p[1].x + ' ' + p[1].y + ' L ' + p[2].x + ' ' + p[2].y + ' Z'
    rc.path(d, { stroke: 'rgba(255,255,255,0.6)', strokeWidth: 2, roughness: 0.5, bowing: 0.8, fill: 'none', disableMultiStroke: true, seed: 99 })

    /* cancel button */
    var BS = 40
    /* zoom slider track */
    var sc = sliderRef.current
    if (sc) {
      sc.width = SLIDER_W * dpr; sc.height = SLIDER_H * dpr
      sc.style.width = SLIDER_W + 'px'; sc.style.height = SLIDER_H + 'px'
      var sctx = sc.getContext('2d'); sctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      var src = rough.canvas(sc)
      src.line(SLIDER_W / 2, 8, SLIDER_W / 2, SLIDER_H - 8, {
        stroke: '#D0C8C0', strokeWidth: 1, roughness: 0.4,
        disableMultiStroke: true, seed: 70
      })
      /* + at top, - at bottom */
      sctx.fillStyle = '#B0A898'; sctx.font = "11px -apple-system, sans-serif"
      sctx.textAlign = 'center'; sctx.textBaseline = 'middle'
      sctx.fillText('+', SLIDER_W / 2, 3)
      sctx.fillText('−', SLIDER_W / 2, SLIDER_H - 2)
    }

    function drawBtn(ref, color, seed) {
      var c = ref.current; if (!c) return
      c.width = BS * dpr; c.height = BS * dpr
      c.style.width = BS + 'px'; c.style.height = BS + 'px'
      var ct = c.getContext('2d'); ct.setTransform(dpr, 0, 0, dpr, 0, 0)
      var r = rough.canvas(c)
      r.rectangle(2, 2, BS - 4, BS - 4, { stroke: color, strokeWidth: 1.2, roughness: 0.4, disableMultiStroke: true, seed: seed })
    }
    drawBtn(cancelRef, '#D0C8C0', 60)
    drawBtn(confirmRef, '#2E94B9', 65)
  }, [])

  function onTouchStart(e) {
    if (e.touches.length === 2) {
      var dx = e.touches[1].clientX - e.touches[0].clientX
      var dy = e.touches[1].clientY - e.touches[0].clientY
      pinchRef.current = { dist: Math.sqrt(dx * dx + dy * dy), scale0: scale }; return
    }
    dragRef.current = { sx: e.touches[0].clientX - pos.x, sy: e.touches[0].clientY - pos.y }
  }
  function onTouchMove(e) {
    e.preventDefault()
    if (e.touches.length === 2 && pinchRef.current) {
      var dx = e.touches[1].clientX - e.touches[0].clientX
      var dy = e.touches[1].clientY - e.touches[0].clientY
      var ns = pinchRef.current.scale0 * (Math.sqrt(dx * dx + dy * dy) / pinchRef.current.dist)
      setScale(Math.max(0.3, Math.min(ns, 8))); return
    }
    if (!dragRef.current) return
    setPos({ x: e.touches[0].clientX - dragRef.current.sx, y: e.touches[0].clientY - dragRef.current.sy })
  }
  function onTouchEnd() { dragRef.current = null; pinchRef.current = null }
  function onMouseDown(e) { dragRef.current = { sx: e.clientX - pos.x, sy: e.clientY - pos.y } }
  function onMouseMove(e) { if (!dragRef.current) return; setPos({ x: e.clientX - dragRef.current.sx, y: e.clientY - dragRef.current.sy }) }
  function onMouseUp() { dragRef.current = null }

  /* slider handlers */
  function sliderY() {
    var t = (scale - MIN_S) / (MAX_S - MIN_S)
    return 8 + (1 - t) * (SLIDER_H - 16 - KNOB)
  }
  function onSliderStart(e) {
    e.stopPropagation()
    var t = e.touches ? e.touches[0] : e
    var rect = sliderRef.current.getBoundingClientRect()
    sliderDrag.current = { baseY: rect.top }
    updateSlider(t.clientY - rect.top)
  }
  function onSliderMove(e) {
    e.stopPropagation(); e.preventDefault()
    if (!sliderDrag.current) return
    var t = e.touches ? e.touches[0] : e
    updateSlider(t.clientY - sliderDrag.current.baseY)
  }
  function onSliderEnd(e) { e.stopPropagation(); sliderDrag.current = null }
  function updateSlider(y) {
    var t = 1 - (y - 8) / (SLIDER_H - 16 - KNOB)
    t = Math.max(0, Math.min(1, t))
    setScale(MIN_S + t * (MAX_S - MIN_S))
  }

  function doConfirm() {
    var img = new Image()
    img.onload = function () {
      var off = document.createElement('canvas')
      off.width = OUT_W; off.height = OUT_H
      var ctx = off.getContext('2d')
      var p = triPts(OUT_W, OUT_H)
      ctx.beginPath()
      ctx.moveTo(p[0].x, p[0].y); ctx.lineTo(p[1].x, p[1].y); ctx.lineTo(p[2].x, p[2].y)
      ctx.closePath(); ctx.clip()
      var sx = OUT_W / CW, sy = OUT_H / CH
      ctx.drawImage(img, pos.x * sx, pos.y * sy, imgW * scale * sx, imgH * scale * sy)
      onConfirm(off.toDataURL('image/png'))
    }
    img.src = src
  }

  /* SVG mask: triangle cutout */
  var p = triPts(CW, CH)
  var triPoints = p[0].x + ',' + p[0].y + ' ' + p[1].x + ',' + p[1].y + ' ' + p[2].x + ',' + p[2].y

  var font = "-apple-system, 'PingFang SC', sans-serif"

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: HOPSCOTCH_BG, zIndex: 300,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      touchAction: 'none',
    }}>
      {/* title */}
      <div style={{ fontSize: 11, letterSpacing: 3, color: '#B0A898', fontFamily: font, marginBottom: 20 }}>
        CROP
      </div>

      {/* crop area + slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: CW, height: CH, overflow: 'hidden' }}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>

        <img src={src} draggable={false} style={{
          position: 'absolute', left: pos.x, top: pos.y,
          width: imgW * scale, height: imgH * scale,
          pointerEvents: 'none', userSelect: 'none',
        }} />

        {/* mask: dim outside triangle */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <mask id="triMask">
              <rect width="100%" height="100%" fill="white" />
              <polygon points={triPoints} fill="black" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill={HOPSCOTCH_BG} opacity="0.7" mask="url(#triMask)" />
        </svg>

        {/* rough.js triangle border */}
        <canvas ref={borderRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
      </div>

      {/* zoom slider */}
      <div style={{ position: 'relative', width: SLIDER_W, height: SLIDER_H, cursor: 'ns-resize', flexShrink: 0 }}
        onTouchStart={onSliderStart} onTouchMove={onSliderMove} onTouchEnd={onSliderEnd}
        onMouseDown={onSliderStart} onMouseMove={onSliderMove} onMouseUp={onSliderEnd} onMouseLeave={onSliderEnd}>
        <canvas ref={sliderRef} style={{ position: 'absolute', top: 0, left: 0 }} />
        <div style={{
          position: 'absolute', left: SLIDER_W / 2 - KNOB / 2, top: sliderY(),
          width: KNOB, height: KNOB, borderRadius: '50%',
          background: '#2E94B9', border: '1.5px solid #fff',
          transition: sliderDrag.current ? 'none' : 'top 0.1s ease',
        }} />
      </div>
      </div>

      {/* hint */}
      <div style={{ fontSize: 10, color: '#B0A898', fontFamily: font, marginTop: 12, letterSpacing: 1 }}>
        drag to position · slide to zoom
      </div>

      {/* buttons */}
      <div style={{ display: 'flex', gap: 40, marginTop: 20 }}>
        <div onClick={onCancel} style={{ position: 'relative', width: 40, height: 40, cursor: 'pointer' }}>
          <canvas ref={cancelRef} style={{ position: 'absolute', top: 0, left: 0 }} />
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#A09888', fontFamily: font }}>✕</div>
        </div>
        <div onClick={doConfirm} style={{ position: 'relative', width: 40, height: 40, cursor: 'pointer' }}>
          <canvas ref={confirmRef} style={{ position: 'absolute', top: 0, left: 0 }} />
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#2E94B9', fontFamily: font }}>✓</div>
        </div>
      </div>
    </div>
  )
}
