import { useRef, useEffect, useState, useCallback } from 'react'
import rough from 'roughjs'
import * as topojson from 'topojson-client'
import worldTopo from 'world-atlas/countries-110m.json'
import LocationCard from './LocationCard'

/* ── weather icons (compressed) ── */
var RO={roughness:0.8,bowing:0.5,disableMultiStroke:true,seed:1}
function ro(x){var o={roughness:RO.roughness,bowing:RO.bowing,disableMultiStroke:RO.disableMultiStroke,seed:RO.seed};if(x){var k=Object.keys(x);for(var i=0;i<k.length;i++)o[k[i]]=x[k[i]]};return o}
function drawSun(rc,cx,cy,c){rc.circle(cx,cy,14,ro({stroke:c,strokeWidth:1.5}));for(var i=0;i<8;i++){var a=i*Math.PI/4;rc.line(cx+Math.cos(a)*9,cy+Math.sin(a)*9,cx+Math.cos(a)*12,cy+Math.sin(a)*12,ro({stroke:c,strokeWidth:1}))}}
function drawWarm(rc,cx,cy,c){rc.circle(cx,cy,18,ro({stroke:c,strokeWidth:1.8}));rc.line(cx-13,cy,cx-16,cy,ro({stroke:c,strokeWidth:1}));rc.line(cx+13,cy,cx+16,cy,ro({stroke:c,strokeWidth:1}));rc.line(cx,cy-13,cx,cy-16,ro({stroke:c,strokeWidth:1}));rc.line(cx,cy+13,cx,cy+16,ro({stroke:c,strokeWidth:1}))}
function drawGlow(rc,cx,cy,c){rc.circle(cx,cy,12,ro({stroke:c,strokeWidth:1.3}));rc.circle(cx,cy,24,ro({stroke:c,strokeWidth:0.7}))}
function drawMoon(rc,cx,cy,c){var pts=[],i;for(i=0;i<=20;i++){var a=-Math.PI/2+i*Math.PI/20;pts.push([cx+Math.cos(a)*13,cy+Math.sin(a)*13])};for(i=20;i>=0;i--){var a2=-Math.PI/2+i*Math.PI/20;pts.push([cx+Math.cos(a2)*4,cy+Math.sin(a2)*12])};rc.linearPath(pts,ro({stroke:c,strokeWidth:1.3}))}
function drawDrizzle(rc,cx,cy,c){rc.line(cx-7,cy-8,cx-8,cy,ro({stroke:c,strokeWidth:1.2}));rc.line(cx,cy-6,cx-1,cy+4,ro({stroke:c,strokeWidth:1.2}));rc.line(cx+7,cy-7,cx+6,cy+2,ro({stroke:c,strokeWidth:1.2}))}
function drawRain(rc,cx,cy,c){for(var i=-3;i<=3;i++)rc.line(cx+i*4,cy-8+Math.abs(i),cx+i*4-1,cy+6-Math.abs(i),ro({stroke:c,strokeWidth:1.1}))}
function drawStorm(rc,cx,cy,c){rc.linearPath([[cx,cy-13],[cx-5,cy-2],[cx+3,cy-2],[cx-2,cy+13]],ro({stroke:c,strokeWidth:1.8}))}
function drawCloudy(rc,cx,cy,c){rc.linearPath([[cx-14,cy+3],[cx-13,cy-1],[cx-9,cy-5],[cx-4,cy-7],[cx,cy-9],[cx+4,cy-7],[cx+9,cy-5],[cx+13,cy-1],[cx+14,cy+3]],ro({stroke:c,strokeWidth:1.3}));rc.line(cx-14,cy+3,cx+14,cy+3,ro({stroke:c,strokeWidth:1.1}))}
function drawOvercast(rc,cx,cy,c){rc.line(cx-16,cy-2,cx+16,cy-2,ro({stroke:c,strokeWidth:2.5}));rc.line(cx-14,cy+4,cx+14,cy+4,ro({stroke:c,strokeWidth:2}))}
function drawFog(rc,cx,cy,c){rc.line(cx-12,cy-7,cx-3,cy-7,ro({stroke:c,strokeWidth:1.1,roughness:1.5}));rc.line(cx+2,cy-7,cx+10,cy-7,ro({stroke:c,strokeWidth:0.9,roughness:1.5}));rc.line(cx-10,cy-1,cx+1,cy-1,ro({stroke:c,strokeWidth:1.2,roughness:1.5}));rc.line(cx+5,cy-1,cx+13,cy-1,ro({stroke:c,strokeWidth:0.8,roughness:1.5}));rc.line(cx-13,cy+5,cx-4,cy+5,ro({stroke:c,strokeWidth:0.9,roughness:1.5}));rc.line(cx+1,cy+5,cx+11,cy+5,ro({stroke:c,strokeWidth:1.1,roughness:1.5}))}
function drawWind(rc,cx,cy,c){rc.linearPath([[cx-14,cy-6],[cx,cy-5],[cx+10,cy-9]],ro({stroke:c,strokeWidth:1.3}));rc.linearPath([[cx-12,cy+1],[cx+2,cy+1],[cx+14,cy-2]],ro({stroke:c,strokeWidth:1.5}));rc.linearPath([[cx-10,cy+7],[cx+4,cy+8],[cx+12,cy+5]],ro({stroke:c,strokeWidth:1.1}))}
function drawBreeze(rc,cx,cy,c){rc.linearPath([[cx-14,cy],[cx-4,cy-3],[cx+6,cy+1],[cx+14,cy-2]],ro({stroke:c,strokeWidth:1.2}))}
function drawHumid(rc,cx,cy,c){rc.linearPath([[cx,cy-12],[cx-8,cy+4]],ro({stroke:c,strokeWidth:1.3}));rc.linearPath([[cx,cy-12],[cx+8,cy+4]],ro({stroke:c,strokeWidth:1.3}));rc.arc(cx,cy+4,16,10,0,Math.PI,false,ro({stroke:c,strokeWidth:1.3}))}
function drawSnow(rc,cx,cy,c){for(var i=0;i<6;i++){var a=i*Math.PI/3,ex=Math.cos(a),ey=Math.sin(a);rc.line(cx,cy,cx+ex*13,cy+ey*13,ro({stroke:c,strokeWidth:1}));rc.line(cx+ex*8,cy+ey*8,cx+ex*8+Math.cos(a+0.8)*5,cy+ey*8+Math.sin(a+0.8)*5,ro({stroke:c,strokeWidth:0.7}))}}
function drawFrost(rc,cx,cy,c){for(var i=0;i<6;i++){var a=i*Math.PI/3;rc.line(cx,cy,cx+Math.cos(a)*12,cy+Math.sin(a)*12,ro({stroke:c,strokeWidth:1.1}))};rc.circle(cx,cy,4,ro({stroke:c,strokeWidth:0.8}))}
function drawHail(rc,cx,cy,c){rc.circle(cx-8,cy-6,7,ro({stroke:c,strokeWidth:1,fill:c,fillStyle:'solid'}));rc.circle(cx+5,cy-3,6,ro({stroke:c,strokeWidth:1,fill:c,fillStyle:'solid'}));rc.circle(cx-3,cy+5,8,ro({stroke:c,strokeWidth:1,fill:c,fillStyle:'solid'}))}
function drawRainbow(rc,cx,cy,c){var cs=["#C85050","#D88840","#D0B830","#50A850","#4878C0","#7858A8"];for(var i=0;i<cs.length;i++)rc.arc(cx,cy+8,28-i*3.5,24-i*3.5,Math.PI,Math.PI*2,false,ro({stroke:cs[i],strokeWidth:1.5}))}
function drawStarry(rc,cx,cy,c){var pts=[[-8,-7,4],[4,-9,5],[10,-2,3],[-10,3,3],[-2,2,6],[7,5,4],[-6,9,3],[5,10,3]];for(var i=0;i<pts.length;i++){var p=pts[i],s=p[2]/2;rc.line(cx+p[0],cy+p[1]-s,cx+p[0],cy+p[1]+s,ro({stroke:c,strokeWidth:0.8}));rc.line(cx+p[0]-s,cy+p[1],cx+p[0]+s,cy+p[1],ro({stroke:c,strokeWidth:0.8}))}}
function drawDust(rc,cx,cy,c){var pts=[[-10,-5],[-4,-9],[3,-7],[9,-4],[-8,1],[1,-1],[7,1],[-6,6],[0,7],[6,6]];for(var i=0;i<pts.length;i++)rc.circle(cx+pts[i][0],cy+pts[i][1],2+i%2,ro({stroke:c,strokeWidth:0.7,fill:c,fillStyle:'solid'}))}
function drawPetals(rc,cx,cy,c){var pts=[[-7,-8],[-1,-3],[6,-6],[-9,3],[3,2],[9,1],[-5,8],[4,9]];for(var i=0;i<pts.length;i++)rc.ellipse(cx+pts[i][0],cy+pts[i][1],6,3,ro({stroke:c,strokeWidth:0.9}))}
function drawPlum(rc,cx,cy,c){for(var i=-5;i<=5;i++){rc.line(cx+i*3,cy-10,cx+i*3,cy-5,ro({stroke:c,strokeWidth:0.8}));rc.line(cx+i*3-1,cy-2,cx+i*3-1,cy+3,ro({stroke:c,strokeWidth:0.8}))}}
var WS={sun:{color:"#C8A830",draw:drawSun},warm:{color:"#C09030",draw:drawWarm},glow:{color:"#B0A070",draw:drawGlow},moon:{color:"#7888A8",draw:drawMoon},drizzle:{color:"#6888A8",draw:drawDrizzle},rain:{color:"#4870A0",draw:drawRain},storm:{color:"#5858A0",draw:drawStorm},plum:{color:"#5888A0",draw:drawPlum},cloudy:{color:"#9A9488",draw:drawCloudy},overcast:{color:"#888480",draw:drawOvercast},fog:{color:"#A09890",draw:drawFog},wind:{color:"#5898A0",draw:drawWind},breeze:{color:"#78A880",draw:drawBreeze},humid:{color:"#A09070",draw:drawHumid},snow:{color:"#6880A8",draw:drawSnow},frost:{color:"#5080A8",draw:drawFrost},hail:{color:"#6878A0",draw:drawHail},rainbow:{color:"#C07878",draw:drawRainbow},starry:{color:"#A09060",draw:drawStarry},dust:{color:"#B09050",draw:drawDust},petals:{color:"#C08080",draw:drawPetals}}

