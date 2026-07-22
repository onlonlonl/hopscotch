import { useRef, useEffect, useState } from 'react'
import rough from 'roughjs'
import LocationCard from './LocationCard'

var SEED = 1
var RO = {roughness:0.8,bowing:0.5,disableMultiStroke:true,seed:SEED}
function ro(extra) {
  var o = {roughness:RO.roughness,bowing:RO.bowing,disableMultiStroke:RO.disableMultiStroke,seed:RO.seed}
  if (extra) { var keys = Object.keys(extra); for (var i=0;i<keys.length;i++) o[keys[i]]=extra[keys[i]] }
  return o
}

function drawSun(rc,cx,cy,c){ rc.circle(cx,cy,14,ro({stroke:c,strokeWidth:1.5})); var r=12;for(var i=0;i<8;i++){var a=i*Math.PI/4;rc.line(cx+Math.cos(a)*9,cy+Math.sin(a)*9,cx+Math.cos(a)*r,cy+Math.sin(a)*r,ro({stroke:c,strokeWidth:1}))} }
function drawWarm(rc,cx,cy,c){ rc.circle(cx,cy,18,ro({stroke:c,strokeWidth:1.8}));rc.line(cx-13,cy,cx-16,cy,ro({stroke:c,strokeWidth:1}));rc.line(cx+13,cy,cx+16,cy,ro({stroke:c,strokeWidth:1}));rc.line(cx,cy-13,cx,cy-16,ro({stroke:c,strokeWidth:1}));rc.line(cx,cy+13,cx,cy+16,ro({stroke:c,strokeWidth:1})) }
function drawGlow(rc,cx,cy,c){ rc.circle(cx,cy,12,ro({stroke:c,strokeWidth:1.3}));rc.circle(cx,cy,24,ro({stroke:c,strokeWidth:0.7})) }
function drawMoon(rc,cx,cy,c){ var pts=[],i;for(i=0;i<=20;i++){var a=-Math.PI/2+i*Math.PI/20;pts.push([cx+Math.cos(a)*13,cy+Math.sin(a)*13])};for(i=20;i>=0;i--){var a2=-Math.PI/2+i*Math.PI/20;pts.push([cx+Math.cos(a2)*4,cy+Math.sin(a2)*12])};rc.linearPath(pts,ro({stroke:c,strokeWidth:1.3})) }
function drawDrizzle(rc,cx,cy,c){ rc.line(cx-7,cy-8,cx-8,cy+0,ro({stroke:c,strokeWidth:1.2}));rc.line(cx,cy-6,cx-1,cy+4,ro({stroke:c,strokeWidth:1.2}));rc.line(cx+7,cy-7,cx+6,cy+2,ro({stroke:c,strokeWidth:1.2})) }
function drawRain(rc,cx,cy,c){ for(var i=-3;i<=3;i++){rc.line(cx+i*4,cy-8+Math.abs(i),cx+i*4-1,cy+6-Math.abs(i),ro({stroke:c,strokeWidth:1.1}))} }
function drawStorm(rc,cx,cy,c){ rc.linearPath([[cx,cy-13],[cx-5,cy-2],[cx+3,cy-2],[cx-2,cy+13]],ro({stroke:c,strokeWidth:1.8})) }
function drawPlum(rc,cx,cy,c){ for(var i=-5;i<=5;i++){rc.line(cx+i*3,cy-10,cx+i*3,cy-5,ro({stroke:c,strokeWidth:0.8}));rc.line(cx+i*3-1,cy-2,cx+i*3-1,cy+3,ro({stroke:c,strokeWidth:0.8}));rc.line(cx+i*3,cy+6,cx+i*3,cy+11,ro({stroke:c,strokeWidth:0.8}))} }
function drawCloudy(rc,cx,cy,c){ rc.linearPath([[cx-14,cy+3],[cx-13,cy-1],[cx-9,cy-5],[cx-4,cy-7],[cx,cy-9],[cx+4,cy-7],[cx+9,cy-5],[cx+13,cy-1],[cx+14,cy+3]],ro({stroke:c,strokeWidth:1.3}));rc.line(cx-14,cy+3,cx+14,cy+3,ro({stroke:c,strokeWidth:1.1})) }
function drawOvercast(rc,cx,cy,c){ rc.line(cx-16,cy-2,cx+16,cy-2,ro({stroke:c,strokeWidth:2.5}));rc.line(cx-14,cy+4,cx+14,cy+4,ro({stroke:c,strokeWidth:2})) }
function drawFog(rc,cx,cy,c){ rc.line(cx-12,cy-7,cx-3,cy-7,ro({stroke:c,strokeWidth:1.1,roughness:1.5}));rc.line(cx+2,cy-7,cx+10,cy-7,ro({stroke:c,strokeWidth:0.9,roughness:1.5}));rc.line(cx-10,cy-1,cx+1,cy-1,ro({stroke:c,strokeWidth:1.2,roughness:1.5}));rc.line(cx+5,cy-1,cx+13,cy-1,ro({stroke:c,strokeWidth:0.8,roughness:1.5}));rc.line(cx-13,cy+5,cx-4,cy+5,ro({stroke:c,strokeWidth:0.9,roughness:1.5}));rc.line(cx+1,cy+5,cx+11,cy+5,ro({stroke:c,strokeWidth:1.1,roughness:1.5})) }
function drawWind(rc,cx,cy,c){ rc.linearPath([[cx-14,cy-6],[cx,cy-5],[cx+10,cy-9]],ro({stroke:c,strokeWidth:1.3}));rc.linearPath([[cx-12,cy+1],[cx+2,cy+1],[cx+14,cy-2]],ro({stroke:c,strokeWidth:1.5}));rc.linearPath([[cx-10,cy+7],[cx+4,cy+8],[cx+12,cy+5]],ro({stroke:c,strokeWidth:1.1})) }
function drawBreeze(rc,cx,cy,c){ rc.linearPath([[cx-14,cy],[cx-4,cy-3],[cx+6,cy+1],[cx+14,cy-2]],ro({stroke:c,strokeWidth:1.2})) }
function drawHumid(rc,cx,cy,c){ rc.linearPath([[cx,cy-12],[cx-8,cy+4]],ro({stroke:c,strokeWidth:1.3}));rc.linearPath([[cx,cy-12],[cx+8,cy+4]],ro({stroke:c,strokeWidth:1.3}));rc.arc(cx,cy+4,16,10,0,Math.PI,false,ro({stroke:c,strokeWidth:1.3})) }
function drawSnow(rc,cx,cy,c){ for(var i=0;i<6;i++){var a=i*Math.PI/3;var ex=Math.cos(a),ey=Math.sin(a);rc.line(cx,cy,cx+ex*13,cy+ey*13,ro({stroke:c,strokeWidth:1}));rc.line(cx+ex*8,cy+ey*8,cx+ex*8+Math.cos(a+0.8)*5,cy+ey*8+Math.sin(a+0.8)*5,ro({stroke:c,strokeWidth:0.7}));rc.line(cx+ex*8,cy+ey*8,cx+ex*8+Math.cos(a-0.8)*5,cy+ey*8+Math.sin(a-0.8)*5,ro({stroke:c,strokeWidth:0.7}))} }
function drawFrost(rc,cx,cy,c){ for(var i=0;i<6;i++){var a=i*Math.PI/3;rc.line(cx,cy,cx+Math.cos(a)*12,cy+Math.sin(a)*12,ro({stroke:c,strokeWidth:1.1}))};rc.circle(cx,cy,4,ro({stroke:c,strokeWidth:0.8})) }
function drawHail(rc,cx,cy,c){ rc.circle(cx-8,cy-6,7,ro({stroke:c,strokeWidth:1,fill:c,fillStyle:'solid'}));rc.circle(cx+5,cy-3,6,ro({stroke:c,strokeWidth:1,fill:c,fillStyle:'solid'}));rc.circle(cx-3,cy+5,8,ro({stroke:c,strokeWidth:1,fill:c,fillStyle:'solid'}));rc.circle(cx+9,cy+6,5,ro({stroke:c,strokeWidth:0.9,fill:c,fillStyle:'solid'}));rc.circle(cx-10,cy+8,4,ro({stroke:c,strokeWidth:0.8,fill:c,fillStyle:'solid'})) }
function drawRainbow(rc,cx,cy,c){ var cs=["#C85050","#D88840","#D0B830","#50A850","#4878C0","#7858A8"];for(var i=0;i<cs.length;i++){rc.arc(cx,cy+8,28-i*3.5,24-i*3.5,Math.PI,Math.PI*2,false,ro({stroke:cs[i],strokeWidth:1.5}))} }
function drawStarry(rc,cx,cy,c){ var pts=[[-8,-7,4],[4,-9,5],[10,-2,3],[-10,3,3],[-2,2,6],[7,5,4],[-6,9,3],[5,10,3]];for(var i=0;i<pts.length;i++){var p=pts[i],s=p[2]/2;rc.line(cx+p[0],cy+p[1]-s,cx+p[0],cy+p[1]+s,ro({stroke:c,strokeWidth:0.8}));rc.line(cx+p[0]-s,cy+p[1],cx+p[0]+s,cy+p[1],ro({stroke:c,strokeWidth:0.8}))} }
function drawDust(rc,cx,cy,c){ var pts=[[-10,-5],[-4,-9],[3,-7],[9,-4],[-8,1],[1,-1],[7,1],[-6,6],[0,7],[6,6],[-3,11],[5,10]];for(var i=0;i<pts.length;i++){rc.circle(cx+pts[i][0],cy+pts[i][1],2+i%2,ro({stroke:c,strokeWidth:0.7,fill:c,fillStyle:'solid'}))} }
function drawPetals(rc,cx,cy,c){ var pts=[[-7,-8],[-1,-3],[6,-6],[-9,3],[3,2],[9,1],[-5,8],[4,9]];for(var i=0;i<pts.length;i++){rc.ellipse(cx+pts[i][0],cy+pts[i][1],6,3,ro({stroke:c,strokeWidth:0.9}))} }

