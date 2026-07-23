
import { useState, useRef, useCallback, useEffect } from 'react'
import rough from 'roughjs'
import HopscotchCanvas from './components/HopscotchCanvas'
import HandDrawnMap from './components/HandDrawnMap'
import StampsPanel from './components/StampsPanel'
import { recipes } from './components/IconGallery'
import ThreadView from './components/ThreadView'
import CompassView from './components/CompassView'
import LocationCard from './components/LocationCard'

const INITIAL = [
  { id: 'home', label: '\u5bb6', icon_type: 'house', color: '#E8A87C', lux_x: 50, lux_y: 50, scale: 1.2, errands: 9, lat: 30.33, lng: 120.06, weather: 'warm', story_name: 'Honey Jar', display_name: 'Home', inf_t: 0.127, inf_w: 0.94, story: 'The place where mornings start slow and the light is always golden.' },
  { id: 'office', label: '\u65b0\u516c\u53f8', icon_type: 'building', color: '#7BA7BC', lux_x: 75, lux_y: 35, scale: 0.9, errands: 5, lat: 30.30, lng: 120.04, weather: 'cloudy', story_name: 'The Hive', display_name: 'Office', inf_t: 0.456, inf_w: 0.52, story: 'Busy bees. Coffee machine hums at 2pm.' },
  { id: 'metro', label: '\u5730\u9435\u7ad9', icon_type: 'train', color: '#9BB89C', lux_x: 35, lux_y: 65, scale: 0.8, errands: 3, lat: 30.28, lng: 120.33, weather: 'drizzle', story_name: 'Waiting Room', display_name: 'Metro', inf_t: 0.831, inf_w: 0.33, story: 'Always raining here somehow.' },
]
const CONNS = [['home','office'],['home','metro']]
const nodeColors = ['#E8A87C','#7BA7BC','#9BB89C','#C4A6D0','#D4B896','#B8C4D0','#D0A0A0','#A8B89A']
const stampLabels = {
  house:'\u5bb6',building:'\u516c\u53f8',train:'\u5730\u9435',plane:'\u6a5f\u5834',
  shop:'\u5546\u5e97',school:'\u5b78\u6821',hospital:'\u91ab\u9662',
  cafe:'\u5496\u5561',restaurant:'\u9910\u5ef3',bar:'\u9152\u5427',
  park:'\u516c\u5712',mountain:'\u5c71',beach:'\u6d77\u7058',hotel:'\u9152\u5e97',
  cinema:'\u96fb\u5f71\u9662',torii:'\u9ce5\u5c45',temple:'\u5bfa\u5edf',
  church:'\u6559\u5802',flag:'\u65d7\u5b50',heart:'\u2764',
}

/* draw the 3 dimension tab icons on a canvas */
function drawTabs(cvs, active) {
  var IW = 32, IH = 32, GAP = 6, TH = IH * 3 + GAP * 2
  var dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = IW * dpr; cvs.height = TH * dpr
  cvs.style.width = IW + 'px'; cvs.style.height = TH + 'px'
  var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  var rc = rough.canvas(cvs)
  var ro = { roughness: 0.5, bowing: 0.8, disableMultiStroke: true }

  for (var i = 0; i < 3; i++) {
    var y = i * (IH + GAP), cx = IW / 2, cy = y + IH / 2
    var ac = i === active, sc = ac ? '#2E94B9' : '#B8B0A0', sw = ac ? 1.2 : 0.7

    /* background pill */
    if (ac) rc.rectangle(2, y + 2, IW - 4, IH - 4, { stroke: '#2E94B9', strokeWidth: 0.6, roughness: 0.4, fill: 'rgba(46,148,185,0.06)', fillStyle: 'solid', disableMultiStroke: true, seed: 50 + i })

    if (i === 0) {
      /* Ink: small rectangle frame with a dot */
      rc.rectangle(cx - 8, cy - 6, 16, 12, { stroke: sc, strokeWidth: sw, ...ro, seed: 10 })
      ctx.fillStyle = sc; ctx.globalAlpha = ac ? 1 : 0.5
      ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1
    } else if (i === 1) {
      /* Thread: infinity/lemniscate */
      ctx.strokeStyle = sc; ctx.lineWidth = sw; ctx.globalAlpha = ac ? 1 : 0.6
      ctx.beginPath()
      for (var t = 0; t <= 60; t++) { var a = t / 60 * Math.PI * 2, s = Math.sin(a), c2 = Math.cos(a), d = 1 + s * s; var px = cx + 10 * c2 / d, py = cy + 6 * s * c2 / d; t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py) }
      ctx.stroke(); ctx.globalAlpha = 1
    } else {
      /* Compass: circle + crosshairs */
      rc.circle(cx, cy, 18, { stroke: sc, strokeWidth: sw, ...ro, seed: 30 })
      rc.line(cx, cy - 5, cx, cy + 5, { stroke: sc, strokeWidth: sw * 0.7, ...ro, seed: 31 })
      rc.line(cx - 5, cy, cx + 5, cy, { stroke: sc, strokeWidth: sw * 0.7, ...ro, seed: 32 })
    }
  }
}

/* draw rough back arrow on canvas */
function drawBack(cvs) {
  var S = 36, dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = S * dpr; cvs.height = S * dpr
  cvs.style.width = S + 'px'; cvs.style.height = S + 'px'
  var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  var rc = rough.canvas(cvs)
  rc.rectangle(2, 2, S - 4, S - 4, { stroke: '#D0C8C0', strokeWidth: 1, roughness: 0.5, fill: 'rgba(255,255,255,0.85)', fillStyle: 'solid', disableMultiStroke: true, seed: 77 })
  rc.line(22, 12, 12, 18, { stroke: '#8A7A68', strokeWidth: 1.3, roughness: 0.4, disableMultiStroke: true, seed: 78 })
  rc.line(12, 18, 22, 24, { stroke: '#8A7A68', strokeWidth: 1.3, roughness: 0.4, disableMultiStroke: true, seed: 79 })
}

