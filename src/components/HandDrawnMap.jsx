// HandDrawnMap.jsx — Lux's psychological distance map
// Infinite canvas with pinch-zoom and pan support
// Uses Rough.js for location icons, Canvas 2D for paths and footprints

import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import rough from 'roughjs'
import { recipes } from './IconGallery'

const MOCK_LOCATIONS = [
  { id: 'home', label: '家', display_name: '家', icon_type: 'house', color: '#E8A87C', lux_x: 50, lux_y: 50, scale: 1.2, errands: 9 },
  { id: 'office-new', label: '新公司', display_name: '公司', icon_type: 'building', color: '#7BA7BC', lux_x: 75, lux_y: 35, scale: 0.9, errands: 5 },
  { id: 'metro', label: '地鐵站', display_name: '地鐵站', icon_type: 'train', color: '#9BB89C', lux_x: 35, lux_y: 65, scale: 0.8, errands: 3 },
  { id: 'airport', label: '機場', display_name: '機場', icon_type: 'plane', color: '#B8C4D0', lux_x: 15, lux_y: 20, scale: 0.7, errands: 1 },
  { id: 'tokyo', label: '東京', display_name: '東京', icon_type: 'torii', color: '#D0A0A0', lux_x: 85, lux_y: 15, scale: 0.8, errands: 0 },
  { id: 'taiwan', label: '台灣', display_name: '台灣', icon_type: 'lantern', color: '#C4A6D0', lux_x: 80, lux_y: 75, scale: 0.7, errands: 0 },
]

const CONNECTIONS = [
  ['home', 'office-new'],
  ['home', 'metro'],
  ['home', 'airport'],
]

var MIN_ZOOM = 0.4
var MAX_ZOOM = 4.0

