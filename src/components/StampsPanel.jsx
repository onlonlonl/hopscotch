
// StampsPanel v3 — Rough.js styled editor UI, existing stamps untouched
import { useState, useRef, useEffect, useCallback } from 'react'
import rough from 'roughjs'

var defaultCategories = {
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

var RO = { roughness: 0.5, bowing: 0.8, disableMultiStroke: true }

function RoughHandle({ width }) {
  var ref = useRef(null)
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    var w = width || 36, h = 8
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.line(4, h/2, w-4, h/2, { stroke: '#C0B8A8', strokeWidth: 1.2, roughness: 0.8, bowing: 0.6, disableMultiStroke: true, seed: 11 })
    rc.line(8, h/2+2.5, w-8, h/2+2.5, { stroke: '#D0C8C0', strokeWidth: 0.8, roughness: 0.7, bowing: 0.5, disableMultiStroke: true, seed: 12 })
  }, [width])
  return <canvas ref={ref} style={{ display: 'block' }} />
}

function RoughClose({ size, onClick }) {
  var ref = useRef(null)
  var sz = size || 28
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.line(8, 8, sz-8, sz-8, { stroke: '#B0A898', strokeWidth: 1.2, ...RO, seed: 20 })
    rc.line(sz-8, 8, 8, sz-8, { stroke: '#B0A898', strokeWidth: 1.2, ...RO, seed: 21 })
  }, [sz])
  return <canvas ref={ref} onClick={onClick} style={{ display: 'block', cursor: 'pointer' }} />
}

function RoughTabLine({ width, active }) {
  var ref = useRef(null)
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var w = width || 50, h = 4
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (active) {
      var rc = rough.canvas(cvs)
      rc.line(2, 2, w-2, 2, { stroke: '#5A4A38', strokeWidth: 1.5, roughness: 0.7, bowing: 0.5, disableMultiStroke: true, seed: 33 })
    }
  }, [width, active])
  return <canvas ref={ref} style={{ display: 'block' }} />
}

function RoughAddButton({ size, label }) {
  var ref = useRef(null)
  var sz = size || 52
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = (sz + 14) * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = (sz + 14) + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.rectangle(4, 4, sz-8, sz-8, { stroke: '#C0B8A8', strokeWidth: 1, roughness: 0.6, bowing: 0.5, disableMultiStroke: true, seed: 40, strokeLineDash: [4, 3] })
    var cx = sz/2, cy = sz/2
    rc.line(cx, cy-7, cx, cy+7, { stroke: '#B0A898', strokeWidth: 1.2, roughness: 0.4, disableMultiStroke: true, seed: 41 })
    rc.line(cx-7, cy, cx+7, cy, { stroke: '#B0A898', strokeWidth: 1.2, roughness: 0.4, disableMultiStroke: true, seed: 42 })
    if (label) {
      ctx.fillStyle = '#B0A898'
      ctx.font = "9px '-apple-system', 'PingFang SC', sans-serif"
      ctx.textAlign = 'center'
      ctx.fillText(label, sz/2, sz + 8)
    }
  }, [sz, label])
  return <canvas ref={ref} style={{ display: 'block' }} />
}

function RoughPanelBorder({ width }) {
  var ref = useRef(null)
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var w = width || 300, h = 4
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.line(16, 2, w-16, 2, { stroke: '#D8D0C4', strokeWidth: 0.8, roughness: 1, bowing: 0.3, disableMultiStroke: true, seed: 50 })
  }, [width])
  return <canvas ref={ref} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
}

function RoughDivider({ width }) {
  var ref = useRef(null)
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var w = width || 300, h = 3
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.line(8, 1.5, w-8, 1.5, { stroke: '#EAE4DC', strokeWidth: 0.7, roughness: 1.2, bowing: 0.3, disableMultiStroke: true, seed: 55 })
  }, [width])
  return <canvas ref={ref} style={{ display: 'block', width: '100%' }} />
}

