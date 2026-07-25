import { useRef, useEffect, useState, useCallback } from 'react'
import rough from 'roughjs'
import { supaGet, isConnected } from '../lib/supabase'
import { HOPSCOTCH_BG } from '../lib/tokens'

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

/* individual note card drawn on canvas */
function NoteCard({ note, index }) {
  var canvasRef = useRef(null)
  var containerRef = useRef(null)
  var [ready, setReady] = useState(false)

  useEffect(function () {
    /* wait one frame so container has layout */
    requestAnimationFrame(function () { setReady(true) })
  }, [])

  useEffect(function () {
    if (!ready) return
    var cvs = canvasRef.current
    var container = containerRef.current
    if (!cvs || !container) return

    var W = container.offsetWidth, H = container.offsetHeight
    if (W < 2 || H < 2) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = W * dpr; cvs.height = H * dpr
    cvs.style.width = W + 'px'; cvs.style.height = H + 'px'
    var ctx = cvs.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    var rc = rough.canvas(cvs)

    /* paper */
    var pad = 4
    rc.rectangle(pad, pad + 12, W - pad * 2, H - pad * 2 - 12, {
      stroke: '#E0D8D0', strokeWidth: 0.7, roughness: 0.35,
      fill: PAPER_WHITE, fillStyle: 'solid',
      disableMultiStroke: true, seed: 42 + index * 7
    })

    /* paperclip top-left */
    var clipColor = note.clip_color || CLIP_COLORS[index % CLIP_COLORS.length]
    drawClip(rc, pad + 8, 2, 10, 28, clipColor, 77 + index * 13)
  }, [note, index, ready])

  /* format date */
  var d = new Date(note.created_at)
  var dateStr = d.getFullYear() + '.' +
    String(d.getMonth() + 1).padStart(2, '0') + '.' +
    String(d.getDate()).padStart(2, '0')

  return (
    <div ref={containerRef} style={{
      position: 'relative', width: '100%',
      minHeight: 80, marginBottom: 14,
    }}>
      <canvas ref={canvasRef} style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'relative', zIndex: 1,
        padding: '24px 18px 16px 32px',
      }}>
        <div style={{
          fontSize: 9, color: '#B0A898', letterSpacing: 1,
          marginBottom: 6, fontFamily: "-apple-system, 'PingFang SC', sans-serif",
        }}>
          {dateStr}
          <span style={{ marginLeft: 8, opacity: 0.6 }}>
            {note.author === 'iris' ? '\uD83C\uDF19' : '\uD83D\uDCA1'}
          </span>
        </div>
        <div style={{
          fontSize: 13, lineHeight: 1.7, color: '#5A5248',
          fontFamily: "-apple-system, 'PingFang SC', sans-serif",
          wordBreak: 'break-word',
        }}>
          {note.content}
        </div>
      </div>
    </div>
  )
}

export default function NotesView({ onExit }) {
  var [notes, setNotes] = useState([])
  var backRef = useRef(null)

  useEffect(function () {
    if (!isConnected()) return
    supaGet('hopscotch_notes', 'order=created_at.desc&limit=50')
      .then(function (r) { if (r) setNotes(r) })
  }, [])

  /* draw back button — reuse same style as map view */
  useEffect(function () {
    var cvs = backRef.current; if (!cvs) return
    var S = 36, dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = S * dpr; cvs.height = S * dpr
    cvs.style.width = S + 'px'; cvs.style.height = S + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.rectangle(2, 2, S - 4, S - 4, {
      stroke: '#D0C8C0', strokeWidth: 1, roughness: 0.5,
      fill: 'rgba(255,255,255,0.85)', fillStyle: 'solid',
      disableMultiStroke: true, seed: 77
    })
    rc.line(22, 12, 12, 18, { stroke: '#8A7A68', strokeWidth: 1.3, roughness: 0.4, disableMultiStroke: true, seed: 78 })
    rc.line(12, 18, 22, 24, { stroke: '#8A7A68', strokeWidth: 1.3, roughness: 0.4, disableMultiStroke: true, seed: 79 })
  }, [])

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: HOPSCOTCH_BG, zIndex: 200,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* back button */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 210 }}>
        <canvas ref={backRef} onClick={onExit} style={{ cursor: 'pointer' }} />
      </div>

      {/* title */}
      <div style={{
        textAlign: 'center', paddingTop: 18, paddingBottom: 8,
        fontSize: 11, letterSpacing: 3, color: '#B0A898',
        fontFamily: "-apple-system, 'PingFang SC', sans-serif",
      }}>
        NOTES
      </div>

      {/* scrollable notes list */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: '8px 20px 40px',
        WebkitOverflowScrolling: 'touch',
      }}>
        {notes.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '40px 0',
            fontSize: 12, color: '#B0A898',
            fontFamily: "-apple-system, 'PingFang SC', sans-serif",
          }}>
            no notes yet.
          </div>
        )}
        {notes.map(function (n, i) {
          return <NoteCard key={n.id} note={n} index={i} />
        })}
      </div>
    </div>
  )
}
