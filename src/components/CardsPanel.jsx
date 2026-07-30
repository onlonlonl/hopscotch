import { useState, useRef, useEffect, useCallback } from 'react'
import rough from 'roughjs'
import { locColor } from '../lib/tokens'
import PoiPicker, { poiToGeoPatch } from './PoiPicker'
import { supaGet, supaPost, supaPatch, supaDelete, isConnected } from '../lib/supabase'

/* === Weather-themed flat border === */
var FRO = { roughness: 0.8, bowing: 0.5, disableMultiStroke: true }
function fro(x) { var o = { ...FRO, seed: 2 }; if (x) { for (var k in x) o[k] = x[k] }; return o }

function drawFlatBorder(rc, w, h, wt, c) {
  var m = 3
  if (wt === 'drizzle' || wt === 'rain') {
    rc.rectangle(m, m, w - m * 2, h - m * 2, fro({ stroke: c, strokeWidth: 1.2 }))
    function drop(x, y, s) { rc.circle(x, y + s * 0.4, s, fro({ stroke: c, strokeWidth: 0.5, fill: c, fillStyle: 'solid' })); rc.linearPath([[x, y - s * 0.6], [x - s * 0.3, y + s * 0.1], [x + s * 0.3, y + s * 0.1]], fro({ stroke: c, strokeWidth: 0.4 })) }
    drop(w - m - 10, m + 8, 2.5); drop(w - m - 20, m + 6, 2)
    if (wt === 'rain') { drop(m + 12, h - m - 8, 2); drop(m + 22, h - m - 6, 2.5) }
  } else if (wt === 'storm') {
    rc.rectangle(m, m, w - m * 2, h - m * 2, fro({ stroke: c, strokeWidth: 1.4 }))
    rc.linearPath([[w - m - 14, m + 5], [w - m - 18, m + 14], [w - m - 13, m + 14], [w - m - 17, m + 24]], fro({ stroke: '#D0A830', strokeWidth: 1.2 }))
  } else if (wt === 'cloudy' || wt === 'overcast') {
    rc.rectangle(m, m, w - m * 2, h - m * 2, fro({ stroke: c, strokeWidth: wt === 'overcast' ? 1.6 : 1.2 }))
    if (wt === 'cloudy') {
      rc.linearPath([[w - m - 28, m + 10], [w - m - 24, m + 6], [w - m - 18, m + 5], [w - m - 14, m + 7], [w - m - 10, m + 10]], fro({ stroke: c, strokeWidth: 0.7 }))
      rc.line(w - m - 28, m + 10, w - m - 10, m + 10, fro({ stroke: c, strokeWidth: 0.6 }))
    }
  } else if (wt === 'fog') {
    rc.line(m, m, m + 30, m, fro({ stroke: c, strokeWidth: 1, roughness: 1.5 })); rc.line(m + 40, m, w - m, m, fro({ stroke: c, strokeWidth: 0.8, roughness: 1.5 }))
    rc.line(m, h - m, m + 25, h - m, fro({ stroke: c, strokeWidth: 0.8, roughness: 1.5 })); rc.line(m + 35, h - m, w - m, h - m, fro({ stroke: c, strokeWidth: 1, roughness: 1.5 }))
    rc.line(m, m, m, h - m, fro({ stroke: c, strokeWidth: 0.8 })); rc.line(w - m, m, w - m, h - m, fro({ stroke: c, strokeWidth: 0.8 }))
  } else if (wt === 'snow') {
    rc.rectangle(m, m, w - m * 2, h - m * 2, fro({ stroke: c, strokeWidth: 1.2 }))
    function flk(x, y, r) { for (var i = 0; i < 3; i++) { var a = (Math.PI / 3) * i; rc.line(x + Math.cos(a) * r, y + Math.sin(a) * r, x - Math.cos(a) * r, y - Math.sin(a) * r, fro({ stroke: c, strokeWidth: 0.6 })) } }
    flk(w - m - 10, m + 8, 3); flk(w - m - 22, h - m - 8, 2.5)
  } else if (wt === 'warm' || wt === 'sun' || wt === 'clear') {
    rc.rectangle(m, m, w - m * 2, h - m * 2, fro({ stroke: c, strokeWidth: 1.2 }))
    var sx = w - m - 12, sy = m + 10, sr = 4
    rc.circle(sx, sy, sr * 2, fro({ stroke: c, strokeWidth: 0.6, fill: c, fillStyle: 'solid' }))
    for (var i = 0; i < 5; i++) { var a = (i / 5) * Math.PI * 2; rc.line(sx + Math.cos(a) * (sr + 2), sy + Math.sin(a) * (sr + 2), sx + Math.cos(a) * (sr + 5), sy + Math.sin(a) * (sr + 5), fro({ stroke: c, strokeWidth: 0.5 })) }
  } else {
    rc.rectangle(m, m, w - m * 2, h - m * 2, fro({ stroke: c, strokeWidth: 1.2 }))
  }
}