var WS = {
  sun:{color:"#C8A830",draw:drawSun}, warm:{color:"#C09030",draw:drawWarm},
  glow:{color:"#B0A070",draw:drawGlow}, moon:{color:"#7888A8",draw:drawMoon},
  drizzle:{color:"#6888A8",draw:drawDrizzle}, rain:{color:"#4870A0",draw:drawRain},
  storm:{color:"#5858A0",draw:drawStorm}, plum:{color:"#5888A0",draw:drawPlum},
  cloudy:{color:"#9A9488",draw:drawCloudy}, overcast:{color:"#888480",draw:drawOvercast},
  fog:{color:"#A09890",draw:drawFog}, wind:{color:"#5898A0",draw:drawWind},
  breeze:{color:"#78A880",draw:drawBreeze}, humid:{color:"#A09070",draw:drawHumid},
  snow:{color:"#6880A8",draw:drawSnow}, frost:{color:"#5080A8",draw:drawFrost},
  hail:{color:"#6878A0",draw:drawHail}, rainbow:{color:"#C07878",draw:drawRainbow},
  starry:{color:"#A09060",draw:drawStarry}, dust:{color:"#B09050",draw:drawDust},
  petals:{color:"#C08080",draw:drawPetals}
}

function makeProj(locs,W,H,pad) {
  var lats=[],lngs=[],i
  for(i=0;i<locs.length;i++){lats.push(Number(locs[i].lat));lngs.push(Number(locs[i].lng))}
  var a=Math.min.apply(null,lats),b=Math.max.apply(null,lats)
  var c=Math.min.apply(null,lngs),d=Math.max.apply(null,lngs)
  var dl=(b-a)||0.01,dn=(d-c)||0.01
  a-=dl*0.5;b+=dl*0.5;c-=dn*0.5;d+=dn*0.5
  return function(lat,lng){return[pad+((lng-c)/(d-c))*(W-pad*2),pad+((b-lat)/(b-a))*(H-pad*2)]}
}

