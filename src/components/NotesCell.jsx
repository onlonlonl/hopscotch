import { useRef, useEffect, useState, useCallback } from 'react'
import rough from 'roughjs'
import { supaGet, isConnected } from '../lib/supabase'

var CLIP_COLORS = ['#E8A87C','#7BA7BC','#9BB89C','#C4A6D0','#D4B896','#D0A0A0','#A8B89A','#B8C4D0']
var PAPER_WHITE = '#F8F8F6'

/* draw a paperclip — real Gem-style single wire path */
function drawClip(rc, x, y, w, h, color, seed) {
  var gap = w * 0.25
  var r = w * 0.35

  var ol = x, or_ = x + w, ot = y, ob = y + h
  var il = ol + gap, ir = or_ - gap, it = ot + h * 0.3, ib = ob - gap

  var d = ''
  d += 'M ' + il + ' ' + (ib - r * 0.3)
  d += ' L ' + il + ' ' + ib
  d += ' Q ' + il + ' ' + ob + ' ' + ol + ' ' + ob
  d += ' L ' + (ol + r) + ' ' + ob
  d += ' Q ' + ol + ' ' + ob + ' ' + ol + ' ' + (ob - r)
  d += ' L ' + ol + ' ' + (ot + r)
  d += ' Q ' + ol + ' ' + ot + ' ' + (ol + r) + ' ' + ot
  d += ' L ' + (or_ - r) + ' ' + ot
  d += ' Q ' + or_ + ' ' + ot + ' ' + or_ + ' ' + (ot + r)
  d += ' L ' + or_ + ' ' + (ob - r)
  d += ' Q ' + or_ + ' ' + ob + ' ' + (or_ - r) + ' ' + ob
  d += ' L ' + (ir + r * 0.5) + ' ' + ob
  d += ' Q ' + ir + ' ' + ob + ' ' + ir + ' ' + (ob - gap)
  d += ' L ' + ir + ' ' + (it + r * 0.6)
  d += ' Q ' + ir + ' ' + it + ' ' + (ir - r * 0.6) + ' ' + it
  d += ' L ' + (il + r * 0.6) + ' ' + it
  d += ' Q ' + il + ' ' + it + ' ' + il + ' ' + (it + r * 0.6)
  d += ' L ' + il + ' ' + (ib - r * 0.3)

  rc.path(d, {
    stroke: color, strokeWidth: 1.4, roughness: 0.3,
    fill: 'none', disableMultiStroke: true, seed: seed
  })
}

/* draw the cell preview: paper + clip + text */
function renderCell(cvs, note, cellW, cellH) {
  var dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = cellW * dpr; cvs.height = cellH * dpr
  cvs.style.width = cellW + 'px'; cvs.style.height = cellH + 'px'
  var ctx = cvs.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  var rc = rough.canvas(cvs)
  var s = Math.min(cellW, cellH) / 88

  /* hint of old paper underneath, offset */
  var pad = 6 * s
  var pw = cellW - pad * 2, ph = cellH - pad * 2.5
  rc.rectangle(pad + 3 * s, pad + 4 * s, pw, ph, {
    stroke: '#E8E0D8', strokeWidth: 0.4, roughness: 0.3,
    fill: '#F4F4F2', fillStyle: 'solid',
    disableMultiStroke: true, seed: 55
  })

  /* front paper */
  rc.rectangle(pad, pad + 2 * s, pw, ph, {
    stroke: '#E0D8D0', strokeWidth: 0.6, roughness: 0.4,
    fill: PAPER_WHITE, fillStyle: 'solid',
    disableMultiStroke: true, seed: 42
  })

  /* paperclip at top-left of paper */
  var clipW = 5 * s, clipH = 16 * s
  var clipX = pad + 3 * s, clipY = pad - 3 * s
  var clipColor = note ? note.clip_color : CLIP_COLORS[0]
  drawClip(rc, clipX, clipY, clipW, clipH, clipColor, 77)

  /* text on paper */
  if (!note) {
    ctx.fillStyle = '#E0DAD4'
    var phSize = Math.max(7, Math.round(8 * s))
    ctx.font = phSize + "px -apple-system, 'PingFang SC', sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('a note will find its way here', cellW / 2, cellH / 2 + 4 * s)
  }
  if (note) {
    ctx.fillStyle = '#6A6058'
    var fontSize = Math.max(7, Math.round(9 * s))
    ctx.font = fontSize + "px -apple-system, 'PingFang SC', sans-serif"
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    var textX = pad + 3 * s
    var textY = pad + 16 * s
    var maxW = pw - 7 * s
    var lineH = fontSize * 1.5
    var maxLines = Math.floor((ph - 20 * s) / lineH)
    if (maxLines < 1) maxLines = 1

    var text = note.content || ''
    var indent = fontSize * 1.5
    var lines = [], line = '', isFirst = true
    for (var i = 0; i < text.length; i++) {
      var test = line + text[i]
      var curMaxW = isFirst ? maxW - indent : maxW
      if (ctx.measureText(test).width > curMaxW && line.length > 0) {
        lines.push(line); line = text[i]; isFirst = false
      } else { line = test }
    }
    if (line) lines.push(line)

    for (var j = 0; j < Math.min(lines.length, maxLines); j++) {
      var t = lines[j]
      if (j === maxLines - 1 && j < lines.length - 1) {
        while (ctx.measureText(t + '\u2026').width > maxW && t.length > 1) t = t.slice(0, -1)
        t += '\u2026'
      }
      ctx.fillText(t, textX + (j === 0 ? fontSize * 1.5 : 0), textY + j * lineH)
    }
  }
}

export default function NotesCell({ cellRect, onTap }) {
  var canvasRef = useRef(null)
  var [latest, setLatest] = useState(null)

  useEffect(function () {
    if (!isConnected()) return
    supaGet('hopscotch_notes', 'order=created_at.desc&limit=1')
      .then(function (r) { if (r && r.length > 0) setLatest(r[0]) })
  }, [])

  var paint = useCallback(function () {
    var cvs = canvasRef.current
    if (!cvs || !cellRect) return
    renderCell(cvs, latest, cellRect.w, cellRect.h)
  }, [latest, cellRect])

  useEffect(function () { paint() }, [paint])

  if (!cellRect) return null
  return <canvas ref={canvasRef} onClick={onTap} style={{
    position: 'absolute', left: cellRect.x, top: cellRect.y,
    width: cellRect.w, height: cellRect.h, cursor: 'pointer'
  }} />
}
