// StampsPanel v5 — Stickers + Patterns, Rough.js UI throughout
import { useState, useRef, useEffect, useCallback } from 'react'
import rough from 'roughjs'
import { stickerCategories, stickerRecipes, stickerColors } from './StickerRecipes'
import { patternTypes, colorPresets, renderPattern } from './PatternLib'

var RO = { roughness: 0.5, bowing: 0.8, disableMultiStroke: true }
var FONT = "'-apple-system', 'PingFang SC', sans-serif"

function RoughHandle({ width }) {
  var ref = useRef(null)
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    var w = width || 40, h = 8
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.line(4, 3, w - 4, 3, { stroke: '#C0B8A8', strokeWidth: 1.5, roughness: 0.8, bowing: 0.6, disableMultiStroke: true, seed: 11 })
  }, [width])
  return <canvas ref={ref} style={{ display: 'block' }} />
}

function RoughClose({ size, onClick }) {
  var ref = useRef(null)
  var sz = size || 32
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.line(10, 10, sz - 10, sz - 10, { stroke: '#B0A898', strokeWidth: 1.3, ...RO, seed: 20 })
    rc.line(sz - 10, 10, 10, sz - 10, { stroke: '#B0A898', strokeWidth: 1.3, ...RO, seed: 21 })
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
      rc.line(4, 2, w - 4, 2, { stroke: '#5A4A38', strokeWidth: 1.5, roughness: 0.7, bowing: 0.5, disableMultiStroke: true, seed: 33 })
    }
  }, [width, active])
  return <canvas ref={ref} style={{ display: 'block' }} />
}

function RoughPlusCircle({ size, onClick }) {
  var ref = useRef(null)
  var sz = size || 36
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    var cx = sz / 2, cy = sz / 2
    rc.circle(cx, cy, sz - 8, { stroke: '#C0B8A8', strokeWidth: 0.8, roughness: 0.5, disableMultiStroke: true, seed: 44 })
    rc.line(cx, cy - 6, cx, cy + 6, { stroke: '#B0A898', strokeWidth: 1.2, roughness: 0.4, disableMultiStroke: true, seed: 45 })
    rc.line(cx - 6, cy, cx + 6, cy, { stroke: '#B0A898', strokeWidth: 1.2, roughness: 0.4, disableMultiStroke: true, seed: 46 })
  }, [])
  return <canvas ref={ref} onClick={onClick} style={{ display: 'block', cursor: 'pointer' }} />
}

function RoughBtn({ width, label, color, disabled, onClick }) {
  var ref = useRef(null)
  var w = width || 120, h = 38
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    var c = disabled ? '#D0C8C0' : (color || '#2E94B9')
    rc.rectangle(3, 3, w - 6, h - 6, { stroke: c, strokeWidth: 1.2, ...RO, seed: 60, fill: c, fillStyle: 'solid' })
    ctx.fillStyle = '#fff'
    ctx.font = "600 12px " + FONT
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(label || 'Generate', w / 2, h / 2)
  }, [w, label, color, disabled])
  return <canvas ref={ref} onClick={disabled ? undefined : onClick} style={{ display: 'block', cursor: disabled ? 'default' : 'pointer' }} />
}

function RoughInput({ value, onChange, placeholder }) {
  var borderRef = useRef(null)
  useEffect(function() {
    var cvs = borderRef.current; if (!cvs) return
    var w = cvs.parentElement ? cvs.parentElement.clientWidth : 260
    var h = 42
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.rectangle(3, 3, w - 6, h - 6, { stroke: '#D0C8C0', strokeWidth: 1.2, ...RO, seed: 90, fill: '#FAFAF6', fillStyle: 'solid' })
  }, [])
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <canvas ref={borderRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%' }} />
      <input type="text" value={value} onChange={onChange} placeholder={placeholder}
        style={{ position: 'relative', width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit', color: '#5A4A38', outline: 'none', boxSizing: 'border-box', height: 42 }} />
    </div>
  )
}

function RoughFrame({ size }) {
  var ref = useRef(null)
  var sz = size || 100
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.rectangle(4, 4, sz - 8, sz - 8, { stroke: '#D0C8C0', strokeWidth: 1, ...RO, seed: 80, fill: '#F5F2EC', fillStyle: 'solid' })
    ctx.fillStyle = '#C0B8A8'
    ctx.font = '11px ' + FONT; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('preview', sz / 2, sz / 2)
  }, [sz])
  return <canvas ref={ref} style={{ display: 'block', margin: '0 auto 12px' }} />
}

