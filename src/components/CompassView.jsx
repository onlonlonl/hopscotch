import { useRef, useEffect, useState } from 'react'
import rough from 'roughjs'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import LocationCard from './LocationCard'

/* ── weather icon drawing (same functions, reused) ── */
var RO={roughness:0.8,bowing:0.5,disableMultiStroke:true,seed:1}
function ro(x){var o={roughness:RO.roughness,bowing:RO.bowing,disableMultiStroke:RO.disableMultiStroke,seed:RO.seed};if(x)for(var k in x)o[k]=x[k];return o}
function drawSun(rc,cx,cy,c){rc.circle(cx,cy,14,ro({stroke:c,strokeWidth:1.5}));for(var i=0;i<8;i++){var a=i*Math.PI/4;rc.line(cx+Math.cos(a)*9,cy+Math.sin(a)*9,cx+Math.cos(a)*12,cy+Math.sin(a)*12,ro({stroke:c,strokeWidth:1}))}}
function drawWarm(rc,cx,cy,c){rc.circle(cx,cy,18,ro({stroke:c,strokeWidth:1.8}));rc.line(cx-13,cy,cx-16,cy,ro({stroke:c,strokeWidth:1}));rc.line(cx+13,cy,cx+16,cy,ro({stroke:c,strokeWidth:1}));rc.line(cx,cy-13,cx,cy-16,ro({stroke:c,strokeWidth:1}));rc.line(cx,cy+13,cx,cy+16,ro({stroke:c,strokeWidth:1}))}
function drawGlow(rc,cx,cy,c){rc.circle(cx,cy,12,ro({stroke:c,strokeWidth:1.3}));rc.circle(cx,cy,24,ro({stroke:c,strokeWidth:0.7}))}
function drawMoon(rc,cx,cy,c){var pts=[],i;for(i=0;i<=20;i++){var a=-Math.PI/2+i*Math.PI/20;pts.push([cx+Math.cos(a)*13,cy+Math.sin(a)*13])};for(i=20;i>=0;i--){var a2=-Math.PI/2+i*Math.PI/20;pts.push([cx+Math.cos(a2)*4,cy+Math.sin(a2)*12])};rc.linearPath(pts,ro({stroke:c,strokeWidth:1.3}))}
function drawDrizzle(rc,cx,cy,c){rc.line(cx-7,cy-8,cx-8,cy,ro({stroke:c,strokeWidth:1.2}));rc.line(cx,cy-6,cx-1,cy+4,ro({stroke:c,strokeWidth:1.2}));rc.line(cx+7,cy-7,cx+6,cy+2,ro({stroke:c,strokeWidth:1.2}))}
function drawRain(rc,cx,cy,c){for(var i=-3;i<=3;i++)rc.line(cx+i*4,cy-8+Math.abs(i),cx+i*4-1,cy+6-Math.abs(i),ro({stroke:c,strokeWidth:1.1}))}
function drawStorm(rc,cx,cy,c){rc.linearPath([[cx,cy-13],[cx-5,cy-2],[cx+3,cy-2],[cx-2,cy+13]],ro({stroke:c,strokeWidth:1.8}))}
function drawCloudy(rc,cx,cy,c){rc.linearPath([[cx-14,cy+3],[cx-13,cy-1],[cx-9,cy-5],[cx-4,cy-7],[cx,cy-9],[cx+4,cy-7],[cx+9,cy-5],[cx+13,cy-1],[cx+14,cy+3]],ro({stroke:c,strokeWidth:1.3}));rc.line(cx-14,cy+3,cx+14,cy+3,ro({stroke:c,strokeWidth:1.1}))}
function drawOvercast(rc,cx,cy,c){rc.line(cx-16,cy-2,cx+16,cy-2,ro({stroke:c,strokeWidth:2.5}));rc.line(cx-14,cy+4,cx+14,cy+4,ro({stroke:c,strokeWidth:2}))}
function drawFog(rc,cx,cy,c){for(var y=-7;y<=5;y+=6){rc.line(cx-12,cy+y,cx-3,cy+y,ro({stroke:c,strokeWidth:1.1,roughness:1.5}));rc.line(cx+2,cy+y,cx+10,cy+y,ro({stroke:c,strokeWidth:0.9,roughness:1.5}))}}
function drawWind(rc,cx,cy,c){rc.linearPath([[cx-14,cy-6],[cx,cy-5],[cx+10,cy-9]],ro({stroke:c,strokeWidth:1.3}));rc.linearPath([[cx-12,cy+1],[cx+2,cy+1],[cx+14,cy-2]],ro({stroke:c,strokeWidth:1.5}));rc.linearPath([[cx-10,cy+7],[cx+4,cy+8],[cx+12,cy+5]],ro({stroke:c,strokeWidth:1.1}))}
function drawBreeze(rc,cx,cy,c){rc.linearPath([[cx-14,cy],[cx-4,cy-3],[cx+6,cy+1],[cx+14,cy-2]],ro({stroke:c,strokeWidth:1.2}))}
function drawHumid(rc,cx,cy,c){rc.linearPath([[cx,cy-12],[cx-8,cy+4]],ro({stroke:c,strokeWidth:1.3}));rc.linearPath([[cx,cy-12],[cx+8,cy+4]],ro({stroke:c,strokeWidth:1.3}));rc.arc(cx,cy+4,16,10,0,Math.PI,false,ro({stroke:c,strokeWidth:1.3}))}
function drawSnow(rc,cx,cy,c){for(var i=0;i<6;i++){var a=i*Math.PI/3,ex=Math.cos(a),ey=Math.sin(a);rc.line(cx,cy,cx+ex*13,cy+ey*13,ro({stroke:c,strokeWidth:1}))}}
function drawFrost(rc,cx,cy,c){for(var i=0;i<6;i++){var a=i*Math.PI/3;rc.line(cx,cy,cx+Math.cos(a)*12,cy+Math.sin(a)*12,ro({stroke:c,strokeWidth:1.1}))};rc.circle(cx,cy,4,ro({stroke:c,strokeWidth:0.8}))}
function drawHail(rc,cx,cy,c){rc.circle(cx-8,cy-6,7,ro({stroke:c,strokeWidth:1,fill:c,fillStyle:'solid'}));rc.circle(cx+5,cy-3,6,ro({stroke:c,strokeWidth:1,fill:c,fillStyle:'solid'}));rc.circle(cx-3,cy+5,8,ro({stroke:c,strokeWidth:1,fill:c,fillStyle:'solid'}))}
function drawRainbow(rc,cx,cy,c){var cs=["#C85050","#D88840","#D0B830","#50A850","#4878C0","#7858A8"];for(var i=0;i<cs.length;i++)rc.arc(cx,cy+8,28-i*3.5,24-i*3.5,Math.PI,Math.PI*2,false,ro({stroke:cs[i],strokeWidth:1.5}))}
function drawStarry(rc,cx,cy,c){var pts=[[-8,-7],[4,-9],[10,-2],[-10,3],[-2,2],[7,5],[-6,9],[5,10]];for(var i=0;i<pts.length;i++){var s=2;rc.line(cx+pts[i][0],cy+pts[i][1]-s,cx+pts[i][0],cy+pts[i][1]+s,ro({stroke:c,strokeWidth:0.8}));rc.line(cx+pts[i][0]-s,cy+pts[i][1],cx+pts[i][0]+s,cy+pts[i][1],ro({stroke:c,strokeWidth:0.8}))}}
function drawDust(rc,cx,cy,c){var pts=[[-10,-5],[-4,-9],[3,-7],[9,-4],[-8,1],[1,-1],[7,1],[-6,6],[0,7],[6,6]];for(var i=0;i<pts.length;i++)rc.circle(cx+pts[i][0],cy+pts[i][1],2,ro({stroke:c,strokeWidth:0.7,fill:c,fillStyle:'solid'}))}
function drawPetals(rc,cx,cy,c){var pts=[[-7,-8],[-1,-3],[6,-6],[-9,3],[3,2],[9,1],[-5,8],[4,9]];for(var i=0;i<pts.length;i++)rc.ellipse(cx+pts[i][0],cy+pts[i][1],6,3,ro({stroke:c,strokeWidth:0.9}))}
function drawPlum(rc,cx,cy,c){for(var i=-5;i<=5;i++){rc.line(cx+i*3,cy-10,cx+i*3,cy-5,ro({stroke:c,strokeWidth:0.8}));rc.line(cx+i*3-1,cy-2,cx+i*3-1,cy+3,ro({stroke:c,strokeWidth:0.8}))}}
var WS={sun:{color:"#C8A830",draw:drawSun},warm:{color:"#C09030",draw:drawWarm},glow:{color:"#B0A070",draw:drawGlow},moon:{color:"#7888A8",draw:drawMoon},drizzle:{color:"#6888A8",draw:drawDrizzle},rain:{color:"#4870A0",draw:drawRain},storm:{color:"#5858A0",draw:drawStorm},plum:{color:"#5888A0",draw:drawPlum},cloudy:{color:"#9A9488",draw:drawCloudy},overcast:{color:"#888480",draw:drawOvercast},fog:{color:"#A09890",draw:drawFog},wind:{color:"#5898A0",draw:drawWind},breeze:{color:"#78A880",draw:drawBreeze},humid:{color:"#A09070",draw:drawHumid},snow:{color:"#6880A8",draw:drawSnow},frost:{color:"#5080A8",draw:drawFrost},hail:{color:"#6878A0",draw:drawHail},rainbow:{color:"#C07878",draw:drawRainbow},starry:{color:"#A09060",draw:drawStarry},dust:{color:"#B09050",draw:drawDust},petals:{color:"#C08080",draw:drawPetals}}

