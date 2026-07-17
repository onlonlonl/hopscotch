
import { useState, useRef, useCallback } from 'react'
import HopscotchCanvas from './components/HopscotchCanvas'
import HandDrawnMap from './components/HandDrawnMap'
import StampsPanel from './components/StampsPanel'
import { recipes } from './components/IconGallery'
import ThreadView from './components/ThreadView'

const INITIAL = [
  { id: 'home', label: '\u5bb6', display_name: '\u5bb6', story_name: '\u6bcf\u6b21\u8d70\u5230\u9580\u53e3\u90fd\u89ba\u5f97\u5b89\u5fc3', icon_type: 'house', color: '#E8A87C', lux_x: 50, lux_y: 50, scale: 1.2, errands: 9 },
  { id: 'office', label: '\u65b0\u516c\u53f8', display_name: '\u516c\u53f8', story_name: '\u7b2c\u4e8c\u500b\u5bb6', icon_type: 'building', color: '#7BA7BC', lux_x: 75, lux_y: 35, scale: 0.9, errands: 5 },
  { id: 'metro', label: '\u5730\u9435\u7ad9', display_name: '\u5730\u9435', story_name: '\u5730\u4e0b\u7684\u98a8\u7e3d\u662f\u5f88\u5927', icon_type: 'train', color: '#9BB89C', lux_x: 35, lux_y: 65, scale: 0.8, errands: 3 },
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

  // flipTo removed — using direct setDimIndex in label buttons

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

  // Hopscotch home
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

  // Dimension flipper: Ink / Thread / Compass
  const dimensions = ['ink', 'thread', 'compass']
  const dimLabels = { ink: 'Ink', thread: 'Thread', compass: 'Compass' }

  return (
    <div style={{
      width: '100vw', height: '100vh', position: 'relative',
      perspective: '1200px',
      opacity: collapsing ? 0 : 1,
      transition: 'opacity 0.35s ease',
    }}>
      {/* Flip container */}
      <div style={{
        width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transform: `rotateY(${dimIndex * -120}deg)`,
        transition: flipping ? 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
      }}>
        {/* Ink face */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(0deg)',
          background: '#FAF6F0',
        }}>
          <HandDrawnMap ref={mapRef} locations={locations} connections={CONNS}
            fullscreen={true} onLocationTap={handleLocationTap} />
        </div>

        {/* Thread face */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(120deg)',
        }}>
          {dimIndex === 1 && <ThreadView locations={locations} activeErrand={null} />}
        </div>

        {/* Compass face */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(240deg)',
          background: '#E8E4DE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{color:'#5A5A58',fontFamily:"'-apple-system',sans-serif",textAlign:'center'}}>
            <div style={{fontSize:32,marginBottom:8}}>\u25ce</div>
            <div style={{fontSize:13,letterSpacing:2,opacity:0.5}}>Compass</div>
          </div>
        </div>
      </div>



      {/* Dimension switcher labels */}
      <div style={{
        position:'fixed', bottom: panelOpen ? 'calc(42vh + 12px)' : 16, left:'50%', transform:'translateX(-50%)',
        display:'flex', gap:0, zIndex:106, transition:'bottom 0.3s ease',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 8, overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {[{key:'ink',label:'Ink'},{key:'thread',label:'Thread'},{key:'compass',label:'Compass'}].map((d, i) => (
          <button key={d.key} onClick={() => { if (dimIndex !== i && !flipping) { setFlipping(true); setCard(null); setPanelOpen(false); setDimIndex(i); setTimeout(() => setFlipping(false), 650) } }} style={{
            padding: '7px 16px',
            fontSize: 11, letterSpacing: 1,
            fontFamily: "'-apple-system','PingFang SC',sans-serif",
            fontWeight: dimIndex === i ? 600 : 400,
            color: dimIndex === i ? '#2E94B9' : '#A0A098',
            background: dimIndex === i ? 'rgba(46,148,185,0.08)' : 'transparent',
            border: 'none', cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>{d.label}</button>
        ))}
      </div>

      {/* Exit button — top left */}
      <button onClick={exitInk} style={{
        position: 'fixed', top: 50, left: 16,
        width: 36, height: 36, background: 'rgba(255,255,255,0.8)',
        border: '1.5px solid #D0C8C0', borderRadius: 10,
        fontSize: 16, color: '#8A7A68', cursor: 'pointer',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', zIndex: 110,
        fontFamily: "'-apple-system',sans-serif",
      }}>\u2190</button>

      {/* Story card */}
      {card && (
        <div onClick={e => e.stopPropagation()} style={{
          position: 'fixed',
          left: Math.min(card.x, window.innerWidth - 220),
          top: Math.max(card.y - 140, 60),
          width: 200, background: '#fff', borderRadius: 12, padding: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 120,
          fontFamily: "'-apple-system','PingFang SC',sans-serif",
          animation: 'cardIn 0.2s ease-out',
        }}>
          <div style={{fontSize:15,fontWeight:600,color:card.color,marginBottom:2}}>
            {card.display_name || card.label}
          </div>
          {card.label !== card.display_name && (
            <div style={{fontSize:11,color:'#B0A898',marginBottom:4}}>{card.label}</div>
          )}
          {card.story_name && (
            <div style={{fontSize:12,color:'#8A7A68',marginBottom:6,lineHeight:1.6}}>
              {card.story_name}
            </div>
          )}
          {card.errands > 0 && (
            <div style={{fontSize:11,color:'#B0A898',marginBottom:4}}>{card.errands} times</div>
          )}
          <div style={{display:'flex',gap:4,marginTop:8}}>
            {nodeColors.map(c => (
              <div key={c} onClick={() => {
                setLocations(prev => prev.map(l => l.id === card.id ? {...l, color: c} : l))
                setCard(prev => ({...prev, color: c}))
              }} style={{
                width:14,height:14,borderRadius:7,background:c,
                border: c === card.color ? '2px solid #5A4A38' : '1.5px solid #E0D8D0',
                cursor:'pointer',
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Stamps button — only in Ink */}
      {!panelOpen && !card && dimIndex === 0 && (
        <button onClick={() => setPanelOpen(true)} style={{
          position:'fixed', bottom:16, right:16, width:44, height:44,
          background:'#2E94B9', border:'none', borderRadius:12,
          color:'#fff', fontSize:18, cursor:'pointer',
          boxShadow:'0 2px 10px rgba(0,0,0,0.12)', zIndex:101,
        }}>\u270e</button>
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