function RoughBack({ onClick }) {
  var ref = useRef(null)
  useEffect(function() {
    var cvs = ref.current; if (!cvs) return
    var w = 44, h = 24
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = w * dpr; cvs.height = h * dpr
    cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.line(4, h / 2, 13, h / 2 - 5, { stroke: '#B0A898', strokeWidth: 1, roughness: 0.5, disableMultiStroke: true, seed: 70 })
    rc.line(4, h / 2, 13, h / 2 + 5, { stroke: '#B0A898', strokeWidth: 1, roughness: 0.5, disableMultiStroke: true, seed: 71 })
    ctx.fillStyle = '#B0A898'; ctx.font = '13px ' + FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText('back', 15, h / 2 + 1)
  }, [])
  return <canvas ref={ref} onClick={onClick} style={{ display: 'block', cursor: 'pointer' }} />
}

function StickerThumb({ recipeFn, color, size }) {
  var ref = useRef(null)
  var sz = size || 58
  useEffect(function() {
    if (!ref.current || !recipeFn) return
    var cvs = ref.current
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, sz, sz)
    var rc = rough.canvas(cvs)
    recipeFn(rc, ctx, sz / 2, sz / 2, sz / 56, color || '#A09080')
  }, [recipeFn, color, sz])
  return <canvas ref={ref} style={{ display: 'block' }} />
}

function PatternThumb({ patternId, colorId }) {
  var ref = useRef(null)
  useEffect(function() { renderPattern(ref.current, patternId, colorId, 2) }, [patternId, colorId])
  return <canvas ref={ref} style={{ display: 'block', borderRadius: 4 }} />
}

function GenPreview({ shapes, size }) {
  var ref = useRef(null)
  var sz = size || 100
  useEffect(function() {
    if (!ref.current || !shapes) return
    var cvs = ref.current
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, sz, sz)
    var rc2 = rough.canvas(cvs)
    rc2.rectangle(4, 4, sz - 8, sz - 8, { stroke: '#D0C8C0', strokeWidth: 1, ...RO, seed: 80, fill: '#F5F2EC', fillStyle: 'solid' })
    // drawFromJSON for AI-generated stickers
    if (shapes && shapes.length) {
      for (var i = 0; i < shapes.length; i++) {
        var sh = shapes[i], s = sz / 32, cx = sz/2, cy = sz/2
        var opts = { roughness: 0.6, disableMultiStroke: true, seed: 650 + i * 3 }
        if (sh.fill) { opts.fill = sh.fill; opts.fillStyle = 'solid' }
        if (sh.stroke) opts.stroke = sh.stroke; opts.strokeWidth = (sh.sw || 1.2) * s
        if (sh.t === 'circle') rc2.circle(cx + sh.x * s, cy + sh.y * s, (sh.r || 3) * 2 * s, opts)
        else if (sh.t === 'ellipse') rc2.ellipse(cx + sh.x * s, cy + sh.y * s, (sh.w || 6) * s, (sh.h || 3) * s, opts)
        else if (sh.t === 'line') rc2.line(cx + sh.x1 * s, cy + sh.y1 * s, cx + sh.x2 * s, cy + sh.y2 * s, opts)
        else if (sh.t === 'rect') rc2.rectangle(cx + sh.x * s, cy + sh.y * s, (sh.w || 4) * s, (sh.h || 4) * s, opts)
      }
    }
  }, [shapes, sz])
  return <canvas ref={ref} style={{ display: 'block', margin: '0 auto 12px' }} />
}


