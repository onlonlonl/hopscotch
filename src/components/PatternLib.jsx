// PatternLib — repeating tile patterns drawn with Canvas 2D + Rough.js
import rough from 'roughjs'

var RO = { roughness: 0.6, bowing: 0.4, disableMultiStroke: true }

export var patternTypes = [
  { id: 'h_stripe', label: 'H stripe' },
  { id: 'v_stripe', label: 'V stripe' },
  { id: 'd_stripe', label: 'D stripe' },
  { id: 'polka', label: 'polka' },
  { id: 'grid', label: 'grid' },
  { id: 'star', label: 'star' },
  { id: 'heart', label: 'heart' },
  { id: 'cross', label: 'cross' },
  { id: 'checker', label: 'checker' },
  { id: 'wave', label: 'wave' },
  { id: 'diamond', label: 'diamond' },
]

export var colorPresets = [
  { id: 'rose', fg: '#D0A0A0', bg: '#F8EEEE' },
  { id: 'clay', fg: '#C48A7A', bg: '#FAF0EC' },
  { id: 'orange', fg: '#D89A6C', bg: '#FAF2EA' },
  { id: 'yellow', fg: '#D4B878', bg: '#FAF6EA' },
  { id: 'sage', fg: '#9BB89C', bg: '#F0F5F0' },
  { id: 'sky', fg: '#7BA7BC', bg: '#EEF4F8' },
  { id: 'lavender', fg: '#C4A6D0', bg: '#F4EFF8' },
  { id: 'cream', fg: '#D4C4B0', bg: '#FAF6F0' },
]

export var patternDrawers = {
  h_stripe: function(ctx, rc, s, fg) {
    var gap = s / 4
    for (var y = gap / 2; y < s; y += gap)
      rc.line(0, y, s, y, { stroke: fg, strokeWidth: 1.2, ...RO, seed: Math.floor(y * 7) })
  },
  v_stripe: function(ctx, rc, s, fg) {
    var gap = s / 4
    for (var x = gap / 2; x < s; x += gap)
      rc.line(x, 0, x, s, { stroke: fg, strokeWidth: 1.2, ...RO, seed: Math.floor(x * 7) })
  },
  d_stripe: function(ctx, rc, s, fg) {
    var gap = s / 3
    var lo = { stroke: fg, strokeWidth: 1, roughness: 0.3, bowing: 0.2, disableMultiStroke: true }
    for (var i = -2; i < 5; i++) {
      var off = i * gap
      rc.line(off, -2, off + s + 2, s + 2, { ...lo, seed: 100 + i * 11 })
    }
  },
  polka: function(ctx, rc, s, fg) {
    var r = s * 0.1, gap = s / 2
    for (var row = 0; row < 2; row++)
      for (var col = 0; col < 2; col++) {
        // no offset
        rc.circle(gap * 0.5 + col * gap, gap * 0.5 + row * gap, r * 2, {
          fill: fg, fillStyle: 'solid', stroke: fg, strokeWidth: 0.5, ...RO, seed: 200 + row * 10 + col
        })
      }
  },
  grid: function(ctx, rc, s, fg) {
    var gap = s / 3
    for (var i = 1; i < 3; i++) {
      rc.line(i * gap, 0, i * gap, s, { stroke: fg, strokeWidth: 0.8, ...RO, seed: 300 + i })
      rc.line(0, i * gap, s, i * gap, { stroke: fg, strokeWidth: 0.8, ...RO, seed: 310 + i })
    }
  },
  star: function(ctx, rc, s, fg) {
    var cx = s / 2, cy = s / 2, r = s * 0.25
    for (var a = 0; a < 4; a++) {
      var ang = a * Math.PI / 4
      rc.line(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r,
              cx - Math.cos(ang) * r, cy - Math.sin(ang) * r,
              { stroke: fg, strokeWidth: 1, ...RO, seed: 400 + a })
    }
  },
  heart: function(ctx, rc, s, fg) {
    var cx = s / 2, cy = s / 2, sz = s * 0.3
    rc.circle(cx - sz * 0.3, cy - sz * 0.15, sz * 0.55, { stroke: fg, strokeWidth: 0.8, ...RO, seed: 500 })
    rc.circle(cx + sz * 0.3, cy - sz * 0.15, sz * 0.55, { stroke: fg, strokeWidth: 0.8, ...RO, seed: 501 })
    rc.line(cx - sz * 0.55, cy + sz * 0.05, cx, cy + sz * 0.6, { stroke: fg, strokeWidth: 0.8, ...RO, seed: 502 })
    rc.line(cx + sz * 0.55, cy + sz * 0.05, cx, cy + sz * 0.6, { stroke: fg, strokeWidth: 0.8, ...RO, seed: 503 })
  },
  cross: function(ctx, rc, s, fg) {
    var gap = s / 3, sz = gap * 0.3
    for (var row = 0; row < 3; row++)
      for (var col = 0; col < 3; col++)
        if ((row + col) % 2 === 0) {
          var cx = col * gap + gap / 2, cy = row * gap + gap / 2
          rc.line(cx - sz, cy, cx + sz, cy, { stroke: fg, strokeWidth: 1, ...RO, seed: 600 + row * 10 + col })
          rc.line(cx, cy - sz, cx, cy + sz, { stroke: fg, strokeWidth: 1, ...RO, seed: 610 + row * 10 + col })
        }
  },
  checker: function(ctx, rc, s, fg) {
    var gap = s / 4
    for (var row = 0; row < 4; row++)
      for (var col = 0; col < 4; col++)
        if ((row + col) % 2 === 0)
          rc.rectangle(col * gap, row * gap, gap, gap, {
            fill: fg, fillStyle: 'solid', stroke: 'none', strokeWidth: 0, ...RO, seed: 700 + row * 10 + col
          })
  },
  wave: function(ctx, rc, s, fg) {
    var amp = s * 0.08, gap = s / 3
    for (var row = 0; row < 3; row++) {
      var y = row * gap + gap / 2
      var pts = []
      for (var x = 0; x <= s; x += s / 8) pts.push([x, y + Math.sin(x / s * Math.PI * 2) * amp])
      for (var p = 0; p < pts.length - 1; p++)
        rc.line(pts[p][0], pts[p][1], pts[p + 1][0], pts[p + 1][1], { stroke: fg, strokeWidth: 1, ...RO, seed: 800 + row * 20 + p })
    }
  },
  diamond: function(ctx, rc, s, fg) {
    var cx = s / 2, cy = s / 2, r = s * 0.25
    rc.line(cx, cy - r, cx + r, cy, { stroke: fg, strokeWidth: 1, ...RO, seed: 900 })
    rc.line(cx + r, cy, cx, cy + r, { stroke: fg, strokeWidth: 1, ...RO, seed: 901 })
    rc.line(cx, cy + r, cx - r, cy, { stroke: fg, strokeWidth: 1, ...RO, seed: 902 })
    rc.line(cx - r, cy, cx, cy - r, { stroke: fg, strokeWidth: 1, ...RO, seed: 903 })
  },
}