/* ── Mercator, Pacific-centered, cut 25°W ── */
var MW = 1080, MERC_R = MW / (2 * Math.PI), CUT = -25, DS = MW / 360, LAT_CLIP = 82, MAX_ZOOM = 15

function wrapLng(v) { return ((v - CUT) % 360 + 360) % 360 }
function lngX(v) { return wrapLng(v) * DS }
function mercY(lat) { var l = Math.max(-LAT_CLIP, Math.min(LAT_CLIP, lat)) * Math.PI / 180; return MERC_R * Math.log(Math.tan(Math.PI / 4 + l / 2)) }
var Y_TOP = mercY(LAT_CLIP), MH = 2 * Y_TOP
function latY(lat) { return Y_TOP - mercY(lat) }

function niceScale(kpp, maxPx) { var ts = [10000,5000,2000,1000,500,200,100,50,20,10,5,2,1]; for (var i = 0; i < ts.length; i++) { var px = ts[i] / kpp; if (px <= maxPx && px >= 30) return { km: ts[i], px: px } }; return { km: 1, px: 1 / kpp } }

/* ── pre-compute ── */
function projectRing(coords) {
  var pts = []
  for (var i = 0; i < coords.length; i++) {
    var lat = Math.max(-LAT_CLIP, Math.min(LAT_CLIP, coords[i][1]))
    pts.push([wrapLng(coords[i][0]) * DS, Y_TOP - mercY(lat)])
  }
  var rings = [[]], ci = 0
  for (var i = 0; i < pts.length; i++) {
    if (i > 0 && Math.abs(pts[i][0] - pts[i - 1][0]) > MW * 0.5) {
      var prev = pts[i - 1], cur = pts[i], edgeX = cur[0] > prev[0] ? MW : 0
      rings[ci].push([edgeX, (prev[1] + cur[1]) / 2])
      rings.push([]); ci++
      rings[ci].push([edgeX === MW ? 0 : MW, (prev[1] + cur[1]) / 2])
    }
    rings[ci].push(pts[i])
  }
  return rings.filter(function(r) { return r.length >= 3 })
}

