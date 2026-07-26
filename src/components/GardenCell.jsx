import { useRef, useEffect, useCallback } from 'react'
import rough from 'roughjs'

var PAPER = '#F8F8F6'
var STAGES = ['Seed','Sprout','Leaf','Bud','Bloom','Glory']
var THRESHOLDS = [0, 5, 12, 22, 33, 45]

/* draw a rough flower pot */
function drawPot(rc, ctx, cx, bottomY, s) {
  var topW = 18 * s, botW = 12 * s, potH = 14 * s, rimH = 3 * s
  var rimY = bottomY - potH - rimH

  /* rim */
  rc.rectangle(cx - topW / 2 - 1 * s, rimY, topW + 2 * s, rimH, {
    stroke: '#C07850', strokeWidth: 1.2, fill: '#D08860', fillStyle: 'solid',
    roughness: 0.6, disableMultiStroke: true, seed: 300
  })

  /* pot body (trapezoid as polygon) */
  var tl = cx - topW / 2, tr = cx + topW / 2
  var bl = cx - botW / 2, br = cx + botW / 2
  var potTop = rimY + rimH, potBot = bottomY
  rc.polygon([[tl, potTop], [tr, potTop], [br, potBot], [bl, potBot]], {
    stroke: '#C07850', strokeWidth: 1, fill: '#D4956A', fillStyle: 'solid',
    roughness: 0.5, disableMultiStroke: true, seed: 301
  })

  /* soil line */
  var soilY = rimY + rimH + 1 * s
  rc.line(tl + 2 * s, soilY, tr - 2 * s, soilY, {
    stroke: '#8B6C52', strokeWidth: 1, roughness: 0.8, disableMultiStroke: true, seed: 302
  })
}

/* tiny sprout indicators for stages 1-5 */
function drawSprout(rc, ctx, cx, potTopY, stage, s) {
  if (stage < 1) return
  var stemColor = '#6AAF5C'
  var leafColor = '#7BC46A'
  var flowerColor = '#ECC44E'

  var stemH = (4 + stage * 3) * s
  var stemTop = potTopY - stemH

  /* stem */
  rc.line(cx, potTopY, cx, stemTop, {
    stroke: stemColor, strokeWidth: 1.2, roughness: 0.5,
    disableMultiStroke: true, seed: 310
  })

  if (stage >= 2) {
    /* left leaf */
    rc.ellipse(cx - 4 * s, stemTop + stemH * 0.5, 5 * s, 3 * s, {
      stroke: leafColor, strokeWidth: 0.8, fill: leafColor, fillStyle: 'solid',
      roughness: 0.6, disableMultiStroke: true, seed: 311
    })
  }
  if (stage >= 3) {
    /* right leaf */
    rc.ellipse(cx + 4 * s, stemTop + stemH * 0.35, 5 * s, 3 * s, {
      stroke: leafColor, strokeWidth: 0.8, fill: leafColor, fillStyle: 'solid',
      roughness: 0.6, disableMultiStroke: true, seed: 312
    })
  }
  if (stage >= 4) {
    /* flower bud / bloom */
    rc.circle(cx, stemTop - 2 * s, 6 * s, {
      stroke: flowerColor, strokeWidth: 1, fill: flowerColor, fillStyle: 'solid',
      roughness: 0.5, disableMultiStroke: true, seed: 313
    })
  }
  if (stage >= 5) {
    /* extra petals */
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * Math.PI * 2 - Math.PI / 2
      var px = cx + Math.cos(a) * 5 * s
      var py = stemTop - 2 * s + Math.sin(a) * 5 * s
      rc.circle(px, py, 3 * s, {
        stroke: '#E8A87C', strokeWidth: 0.6, fill: '#E8A87C', fillStyle: 'solid',
        roughness: 0.4, disableMultiStroke: true, seed: 320 + i
      })
    }
    rc.circle(cx, stemTop - 2 * s, 4 * s, {
      stroke: flowerColor, strokeWidth: 0.8, fill: flowerColor, fillStyle: 'solid',
      roughness: 0.4, disableMultiStroke: true, seed: 326
    })
  }
}