export default function CompassView({ locations }) {
  var canvasRef = useRef(null)
  var projRef = useRef(null)
  var geoLocsRef = useRef([])
  var selectedState = useState(null)
  var selected = selectedState[0]
  var setSelected = selectedState[1]

  useEffect(function() {
    var canvas = canvasRef.current
    if (!canvas) return
    var el = canvas.parentElement
    if (!el) return
    var W = el.clientWidth || 380
    var H = el.clientHeight || 600
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    var ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#FAF6F0'
    ctx.fillRect(0, 0, W, H)

    var geoLocs = []
    if (locations) {
      for (var j = 0; j < locations.length; j++) {
        if (locations[j].lat != null && locations[j].lng != null) geoLocs.push(locations[j])
      }
    }
    geoLocsRef.current = geoLocs

    if (geoLocs.length === 0) {
      ctx.fillStyle = '#C0B8A8'
      ctx.font = '13px -apple-system, PingFang SC, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('no places yet', W / 2, H / 2)
      return
    }

    var rc = rough.canvas(canvas)
    var pad = 50
    var proj = makeProj(geoLocs, W, H, pad)
    projRef.current = proj
    var cR = Math.min(W, H) * 0.09

    for (var i = 0; i < geoLocs.length; i++) {
      var loc = geoLocs[i]
      var pos = proj(loc.lat, loc.lng)
      var cx = pos[0], cy = pos[1]
      var weather = loc.weather || 'sun'
      var ws = WS[weather] || WS.sun

      rc.circle(cx, cy, cR * 2, ro({stroke: ws.color, strokeWidth: 1, roughness: 1}))
      try { ws.draw(rc, cx, cy, ws.color) } catch(e) {}

      ctx.textAlign = 'center'
      ctx.font = '600 11px -apple-system, PingFang SC, sans-serif'
      ctx.fillStyle = '#8A7A68'
      ctx.fillText(loc.display_name || loc.label || loc.id, cx, cy + cR + 14)
    }
  }, [locations])

  function handleCanvasClick(e) {
    var canvas = canvasRef.current
    if (!canvas) return
    var rect = canvas.getBoundingClientRect()
    var mx = e.clientX - rect.left
    var my = e.clientY - rect.top
    var proj = projRef.current
    var gl = geoLocsRef.current
    if (!proj || !gl.length) return

    var best = null, bestD = 40
    for (var i = 0; i < gl.length; i++) {
      var pos = proj(gl[i].lat, gl[i].lng)
      var dx = mx - pos[0], dy = my - pos[1]
      var d = Math.sqrt(dx * dx + dy * dy)
      if (d < bestD) { bestD = d; best = { loc: gl[i], pos: pos } }
    }
    if (best) { setSelected(best); e.stopPropagation() }
  }

  var cardWeather = selected ? (WS[selected.loc.weather || 'sun'] || WS.sun) : null

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}
         onClick={function() { setSelected(null) }}>
      <canvas ref={canvasRef}
              onClick={handleCanvasClick}
              style={{ width: '100%', height: '100%', display: 'block' }} />
      {selected && (
        <LocationCard
          location={selected.loc}
          position={selected.pos}
          onClose={function() { setSelected(null) }}
          weatherDraw={cardWeather.draw}
          weatherColor={cardWeather.color}
        weatherType={selected.loc.weather || 'sun'}
        />
      )}
    </div>
  )
}
