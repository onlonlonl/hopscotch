
// Icon Gallery — all 20 base recipes for review
import { useRef, useEffect } from 'react'
import rough from 'roughjs'

export const recipes = {
  // === 生活 ===
  house: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.5*s, roughness: 0.5, bowing: 0.8, disableMultiStroke: true, seed: 42 }
    const fo = { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.15 }
    const w = { stroke: '#FAF6F0', strokeWidth: 1.2*s, roughness: 0.4, disableMultiStroke: true, seed: 42 }
    rc.rectangle(x-8*s, y-6*s, 16*s, 14*s, fo)
    rc.path(`M ${x} ${y-14*s} L ${x+10*s} ${y-6*s} L ${x-10*s} ${y-6*s} Z`, fo)
    rc.line(x+6*s, y-10*s, x+6*s, y-16*s, o)
    rc.rectangle(x-2*s, y+1*s, 5*s, 7*s, w)
    rc.rectangle(x+3*s, y-4*s, 4*s, 4*s, w)
    ctx.strokeStyle = '#FAF6F0'; ctx.lineWidth = 0.8*s
    ctx.beginPath(); ctx.moveTo(x+5*s, y-4*s); ctx.lineTo(x+5*s, y); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x+3*s, y-2*s); ctx.lineTo(x+7*s, y-2*s); ctx.stroke()
  },
  building: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.5*s, roughness: 0.5, bowing: 0.8, disableMultiStroke: true, seed: 42 }
    const fo = { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.15 }
    const w = { stroke: '#FAF6F0', strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42 }
    rc.rectangle(x-8*s, y-18*s, 16*s, 26*s, fo)
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++)
      rc.rectangle(x-6*s+c*8*s, y-15*s+r*7*s, 4*s, 4*s, w)
    rc.rectangle(x-3*s, y+2*s, 6*s, 6*s, w)
  },
  train: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.5*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    rc.circle(x, y, 22*s, { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.15 })
    ctx.fillStyle = '#FAF6F0'
    ctx.font = `bold ${10*s}px '-apple-system', 'PingFang SC', sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('M', x, y+1*s)
  },
  plane: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.3*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    // fuselage
    rc.path(`M ${x} ${y-10*s} Q ${x+2*s} ${y} ${x} ${y+8*s}`, o)
    // wings
    rc.path(`M ${x-12*s} ${y+2*s} L ${x} ${y-2*s} L ${x+12*s} ${y+2*s}`, o)
    // tail wings
    rc.path(`M ${x-5*s} ${y+6*s} L ${x} ${y+4*s} L ${x+5*s} ${y+6*s}`, o)
    // nose dot
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y-10*s, 1.5*s, 0, Math.PI*2); ctx.fill()
  },
  shop: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.5*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    const fo = { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.15 }
    const w = { stroke: '#FAF6F0', strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42 }
    // bag body
    rc.rectangle(x-7*s, y-4*s, 14*s, 14*s, fo)
    // handle
    rc.path(`M ${x-4*s} ${y-4*s} Q ${x-4*s} ${y-10*s} ${x} ${y-10*s} Q ${x+4*s} ${y-10*s} ${x+4*s} ${y-4*s}`, o)
    // pocket
    rc.rectangle(x-3*s, y+2*s, 6*s, 4*s, w)
  },
  school: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.3*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    // pencil body
    rc.rectangle(x-2.5*s, y-12*s, 5*s, 20*s, { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.15 })
    // tip
    rc.path(`M ${x-2.5*s} ${y+8*s} L ${x} ${y+13*s} L ${x+2.5*s} ${y+8*s}`, o)
    // eraser band
    rc.line(x-2.5*s, y-8*s, x+2.5*s, y-8*s, o)
    // eraser
    rc.rectangle(x-2.5*s, y-12*s, 5*s, 4*s, { stroke: '#FAF6F0', strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42 })
  },
  hospital: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.5*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    const fo = { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.15 }
    rc.rectangle(x-9*s, y-9*s, 18*s, 18*s, fo)
    // cross
    const w = { stroke: '#FAF6F0', strokeWidth: 2*s, roughness: 0.3, disableMultiStroke: true, seed: 42 }
    rc.line(x, y-5*s, x, y+5*s, w)
    rc.line(x-5*s, y, x+5*s, y, w)
  },

  // === 休闲 ===
  cafe: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.3*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    const fo = { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.15 }
    // cup
    rc.path(`M ${x-6*s} ${y-4*s} L ${x-5*s} ${y+6*s} L ${x+5*s} ${y+6*s} L ${x+6*s} ${y-4*s}`, fo)
    // handle
    rc.path(`M ${x+6*s} ${y-2*s} Q ${x+11*s} ${y} ${x+6*s} ${y+4*s}`, o)
    // saucer
    rc.line(x-7*s, y+7*s, x+7*s, y+7*s, o)
    // steam
    ctx.strokeStyle = color; ctx.lineWidth = 0.8*s; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(x-2*s, y-6*s); ctx.quadraticCurveTo(x-3*s, y-10*s, x-1*s, y-13*s); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x+2*s, y-6*s); ctx.quadraticCurveTo(x+3*s, y-10*s, x+1*s, y-13*s); ctx.stroke()
  },
  restaurant: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.3*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    // plate
    rc.circle(x, y+2*s, 16*s, { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.08 })
    rc.circle(x, y+2*s, 8*s, o)
    // fork (left)
    rc.line(x-10*s, y-10*s, x-10*s, y+2*s, o)
    rc.line(x-10*s, y-10*s, x-10*s, y-6*s, { ...o, strokeWidth: 0.8*s })
    rc.line(x-12*s, y-10*s, x-12*s, y-5*s, { ...o, strokeWidth: 0.8*s })
    rc.line(x-8*s, y-10*s, x-8*s, y-5*s, { ...o, strokeWidth: 0.8*s })
    // knife (right)
    rc.path(`M ${x+10*s} ${y-10*s} L ${x+10*s} ${y+2*s}`, o)
    rc.path(`M ${x+10*s} ${y-10*s} Q ${x+13*s} ${y-6*s} ${x+10*s} ${y-2*s}`, { ...o, strokeWidth: 0.8*s })
  },
  bar: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.3*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    // liquid fill inside glass
    rc.path(`M ${x-5*s} ${y-4*s} L ${x-3*s} ${y+2*s} L ${x+3*s} ${y+2*s} L ${x+5*s} ${y-4*s} Z`, { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.15, stroke: 'none' })
    // glass V shape
    rc.path(`M ${x-7*s} ${y-8*s} L ${x-3*s} ${y+2*s} L ${x+3*s} ${y+2*s} L ${x+7*s} ${y-8*s}`, o)
    // stem
    rc.line(x, y+2*s, x, y+7*s, o)
    // base
    rc.line(x-4*s, y+7*s, x+4*s, y+7*s, o)
    // olive
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x+5*s, y-6*s, 2*s, 0, Math.PI*2); ctx.fill()
    // olive stick
    rc.line(x+3*s, y-9*s, x+6*s, y-4*s, o)
  },
  park: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.3*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    const fo = { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.15 }
    // trunk
    rc.line(x, y+8*s, x, y-2*s, { ...o, strokeWidth: 2*s })
    // canopy layers
    rc.circle(x, y-6*s, 14*s, fo)
    rc.circle(x-5*s, y-3*s, 10*s, fo)
    rc.circle(x+5*s, y-3*s, 10*s, fo)
  },
  mountain: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.5*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    const fo = { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.12 }
    // main peak
    rc.path(`M ${x-12*s} ${y+8*s} L ${x-2*s} ${y-10*s} L ${x+8*s} ${y+8*s} Z`, fo)
    // second peak behind
    rc.path(`M ${x-4*s} ${y+8*s} L ${x+5*s} ${y-6*s} L ${x+14*s} ${y+8*s}`, { ...o, strokeWidth: 1*s })
    // snow cap
    rc.path(`M ${x-4*s} ${y-6*s} L ${x-2*s} ${y-10*s} L ${x} ${y-6*s}`, { stroke: '#FAF6F0', strokeWidth: 1.2*s, roughness: 0.4, disableMultiStroke: true, seed: 42 })
  },
  beach: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.3*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    // umbrella
    rc.path(`M ${x-8*s} ${y-4*s} Q ${x} ${y-14*s} ${x+8*s} ${y-4*s}`, { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.15 })
    // pole
    rc.line(x, y-4*s, x, y+6*s, o)
    // waves
    ctx.strokeStyle = color; ctx.lineWidth = 1*s; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(x-10*s, y+8*s); ctx.quadraticCurveTo(x-5*s, y+5*s, x, y+8*s); ctx.quadraticCurveTo(x+5*s, y+11*s, x+10*s, y+8*s); ctx.stroke()
  },
  hotel: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.3*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    const fo = { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.15 }
    const w = { stroke: '#FAF6F0', strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42 }
    // bed frame
    rc.rectangle(x-10*s, y-2*s, 20*s, 10*s, fo)
    // headboard
    rc.rectangle(x-10*s, y-8*s, 6*s, 6*s, fo)
    // pillow
    rc.rectangle(x-8*s, y-4*s, 5*s, 3*s, w)
    // blanket line
    rc.line(x-4*s, y+2*s, x+10*s, y+2*s, w)
  },

  // === 纪念 ===
  torii: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.5*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    rc.line(x-8*s, y+8*s, x-6*s, y-8*s, o)
    rc.line(x+8*s, y+8*s, x+6*s, y-8*s, o)
    rc.path(`M ${x-12*s} ${y-8*s} Q ${x} ${y-13*s} ${x+12*s} ${y-8*s}`, { ...o, strokeWidth: 2*s })
    rc.line(x-9*s, y-4*s, x+9*s, y-4*s, o)
  },
  cinema: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.3*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    const fo = { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.15 }
    const w = { stroke: '#FAF6F0', strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42 }
    // board body
    rc.rectangle(x-9*s, y-2*s, 18*s, 14*s, fo)
    // board top edge (where clapper attaches)
    rc.rectangle(x-9*s, y-6*s, 18*s, 4*s, fo)
    // stripes on board top
    rc.line(x-5*s, y-6*s, x-5*s, y-2*s, { ...o, strokeWidth: 1*s })
    rc.line(x-1*s, y-6*s, x-1*s, y-2*s, { ...o, strokeWidth: 1*s })
    rc.line(x+3*s, y-6*s, x+3*s, y-2*s, { ...o, strokeWidth: 1*s })
    rc.line(x+7*s, y-6*s, x+7*s, y-2*s, { ...o, strokeWidth: 1*s })
    // clapper (thin strip, hinged left, angled open ~30 degrees)
    ctx.save()
    ctx.translate(x-9*s, y-6*s)
    ctx.rotate(-0.5)
    rc.rectangle(0, -3*s, 18*s, 3*s, fo)
    // stripes on clapper
    rc.line(4*s, -3*s, 4*s, 0, { ...o, strokeWidth: 1*s })
    rc.line(8*s, -3*s, 8*s, 0, { ...o, strokeWidth: 1*s })
    rc.line(12*s, -3*s, 12*s, 0, { ...o, strokeWidth: 1*s })
    rc.line(16*s, -3*s, 16*s, 0, { ...o, strokeWidth: 1*s })
    ctx.restore()
    // text lines on board body
    rc.line(x-5*s, y+3*s, x+5*s, y+3*s, w)
    rc.line(x-5*s, y+7*s, x+3*s, y+7*s, w)
  },
  temple: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.3*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    const fo = { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.12 }
    // tiered roofs
    rc.path(`M ${x-10*s} ${y+2*s} L ${x} ${y-4*s} L ${x+10*s} ${y+2*s}`, fo)
    rc.path(`M ${x-7*s} ${y-4*s} L ${x} ${y-9*s} L ${x+7*s} ${y-4*s}`, fo)
    // spire
    rc.line(x, y-9*s, x, y-14*s, o)
    // base
    rc.rectangle(x-6*s, y+2*s, 12*s, 8*s, fo)
    // door
    rc.rectangle(x-2*s, y+4*s, 4*s, 6*s, { stroke: '#FAF6F0', strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42 })
  },
  church: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.3*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    const fo = { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.12 }
    // body
    rc.rectangle(x-7*s, y-4*s, 14*s, 14*s, fo)
    // steeple
    rc.path(`M ${x-4*s} ${y-4*s} L ${x} ${y-14*s} L ${x+4*s} ${y-4*s}`, fo)
    // cross on top
    rc.line(x, y-14*s, x, y-18*s, o)
    rc.line(x-2*s, y-16*s, x+2*s, y-16*s, o)
    // door arch
    rc.path(`M ${x-3*s} ${y+10*s} L ${x-3*s} ${y+3*s} Q ${x} ${y} ${x+3*s} ${y+3*s} L ${x+3*s} ${y+10*s}`, { stroke: '#FAF6F0', strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42 })
    // window
    rc.circle(x, y-6*s, 4*s, { stroke: '#FAF6F0', strokeWidth: 0.8*s, roughness: 0.3, disableMultiStroke: true, seed: 42 })
  },
  flag: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.2*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    rc.line(x-2*s, y+10*s, x-2*s, y-10*s, o)
    rc.path(`M ${x-2*s} ${y-10*s} L ${x+8*s} ${y-7*s} L ${x-2*s} ${y-4*s} Z`,
      { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.25 })
  },
  heart: (rc, ctx, x, y, s, color) => {
    const o = { stroke: color, strokeWidth: 1.5*s, roughness: 0.5, disableMultiStroke: true, seed: 42 }
    const fo = { ...o, fill: color, fillStyle: 'solid', fillWeight: 0.2 }
    rc.path(`M ${x} ${y+10*s} C ${x-4*s} ${y+6*s} ${x-12*s} ${y+2*s} ${x-12*s} ${y-4*s} C ${x-12*s} ${y-10*s} ${x-6*s} ${y-12*s} ${x} ${y-6*s} C ${x+6*s} ${y-12*s} ${x+12*s} ${y-10*s} ${x+12*s} ${y-4*s} C ${x+12*s} ${y+2*s} ${x+4*s} ${y+6*s} ${x} ${y+10*s}`, fo)
  },
}

const allIcons = [
  { type: 'house', label: '家', cat: '生活', color: '#E8A87C' },
  { type: 'building', label: '公司', cat: '生活', color: '#7BA7BC' },
  { type: 'train', label: '地鐵', cat: '生活', color: '#9BB89C' },
  { type: 'plane', label: '機場', cat: '生活', color: '#B8C4D0' },
  { type: 'shop', label: '商店', cat: '生活', color: '#D4B896' },
  { type: 'school', label: '學校', cat: '生活', color: '#C4A6D0' },
  { type: 'hospital', label: '醫院', cat: '生活', color: '#D0A0A0' },
  { type: 'cafe', label: '咖啡', cat: '休闲', color: '#A8B89A' },
  { type: 'restaurant', label: '餐廳', cat: '休闲', color: '#E8A87C' },
  { type: 'bar', label: '酒吧', cat: '休闲', color: '#C4A6D0' },
  { type: 'park', label: '公園', cat: '休闲', color: '#9BB89C' },
  { type: 'mountain', label: '山', cat: '休闲', color: '#7BA7BC' },
  { type: 'beach', label: '海灘', cat: '休闲', color: '#B8C4D0' },
  { type: 'hotel', label: '酒店', cat: '休闲', color: '#D4B896' },
  { type: 'torii', label: '鳥居', cat: '纪念', color: '#D0A0A0' },
  { type: 'cinema', label: '電影院', cat: '休闲', color: '#E8A87C' },
  { type: 'temple', label: '寺廟', cat: '纪念', color: '#A8B89A' },
  { type: 'church', label: '教堂', cat: '纪念', color: '#7BA7BC' },
  { type: 'flag', label: '旗子', cat: '标记', color: '#9BB89C' },
  { type: 'heart', label: '心', cat: '标记', color: '#D0A0A0' },
]

export default function IconGallery() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rc = rough.canvas(canvas)
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    const W = Math.min(window.innerWidth, 500)
    const cols = 4
    const cellW = W / cols
    const cellH = cellW * 1.3
    const rows = Math.ceil(allIcons.length / cols)
    const H = rows * cellH + 60

    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = '#FAF6F0'
    ctx.fillRect(0, 0, W, H)

    const baseScale = cellW / 80

    let currentCat = ''
    allIcons.forEach((icon, idx) => {
      const col = idx % cols
      const row = Math.floor(idx / cols)
      const cx = col * cellW + cellW / 2
      const cy = row * cellH + cellH / 2 + 10

      // Draw icon
      const recipe = recipes[icon.type]
      if (recipe) recipe(rc, ctx, cx, cy - 8, baseScale, icon.color)

      // Label
      ctx.fillStyle = '#8A7A68'
      ctx.font = `${9 * baseScale}px '-apple-system', 'PingFang SC', sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(icon.label, cx, cy + 18 * baseScale)

      // Type name
      ctx.fillStyle = '#B8B0A0'
      ctx.font = `${7 * baseScale}px '-apple-system', 'PingFang SC', sans-serif`
      ctx.fillText(icon.type, cx, cy + 26 * baseScale)
    })
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', margin: '0 auto' }} />
}