function buildDrawables() {
  var gen = rough.generator()
  var countries = topojson.feature(worldTopo, worldTopo.objects.countries)
  var drawables = [], seed = 1
  for (var f = 0; f < countries.features.length; f++) {
    var feat = countries.features[f], geom = feat.geometry
    /* skip Antarctica (id "010") */
    if (feat.id === '010') continue
    var allRings = []
    if (geom.type === 'Polygon') {
      for (var r = 0; r < geom.coordinates.length; r++) allRings = allRings.concat(projectRing(geom.coordinates[r]))
    } else if (geom.type === 'MultiPolygon') {
      for (var p = 0; p < geom.coordinates.length; p++)
        for (var r = 0; r < geom.coordinates[p].length; r++) allRings = allRings.concat(projectRing(geom.coordinates[p][r]))
    }
    /* skip rings entirely above/below clip */
    for (var i = 0; i < allRings.length; i++) {
      var ring = allRings[i], allTop = true, allBot = true
      for (var j = 0; j < ring.length; j++) { if (ring[j][1] > 3) allTop = false; if (ring[j][1] < MH - 3) allBot = false }
      if (allTop || allBot) continue
      drawables.push(gen.polygon(ring, {
        stroke: '#C0B8AC', strokeWidth: 0.4, roughness: 0.15, bowing: 0.3,
        fill: '#F0ECE4', fillStyle: 'solid', disableMultiStroke: true, seed: seed++
      }))
    }
  }
  return drawables
}

