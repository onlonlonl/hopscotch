// HandDrawnMap.jsx — Lux's psychological distance map
// Renders inside the map zone or fullscreen
// Uses Rough.js for location icons, Canvas 2D for paths and footprints

import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import rough from 'roughjs'
import { recipes } from './IconGallery'

// Mock location data (will come from Supabase)
const MOCK_LOCATIONS = [
  { id: 'home', label: '家', display_name: '家', icon_type: 'house', color: '#E8A87C', lux_x: 50, lux_y: 50, scale: 1.2, errands: 9 },
  { id: 'office-new', label: '新公司', display_name: '公司', icon_type: 'building', color: '#7BA7BC', lux_x: 75, lux_y: 35, scale: 0.9, errands: 5 },
  { id: 'metro', label: '地鐵站', display_name: '地鐵站', icon_type: 'train', color: '#9BB89C', lux_x: 35, lux_y: 65, scale: 0.8, errands: 3 },
  { id: 'airport', label: '機場', display_name: '機場', icon_type: 'plane', color: '#B8C4D0', lux_x: 15, lux_y: 20, scale: 0.7, errands: 1 },
  { id: 'tokyo', label: '東京', display_name: '東京', icon_type: 'torii', color: '#D0A0A0', lux_x: 85, lux_y: 15, scale: 0.8, errands: 0 },
  { id: 'taiwan', label: '台灣', display_name: '台灣', icon_type: 'lantern', color: '#C4A6D0', lux_x: 80, lux_y: 75, scale: 0.7, errands: 0 },
]

// Connections between locations (for dotted paths + footprints)
const CONNECTIONS = [
  ['home', 'office-new'],
  ['home', 'metro'],
  ['home', 'airport'],
]

