
// ThreadView.jsx — the infinity dimension
// Rough.js hand-drawn lemniscate with color dye, CSS 3D rotation, bottom nav panel
import { useRef, useEffect, useState, useCallback } from 'react'
import rough from 'roughjs'

// === Lemniscate math ===
function lem(t, ox, oy, sc, yOff) {
  const a = t * Math.PI * 2
  const s = Math.sin(a), c = Math.cos(a), d = 1 + s * s
  return [ox + sc * c / d, oy + sc * s * c / d + (yOff || 0)]
}

function parseHex(h) {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]
}

function getColor(t, alpha, locations, baseRGB) {
  let tw = 0, r = 0, g = 0, b = 0
  for (const loc of locations) {
    const d = Math.min(Math.abs(t - loc.inf_t), Math.abs(t - loc.inf_t + 1), Math.abs(t - loc.inf_t - 1))
    const sp = 0.005 + (loc.inf_w || 0.5) * 0.012
    if (d < sp) {
      const raw = 1 - d / sp, w = raw * raw * (3 - 2 * raw)
      const [cr, cg, cb] = parseHex(loc.color || '#C0B0A0')
      r += cr * w; g += cg * w; b += cb * w; tw += w
    }
  }
  const [br, bg, bb] = baseRGB
  if (tw > 0) {
    r /= tw; g /= tw; b /= tw
    const bl = Math.min(tw, 1)
    r = br*(1-bl) + r*bl; g = bg*(1-bl) + g*bl; b = bb*(1-bl) + b*bl
  } else { r = br; g = bg; b = bb }
  return 'rgba('+Math.round(r)+','+Math.round(g)+','+Math.round(b)+','+alpha+')'
}

function getTimeBg() {
  const h = new Date().getHours()
  let r = 250, g = 246, b = 240
  if (h >= 17 && h < 19) { r += 3; g -= 2; b -= 5 }
  else if (h >= 19 && h < 23) { r -= 4; g -= 2; b += 3 }
  else if (h >= 23 || h < 5) { r -= 6; g -= 4; b += 4 }
  return 'rgb('+r+','+g+','+b+')'
}

// === Drawing ===
const SAMPLES = 180, SEG = 6
const LINE_PASSES = [
  { seed: 1, rough: 1.2, sw: 0.9, yOff: -3, alpha: 0.35 },
  { seed: 13, rough: 0.8, sw: 1.1, yOff: 0, alpha: 0.45 },
  { seed: 25, rough: 1.0, sw: 0.85, yOff: 3.5, alpha: 0.3 },
]
const BASE_RGB = [205, 195, 182]

function drawInfinity(canvas, locs, sc, ox, oy) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const rc = rough.canvas(canvas)
  for (const pass of LINE_PASSES) {
    for (let s = 0; s < SAMPLES; s += SEG) {
      const pts = []
      for (let i = s; i <= Math.min(s + SEG, SAMPLES); i++) pts.push(lem(i / SAMPLES, ox, oy, sc, pass.yOff))
      if (pts.length >= 2)
        rc.curve(pts, { seed: pass.seed + s, roughness: pass.rough, strokeWidth: pass.sw, stroke: getColor((s + SEG/2) / SAMPLES, pass.alpha, locs, BASE_RGB), disableMultiStroke: true, bowing: 0.8 })
    }
  }
  // Decorations
  ctx.save()
  ctx.strokeStyle = 'rgb(170,160,148)'; ctx.fillStyle = 'rgb(170,160,148)'
  ctx.lineWidth = 1; ctx.lineCap = 'round'
  const decos = [
    { x: ox-sc*1.3, y: oy-sc*0.6, t: 'star' }, { x: ox+sc*1.35, y: oy+sc*0.5, t: 'spiral' },
    { x: ox-sc*0.3, y: oy-sc*1.15, t: 'dot' }, { x: ox+sc*0.5, y: oy+sc*1.1, t: 'dot' },
    { x: ox+sc*1.2, y: oy-sc*0.8, t: 'star' }, { x: ox-sc*1.1, y: oy+sc*0.9, t: 'spiral' },
  ]
  for (const d of decos) {
    ctx.globalAlpha = d.t === 'dot' ? 0.08 : 0.1
    if (d.t === 'star') {
      ctx.beginPath()
      for (let i = 0; i < 4; i++) { const a = i*Math.PI/4; ctx.moveTo(d.x-6*Math.cos(a),d.y-6*Math.sin(a)); ctx.lineTo(d.x+6*Math.cos(a),d.y+6*Math.sin(a)) }
      ctx.stroke()
    } else if (d.t === 'spiral') {
      ctx.beginPath()
      for (let i = 0; i < 50; i++) { const a=i*0.2, r=1.5+a*0.8; i===0?ctx.moveTo(d.x+r*Math.cos(a),d.y+r*Math.sin(a)):ctx.lineTo(d.x+r*Math.cos(a),d.y+r*Math.sin(a)) }
      ctx.stroke()
    } else { ctx.beginPath(); ctx.arc(d.x,d.y,2.5,0,Math.PI*2); ctx.fill() }
  }
  ctx.restore()
}