export default function App() {
  const [view, setView] = useState('home')
  const [expanding, setExpanding] = useState(false)
  const [collapsing, setCollapsing] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [locations, setLocations] = useState(INITIAL)
  const [card, setCard] = useState(null)
  const [dimIndex, setDimIndex] = useState(0)
  const [flipping, setFlipping] = useState(false)
  const mapRef = useRef(null)
  const tabRef = useRef(null)
  const backRef = useRef(null)

  const enterInk = useCallback(() => {
    setExpanding(true)
    setTimeout(() => { setView('ink'); setExpanding(false) }, 350)
  }, [])

  const exitInk = useCallback(() => {
    setCollapsing(true)
    setPanelOpen(false)
    setCard(null)
    setTimeout(() => { setView('home'); setCollapsing(false) }, 350)
  }, [])

  const handleZoneTap = useCallback((zone) => {
    if (zone === 'top') enterInk()
  }, [enterInk])

  const handleDragToMap = useCallback((type, sx, sy) => {
    if (!mapRef.current) return
    const { lux_x, lux_y } = mapRef.current.screenToLoc(sx, sy)
    const cLabel = stampLabels[type] || type
    setLocations(prev => [...prev, {
      id: 'loc_' + Date.now(), label: cLabel, display_name: cLabel,
      story_name: '', icon_type: type,
      color: nodeColors[locations.length % nodeColors.length],
      lux_x, lux_y, scale: 0.85, errands: 0,
    }])
  }, [locations])

  const handleLocationTap = useCallback((loc, x, y) => {
    if (!loc) { setCard(null); return }
    setCard({ ...loc, x, y })
  }, [])

  /* draw tabs + back button */
  useEffect(() => {
    if (view !== 'ink') return
    if (tabRef.current) drawTabs(tabRef.current, dimIndex)
    if (backRef.current) drawBack(backRef.current)
  }, [view, dimIndex])

  const handleTabClick = useCallback((e) => {
    var rect = tabRef.current.getBoundingClientRect()
    var y = e.clientY - rect.top
    var IH = 32, GAP = 6
    var idx = Math.floor(y / (IH + GAP))
    if (idx < 0) idx = 0; if (idx > 2) idx = 2
    if (idx !== dimIndex && !flipping) {
      setFlipping(true); setCard(null); setPanelOpen(false); setDimIndex(idx)
      setTimeout(() => setFlipping(false), 650)
    }
  }, [dimIndex, flipping])

  if (view === 'home') {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        opacity: expanding ? 0 : 1,
        transform: expanding ? 'scale(1.1)' : 'scale(1)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}>
        <HopscotchCanvas onZoneTap={handleZoneTap} />
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative',
      overflow: 'hidden',
      opacity: collapsing ? 0 : 1,
      transition: 'opacity 0.35s ease',
    }}>
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, perspective: '1200px' }}>
      <div style={{
        width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transform: `rotateY(${dimIndex * -120}deg)`,
        transition: flipping ? 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
      }}>
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(0deg)',
          background: '#FAF6F0', overflow: 'hidden',
        }}>
          <HandDrawnMap ref={mapRef} locations={locations} connections={CONNS}
            fullscreen={true} onLocationTap={handleLocationTap} />
        </div>

        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(120deg)',
        }}>
          {dimIndex === 1 && <ThreadView locations={locations} onNodeTap={handleLocationTap} />}
        </div>

        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(240deg)',
          overflow: 'hidden',
        }}>
          {dimIndex === 2 && <CompassView locations={locations} />}
        </div>
      </div>
      </div>

      {/* Left-side dimension tabs */}
      <canvas ref={tabRef} onClick={handleTabClick} style={{
        position: 'fixed', left: 10, top: '50%', transform: 'translateY(-50%)',
        zIndex: 115, cursor: 'pointer',
      }} />

      {/* Back button */}
      <canvas ref={backRef} onClick={exitInk} style={{
        position: 'fixed', top: 50, left: 12,
        zIndex: 110, cursor: 'pointer',
      }} />

      {card && (
        <>
          <div onClick={() => setCard(null)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 119,
          }} />
          <LocationCard
            location={card}
            position={dimIndex === 1
              ? [window.innerWidth / 2, (window.innerHeight - 100) / 2]
              : [Math.min(card.x, window.innerWidth - 120), Math.max(card.y, 130)]
            }
            onClose={() => setCard(null)}
            weatherColor={card.color}
            weatherType={card.weather || 'sun'} activeDim={dimIndex}
          />
        </>
      )}

      {!panelOpen && !card && dimIndex === 0 && (
        <button onClick={() => setPanelOpen(true)} style={{
          position:'fixed', bottom:16, right:16, width:44, height:44,
          background:'#2E94B9', border:'none', borderRadius:12,
          color:'#fff', fontSize:18, cursor:'pointer',
          boxShadow:'0 2px 10px rgba(0,0,0,0.12)', zIndex:101,
        }}>{'\u270e'}</button>
      )}

      <StampsPanel open={panelOpen} onClose={() => setPanelOpen(false)}
        onSelect={t => console.log(t)} onDragToMap={handleDragToMap} recipes={recipes} />

      <style>{`
        @keyframes cardIn {
          0% { transform: scale(0.8) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