function prerenderIcon(loc, idx) {
  var weather = loc.weather || 'sun', ws = WS[weather] || WS.sun
  var cvs = document.createElement('canvas'); cvs.width = 60; cvs.height = 60
  var ctx = cvs.getContext('2d')
  ctx.fillStyle = '#F0ECE4'; ctx.beginPath(); ctx.arc(30, 30, 22, 0, Math.PI * 2); ctx.fill()
  var rc = rough.canvas(cvs)
  rc.circle(30, 30, 44, { stroke: ws.color, strokeWidth: 1.2, roughness: 0.8, disableMultiStroke: true, seed: 200 + idx })
  try { ws.draw(rc, 30, 30, ws.color) } catch (e) {}
  return { canvas: cvs, ws: ws }
}

/* ── component ── */
export default function CompassView({ locations }) {
  var canvasRef = useRef(null), scaleRef = useRef(null), outerRef = useRef(null), cardWrapRef = useRef(null)
  var drawRef = useRef(null), iconsRef = useRef([]), geoRef = useRef([])
  var camRef = useRef(null), sizeRef = useRef({ W: 380, H: 600 })
  var renderedRef = useRef({ px: 0, py: 0, z: 1 })
  var gestRef = useRef(null), movedRef = useRef(false), timerRef = useRef(null)
  var ss = useState(null), selected = ss[0], setSelected = ss[1]
  var minZRef = useRef(0.3)

  useEffect(function() { drawRef.current = buildDrawables() }, [])

  useEffect(function() {
    var gl = locations ? locations.filter(function(l) { return l.lat != null && l.lng != null }) : []
    geoRef.current = gl; iconsRef.current = gl.map(prerenderIcon)
  }, [locations])

  /* ── full render ── */
  var fullRender = useCallback(function() {
    var canvas = canvasRef.current; if (!canvas) return
    var ds = drawRef.current; if (!ds) return
    var cam = camRef.current; if (!cam) return
    var sz = sizeRef.current, dpr = Math.min(window.devicePixelRatio || 1, 2)

    canvas.width = sz.W * dpr; canvas.height = sz.H * dpr
    canvas.style.width = sz.W + 'px'; canvas.style.height = sz.H + 'px'
    canvas.style.transform = ''; canvas.style.transformOrigin = '0 0'
    var ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#C8D4DC'; ctx.fillRect(0, 0, sz.W, sz.H)

    /* countries in world space with clip rect */
    ctx.save()
    ctx.translate(cam.px, cam.py); ctx.scale(cam.z, cam.z)
    ctx.beginPath(); ctx.rect(0, 0, MW, MH); ctx.clip()
    var rc = rough.canvas(canvas)
    for (var i = 0; i < ds.length; i++) rc.draw(ds[i])
    ctx.restore()

    /* icons + labels in screen space (always crisp) */
    var gl = geoRef.current, icons = iconsRef.current
    for (var j = 0; j < gl.length; j++) {
      var loc = gl[j], sx = lngX(loc.lng) * cam.z + cam.px, sy = latY(loc.lat) * cam.z + cam.py
      if (sx < -30 || sx > sz.W + 30 || sy < -30 || sy > sz.H + 30) continue
      if (icons[j]) ctx.drawImage(icons[j].canvas, 0, 0, 60, 60, sx - 10, sy - 10, 20, 20)
      ctx.textAlign = 'center'; ctx.font = "600 9px -apple-system,'PingFang SC',sans-serif"; ctx.fillStyle = '#5A4E40'
      ctx.fillText(loc.display_name || loc.label || loc.id, sx, sy + 16)
    }
    renderedRef.current = { px: cam.px, py: cam.py, z: cam.z }
    renderScale(cam.z)
  }, [])

  /* ── CSS transform (GPU, instant) ── */
  function cssUpdate() {
    var canvas = canvasRef.current; if (!canvas) return
    var cam = camRef.current, r = renderedRef.current, ratio = cam.z / r.z
    canvas.style.transformOrigin = '0 0'
    canvas.style.transform = 'translate(' + (cam.px - ratio * r.px) + 'px,' + (cam.py - ratio * r.py) + 'px) scale(' + ratio + ')'
  }
  function scheduleRender(ms) { if (timerRef.current) clearTimeout(timerRef.current); timerRef.current = setTimeout(function() { requestAnimationFrame(fullRender) }, ms || 80) }

  function renderScale(z) {
    var cvs = scaleRef.current; if (!cvs) return
    var sw = 130, sh = 28, dpr = Math.min(window.devicePixelRatio || 1, 2)
    cvs.width = sw * dpr; cvs.height = sh * dpr; cvs.style.width = sw + 'px'; cvs.style.height = sh + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var kpp = 111.32 * Math.cos(25 * Math.PI / 180) / (DS * z), sc = niceScale(kpp, 100), y = sh - 8
    var rc = rough.canvas(cvs)
    rc.line(10, y, 10 + sc.px, y, { stroke: '#6B5B4E', strokeWidth: 1.2, roughness: 0.4, disableMultiStroke: true, seed: 99 })
    rc.line(10, y - 4, 10, y + 1, { stroke: '#6B5B4E', strokeWidth: 0.8, roughness: 0.3, disableMultiStroke: true, seed: 100 })
    rc.line(10 + sc.px, y - 4, 10 + sc.px, y + 1, { stroke: '#6B5B4E', strokeWidth: 0.8, roughness: 0.3, disableMultiStroke: true, seed: 101 })
    ctx.font = '9px -apple-system,PingFang SC,sans-serif'; ctx.fillStyle = '#6B5B4E'; ctx.textAlign = 'center'
    ctx.fillText(sc.km >= 1 ? sc.km + ' km' : (sc.km * 1000) + ' m', 10 + sc.px / 2, y - 6)
  }

  /* ── init + all gestures ── */
  useEffect(function() {
    var el = outerRef.current; if (!el) return
    var sw = el.clientWidth || 380, sh = el.clientHeight || 600
    sizeRef.current = { W: sw, H: sh }
    minZRef.current = Math.max(sw / MW, sh / MH) * 0.7

    /* initial: focused on Shenzhen, ~15° of longitude visible */
    var z = sw / (15 * DS)
    camRef.current = { px: sw / 2 - lngX(114) * z, py: sh / 2 - latY(22.5) * z, z: z }

    function clamp(v) { return Math.max(minZRef.current, Math.min(MAX_ZOOM, v)) }
    function onResize() { sizeRef.current = { W: el.clientWidth, H: el.clientHeight }; minZRef.current = Math.max(el.clientWidth / MW, el.clientHeight / MH) * 0.7; fullRender() }
    window.addEventListener('resize', onResize)

    /* ── touch gestures ── */
    function d2(ts) { return Math.hypot(ts[1].clientX - ts[0].clientX, ts[1].clientY - ts[0].clientY) }
    function onTS(e) {
      if (cardWrapRef.current && cardWrapRef.current.contains(e.target)) return
      movedRef.current = false; var ts = e.touches
      if (ts.length === 1) gestRef.current = { type: 'pan', sx: ts[0].clientX, sy: ts[0].clientY, spx: camRef.current.px, spy: camRef.current.py }
      else if (ts.length >= 2) { e.preventDefault(); setSelected(null); gestRef.current = { type: 'pinch', sd: d2(ts), sz: camRef.current.z, spx: camRef.current.px, spy: camRef.current.py, smx: (ts[0].clientX + ts[1].clientX) / 2, smy: (ts[0].clientY + ts[1].clientY) / 2 } }
    }
    function onTM(e) {
      var g = gestRef.current; if (!g) return; e.preventDefault(); var ts = e.touches, cam = camRef.current
      if (ts.length >= 2) {
        if (g.type === 'pan') { setSelected(null); g.type = 'pinch'; g.sd = d2(ts); g.sz = cam.z; g.spx = cam.px; g.spy = cam.py; g.smx = (ts[0].clientX + ts[1].clientX) / 2; g.smy = (ts[0].clientY + ts[1].clientY) / 2; return }
        movedRef.current = true; var d = d2(ts), nz = clamp(g.sz * d / g.sd)
        var mx = (ts[0].clientX + ts[1].clientX) / 2, my = (ts[0].clientY + ts[1].clientY) / 2
        var rect = el.getBoundingClientRect(), cx = g.smx - rect.left, cy = g.smy - rect.top
        cam.z = nz; cam.px = cx - (cx - g.spx) * nz / g.sz + (mx - g.smx); cam.py = cy - (cy - g.spy) * nz / g.sz + (my - g.smy)
        cssUpdate()
      } else if (g.type === 'pan' && ts.length === 1) {
        var dx = ts[0].clientX - g.sx, dy = ts[0].clientY - g.sy
        if (Math.abs(dx) + Math.abs(dy) > 5) { movedRef.current = true; setSelected(null) }
        cam.px = g.spx + dx; cam.py = g.spy + dy; cssUpdate()
      }
    }
    function onTE(e) { if (e.touches.length === 0) { gestRef.current = null; scheduleRender(60) } }

    /* ── mouse gestures (desktop) ── */
    var mouseDown = false, mouseSX = 0, mouseSY = 0, mouseSPX = 0, mouseSPY = 0
    function onMD(e) { if (e.button !== 0) return; mouseDown = true; movedRef.current = false; mouseSX = e.clientX; mouseSY = e.clientY; mouseSPX = camRef.current.px; mouseSPY = camRef.current.py }
    function onMM(e) {
      if (!mouseDown) return; var dx = e.clientX - mouseSX, dy = e.clientY - mouseSY
      if (Math.abs(dx) + Math.abs(dy) > 3) { movedRef.current = true; setSelected(null) }
      camRef.current.px = mouseSPX + dx; camRef.current.py = mouseSPY + dy; cssUpdate()
    }
    function onMU() { if (mouseDown) { mouseDown = false; scheduleRender(60) } }

    /* ── wheel ── */
    function onWh(e) {
      e.preventDefault(); var rect = el.getBoundingClientRect()
      var cx = e.clientX - rect.left, cy = e.clientY - rect.top
      var cam = camRef.current, oz = cam.z, nz = clamp(oz * (e.deltaY > 0 ? 0.9 : 1.1))
      cam.px = cx - (cx - cam.px) * nz / oz; cam.py = cy - (cy - cam.py) * nz / oz; cam.z = nz
      cssUpdate(); scheduleRender(80)
    }

    el.addEventListener('touchstart', onTS, { passive: false })
    el.addEventListener('touchmove', onTM, { passive: false })
    el.addEventListener('touchend', onTE, { passive: true })
    el.addEventListener('mousedown', onMD)
    window.addEventListener('mousemove', onMM)
    window.addEventListener('mouseup', onMU)
    el.addEventListener('wheel', onWh, { passive: false })

    var timer = setInterval(function() { if (drawRef.current) { fullRender(); clearInterval(timer) } }, 50)
    return function() {
      window.removeEventListener('resize', onResize); window.removeEventListener('mousemove', onMM); window.removeEventListener('mouseup', onMU)
      el.removeEventListener('touchstart', onTS); el.removeEventListener('touchmove', onTM); el.removeEventListener('touchend', onTE)
      el.removeEventListener('mousedown', onMD); el.removeEventListener('wheel', onWh)
      clearInterval(timer); if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [fullRender])

  function handleClick(e) {
    if (movedRef.current) return
    if (cardWrapRef.current && cardWrapRef.current.contains(e.target)) return
    var rect = outerRef.current.getBoundingClientRect(), cam = camRef.current
    var wx = (e.clientX - rect.left - cam.px) / cam.z, wy = (e.clientY - rect.top - cam.py) / cam.z
    var gl = geoRef.current, best = null, bestD = 15 / cam.z
    for (var i = 0; i < gl.length; i++) {
      var d = Math.hypot(wx - lngX(gl[i].lng), wy - latY(gl[i].lat))
      if (d < bestD) { bestD = d; best = { loc: gl[i], pos: [lngX(gl[i].lng), latY(gl[i].lat)] } }
    }
    setSelected(best || null)
  }

  var cardPos = null
  if (selected && camRef.current) {
    var cam = camRef.current, sz = sizeRef.current
    var rx = selected.pos[0] * cam.z + cam.px, ry = selected.pos[1] * cam.z + cam.py, CW = 230, CH = 280
    cardPos = [Math.max(CW / 2 + 4, Math.min(sz.W - CW / 2 - 4, rx)), Math.max(CH / 2 + 4, Math.min(sz.H - CH / 2 - 4, ry))]
  }
  var cw = selected ? (WS[selected.loc.weather || 'sun'] || WS.sun) : null

  return (
    <div ref={outerRef} onClick={handleClick} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', touchAction: 'none', background: '#C8D4DC' }}>
      <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', top: 0, left: 0, willChange: 'transform' }} />
      <canvas ref={scaleRef} style={{ position: 'absolute', bottom: 16, left: 12, zIndex: 50, pointerEvents: 'none' }} />
      {selected && cardPos && (
        <div ref={cardWrapRef} onClick={function(e) { e.stopPropagation() }} style={{ position: 'absolute', top: 0, left: 0, zIndex: 200 }}>
          <LocationCard location={selected.loc} position={cardPos} onClose={function() { setSelected(null) }} weatherDraw={cw.draw} weatherColor={cw.color} weatherType={selected.loc.weather || 'sun'} activeDim={2} />
        </div>
      )}
    </div>
  )
}
