import { useRef, useEffect, useState, useCallback } from 'react'
import rough from 'roughjs'

var PAPER_WHITE = '#F8F8F6'

function drawBadge(cvs, idx, loc, w, h) {
  var dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = w * dpr; cvs.height = h * dpr
  cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
  var ctx = cvs.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  var rc = rough.canvas(cvs)
  var s = Math.min(w, h) / 88

  /* paper dimensions (bg drawn separately) */
  var pad = 6 * s
  var pw = w - pad * 2, ph = h - pad * 2.5

  /* center of paper area */
  var cx = w / 2, cy = pad + 2 * s + ph * 0.45
  var c = loc ? (loc.color || '#E8A87C') : '#E8A87C'
  var ro = { roughness: 0.5, bowing: 0.8, disableMultiStroke: true }

  /* label position */
  var labelY = pad + 2 * s + ph - 4 * s

  if (idx === 0) {
    /* Ink: rectangle frame + dot — fill most of paper */
    var fw = pw * 0.6, fh = ph * 0.45
    rc.rectangle(cx - fw / 2, cy - fh / 2, fw, fh, {
      stroke: '#C0B8A8', strokeWidth: 0.6, ...ro, seed: 10
    })
    ctx.fillStyle = c; ctx.globalAlpha = 0.8
    ctx.beginPath(); ctx.arc(cx, cy, 3 * s, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 0.45; ctx.fillStyle = '#8A7A68'
    ctx.font = Math.max(7, Math.round(8 * s)) + "px -apple-system, 'PingFang SC', sans-serif"
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('Ink', cx, labelY)
    ctx.globalAlpha = 1

  } else if (idx === 1) {
    /* Thread: lemniscate + dot — larger curve */
    var lr = pw * 0.3
    ctx.strokeStyle = c; ctx.lineWidth = 0.9 * s; ctx.globalAlpha = 0.55
    ctx.beginPath()
    for (var i = 0; i <= 60; i++) {
      var t = i / 60 * Math.PI * 2, si = Math.sin(t), co = Math.cos(t), d = 1 + si * si
      var px = cx + lr * co / d, py = cy + lr * 0.7 * si * co / d
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    }
    ctx.stroke()
    var inf_t = loc ? (loc.inf_t || 0.127) : 0.127
    var a2 = inf_t * Math.PI * 2, s2 = Math.sin(a2), c2 = Math.cos(a2), d2 = 1 + s2 * s2
    ctx.globalAlpha = 1; ctx.fillStyle = c
    ctx.beginPath(); ctx.arc(cx + lr * c2 / d2, cy + lr * 0.7 * s2 * c2 / d2, 3 * s, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 0.45; ctx.fillStyle = '#8A7A68'
    ctx.font = Math.max(7, Math.round(8 * s)) + "px -apple-system, 'PingFang SC', sans-serif"
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('Thread', cx, labelY)
    ctx.globalAlpha = 1

  } else {
    /* Compass: circle + crosshairs + dot — larger */
    var cr = Math.min(pw, ph) * 0.3
    ctx.strokeStyle = '#B0A898'; ctx.lineWidth = 0.5 * s; ctx.globalAlpha = 0.4
    ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx - cr - 3 * s, cy); ctx.lineTo(cx + cr + 3 * s, cy)
    ctx.moveTo(cx, cy - cr - 3 * s); ctx.lineTo(cx, cy + cr + 3 * s)
    ctx.stroke()
    ctx.globalAlpha = 0.8; ctx.fillStyle = c
    ctx.beginPath(); ctx.arc(cx + 4 * s, cy - 5 * s, 3 * s, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 0.45; ctx.fillStyle = '#8A7A68'
    ctx.font = Math.max(7, Math.round(8 * s)) + "px -apple-system, 'PingFang SC', sans-serif"
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('Compass', cx, labelY)
    ctx.globalAlpha = 1
  }
}

export default function MapCell({ cellRect, locations }) {
  var frontRef = useRef(null), backRef = useRef(null)
  var [current, setCurrent] = useState(0)
  var [phase, setPhase] = useState('show') /* show | fadeOut | fadeIn */
  var timerRef = useRef(null)
  var nextRef = useRef(1)

  var home = locations && locations.length > 0 ? locations[0] : null

  /* paint front canvas with current badge */
  useEffect(function () {
    if (!cellRect || !frontRef.current) return
    drawBadge(frontRef.current, current, home, cellRect.w, cellRect.h)
  }, [current, cellRect, home])

  /* cycle: show 8s → fadeOut 0.5s → swap + fadeIn 0.5s → show */
  useEffect(function () {
    timerRef.current = setInterval(function () {
      nextRef.current = (nextRef.current) % 3
      /* pre-render next on back canvas */
      if (backRef.current && cellRect) {
        drawBadge(backRef.current, nextRef.current, home, cellRect.w, cellRect.h)
      }
      /* fade out front */
      setPhase('fadeOut')
      setTimeout(function () {
        /* swap: set current to next, front will repaint */
        setCurrent(nextRef.current)
        nextRef.current = (nextRef.current + 1) % 3
        setPhase('fadeIn')
        setTimeout(function () {
          setPhase('show')
        }, 500)
      }, 500)
    }, 8000)
    return function () { clearInterval(timerRef.current) }
  }, [cellRect, home])

  /* draw static paper background once */
  var bgRef = useRef(null)
  useEffect(function () {
    if (!cellRect || !bgRef.current) return
    var cvs = bgRef.current, w = cellRect.w, h = cellRect.h
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    var s = Math.min(w, h) / 88, pad = 6 * s
    rc.rectangle(pad, pad + 2 * s, w - pad * 2, h - pad * 2.5, {
      stroke: '#E0D8D0', strokeWidth: 0.6, roughness: 0.4,
      fill: PAPER_WHITE, fillStyle: 'solid',
      disableMultiStroke: true, seed: 42
    })
  }, [cellRect])

  if (!cellRect) return null

  var opacity = phase === 'fadeOut' ? 0 : 1
  var base = { position: 'absolute', left: cellRect.x, top: cellRect.y, width: cellRect.w, height: cellRect.h }

  return <>
    <canvas ref={bgRef} style={{ ...base, zIndex: 0 }} />
    <canvas ref={frontRef} style={{
      ...base, zIndex: 1,
      opacity: opacity,
      transition: phase === 'show' ? 'none' : 'opacity 0.5s ease',
    }} />
  </>
}