/* render shapes from stamps JSON */
function drawFromJSON(rc, ctx, shapes, cx, cy, s) {
  if (!shapes || !shapes.length) return
  for (var i = 0; i < shapes.length; i++) {
    var sh = shapes[i]
    var opts = { roughness: 0.6, disableMultiStroke: true, seed: 450 + i * 3 }
    if (sh.fill) { opts.fill = sh.fill; opts.fillStyle = 'solid' }
    if (sh.stroke) opts.stroke = sh.stroke
    opts.strokeWidth = sh.sw || 1.2
    if (sh.t === 'circle') {
      rc.circle(cx + sh.x * s, cy + sh.y * s, (sh.r || 3) * 2 * s, opts)
    } else if (sh.t === 'ellipse') {
      rc.ellipse(cx + sh.x * s, cy + sh.y * s, (sh.w || 6) * s, (sh.h || 3) * s, opts)
    } else if (sh.t === 'line') {
      rc.line(cx + sh.x1 * s, cy + sh.y1 * s, cx + sh.x2 * s, cy + sh.y2 * s, opts)
    } else if (sh.t === 'rect') {
      rc.rectangle(cx + sh.x * s, cy + sh.y * s, (sh.w || 4) * s, (sh.h || 4) * s, opts)
    }
  }
}

function renderCell(cvs, garden, w, h) {
  var dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = w * dpr; cvs.height = h * dpr
  cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
  var ctx = cvs.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  var rc = rough.canvas(cvs)
  var s = Math.min(w, h) / 88

  /* paper background */
  var pad = 6 * s
  rc.rectangle(pad, pad, w - pad * 2, h - pad * 2, {
    stroke: '#E0D8D0', strokeWidth: 0.6, roughness: 0.4,
    fill: PAPER, fillStyle: 'solid',
    disableMultiStroke: true, seed: 400
  })

  var cx = w / 2
  var bottomY = h - pad - 6 * s

  /* pot */
  drawPot(rc, ctx, cx, bottomY, s)

  /* plant based on stage */
  var stage = 0
  if (garden) {
    var days = Math.floor((Date.now() - new Date(garden.planted_at).getTime()) / 86400000)
    var score = days
    for (var i = THRESHOLDS.length - 1; i >= 0; i--) {
      if (score >= THRESHOLDS[i]) { stage = i; break }
    }
  }
  var potTopY = bottomY - 14 * s - 3 * s
  drawSprout(rc, ctx, cx, potTopY, stage, s)

  /* stage label */
  if (garden) {
    ctx.fillStyle = '#9A8A7A'
    var fs = Math.max(6, Math.round(7 * s))
    ctx.font = fs + "px -apple-system, 'PingFang SC', sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(STAGES[stage], cx, pad + 3 * s)
  } else {
    ctx.fillStyle = '#B8A898'
    var fs2 = Math.max(7, Math.round(8 * s))
    ctx.font = fs2 + "px -apple-system, 'PingFang SC', sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Garden', cx, h / 2 - 4 * s)
  }
}

export default function GardenCell({ cellRect, garden, onTap }) {
  var canvasRef = useRef(null)

  var paint = useCallback(function () {
    var cvs = canvasRef.current
    if (!cvs || !cellRect) return
    renderCell(cvs, garden, cellRect.w, cellRect.h)
  }, [garden, cellRect])

  useEffect(function () { paint() }, [paint])

  if (!cellRect) return null
  return <canvas ref={canvasRef} onClick={onTap} style={{
    position: 'absolute', left: cellRect.x, top: cellRect.y,
    width: cellRect.w, height: cellRect.h, cursor: 'pointer'
  }} />
}