var FONT = "-apple-system, 'PingFang SC', sans-serif"
var CARD_H = 56
var DELETE_W = 64

function freeSpot(locations) {
  var taken = (locations || []).map(function(l) { return [l.lux_x || 50, l.lux_y || 50] })
  function occupied(x, y) {
    for (var i = 0; i < taken.length; i++) {
      if (Math.hypot(taken[i][0] - x, taken[i][1] - y) < 9) return true
    }
    return false
  }
  if (!occupied(50, 50)) return { lux_x: 50, lux_y: 50 }
  for (var ring = 1; ring < 8; ring++) {
    var r = ring * 11, steps = ring * 6
    for (var s = 0; s < steps; s++) {
      var a = (s / steps) * Math.PI * 2 + ring * 0.7
      var x = 50 + Math.cos(a) * r, y = 50 + Math.sin(a) * r
      if (x < 6 || x > 94 || y < 6 || y > 94) continue
      if (!occupied(x, y)) return { lux_x: Math.round(x * 10) / 10, lux_y: Math.round(y * 10) / 10 }
    }
  }
  return { lux_x: 50, lux_y: 50 }
}

export default function CardsPanel({ open, onClose, locations, onFocus, setLocations, cityName }) {
  var borderRef = useRef(null)
  var cardRefs = useRef({})

  /* --- swipe state per card --- */
  var [swipeId, setSwipeId] = useState(null)
  var [swipeX, setSwipeX] = useState(0)
  var touchRef = useRef({ id: null, startX: 0, startY: 0, moved: false })

  /* --- edit state --- */
  var [editId, setEditId] = useState(null)
  var [editFields, setEditFields] = useState({ ink_name_iris: '', label: '' })
  var [savedId, setSavedId] = useState(null)

  /* --- POI search state --- */
  var [adding, setAdding] = useState(false)

  /* --- draw panel border --- */
  useEffect(function () {
    if (!open || !borderRef.current) return
    var cvs = borderRef.current, W = 240, H = 380, dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = W * dpr; cvs.height = H * dpr; cvs.style.width = W + 'px'; cvs.style.height = H + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    rough.canvas(cvs).rectangle(3, 3, W - 6, H - 6, { stroke: 'rgba(200,200,200,0.6)', strokeWidth: 1.8, fill: '#FFFFFF', fillStyle: 'solid', roughness: 0.5, bowing: 0.6, disableMultiStroke: true, seed: 300 })
  }, [open])

  /* --- draw card borders --- */
  useEffect(function () {
    if (!open) return
    setTimeout(function () {
      locations.forEach(function (loc) {
        var cvs = cardRefs.current[loc.id]; if (!cvs || cvs._drawn) return; cvs._drawn = true
        var el = cvs.parentElement, W = el ? el.offsetWidth : 200, H = CARD_H, dpr = Math.min(window.devicePixelRatio || 1, 3)
        cvs.width = W * dpr; cvs.height = H * dpr; cvs.style.width = W + 'px'; cvs.style.height = H + 'px'
        var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H)
        drawFlatBorder(rough.canvas(cvs), W, H, loc.weather || 'clear', locColor(loc.weather))
      })
    }, 50)
  }, [open, locations, editId])

  /* --- reset on close --- */
  useEffect(function () {
    if (!open) {
      setSwipeId(null); setSwipeX(0); setEditId(null)
      setAdding(false)
      cardRefs.current = {}
    }
  }, [open])

  /* --- swipe handlers --- */
  function onCardTouchStart(e, locId) {
    // 编辑表单内部（输入框、按钮、POI 结果）不参与卡片的轻点/滑动手势，
    // 否则手指抬起会被判定成「轻点卡片」而立刻收起表单，输入框拿不到焦点
    if (e.target && e.target.closest && e.target.closest('[data-noswipe]')) {
      touchRef.current = { id: null, startX: 0, startY: 0, moved: false }
      return
    }
    var t = e.touches[0]
    touchRef.current = { id: locId, startX: t.clientX, startY: t.clientY, moved: false }
    if (swipeId && swipeId !== locId) { setSwipeId(null); setSwipeX(0) }
  }

  function onCardTouchMove(e) {
    var ref = touchRef.current
    if (!ref.id) return
    var t = e.touches[0]
    var dx = t.clientX - ref.startX
    var dy = t.clientY - ref.startY
    if (!ref.moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
      ref.id = null; return
    }
    if (Math.abs(dx) > 8) ref.moved = true
    if (!ref.moved) return
    e.preventDefault()
    var x = Math.min(0, Math.max(-DELETE_W, dx + (swipeId === ref.id ? -DELETE_W : 0)))
    setSwipeId(ref.id)
    setSwipeX(x)
  }

  function onCardTouchEnd() {
    var ref = touchRef.current
    if (!ref.id) return
    if (!ref.moved) {
      if (swipeId === ref.id) {
        setSwipeId(null); setSwipeX(0)
      } else {
        var loc = locations.find(function (l) { return l.id === ref.id })
        if (loc) {
          if (editId === ref.id) {
            setEditId(null)
          } else {
            setEditId(ref.id)
            setEditFields({
              ink_name_iris: loc.ink_name_iris || '',
              label: loc.label || '',
            })
            cardRefs.current = {}
          }
        }
      }
    } else {
      if (swipeX < -DELETE_W / 2) {
        setSwipeX(-DELETE_W)
      } else {
        setSwipeId(null); setSwipeX(0)
      }
    }
    ref.id = null; ref.moved = false
  }

  async function handleDelete(locId) {
    if (isConnected()) {
      await supaDelete('locations', 'id=eq.' + locId)
    }
    setLocations(function (prev) { return prev.filter(function (l) { return l.id !== locId }) })
    setSwipeId(null); setSwipeX(0)
    cardRefs.current = {}
  }

  async function handleSaveEdit(locId) {
    var patch = {
      ink_name_iris: editFields.ink_name_iris || null,
      label: editFields.label,
    }
    if (isConnected()) {
      await supaPatch('locations', 'id=eq.' + locId, patch)
    }
    setLocations(function (prev) {
      return prev.map(function (l) {
        if (l.id !== locId) return l
        return { ...l, ...patch }
      })
    })
    setEditId(null)
    cardRefs.current = {}
    setSavedId(locId)
    setTimeout(function(){ setSavedId(null) }, 1500)
  }

  if (!open) return null

  var inputS = {
    width: '100%', boxSizing: 'border-box',
    padding: '5px 8px', fontSize: 12,
    border: '1.5px solid rgba(46,148,185,0.25)',
    background: 'rgba(240,244,248,0.6)', color: '#5A6A7A',
    outline: 'none', fontFamily: FONT,
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200 }} />
      <div style={{ position: 'fixed', top: 58, right: 12, zIndex: 201, width: 240, height: 380 }}>
        <canvas ref={borderRef} style={{ position: 'absolute', top: 0, left: 0 }} />
        <div style={{ position: 'relative', padding: '16px 18px', zIndex: 1, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#6A7A8A', letterSpacing: 3, fontFamily: FONT }}>Places</div>
            <div onClick={function () { setAdding(!adding) }}
              style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: adding ? '#C0C0C0' : '#2E94B9', cursor: 'pointer', fontFamily: FONT }}>+</div>
          </div>

          {adding && <div style={{ marginBottom: 10 }}>
            <PoiPicker cityName={cityName} successLabel="Added" onPick={async function (poi) {
              var parts = poi.location ? poi.location.split(',') : [0, 0]
              var spot = freeSpot(locations)
              var newLoc = {
                id: poi.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 12) + '_' + Date.now().toString(36),
                label: poi.name, name: poi.name, city: poi.cityname || cityName || '',
                address: poi.address || '', lng: parts[0], lat: parts[1],
                category: poi.type ? poi.type.split(';')[0] : '',
                ink_name_iris: null, ink_name_lux: null, story: null,
                weather: null, icon_type: 'house',
                lux_x: spot.lux_x, lux_y: spot.lux_y, inf_t: null, inf_w: null,
              }
              if (isConnected()) await supaPost('locations', newLoc)
              setLocations(function (prev) {
                return [...prev, { ...newLoc, errands: 0, lat: parseFloat(newLoc.lat), lng: parseFloat(newLoc.lng) }]
              })
              setAdding(false)
              cardRefs.current = {}
            }} />
          </div>}

          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}
            onTouchMove={onCardTouchMove} onTouchEnd={onCardTouchEnd}>
            {locations.map(function (loc) {
              var isSwiped = swipeId === loc.id
              var isEditing = editId === loc.id
              var tx = isSwiped ? swipeX : 0
              var cardH = isEditing ? CARD_H + 210 : CARD_H

              return (
                <div key={loc.id} style={{ position: 'relative', marginBottom: 8, height: cardH, overflow: 'hidden',
                  transition: isEditing ? 'height 0.2s ease' : 'none' }}>
                  <div onClick={function () { handleDelete(loc.id) }}
                    style={{ position: 'absolute', top: 0, right: 0, width: DELETE_W, height: CARD_H,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                    <canvas ref={function (el) {
                      if (!el || el._dDrawn) return; el._dDrawn = true
                      var W = DELETE_W, H = CARD_H
                      var dpr = Math.min(window.devicePixelRatio || 1, 3)
                      el.width = W*dpr; el.height = H*dpr
                      el.style.width = W+'px'; el.style.height = H+'px'
                      var ctx = el.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0)
                      var rc = rough.canvas(el)
                      rc.rectangle(2, 3, W-4, H-6, {
                        stroke: '#C86A5E', fill: '#F6E4E0', fillStyle: 'solid',
                        strokeWidth: 1.3, roughness: 0.8, bowing: 0.7,
                        disableMultiStroke: true, seed: 620
                      })
                      var o = { stroke: '#C86A5E', strokeWidth: 1.3, roughness: 0.7, disableMultiStroke: true }
                      var cx = W/2, ty = H/2 - 7
                      rc.line(cx-8, ty, cx+8, ty, { ...o, seed: 621 })
                      rc.line(cx-3, ty, cx-3, ty-2.5, { ...o, seed: 622 })
                      rc.line(cx-3, ty-2.5, cx+3, ty-2.5, { ...o, seed: 623 })
                      rc.line(cx+3, ty-2.5, cx+3, ty, { ...o, seed: 624 })
                      rc.line(cx-6, ty, cx-5, ty+13, { ...o, seed: 625 })
                      rc.line(cx+6, ty, cx+5, ty+13, { ...o, seed: 626 })
                      rc.line(cx-5, ty+13, cx+5, ty+13, { ...o, seed: 627 })
                      rc.line(cx-2, ty+3, cx-2, ty+10, { ...o, strokeWidth: 0.8, seed: 628 })
                      rc.line(cx+2, ty+3, cx+2, ty+10, { ...o, strokeWidth: 0.8, seed: 629 })
                    }} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
                  </div>

                  <div style={{ position: 'relative', transform: 'translateX(' + tx + 'px)',
                    transition: touchRef.current.moved ? 'none' : 'transform 0.2s ease',
                    height: cardH, background: '#fff' }}
                    onTouchStart={function (e) { onCardTouchStart(e, loc.id) }}>

                    <canvas ref={function (el) { if (el) cardRefs.current[loc.id] = el }}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: CARD_H + 'px', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', height: CARD_H, boxSizing: 'border-box' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: locColor(loc.weather), fontFamily: FONT, lineHeight: 1.3 }}>
                          {loc.ink_name_iris || <span style={{ color: '#C8D0D8', fontWeight: 400 }}>{loc.label}</span>}
                        </div>
                        <div style={{ fontSize: 10, color: '#9AAAB8', fontFamily: FONT, lineHeight: 1.3 }}>
                          {loc.label}{savedId === loc.id && <span style={{ color: "#2E94B9", fontSize: 9, marginLeft: 6 }}>Saved</span>}
                        </div>
                        {loc.errands > 0 && <div style={{ fontSize: 9, color: '#B0BAC4', fontFamily: FONT }}>{loc.errands} errands</div>}
                      </div>
                      {loc.lat != null && <div onClick={function (e) { e.stopPropagation(); onFocus(loc) }}
                        onTouchStart={function (e) { e.stopPropagation() }}
                        style={{ fontSize: 15, color: '#2E94B9', cursor: 'pointer', flexShrink: 0, padding: '4px' }}>
                        ↗
                      </div>}
                    </div>

                    {isEditing && (
                      <div data-noswipe="1" style={{ padding: '4px 10px 8px', background: '#FAFCFE' }}>
                        <div style={{ fontSize: 9, color: '#9AAAB8', fontFamily: FONT, marginBottom: 2 }}>Re-pin location</div>
                        <div style={{ marginBottom: 8 }}>
                          <PoiPicker cityName={cityName} placeholder="search to move this place"
                            successLabel="Moved"
                            onPick={async function (poi) {
                              var geo = poiToGeoPatch(poi)
                              if (!geo) throw new Error('no coordinates')
                              if (isConnected()) await supaPatch('locations', 'id=eq.' + loc.id, geo)
                              setLocations(function (prev) {
                                return prev.map(function (l) { return l.id === loc.id ? { ...l, ...geo } : l })
                              })
                            }} />
                        </div>
                        <div style={{ marginBottom: 5 }}>
                          <div style={{ fontSize: 9, color: '#9AAAB8', fontFamily: FONT, marginBottom: 2 }}>Place</div>
                          <input value={editFields.label} onChange={function (e) { setEditFields(function (p) { return { ...p, label: e.target.value } }) }}
                            placeholder="short place name" style={inputS} />
                        </div>
        <div style={{ marginBottom: 5 }}>
                          <div style={{ fontSize: 9, color: '#9AAAB8', fontFamily: FONT, marginBottom: 2 }}>My name</div>
                          <input value={editFields.ink_name_iris} onChange={function (e) { setEditFields(function (p) { return { ...p, ink_name_iris: e.target.value } }) }}
                            placeholder="my name for it" style={inputS} />
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          <div onClick={function () { setEditId(null); cardRefs.current = {} }}
                            style={{ flex: 1, textAlign: 'center', padding: '5px 0', fontSize: 11, color: '#9AAAB8', fontFamily: FONT, cursor: 'pointer',
                              border: '1px solid rgba(200,210,220,0.4)', background: '#fff' }}>Cancel</div>
                          <div onClick={function () { handleSaveEdit(loc.id) }}
                            style={{ flex: 1, textAlign: 'center', padding: '5px 0', fontSize: 11, color: '#fff', fontFamily: FONT, cursor: 'pointer',
                              background: '#2E94B9', border: '1px solid #2E94B9' }}>Save</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {/* ? placeholder card — add new location */}
            <div style={{ position: 'relative', marginBottom: 8, height: CARD_H, cursor: 'pointer' }}
              onClick={function() { setAdding(true) }}>
              <canvas ref={function(el) {
                if (!el || el._qDrawn) return; el._qDrawn = true
                var W = el.parentElement ? el.parentElement.offsetWidth : 200, H = CARD_H
                var dpr = Math.min(window.devicePixelRatio||1, 3)
                el.width = W*dpr; el.height = H*dpr
                el.style.width = W+'px'; el.style.height = H+'px'
                var ctx = el.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0)
                ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0,0,W,H)
                var rc = rough.canvas(el)
                rc.rectangle(3,3,W-6,H-6, { stroke:'#D8D0C8', strokeWidth:1, roughness:0.6, disableMultiStroke:true, seed:400, strokeLineDash:[4,4] })
                /* draw ? in center */
                var cx = W/2, cy = H/2, s = 0.8, c = '#C0B8B0'
                var pts = []
                for (var i=0;i<=12;i++) { var t=i/12, a=Math.PI+t*Math.PI*1.3, rx=5*s, ry=5*s; pts.push([cx+Math.cos(a)*rx, (cy-4*s)+Math.sin(a)*ry]) }
                pts.push([cx+1*s, cy+0*s]); pts.push([cx, cy+2*s])
                var d='M '+pts[0][0].toFixed(1)+' '+pts[0][1].toFixed(1)
                for (var j=1;j<pts.length;j++) d+=' L '+pts[j][0].toFixed(1)+' '+pts[j][1].toFixed(1)
                rc.path(d, { stroke:c, strokeWidth:1.3, roughness:0.5, disableMultiStroke:true, seed:401 })
                rc.circle(cx, cy+6*s, 2*s, { stroke:c, strokeWidth:0.8, roughness:0.4, fill:c, fillStyle:'solid', disableMultiStroke:true, seed:402 })
              }} style={{ position:'absolute', top:0, left:0, width:'100%', height:CARD_H+'px' }} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