function HandDrawnMapInner({ locations = MOCK_LOCATIONS, connections = CONNECTIONS, fullscreen = false, onLocationTap }) {
  const canvasRef = useRef(null)
  const [nameMode, setNameMode] = useState(0) // 0: display_name, 1: label, 2: story

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rc = rough.canvas(canvas)
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    const W = canvas.parentElement?.clientWidth || window.innerWidth
    const H = canvas.parentElement?.clientHeight || window.innerHeight

    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Background — warm white paper
    ctx.fillStyle = '#FAF6F0'
    ctx.fillRect(0, 0, W, H)

    // Transform lux_x/lux_y (0-100) to screen coords with padding
    const pad = 40
    const mapW = W - pad * 2
    const mapH = H - pad * 2
    const locToScreen = (lx, ly) => [pad + (lx / 100) * mapW, pad + (ly / 100) * mapH]

    // No dotted lines — footprints are the path
    ctx.lineCap = 'round'

    // Draw footprints along connections (from home outward)
    function drawShoe(sx, sy, sAngle, mirror) {
      ctx.save()
      ctx.translate(sx, sy)
      ctx.rotate(sAngle - Math.PI / 2)
      if (mirror) ctx.scale(-1, 1)
      ctx.beginPath()
      ctx.moveTo(-1.8, -4)
      ctx.quadraticCurveTo(-2.2, -1, -2, 1.5)
      ctx.lineTo(-1.5, 3)
      ctx.lineTo(1.5, 3)
      ctx.lineTo(2, 1.5)
      ctx.quadraticCurveTo(2.2, -1, 1.8, -4)
      ctx.quadraticCurveTo(0, -5, -1.8, -4)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-1.3, 4.5)
      ctx.quadraticCurveTo(-1.5, 6, -1, 7)
      ctx.lineTo(1, 7)
      ctx.quadraticCurveTo(1.5, 6, 1.3, 4.5)
      ctx.fill()
      ctx.restore()
    }

    for (const [fromId, toId] of connections) {
      const from = locations.find(l => l.id === fromId)
      const to = locations.find(l => l.id === toId)
      if (!from || !to) continue
      if (from.errands === 0 && to.errands === 0) continue
      const homeIsFrom = from.id === 'home'
      const [x1, y1] = homeIsFrom ? locToScreen(from.lux_x, from.lux_y) : locToScreen(to.lux_x, to.lux_y)
      const [x2, y2] = homeIsFrom ? locToScreen(to.lux_x, to.lux_y) : locToScreen(from.lux_x, from.lux_y)
      const cmx = (x1 + x2) / 2 + (y2 - y1) * 0.15
      const cmy = (y1 + y2) / 2 - (x2 - x1) * 0.15
      const dist = Math.hypot(x2 - x1, y2 - y1)
      const steps = Math.floor(dist / 35)
      ctx.fillStyle = 'rgba(160, 150, 140, 0.22)'
      for (let i = 1; i < steps; i++) {
        const t = i / steps
        const fx = (1-t)*(1-t)*x1 + 2*(1-t)*t*cmx + t*t*x2
        const fy = (1-t)*(1-t)*y1 + 2*(1-t)*t*cmy + t*t*y2
        const tdx = 2*(1-t)*(cmx-x1) + 2*t*(x2-cmx)
        const tdy = 2*(1-t)*(cmy-y1) + 2*t*(y2-cmy)
        const angle = Math.atan2(tdy, tdx)
        const offset = (i % 2 === 0 ? 4 : -4)
        const px = fx + Math.cos(angle + Math.PI / 2) * offset
        const py = fy + Math.sin(angle + Math.PI / 2) * offset
        drawShoe(px, py, angle, i % 2 === 1)
      }
    }

    // Draw location icons
    const baseScale = Math.min(W, H) / 300
    for (const loc of locations) {
      const [x, y] = locToScreen(loc.lux_x, loc.lux_y)
      const s = baseScale * (loc.scale || 1)
      const recipe = recipes[loc.icon_type] || recipes.flag
      recipe(rc, ctx, x, y, s, loc.color)

      // Label
      ctx.fillStyle = loc.color
      ctx.font = `${9 * s}px 'DotGothic16', monospace`
      ctx.textAlign = 'center'
      ctx.fillText(loc.display_name || loc.label, x, y + 18 * s)

      // Errand count
      if (loc.errands > 0) {
        ctx.fillStyle = 'rgba(160, 150, 140, 0.4)'
        ctx.font = `${7 * s}px 'DotGothic16', monospace`
        ctx.fillText(loc.errands + '×', x, y + 26 * s)
      }
    }
  }, [locations, connections, nameMode])

  useEffect(() => {
    draw()
    const onResize = () => draw()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      onClick={(e) => {
        if (!onLocationTap) return
        const rect = canvasRef.current.getBoundingClientRect()
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top
        const W = rect.width, H = rect.height, pad = 40
        const mapW = W - pad*2, mapH = H - pad*2
        for (const loc of locations) {
          const lx = pad + (loc.lux_x / 100) * mapW
          const ly = pad + (loc.lux_y / 100) * mapH
          const dist = Math.hypot(cx - lx, cy - ly)
          if (dist < 25) { onLocationTap(loc, e.clientX, e.clientY); return }
        }
        onLocationTap(null)
      }}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        borderRadius: fullscreen ? 0 : 4,
      }}
    />
  )
}


const HandDrawnMap = forwardRef(function HandDrawnMap(props, ref) {
  useImperativeHandle(ref, () => ({
    screenToLoc: (sx, sy) => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return { lux_x: 50, lux_y: 50 }
      const rect = canvas.getBoundingClientRect()
      const W = rect.width, H = rect.height, pad = 40
      const lux_x = Math.max(5, Math.min(95, (sx - rect.left - pad) / (W - pad*2) * 100))
      const lux_y = Math.max(5, Math.min(95, (sy - rect.top - pad) / (H - pad*2) * 100))
      return { lux_x, lux_y }
    }
  }))
  return <HandDrawnMapInner {...props} onLocationTap={props.onLocationTap} />
})

export default HandDrawnMap