function drawHighlight(canvas, locs, idx, sc, ox, oy) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (idx < 0 || !locs[idx]) return
  const loc = locs[idx], rc = rough.canvas(canvas)
  const spread = 0.005 + (loc.inf_w || 0.5) * 0.012
  const segStart = Math.max(0, Math.floor((loc.inf_t - spread) * SAMPLES))
  const segEnd = Math.min(SAMPLES, Math.ceil((loc.inf_t + spread) * SAMPLES))
  for (const pass of LINE_PASSES) {
    for (let s = segStart; s < segEnd; s += SEG) {
      const pts = []
      for (let i = s; i <= Math.min(s + SEG, segEnd); i++) pts.push(lem(i / SAMPLES, ox, oy, sc, pass.yOff))
      if (pts.length >= 2)
        rc.curve(pts, { seed: pass.seed + s, roughness: pass.rough, strokeWidth: pass.sw + 0.3, stroke: loc.color || '#C0B0A0', disableMultiStroke: true, bowing: 0.8 })
    }
  }
}

function drawTrack(canvas, locs, trackPad, trackW) {
  const rc = rough.canvas(canvas)
  const trackPasses = [
    { seed: 100, rough: 1.0, sw: 0.9, yOff: -2, alpha: 0.3 },
    { seed: 110, rough: 0.7, sw: 1.1, yOff: 0, alpha: 0.4 },
    { seed: 120, rough: 0.9, sw: 0.8, yOff: 2.5, alpha: 0.25 },
  ]
  for (const pass of trackPasses) {
    for (let s = 0; s < 100; s += 8) {
      const pts = []
      for (let i = s; i <= Math.min(s + 8, 100); i++) pts.push([trackPad + (i/100)*trackW, 16 + pass.yOff])
      if (pts.length >= 2)
        rc.curve(pts, { seed: pass.seed + s, roughness: pass.rough, strokeWidth: pass.sw, stroke: getColor((s+4)/100, pass.alpha, locs, BASE_RGB), disableMultiStroke: true, bowing: 0.3 })
    }
  }
}

// === Component ===
const PANEL_H = 100, NODE_W = 72

