
// StampsPanel v2 — fixed height, centered tabs, close on outside click, drag support
import { useState, useRef, useEffect, useCallback } from 'react'
import rough from 'roughjs'

const defaultCategories = {
  rhythm: { label: 'Rhythm', items: [
    { type: 'house', label: '家' }, { type: 'building', label: '公司' },
    { type: 'train', label: '地鐵' }, { type: 'plane', label: '機場' },
    { type: 'shop', label: '商店' }, { type: 'school', label: '學校' },
    { type: 'hospital', label: '醫院' },
  ]},
  melody: { label: 'Melody', items: [
    { type: 'cafe', label: '咖啡' }, { type: 'restaurant', label: '餐廳' },
    { type: 'bar', label: '酒吧' }, { type: 'park', label: '公園' },
    { type: 'mountain', label: '山' }, { type: 'beach', label: '海灘' },
    { type: 'hotel', label: '酒店' }, { type: 'cinema', label: '電影院' },
  ]},
  echo: { label: 'Echo', items: [
    { type: 'torii', label: '鳥居' }, { type: 'temple', label: '寺廟' },
    { type: 'church', label: '教堂' }, { type: 'flag', label: '旗子' },
    { type: 'heart', label: '心' },
  ]},
}

export default function StampsPanel({ open, onClose, onSelect, onDragToMap, recipes }) {
  const [activeTab, setActiveTab] = useState('rhythm')
  const [generatorOpen, setGeneratorOpen] = useState(false)
  const [genInput, setGenInput] = useState('')
  const [genLoading, setGenLoading] = useState(false)
  const [categories, setCategories] = useState(defaultCategories)
  const [dragging, setDragging] = useState(null)
  const [dragPos, setDragPos] = useState(null)
  const panelRef = useRef(null)
  const dragCanvasRef = useRef(null)

  const cats = Object.entries(categories)
  const currentItems = categories[activeTab]?.items || []

  // Draw stamp thumbnail
  const drawStamp = useCallback((canvas, type, color) => {
    if (!canvas || !recipes || !recipes[type]) return
    const ctx = canvas.getContext('2d')
    const rc = rough.canvas(canvas)
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    const size = 36
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)
    recipes[type](rc, ctx, size/2, size/2, size/100, color || '#A09080')
  }, [recipes])

  // Draw floating drag ghost
  useEffect(() => {
    if (!dragging || !dragCanvasRef.current || !recipes) return
    const canvas = dragCanvasRef.current
    const ctx = canvas.getContext('2d')
    const rc = rough.canvas(canvas)
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    const size = 60
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)
    if (recipes[dragging]) {
      recipes[dragging](rc, ctx, size/2, size/2, size/70, '#7A9080')
    }
  }, [dragging, recipes])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    // Delay to avoid closing immediately
    const timer = setTimeout(() => document.addEventListener('click', handleClick), 100)
    return () => { clearTimeout(timer); document.removeEventListener('click', handleClick) }
  }, [open, onClose])

  // Drag handlers
  const startDrag = (e, type) => {
    e.preventDefault()
    const touch = e.touches ? e.touches[0] : e
    setDragging(type)
    setDragPos({ x: touch.clientX - 30, y: touch.clientY - 30 })

    const onMove = (ev) => {
      const t = ev.touches ? ev.touches[0] : ev
      setDragPos({ x: t.clientX - 30, y: t.clientY - 30 })
    }
    const onEnd = (ev) => {
      const t = ev.changedTouches ? ev.changedTouches[0] : ev
      // Check if dropped above panel (on map)
      const panelTop = panelRef.current?.getBoundingClientRect().top || window.innerHeight
      if (t.clientY < panelTop && onDragToMap) {
        onDragToMap(type, t.clientX, t.clientY)
      }
      setDragging(null)
      setDragPos(null)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
  }

  if (!open) return null

  return (
    <>
      {/* Drag ghost */}
      {dragging && dragPos && (
        <canvas ref={dragCanvasRef} style={{
          position: 'fixed', left: dragPos.x, top: dragPos.y,
          pointerEvents: 'none', zIndex: 200, opacity: 0.8,
        }} />
      )}

      <div ref={panelRef} style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#FAF6F0',
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        zIndex: 100,
        height: generatorOpen ? '85vh' : '42vh',
        transition: 'height 0.3s ease',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'-apple-system', 'PingFang SC', sans-serif",
      }} onClick={e => e.stopPropagation()}>

        {/* Header: drag handle + close */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 4px', justifyContent: 'center', position: 'relative' }}>
          <div style={{ width: 36, height: 4, background: '#D0C8C0', borderRadius: 2 }} />
          <button onClick={onClose} style={{
            position: 'absolute', right: 14, top: 8,
            background: 'none', border: 'none',
            fontSize: 18, color: '#B0A898', cursor: 'pointer',
            fontFamily: 'inherit', lineHeight: 1,
          }}>×</button>
        </div>

        {!generatorOpen ? (
          <>
            {/* Tabs — centered */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 0, borderBottom: '1px solid #EAE4DC' }}>
              {cats.map(([key, cat]) => (
                <button key={key} onClick={() => setActiveTab(key)} style={{
                  padding: '8px 16px', fontSize: 12, letterSpacing: 1,
                  color: activeTab === key ? '#5A4A38' : '#B0A898',
                  fontWeight: activeTab === key ? 600 : 400,
                  background: 'none', border: 'none',
                  borderBottom: activeTab === key ? '2px solid #5A4A38' : '2px solid transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  {cat.label}
                </button>
              ))}
              <button onClick={() => {/* TODO: add category */}} style={{
                padding: '8px 12px', fontSize: 14, color: '#C0B8A8',
                background: 'none', border: 'none', cursor: 'pointer',
              }}>+</button>
            </div>

            {/* Grid — fixed height, scrollable */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 4, padding: '12px 16px',
              flex: 1, overflowY: 'auto', alignContent: 'start',
            }}>
              {currentItems.map(item => (
                <div key={item.type}
                  onMouseDown={(e) => startDrag(e, item.type)}
                  onTouchStart={(e) => startDrag(e, item.type)}
                  onClick={() => onSelect && onSelect(item.type)}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', padding: '4px 2px',
                    borderRadius: 8, cursor: 'grab',
                    userSelect: 'none', WebkitUserSelect: 'none',
                  }}>
                  <StampThumb type={item.type} recipes={recipes} drawStamp={drawStamp} />
                  <span style={{ fontSize: 10, color: '#8A7A68', marginTop: 4 }}>{item.label}</span>
                </div>
              ))}
              <div onClick={() => setGeneratorOpen(true)} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '4px 2px', borderRadius: 8, cursor: 'pointer',
                border: '1.5px dashed #C0B8A8', minHeight: 72,
              }}>
                <span style={{ fontSize: 20, color: '#B0A898' }}>+</span>
                <span style={{ fontSize: 9, color: '#B0A898', marginTop: 2 }}>generate</span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#5A4A38' }}>Generate Stamp</span>
              <button onClick={() => setGeneratorOpen(false)} style={{
                background: 'none', border: 'none', fontSize: 13,
                color: '#B0A898', cursor: 'pointer', fontFamily: 'inherit',
              }}>back</button>
            </div>

            <div style={{
              width: 120, height: 120, margin: '0 auto 16px',
              background: '#F0ECE6', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 11, color: '#C0B8A8' }}>preview</span>
            </div>

            <input type="text" value={genInput}
              onChange={e => setGenInput(e.target.value)}
              placeholder="describe: McDonald's, ramen shop..."
              style={{
                width: '100%', padding: '10px 14px',
                border: '1.5px solid #D0C8C0', borderRadius: 8,
                background: '#FAFAF6', fontSize: 13,
                fontFamily: 'inherit', color: '#5A4A38', outline: 'none',
              }} />

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button disabled={genLoading || !genInput.trim()} style={{
                flex: 1, padding: '10px 0',
                background: genLoading ? '#D0C8C0' : '#2E94B9',
                border: 'none', borderRadius: 8,
                color: '#fff', fontSize: 12, fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer', letterSpacing: 1,
              }}>{genLoading ? 'generating...' : 'Generate'}</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function StampThumb({ type, recipes, drawStamp }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) drawStamp(ref.current, type, '#A09080')
  }, [type, drawStamp])
  return <canvas ref={ref} style={{ display: 'block' }} />
}