// render pattern to fill a specific pixel area with high density
export function renderPatternFill(canvas, patternId, colorId, pxW, pxH, offX, offY, customTile) {
  if (!canvas) return
  var drawer = patternDrawers[patternId]
  if (!drawer) return
  var preset = colorPresets.find(function(p) { return p.id === colorId }) || colorPresets[0]
  var tileSize = customTile || 18
  var dpr = Math.min(window.devicePixelRatio || 1, 3)
  canvas.width = pxW * dpr; canvas.height = pxH * dpr
  canvas.style.width = pxW + 'px'; canvas.style.height = pxH + 'px'
  var ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = preset.bg; ctx.fillRect(0, 0, pxW, pxH)
  var colsN = Math.ceil(pxW / tileSize), rowsN = Math.ceil(pxH / tileSize)
  // draw one tile and reuse
  var tCvs = document.createElement('canvas')
  tCvs.width = tileSize * dpr; tCvs.height = tileSize * dpr
  var tCtx = tCvs.getContext('2d'); tCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  var rc = rough.canvas(tCvs)
  drawer(tCtx, rc, tileSize, preset.fg)
  var ox = offX || 0, oy = offY || 0
  for (var ty = -1; ty <= rowsN; ty++)
    for (var tx = -1; tx <= colsN; tx++)
      ctx.drawImage(tCvs, 0, 0, tileSize * dpr, tileSize * dpr, tx * tileSize + ox, ty * tileSize + oy, tileSize, tileSize)
}

export function renderPattern(canvas, patternId, colorId, repeat) {
  if (!canvas) return
  var drawer = patternDrawers[patternId]
  if (!drawer) return
  var preset = colorPresets.find(function(p) { return p.id === colorId }) || colorPresets[0]
  var rep = repeat || 2
  var tileSize = 32
  var totalSize = tileSize * rep
  var dpr = Math.min(window.devicePixelRatio || 1, 3)
  canvas.width = totalSize * dpr; canvas.height = totalSize * dpr
  canvas.style.width = totalSize + 'px'; canvas.style.height = totalSize + 'px'
  var ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = preset.bg; ctx.fillRect(0, 0, totalSize, totalSize)
  for (var ty = 0; ty < rep; ty++)
    for (var tx = 0; tx < rep; tx++) {
      ctx.save(); ctx.translate(tx * tileSize, ty * tileSize)
      ctx.beginPath(); ctx.rect(0, 0, tileSize, tileSize); ctx.clip()
      var tCvs = document.createElement('canvas')
      tCvs.width = tileSize * dpr; tCvs.height = tileSize * dpr
      var tCtx = tCvs.getContext('2d'); tCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      var rc = rough.canvas(tCvs)
      drawer(tCtx, rc, tileSize, preset.fg)
      ctx.drawImage(tCvs, 0, 0, tileSize * dpr, tileSize * dpr, 0, 0, tileSize, tileSize)
      ctx.restore()
    }
}