function RoughGenButton({ width, disabled, loading, onClick }) {
  var ref = useRef(null)
  var w = width || 200, h = 38
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    var c = disabled ? '#D0C8C0' : '#2E94B9'
    rc.rectangle(3, 3, w-6, h-6, {
      stroke: c, strokeWidth: 1.2, roughness: 0.5, bowing: 0.6,
      disableMultiStroke: true, seed: 60,
      fill: c, fillStyle: 'solid',
    })
    ctx.fillStyle = '#fff'
    ctx.font = "600 12px '-apple-system', 'PingFang SC', sans-serif"
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(loading ? 'generating...' : 'Generate', w/2, h/2)
  }, [w, disabled, loading])
  return <canvas ref={ref} onClick={disabled ? undefined : onClick} style={{ display: 'block', cursor: disabled ? 'default' : 'pointer' }} />
}

function RoughBackButton({ onClick }) {
  var ref = useRef(null)
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var w = 40, h = 20
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.line(4, h/2, 12, h/2-4, { stroke: '#B0A898', strokeWidth: 0.9, roughness: 0.5, disableMultiStroke: true, seed: 70 })
    rc.line(4, h/2, 12, h/2+4, { stroke: '#B0A898', strokeWidth: 0.9, roughness: 0.5, disableMultiStroke: true, seed: 71 })
    ctx.fillStyle = '#B0A898'
    ctx.font = "13px '-apple-system', 'PingFang SC', sans-serif"
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText('back', 14, h/2 + 1)
  }, [])
  return <canvas ref={ref} onClick={onClick} style={{ display: 'block', cursor: 'pointer' }} />
}

function RoughPreviewBox({ size }) {
  var ref = useRef(null)
  var sz = size || 120
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.rectangle(4, 4, sz-8, sz-8, {
      stroke: '#D0C8C0', strokeWidth: 1, roughness: 0.6, bowing: 0.5,
      disableMultiStroke: true, seed: 80,
      fill: '#F0ECE6', fillStyle: 'solid',
    })
    ctx.fillStyle = '#C0B8A8'
    ctx.font = "11px '-apple-system', 'PingFang SC', sans-serif"
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('preview', sz/2, sz/2)
  }, [sz])
  return <canvas ref={ref} style={{ display: 'block', margin: '0 auto 16px' }} />
}

function RoughInput({ value, onChange, placeholder }) {
  var borderRef = useRef(null)
  useEffect(function() {
    var cvs = borderRef.current; if (!cvs) return
    var w = cvs.parentElement ? cvs.parentElement.clientWidth : 260
    var h = 40
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.rectangle(3, 3, w-6, h-6, {
      stroke: '#D0C8C0', strokeWidth: 1.2, roughness: 0.6, bowing: 0.5,
      disableMultiStroke: true, seed: 90,
      fill: '#FAFAF6', fillStyle: 'solid',
    })
  }, [])
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <canvas ref={borderRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
      <input type="text" value={value} onChange={onChange} placeholder={placeholder}
        style={{
          position: 'relative', width: '100%', padding: '10px 14px',
          border: 'none', background: 'transparent', fontSize: 13,
          fontFamily: 'inherit', color: '#5A4A38', outline: 'none',
          boxSizing: 'border-box', height: 40,
        }} />
    </div>
  )
}