export default function ThreadView({ locations = [], onNodeTap }) {
  const infRef = useRef(null), hlRef = useRef(null), trackRef = useRef(null)
  const wrapRef = useRef(null), containerRef = useRef(null), labelsRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const activeIdxRef = useRef(0)
  const [dims, setDims] = useState({ w: 0, h: 0 })

  const locs = [...locations].filter(l => l.inf_t != null).sort((a, b) => a.inf_t - b.inf_t)

  const infSize = Math.round(Math.min((dims.w || 400) * 1.2, ((dims.h || 700) - PANEL_H) * 0.9)) || 400
  const sc = infSize * 0.28, ox = infSize / 2, oy = infSize / 2
  const trackW = locs.length * NODE_W, trackPad = (dims.w || 400) / 2

  const scrollRef = useRef({ x: 0, target: 0, dragging: false, startX: 0, startScroll: 0 })
  const rotRef = useRef({ x: 12, y: 0, dragging: false, px: 0, py: 0, dist: 0 })

  useEffect(() => {
    const el = containerRef.current; if (!el) return
    setDims({ w: el.clientWidth, h: el.clientHeight })
    const onR = () => setDims({ w: el.clientWidth, h: el.clientHeight })
    window.addEventListener('resize', onR); return () => window.removeEventListener('resize', onR)
  }, [])

  useEffect(() => {
    if (!infRef.current || !dims.w || locs.length === 0) return
    const c = infRef.current; c.width = infSize; c.height = infSize; c.style.width = infSize+'px'; c.style.height = infSize+'px'
    drawInfinity(c, locs, sc, ox, oy)
    const hl = hlRef.current; if (hl) { hl.width = infSize; hl.height = infSize; hl.style.width = infSize+'px'; hl.style.height = infSize+'px' }
  }, [dims.w, locs.length, infSize, sc, ox, oy])

  useEffect(() => {
    if (!trackRef.current || !dims.w || locs.length === 0) return
    const c = trackRef.current; c.width = trackPad * 2 + trackW; c.height = 50
    drawTrack(c, locs, trackPad, trackW)
  }, [dims.w, locs.length, trackW, trackPad])

  useEffect(() => {
    if (!hlRef.current || locs.length === 0) return
    drawHighlight(hlRef.current, locs, activeIdx, sc, ox, oy)
  }, [activeIdx, locs.length, infSize, sc, ox, oy])

  const getSnapX = useCallback(i => { if (!locs[i]) return 0; return trackPad + locs[i].inf_t * trackW - (dims.w || 400) / 2 }, [locs, trackPad, trackW, dims.w])
  const findNearest = useCallback(sx => { let minD = Infinity, minI = 0; locs.forEach((loc, i) => { const d = Math.abs(trackPad + loc.inf_t * trackW - sx - (dims.w || 400) / 2); if (d < minD) { minD = d; minI = i } }); return minI }, [locs, trackPad, trackW, dims.w])

  const selectLocation = useCallback(i => {
    activeIdxRef.current = i; setActiveIdx(i)
    scrollRef.current.target = getSnapX(i)
    if (onNodeTap && locs[i]) onNodeTap(locs[i], (dims.w || 400) / 2, ((dims.h || 700) - PANEL_H) / 2)
  }, [locs, getSnapX, onNodeTap, dims])

  useEffect(() => { if (locs.length > 0 && dims.w) { const sx = getSnapX(0); scrollRef.current.target = sx; scrollRef.current.x = sx } }, [locs.length, dims.w, getSnapX])

  const onInfDown = useCallback(e => { rotRef.current.dragging = true; rotRef.current.px = e.clientX; rotRef.current.py = e.clientY; rotRef.current.dist = 0; e.preventDefault() }, [])

  useEffect(() => {
    const onMove = e => { const r = rotRef.current; if (!r.dragging) return; const dx = e.clientX - r.px, dy = e.clientY - r.py; r.dist += Math.abs(dx) + Math.abs(dy); r.y += dx * 0.4; r.x += dy * 0.3; r.x = Math.max(-40, Math.min(40, r.x)); r.px = e.clientX; r.py = e.clientY; if (wrapRef.current) wrapRef.current.style.transform = 'perspective(1200px) rotateX('+r.x+'deg) rotateY('+r.y+'deg)' }
    const onUp = e => { const r = rotRef.current; if (r.dragging && r.dist < 8 && infRef.current) { const rect = infRef.current.getBoundingClientRect(); const cx = (e.clientX - rect.left) * (infSize / rect.width), cy = (e.clientY - rect.top) * (infSize / rect.height); let minD = Infinity, minI = 0; locs.forEach((loc, i) => { const [lx, ly] = lem(loc.inf_t, ox, oy, sc, 0); const d = Math.hypot(lx - cx, ly - cy); if (d < minD) { minD = d; minI = i } }); if (minD < sc * 0.4) selectLocation(minI) }; r.dragging = false }
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp)
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
  }, [locs, infSize, sc, ox, oy, selectLocation])

  const onTrackDown = useCallback(e => { const s = scrollRef.current; s.dragging = true; s.startX = e.touches ? e.touches[0].clientX : e.clientX; s.startScroll = s.x }, [])

  useEffect(() => {
    const minS = () => getSnapX(0) - 20, maxS = () => getSnapX(locs.length - 1) + 20
    const onMove = e => { const s = scrollRef.current; if (!s.dragging) return; const cx = e.touches ? e.touches[0].clientX : e.clientX; s.target = s.startScroll - (cx - s.startX); s.target = Math.max(minS(), Math.min(maxS(), s.target)); const n = findNearest(s.target); if (n !== activeIdxRef.current) selectLocation(n) }
    const onEnd = () => { const s = scrollRef.current; if (!s.dragging) return; s.dragging = false; s.target = getSnapX(activeIdxRef.current) }
    window.addEventListener('touchmove', onMove, { passive: true }); window.addEventListener('mousemove', onMove); window.addEventListener('touchend', onEnd); window.addEventListener('mouseup', onEnd)
    return () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('mousemove', onMove); window.removeEventListener('touchend', onEnd); window.removeEventListener('mouseup', onEnd) }
  }, [locs, getSnapX, findNearest, selectLocation])

  useEffect(() => {
    let t = 0, running = true
    const tick = () => { if (!running) return; requestAnimationFrame(tick); t += 0.016
      if (infRef.current) infRef.current.style.opacity = String(0.9 + 0.06 * Math.sin(t * 0.35))
      if (hlRef.current) hlRef.current.style.opacity = String(0.25 + 0.25 * (0.5 + 0.5 * Math.sin(t * 1.5)))
      const s = scrollRef.current; s.x += (s.target - s.x) * 0.14; if (Math.abs(s.target - s.x) < 0.5) s.x = s.target
      if (trackRef.current) trackRef.current.style.transform = 'translateX('+ (-s.x) +'px)'
      if (labelsRef.current) { const ch = labelsRef.current.children; for (let i = 0; i < ch.length && i < locs.length; i++) ch[i].style.left = (trackPad + locs[i].inf_t * trackW - s.x) + 'px' }
    }; tick(); return () => { running = false }
  }, [locs, trackPad, trackW])

  const bgColor = getTimeBg()
  if (locs.length === 0) return <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#FAF6F0' }} />

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', background: bgColor, position: 'relative', overflow: 'hidden' }}>
      <div onPointerDown={onInfDown} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: PANEL_H, display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none' }}>
        <div ref={wrapRef} style={{ position: 'relative', transformStyle: 'preserve-3d', transform: 'perspective(1200px) rotateX(12deg) rotateY(0deg)' }}>
          <canvas ref={infRef} style={{ display: 'block' }} />
          <canvas ref={hlRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: PANEL_H, background: bgColor, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid rgba(122,92,60,0.06)' }}>
        <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 104 }}>
          <div style={{ fontFamily: "-apple-system,'PingFang SC',sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: 0.5, color: locs[activeIdx] ? locs[activeIdx].color : '#7A5C3C', transition: 'color 0.2s ease', marginBottom: 4 }}>
            {locs[activeIdx] ? (locs[activeIdx].display_name || locs[activeIdx].label || '') : ''}
          </div>
          <div style={{ width: 1, height: 14, background: 'rgba(122,92,60,0.18)' }} />
        </div>
        <div onTouchStart={onTrackDown} onMouseDown={onTrackDown} style={{ position: 'absolute', top: 38, left: 0, right: 0, height: 50, overflow: 'hidden', touchAction: 'pan-x' }}>
          <canvas ref={trackRef} style={{ position: 'absolute', top: 0, left: 0, height: 50 }} />
          <div ref={labelsRef}>
            {locs.map((loc, i) => (
              <div key={loc.id || i} onClick={e => { e.stopPropagation(); selectLocation(i) }} style={{
                position: 'absolute', top: 26, transform: 'translateX(-50%)',
                fontSize: 10, whiteSpace: 'nowrap', cursor: 'pointer', padding: '6px 8px', zIndex: 103,
                fontFamily: "-apple-system,'PingFang SC',sans-serif",
                color: i === activeIdx ? (loc.color || '#7A5C3C') : '#A09888',
                fontWeight: i === activeIdx ? 600 : 400, transition: 'color 0.2s ease',
              }}>
                {loc.display_name || loc.label || loc.id}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