function HandDrawnMapInner({ locations = MOCK_LOCATIONS, connections = CONNECTIONS, fullscreen = false, onLocationTap }) {
  var canvasRef = useRef(null)
  var camRef = useRef({ zoom: 1, panX: 0, panY: 0 })
  var gestRef = useRef({ dragging: false, lastX: 0, lastY: 0, pinchDist: 0, pinchZoom: 1 })

  var draw = useCallback(function() {
    var canvas = canvasRef.current
    if (!canvas) return
    var ctx = canvas.getContext('2d')
    var rc = rough.canvas(canvas)
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    var W = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth
    var H = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight

    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = '#FAF6F0'
    ctx.fillRect(0, 0, W, H)

    var cam = camRef.current
    ctx.save()
    ctx.translate(W / 2, H / 2)
    ctx.scale(cam.zoom, cam.zoom)
    ctx.translate(-W / 2 + cam.panX, -H / 2 + cam.panY)

    var pad = 40
    var mapW = W - pad * 2
    var mapH = H - pad * 2
    function locToScreen(lx, ly) { return [pad + (lx / 100) * mapW, pad + (ly / 100) * mapH] }

    ctx.lineCap = 'round'
    function drawShoe(sx, sy, sAngle, mirror) {
      ctx.save()
      ctx.translate(sx, sy)
      ctx.rotate(sAngle - Math.PI / 2)
      if (mirror) ctx.scale(-1, 1)
      ctx.beginPath()
      ctx.moveTo(-1.8, -4); ctx.quadraticCurveTo(-2.2, -1, -2, 1.5)
      ctx.lineTo(-1.5, 3); ctx.lineTo(1.5, 3); ctx.lineTo(2, 1.5)
      ctx.quadraticCurveTo(2.2, -1, 1.8, -4); ctx.quadraticCurveTo(0, -5, -1.8, -4)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-1.3, 4.5); ctx.quadraticCurveTo(-1.5, 6, -1, 7)
      ctx.lineTo(1, 7); ctx.quadraticCurveTo(1.5, 6, 1.3, 4.5)
      ctx.fill()
      ctx.restore()
    }

    for (var ci = 0; ci < connections.length; ci++) {
      var fromId = connections[ci][0], toId = connections[ci][1]
      var from = null, to = null
      for (var li = 0; li < locations.length; li++) {
        if (locations[li].id === fromId) from = locations[li]
        if (locations[li].id === toId) to = locations[li]
      }
      if (!from || !to) continue
      if (from.errands === 0 && to.errands === 0) continue
      var homeIsFrom = from.id === 'home'
      var p1 = homeIsFrom ? locToScreen(from.lux_x, from.lux_y) : locToScreen(to.lux_x, to.lux_y)
      var p2 = homeIsFrom ? locToScreen(to.lux_x, to.lux_y) : locToScreen(from.lux_x, from.lux_y)
      var cmx = (p1[0] + p2[0]) / 2 + (p2[1] - p1[1]) * 0.15
      var cmy = (p1[1] + p2[1]) / 2 - (p2[0] - p1[0]) * 0.15
      var dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1])
      var steps = Math.floor(dist / 35)
      ctx.fillStyle = 'rgba(160, 150, 140, 0.22)'
      for (var i = 1; i < steps; i++) {
        var t = i / steps
        var fx = (1-t)*(1-t)*p1[0] + 2*(1-t)*t*cmx + t*t*p2[0]
        var fy = (1-t)*(1-t)*p1[1] + 2*(1-t)*t*cmy + t*t*p2[1]
        var tdx = 2*(1-t)*(cmx-p1[0]) + 2*t*(p2[0]-cmx)
        var tdy = 2*(1-t)*(cmy-p1[1]) + 2*t*(p2[1]-cmy)
        var angle = Math.atan2(tdy, tdx)
        var offset = (i % 2 === 0 ? 4 : -4)
        var px = fx + Math.cos(angle + Math.PI / 2) * offset
        var py = fy + Math.sin(angle + Math.PI / 2) * offset
        drawShoe(px, py, angle, i % 2 === 1)
      }
    }

    var baseScale = Math.min(W, H) / 400
    for (var idx = 0; idx < locations.length; idx++) {
      var loc = locations[idx]
      var pos = locToScreen(loc.lux_x, loc.lux_y)
      var s = baseScale * (loc.scale || 1)
      var recipe = recipes[loc.icon_type] || recipes.flag
      recipe(rc, ctx, pos[0], pos[1], s, loc.color)

      ctx.fillStyle = loc.color
      ctx.font = (9 * s) + "px '-apple-system', 'PingFang SC', sans-serif"
      ctx.textAlign = 'center'
      ctx.fillText(loc.display_name || loc.label, pos[0], pos[1] + 18 * s)

      if (loc.errands > 0) {
        ctx.fillStyle = 'rgba(160, 150, 140, 0.4)'
        ctx.font = (7 * s) + "px '-apple-system', 'PingFang SC', sans-serif"
        ctx.fillText(loc.errands + '×', pos[0], pos[1] + 26 * s)
      }
    }

    ctx.restore()
  }, [locations, connections])

  useEffect(function() {
    draw()
    var onResize = function() { draw() }
    window.addEventListener('resize', onResize)
    return function() { window.removeEventListener('resize', onResize) }
  }, [draw])

  useEffect(function() {
    var canvas = canvasRef.current
    if (!canvas) return
    function onWheel(e) {
      e.preventDefault()
      var cam = camRef.current
      var rect = canvas.getBoundingClientRect()
      var mx = e.clientX - rect.left, my = e.clientY - rect.top
      var W = rect.width, H = rect.height
      var factor = e.deltaY > 0 ? 0.92 : 1.08
      var newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.zoom * factor))
      cam.panX += (mx - W/2) * (1/cam.zoom - 1/newZoom)
      cam.panY += (my - H/2) * (1/cam.zoom - 1/newZoom)
      cam.zoom = newZoom
      draw()
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return function() { canvas.removeEventListener('wheel', onWheel) }
  }, [draw])

  useEffect(function() {
    var canvas = canvasRef.current
    if (!canvas) return
    var gest = gestRef.current
    function onDown(e) {
      if (e.button !== 0) return
      gest.dragging = true
      gest.lastX = e.clientX
      gest.lastY = e.clientY
    }
    function onMove(e) {
      if (!gest.dragging) return
      var cam = camRef.current
      cam.panX += (e.clientX - gest.lastX) / cam.zoom
      cam.panY += (e.clientY - gest.lastY) / cam.zoom
      gest.lastX = e.clientX
      gest.lastY = e.clientY
      draw()
    }
    function onUp() { gest.dragging = false }
    canvas.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return function() {
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [draw])

  useEffect(function() {
    var canvas = canvasRef.current
    if (!canvas) return
    var gest = gestRef.current
    function pinchDist(e) {
      return Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
    }
    function pinchCenter(e) {
      return { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2 }
    }
    function onTouchStart(e) {
      if (e.touches.length === 1) {
        gest.dragging = true
        gest.lastX = e.touches[0].clientX
        gest.lastY = e.touches[0].clientY
      } else if (e.touches.length === 2) {
        e.preventDefault()
        gest.dragging = false
        gest.pinchDist = pinchDist(e)
        gest.pinchZoom = camRef.current.zoom
        var c = pinchCenter(e)
        gest.lastX = c.x
        gest.lastY = c.y
      }
    }
    function onTouchMove(e) {
      var cam = camRef.current
      if (e.touches.length === 2) {
        e.preventDefault()
        var d = pinchDist(e)
        var newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, gest.pinchZoom * (d / gest.pinchDist)))
        var c = pinchCenter(e)
        cam.panX += (c.x - gest.lastX) / cam.zoom
        cam.panY += (c.y - gest.lastY) / cam.zoom
        var rect = canvas.getBoundingClientRect()
        cam.panX += (c.x - rect.left - rect.width/2) * (1/cam.zoom - 1/newZoom)
        cam.panY += (c.y - rect.top - rect.height/2) * (1/cam.zoom - 1/newZoom)
        cam.zoom = newZoom
        gest.lastX = c.x
        gest.lastY = c.y
        draw()
      } else if (e.touches.length === 1 && gest.dragging) {
        cam.panX += (e.touches[0].clientX - gest.lastX) / cam.zoom
        cam.panY += (e.touches[0].clientY - gest.lastY) / cam.zoom
        gest.lastX = e.touches[0].clientX
        gest.lastY = e.touches[0].clientY
        draw()
      }
    }
    function onTouchEnd(e) {
      if (e.touches.length < 2) {
        gest.dragging = false
        if (e.touches.length === 1) {
          gest.dragging = true
          gest.lastX = e.touches[0].clientX
          gest.lastY = e.touches[0].clientY
        }
      }
    }
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)
    return function() {
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [draw])

  var tapRef = useRef({ x: 0, y: 0, time: 0 })

  function handlePointerDown(e) {
    tapRef.current = { x: e.clientX, y: e.clientY, time: Date.now() }
  }
  function handlePointerUp(e) {
    var tap = tapRef.current
    if (Math.abs(e.clientX - tap.x) < 8 && Math.abs(e.clientY - tap.y) < 8 && Date.now() - tap.time < 300) {
      handleTap(e.clientX, e.clientY)
    }
  }

  function handleTap(clientX, clientY) {
    if (!onLocationTap) return
    var canvas = canvasRef.current
    if (!canvas) return
    var rect = canvas.getBoundingClientRect()
    var W = rect.width, H = rect.height
    var cam = camRef.current
    var wx = (clientX - rect.left - W/2) / cam.zoom + W/2 - cam.panX
    var wy = (clientY - rect.top - H/2) / cam.zoom + H/2 - cam.panY
    var pad = 40, mapW = W - pad*2, mapH = H - pad*2
    for (var i = 0; i < locations.length; i++) {
      var loc = locations[i]
      var lx = pad + (loc.lux_x / 100) * mapW
      var ly = pad + (loc.lux_y / 100) * mapH
      if (Math.hypot(wx - lx, wy - ly) < 25 / Math.min(cam.zoom, 1.5)) {
        onLocationTap(loc, clientX, clientY)
        return
      }
    }
    onLocationTap(null)
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{
        display: 'block', width: '100%', height: '100%',
        borderRadius: fullscreen ? 0 : 4,
        touchAction: 'none', cursor: 'grab',
      }}
    />
  )
}

var HandDrawnMap = forwardRef(function HandDrawnMap(props, ref) {
  useImperativeHandle(ref, function() {
    return {
      screenToLoc: function(sx, sy) {
        var canvas = document.querySelector('canvas')
        if (!canvas) return { lux_x: 50, lux_y: 50 }
        var rect = canvas.getBoundingClientRect()
        var W = rect.width, H = rect.height, pad = 40
        var lux_x = Math.max(5, Math.min(95, (sx - rect.left - pad) / (W - pad*2) * 100))
        var lux_y = Math.max(5, Math.min(95, (sy - rect.top - pad) / (H - pad*2) * 100))
        return { lux_x: lux_x, lux_y: lux_y }
      }
    }
  })
  return <HandDrawnMapInner {...props} onLocationTap={props.onLocationTap} />
})

export default HandDrawnMap