export default function StampsPanel({ open, onClose, onStickerPlace, onPatternPlace, supaGet, supaPost, supaPatch }) {
  var [topTab, setTopTab] = useState('stickers')
  var [stickerTab, setStickerTab] = useState('flora')
  var [stickerColor, setStickerColor] = useState("#D0A0A0")
  var [selPattern, setSelPattern] = useState('polka')
  var [selColor, setSelColor] = useState('cream')
  var [genOpen, setGenOpen] = useState(false)
  var [genInput, setGenInput] = useState('')
  var [genLoading, setGenLoading] = useState(false)
  var [genResult, setGenResult] = useState(null)
  var [genId, setGenId] = useState(null)
  var [feedbackInput, setFeedbackInput] = useState('')
  var [customStickers, setCustomStickers] = useState([])
  var [customLoaded, setCustomLoaded] = useState(false)
  var panelRef = useRef(null)
  var dragCanvasRef = useRef(null)
  var [dragging, setDragging] = useState(null)
  var [dragPos, setDragPos] = useState(null)

  function startDrag(e, item) {
    e.preventDefault()
    var touch = e.touches ? e.touches[0] : e
    setDragging(item)
    setDragPos({ x: touch.clientX - 30, y: touch.clientY - 30 })
    function onMove(ev) {
      ev.preventDefault()
      var t = ev.touches ? ev.touches[0] : ev
      setDragPos({ x: t.clientX - 30, y: t.clientY - 30 })
    }
    function onEnd(ev) {
      var t = ev.changedTouches ? ev.changedTouches[0] : ev
      var panelTop = panelRef.current ? panelRef.current.getBoundingClientRect().top : window.innerHeight
      if (t.clientY < panelTop && onStickerPlace) {
        onStickerPlace(item.type, item.label, stickerColor, t.clientX, t.clientY)
      }
      setDragging(null); setDragPos(null)
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

  useEffect(function() {
    if (!open || customLoaded || !supaGet) return
    supaGet('hopscotch_stickers', 'status=eq.done&order=created_at.desc').then(function(rows) {
      if (rows) setCustomStickers(rows); setCustomLoaded(true)
    }).catch(function() { setCustomLoaded(true) })
  }, [open, customLoaded, supaGet])

  useEffect(function() {
    if (!open) return
    function handleClick(e) { if (panelRef.current && !panelRef.current.contains(e.target)) onClose() }
    var timer = setTimeout(function() { document.addEventListener('click', handleClick) }, 100)
    return function() { clearTimeout(timer); document.removeEventListener('click', handleClick) }
  }, [open, onClose])

  function handleGenerate() {
    if (!genInput.trim() || genLoading || !supaPost) return
    setGenLoading(true); setGenResult(null)
    var name = genInput.trim().substring(0, 40)
    supaPost('hopscotch_stickers', { name: name, description: name, category: stickerTab, status: 'pending' }).then(function(rows) {
      if (!rows || !rows[0]) { setGenLoading(false); return }
      var id = rows[0].id; setGenId(id)
      var safeName = name.replace(/[^a-zA-Z0-9\u4e00-\u9fff\s\-.,!?]/g, '')
      supaPost('commands', { cmd: 'nohup python3 ~/lucid/gen_sticker.py "' + safeName + '" ' + id + ' > /dev/null 2>&1 &', status: 'pending' })
      var attempts = 0
      var poll = setInterval(function() {
        attempts++
        if (attempts > 20) { clearInterval(poll); setGenLoading(false); return }
        supaGet('hopscotch_stickers', 'id=eq.' + id).then(function(fresh) {
          if (fresh && fresh[0] && fresh[0].status === 'done' && fresh[0].recipe) {
            clearInterval(poll); setGenResult(fresh[0].recipe); setGenLoading(false)
            setCustomStickers(function(prev) { return [fresh[0]].concat(prev) })
          } else if (fresh && fresh[0] && fresh[0].status === 'failed') {
            clearInterval(poll); setGenLoading(false)
          }
        })
      }, 2000)
    }).catch(function() { setGenLoading(false) })
  }

  function handleIterate() {
    if (!feedbackInput.trim() || !genId || genLoading || !supaPost) return
    setGenLoading(true)
    var fb = feedbackInput.trim().replace(/[^a-zA-Z0-9\u4e00-\u9fff\s\-.,!?]/g, '').substring(0, 80)
    var safeName = genInput.trim().replace(/[^a-zA-Z0-9\u4e00-\u9fff\s\-.,!?]/g, '').substring(0, 40)
    if (supaPatch) supaPatch('hopscotch_stickers', 'id=eq.' + genId, { status: 'pending' })
    supaPost('commands', { cmd: 'nohup python3 ~/lucid/gen_sticker.py "' + safeName + '" ' + genId + ' "' + fb + '" > /dev/null 2>&1 &', status: 'pending' })
    setFeedbackInput('')
    var attempts = 0
    var poll = setInterval(function() {
      attempts++
      if (attempts > 20) { clearInterval(poll); setGenLoading(false); return }
      supaGet('hopscotch_stickers', 'id=eq.' + genId).then(function(fresh) {
        if (fresh && fresh[0] && fresh[0].status === 'done' && fresh[0].recipe) {
          clearInterval(poll); setGenResult(fresh[0].recipe); setGenLoading(false)
          setCustomStickers(function(prev) { return prev.map(function(s) { return s.id === genId ? fresh[0] : s }) })
        } else if (fresh && fresh[0] && fresh[0].status === 'failed') { clearInterval(poll); setGenLoading(false) }
      })
    }, 2000)
  }

  if (!open) return null

  // draw drag ghost
  if (dragging && dragCanvasRef.current && dragging.recipeFn) {
    var _cvs = dragCanvasRef.current
    var _dpr = Math.min(window.devicePixelRatio || 1, 3)
    var _sz = 60
    _cvs.width = _sz * _dpr; _cvs.height = _sz * _dpr
    _cvs.style.width = _sz + 'px'; _cvs.style.height = _sz + 'px'
    var _ctx = _cvs.getContext('2d'); _ctx.setTransform(_dpr, 0, 0, _dpr, 0, 0)
    _ctx.clearRect(0, 0, _sz, _sz)
    var _rc = rough.canvas(_cvs)
    dragging.recipeFn(_rc, _ctx, _sz/2, _sz/2, _sz/56, stickerColor)
  }

  var currentItems = []
  var cat = stickerCategories[stickerTab]
  if (cat) currentItems = cat.items.map(function(item) { return { type: item.type, label: item.label, recipeFn: stickerRecipes[item.type] } })
  var customForTab = customStickers.filter(function(s) { return s.category === stickerTab && s.recipe })
  customForTab.forEach(function(s) { currentItems.push({ type: 'custom_' + s.id, label: s.name, shapes: s.recipe }) })
  var catEntries = Object.entries(stickerCategories)

  return (<>
    {dragging && dragPos && (
        <canvas ref={dragCanvasRef} style={{
          position: 'fixed', left: dragPos.x, top: dragPos.y,
          pointerEvents: 'none', zIndex: 200, opacity: 0.85,
        }} />
      )}
    <div ref={panelRef} style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FAF6F0',
      opacity: dragging ? 0.3 : 1,
      borderRadius: '16px 16px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      zIndex: 100, height: genOpen ? '85vh' : '42vh', transition: 'height 0.3s ease',
      display: 'flex', flexDirection: 'column', fontFamily: FONT, overflow: 'hidden',
    }} onClick={function(e) { e.stopPropagation() }}>

      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 4px', justifyContent: 'center', position: 'relative' }}>
        <RoughHandle width={40} />
        <div style={{ position: 'absolute', right: 10, top: 8 }}>
          <RoughClose size={32} onClick={genOpen ? function() { setGenOpen(false); setGenResult(null); setGenId(null); setGenInput('') } : onClose} />
        </div>
      </div>

      {!genOpen ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, padding: '0 0 2px' }}>
            {[{ k: 'stickers', l: 'Stickers' }, { k: 'patterns', l: 'Patterns' }].map(function(t) {
              return (
                <div key={t.k} onClick={function() { setTopTab(t.k) }} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 24px 0', cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 13, letterSpacing: 1.5, color: topTab === t.k ? '#5A4A38' : '#B0A898', fontWeight: topTab === t.k ? 700 : 400 }}>{t.l}</span>
                  <RoughTabLine width={60} active={topTab === t.k} />
                </div>
              )
            })}
          </div>

          {topTab === 'stickers' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '2px 8px 4px' }}>
                {catEntries.map(function(entry) {
                  var key = entry[0], c = entry[1]
                  return (
                    <div key={key} onClick={function() { setStickerTab(key) }} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 14px 0', cursor: 'pointer',
                    }}>
                      <span style={{ fontSize: 11, letterSpacing: 0.5, color: stickerTab === key ? '#5A4A38' : '#B0A898', fontWeight: stickerTab === key ? 600 : 400 }}>{c.label}</span>
                      <RoughTabLine width={44} active={stickerTab === key} />
                    </div>
                  )
                })}
                <div style={{ padding: '0 4px', display: 'flex', alignItems: 'center' }}>
                  <RoughPlusCircle size={32} onClick={function() { setGenOpen(true) }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '2px 0 6px', flexWrap: 'wrap' }}>
                {stickerColors.map(function(sc) {
                  var active = stickerColor === sc.c
                  return (
                    <div key={sc.id} onClick={function() { setStickerColor(sc.c) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 10, background: sc.c, border: active ? '2px solid #5A4A38' : '2px solid transparent' }} />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: '6px 16px', flex: 1, overflowY: 'auto', alignContent: 'start' }}>
                {currentItems.map(function(item) {
                  return (
                    <div key={item.type}
                      onTouchStart={function(e) { startDrag(e, item) }}
                      onMouseDown={function(e) { startDrag(e, item) }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 4px', cursor: 'grab', userSelect: 'none', WebkitUserSelect: 'none' }}>
                      <StickerThumb recipeFn={item.recipeFn} color={stickerColor} />
                      <span style={{ fontSize: 9, color: '#8A7A68', marginTop: 3, textAlign: 'center' }}>{item.label}</span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px' }}>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '4px 0 10px', flexWrap: 'wrap' }}>
                {colorPresets.map(function(cp) {
                  var active = selColor === cp.id
                  return (
                    <div key={cp.id} onClick={function() { setSelColor(cp.id) }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                      <div style={{ width: 24, height: 24, borderRadius: 12, background: cp.fg, border: active ? '2px solid #5A4A38' : '2px solid transparent' }} />
                      <span style={{ fontSize: 8, color: active ? '#5A4A38' : '#B0A898', marginTop: 2 }}>{cp.label}</span>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, alignContent: 'start' }}>
                {patternTypes.map(function(pt) {
                  var active = selPattern === pt.id
                  return (
                    <div key={pt.id} onClick={function() { setSelPattern(pt.id); onPatternPlace && onPatternPlace(pt.id, selColor) }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4, cursor: 'pointer', outline: active ? '2px solid #2E94B9' : 'none', borderRadius: 6 }}>
                      <PatternThumb patternId={pt.id} colorId={selColor} />
                      <span style={{ fontSize: 9, color: '#8A7A68', marginTop: 3 }}>{pt.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '8px 16px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <RoughBack onClick={function() { setGenOpen(false); setGenResult(null); setGenId(null); setGenInput('') }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#5A4A38' }}>Generate Sticker</span>
          </div>
          {genResult ? <GenPreview shapes={genResult} size={100} /> : <RoughFrame size={100} />}
          {!genResult ? (
            <>
              <RoughInput value={genInput} onChange={function(e) { setGenInput(e.target.value) }} placeholder="describe: cherry blossom, wax seal..." />
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                <RoughBtn width={200} label={genLoading ? 'generating...' : 'Generate'} disabled={genLoading || !genInput.trim()} onClick={handleGenerate} />
              </div>
            </>
          ) : (
            <>
              <RoughInput value={feedbackInput} onChange={function(e) { setFeedbackInput(e.target.value) }} placeholder="feedback: bigger petals, add leaves..." />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
                <RoughBtn width={140} label={genLoading ? 'generating...' : 'Iterate'} disabled={genLoading || !feedbackInput.trim()} onClick={handleIterate} />
                <RoughBtn width={100} label="Done" color="#4AAF5C" onClick={function() { setGenOpen(false); setGenResult(null); setGenId(null); setGenInput(''); setFeedbackInput('') }} />
              </div>
            </>
          )}
          {genResult && (
            <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: '#B0A898', width: '100%', textAlign: 'center', marginBottom: 2 }}>save to:</span>
              {catEntries.map(function(entry) {
                var key = entry[0], c = entry[1]
                return (
                  <div key={key} onClick={function() {
                    if (genId && supaPatch) supaPatch('hopscotch_stickers', 'id=eq.' + genId, { category: key })
                    setCustomStickers(function(prev) { return prev.map(function(s) { return s.id === genId ? Object.assign({}, s, { category: key }) : s }) })
                    setStickerTab(key)
                  }} style={{ padding: '4px 12px', fontSize: 11, cursor: 'pointer', color: '#5A4A38', background: '#F0ECE6', borderRadius: 10 }}>{c.label}</div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  </>)
}
