import { useRef, useEffect, useCallback } from 'react'
import rough from 'roughjs'
import { grid, hopscotchPoly, zones, HOPSCOTCH_BG } from '../lib/tokens'

const STARS = [
  { x: 50, y: 48, r: 4 },
  { x: 130, y: 46, r: 3.5 },
]

const SPIRALS = [
  { x: 128, y: 80, startR: 1, endR: 4, turns: 1.5 },
  { x: 52, y: 140, startR: 1, endR: 3.5, turns: 1.3 },
  { x: 110, y: 150, startR: 0.8, endR: 3, turns: 1.4 },
]

const DOTS = [
  { x: 75, y: 30, r: 0.7 },
  { x: 110, y: 35, r: 0.6 },
  { x: 130, y: 60, r: 0.7 },
  { x: 50, y: 100, r: 0.6 },
  { x: 130, y: 115, r: 0.5 },
  { x: 65, y: 150, r: 0.7 },
  { x: 120, y: 148, r: 0.6 },
]

export default function HopscotchCanvas({ onZoneTap }) {
  const canvasRef = useRef(null)
  const transformRef = useRef({ S: 1, ox: 0, oy: 0 })

  const tx = useCallback((x) => {
    const { S, ox } = transformRef.current
    return ox + x * S
  }, [])

  const ty = useCallback((y) => {
    const { S, oy } = transformRef.current
    return oy + y * S
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rc = rough.canvas(canvas)
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    const W = window.innerWidth
    const H = window.innerHeight

    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const fitW = W * 0.75 / grid.double_w
    const fitH = H * 0.70 / (grid.y4 - grid.y0)
    const S = Math.min(fitW, fitH)
    const ox = W / 2 - grid.cx * S
    const oy = H / 2 - grid.cx * S
    transformRef.current = { S, ox, oy }

    ctx.fillStyle = HOPSCOTCH_BG
    ctx.fillRect(0, 0, W, H)

    const opt = {
      stroke: 'rgba(255,255,255,0.55)',
      strokeWidth: 2.5,
      roughness: 0.5,
      bowing: 0.8,
      disableMultiStroke: true,
    }
    const optThin = { ...opt, roughness: 0.4, bowing: 0.6 }

    let path = 'M ' + tx(hopscotchPoly[0][0]) + ' ' + ty(hopscotchPoly[0][1])
    for (let i = 1; i < hopscotchPoly.length; i++) {
      path += ' L ' + tx(hopscotchPoly[i][0]) + ' ' + ty(hopscotchPoly[i][1])
    }
    path += ' Z'
    rc.path(path, opt)

    rc.line(tx(grid.s_left), ty(grid.y1), tx(grid.s_right), ty(grid.y1), optThin)
    rc.line(tx(grid.s_left), ty(grid.y2), tx(grid.s_right), ty(grid.y2), optThin)
    rc.line(tx(grid.s_left), ty(grid.y3), tx(grid.s_right), ty(grid.y3), optThin)
    rc.line(tx(grid.cx), ty(grid.y2), tx(grid.cx), ty(grid.y3), optThin)

    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.font = (7 * S) + "px 'DotGothic16', monospace"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('MAP', tx(grid.cx), ty((grid.y1 + grid.y2) / 2))

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.strokeStyle = 'rgba(248,252,254,0.5)'
    ctx.lineWidth = 1.5 * S / 3
    for (const star of STARS) {
      const { x, y, r } = star
      ctx.beginPath(); ctx.moveTo(tx(x), ty(y - r)); ctx.lineTo(tx(x), ty(y + r)); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(tx(x - r), ty(y)); ctx.lineTo(tx(x + r), ty(y)); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(tx(x - r * 0.7), ty(y - r * 0.7)); ctx.lineTo(tx(x + r * 0.7), ty(y + r * 0.7)); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(tx(x - r * 0.7), ty(y + r * 0.7)); ctx.lineTo(tx(x + r * 0.7), ty(y - r * 0.7)); ctx.stroke()
    }

    ctx.strokeStyle = 'rgba(248,252,254,0.4)'
    ctx.lineWidth = 1.2 * S / 3
    for (const sp of SPIRALS) {
      ctx.beginPath()
      const steps = 60
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const angle = t * Math.PI * 2 * sp.turns
        const r = sp.startR + (sp.endR - sp.startR) * t
        const px = tx(sp.x) + Math.cos(angle) * r * S
        const py = ty(sp.y) + Math.sin(angle) * r * S
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(248,252,254,0.55)'
    for (const d of DOTS) {
      ctx.beginPath()
      ctx.arc(tx(d.x), ty(d.y), S * d.r, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [tx, ty])

  const handleTap = useCallback((e) => {
    if (!onZoneTap) return
    const { S, ox, oy } = transformRef.current
    const rect = canvasRef.current.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    const gx = (cx - ox) / S
    const gy = (cy - oy) / S

    for (const [name, zone] of Object.entries(zones)) {
      if (gx >= zone.x1 && gx <= zone.x2 && gy >= zone.y1 && gy <= zone.y2) {
        onZoneTap(name)
        return
      }
    }
  }, [onZoneTap])

  useEffect(() => {
    draw()
    const onResize = () => draw()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      onClick={handleTap}
      style={{
        display: 'block',
        position: 'absolute',
        top: 0, left: 0,
        width: '100%', height: '100%',
        touchAction: 'manipulation',
      }}
    />
  )
}