export default function StampsPanel({ open, onClose, onSelect, onDragToMap, recipes }) {
  var tabState = useState('rhythm')
  var activeTab = tabState[0], setActiveTab = tabState[1]
  var genState = useState(false)
  var generatorOpen = genState[0], setGeneratorOpen = genState[1]
  var inputState = useState('')
  var genInput = inputState[0], setGenInput = inputState[1]
  var loadState = useState(false)
  var genLoading = loadState[0], setGenLoading = loadState[1]
  var catState = useState(defaultCategories)
  var categories = catState[0]
  var dragState = useState(null)
  var dragging = dragState[0], setDragging = dragState[1]
  var posState = useState(null)
  var dragPos = posState[0], setDragPos = posState[1]
  var panelRef = useRef(null)
  var dragCanvasRef = useRef(null)
  var panelWidthState = useState(300)
  var panelWidth = panelWidthState[0], setPanelWidth = panelWidthState[1]

  var cats = Object.entries(categories)
  var currentItems = categories[activeTab] ? categories[activeTab].items : []

  useEffect(function() {
    if (open && panelRef.current) {
      setPanelWidth(panelRef.current.clientWidth)
    }
  }, [open])

  var drawStamp = useCallback(function(canvas, type, color) {
    if (!canvas || !recipes || !recipes[type]) return
    var ctx = canvas.getContext('2d')
    var rc = rough.canvas(canvas)
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    var size = 52
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = size + 'px'
    canvas.style.height = size + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)
    recipes[type](rc, ctx, size/2, size/2, size/80, color || '#A09080')
  }, [recipes])

  useEffect(function() {
    if (!dragging || !dragCanvasRef.current || !recipes) return
    var canvas = dragCanvasRef.current
    var ctx = canvas.getContext('2d')
    var rc = rough.canvas(canvas)
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    var size = 60
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

  useEffect(function() {
    if (!open) return
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    var timer = setTimeout(function() { document.addEventListener('click', handleClick) }, 100)
    return function() { clearTimeout(timer); document.removeEventListener('click', handleClick) }
  }, [open, onClose])

  function startDrag(e, type) {
    e.preventDefault()
    var touch = e.touches ? e.touches[0] : e
    setDragging(type)
    setDragPos({ x: touch.clientX - 30, y: touch.clientY - 30 })
    function onMove(ev) {
      var t = ev.touches ? ev.touches[0] : ev
      setDragPos({ x: t.clientX - 30, y: t.clientY - 30 })
    }
    function onEnd(ev) {
      var t = ev.changedTouches ? ev.changedTouches[0] : ev
      var panelTop = panelRef.current ? panelRef.current.getBoundingClientRect().top : window.innerHeight
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
        overflow: 'hidden',
      }} onClick={function(e) { e.stopPropagation() }}>

        <RoughPanelBorder width={panelWidth} />

        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 4px', justifyContent: 'center', position: 'relative' }}>
          <RoughHandle width={40} />
          <div style={{ position: 'absolute', right: 12, top: 6 }}>
            <RoughClose size={28} onClick={onClose} />
          </div>
        </div>

        {!generatorOpen ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 0, paddingBottom: 0 }}>
              {cats.map(function(entry) {
                var key = entry[0], cat = entry[1]
                return (
                  <div key={key} onClick={function() { setActiveTab(key) }} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '8px 16px 2px', cursor: 'pointer',
                  }}>
                    <span style={{
                      fontSize: 12, letterSpacing: 1,
                      color: activeTab === key ? '#5A4A38' : '#B0A898',
                      fontWeight: activeTab === key ? 600 : 400,
                      fontFamily: 'inherit',
                    }}>{cat.label}</span>
                    <RoughTabLine width={50} active={activeTab === key} />
                  </div>
                )
              })}
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px 8px 2px', cursor: 'pointer' }}>
                <span style={{ fontSize: 14, color: '#C0B8A8' }}>+</span>
              </div>
            </div>

            <RoughDivider width={panelWidth} />

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 4, padding: '12px 16px',
              flex: 1, overflowY: 'auto', alignContent: 'start',
            }}>
              {currentItems.map(function(item) {
                return (
                  <div key={item.type}
                    onMouseDown={function(e) { startDrag(e, item.type) }}
                    onTouchStart={function(e) { startDrag(e, item.type) }}
                    onClick={function() { onSelect && onSelect(item.type) }}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', padding: '8px 4px',
                      borderRadius: 8, cursor: 'grab',
                      userSelect: 'none', WebkitUserSelect: 'none',
                    }}>
                    <StampThumb type={item.type} recipes={recipes} drawStamp={drawStamp} />
                    <span style={{ fontSize: 10, color: '#8A7A68', marginTop: 4 }}>{item.label}</span>
                  </div>
                )
              })}
              <div onClick={function() { setGeneratorOpen(true) }} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '4px', cursor: 'pointer', minHeight: 72,
              }}>
                <RoughAddButton size={52} label="generate" />
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#5A4A38' }}>Generate Stamp</span>
              <RoughBackButton onClick={function() { setGeneratorOpen(false) }} />
            </div>
            <RoughPreviewBox size={120} />
            <RoughInput
              value={genInput}
              onChange={function(e) { setGenInput(e.target.value) }}
              placeholder="describe: McDonald's, ramen shop..."
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
              <RoughGenButton
                width={Math.min(panelWidth - 32, 300)}
                disabled={genLoading || !genInput.trim()}
                loading={genLoading}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function StampThumb({ type, recipes, drawStamp }) {
  var ref = useRef(null)
  useEffect(function() {
    if (ref.current) drawStamp(ref.current, type, '#A09080')
  }, [type, drawStamp])
  return <canvas ref={ref} style={{ display: 'block' }} />
}