/* ── solid weather icon → data URL for Leaflet marker ── */
function prerenderIcon(loc, idx) {
  var weather = loc.weather || 'sun', ws = WS[weather] || WS.sun
  var sz = 48, pad = 3, dpr = 2
  var cvs = document.createElement('canvas')
  cvs.width = sz * dpr; cvs.height = sz * dpr
  var ctx = cvs.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  /* solid cream circle with soft shadow */
  /* no shadow */
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(sz/2, sz/2, sz/2-pad, 0, Math.PI*2); ctx.fill()
  /* clean */

  /* rough border */
  var rc = rough.canvas(cvs)
  rc.circle(sz/2, sz/2, sz-pad*2, { stroke: ws.color, strokeWidth: 1.3, roughness: 0.6, disableMultiStroke: true, seed: 200+idx })

  /* weather drawing */
  try { ws.draw(rc, sz/2, sz/2, ws.color) } catch(e) {}

  return { url: cvs.toDataURL(), ws: ws }
}

/* ── Leaflet-based CompassView ── */
export default function CompassView({ locations }) {
  var containerRef = useRef(null), mapRef = useRef(null), markersRef = useRef([])
  var ss = useState(null), selected = ss[0], setSelected = ss[1]
  var pp = useState(null), cardPos = pp[0], setCardPos = pp[1]

  var geoLocs = locations ? locations.filter(function(l) { return l.lat != null && l.lng != null }) : []

  /* init map once */
  useEffect(function() {
    if (!containerRef.current || mapRef.current) return
    var map = L.map(containerRef.current, {
      center: [30.27, 120.15],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    })
    mapRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19, subdomains: 'abcd',
    }).addTo(map)

    map.on('click', function() { setSelected(null); setCardPos(null) })
    return function() { map.remove(); mapRef.current = null }
  }, [])

  /* update markers */
  useEffect(function() {
    var map = mapRef.current; if (!map) return
    markersRef.current.forEach(function(m) { map.removeLayer(m) })
    markersRef.current = []

    geoLocs.forEach(function(loc, i) {
      var icon = prerenderIcon(loc, i)
      var label = loc.display_name || loc.label || loc.id

      var marker = L.marker([loc.lat, loc.lng], {
        icon: L.divIcon({
          className: 'hopscotch-marker',
          html: '<div style="display:flex;flex-direction:column;align-items:center;pointer-events:auto">' +
            '<img src="' + icon.url + '" width="48" height="48" style="display:block">' +
            '<span style="font:600 10px -apple-system,PingFang SC,sans-serif;color:#5A4E40;margin-top:2px;white-space:nowrap;text-shadow:0 0 3px #FAF6F0,0 0 3px #FAF6F0,0 0 3px #FAF6F0">' + label + '</span>' +
            '</div>',
          iconSize: [48, 64],
          iconAnchor: [24, 24],
        })
      })

      marker.on('click', function(e) {
        L.DomEvent.stopPropagation(e)
        var pt = map.latLngToContainerPoint([loc.lat, loc.lng])
        setSelected({ loc: loc, idx: i })
        setCardPos([pt.x, pt.y])
      })
      marker.addTo(map)
      markersRef.current.push(marker)
    })
  }, [locations])

  /* update card position when map moves */
  useEffect(function() {
    var map = mapRef.current; if (!map || !selected) return
    function upd() { var pt = map.latLngToContainerPoint([selected.loc.lat, selected.loc.lng]); setCardPos([pt.x, pt.y]) }
    map.on('move', upd)
    return function() { map.off('move', upd) }
  }, [selected])

  var cw = selected ? (WS[selected.loc.weather || 'sun'] || WS.sun) : null

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#DDE6EE' }} />
      {selected && cardPos && (
        <div onClick={function(e) { e.stopPropagation() }} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <LocationCard location={selected.loc} position={cardPos} onClose={function() { setSelected(null); setCardPos(null) }} weatherDraw={cw.draw} weatherColor={cw.color} weatherType={selected.loc.weather || 'sun'} activeDim={2} />
          </div>
        </div>
      )}
    </div>
  )
}
