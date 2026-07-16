
import { useState, useRef, useCallback } from 'react'
import HandDrawnMap from './components/HandDrawnMap'
import StampsPanel from './components/StampsPanel'
import { recipes } from './components/IconGallery'

const INITIAL = [
  { id: 'home', label: '\u5bb6', display_name: '\u5bb6', story_name: '\u6bcf\u6b21\u8d70\u5230\u9580\u53e3\u90fd\u89ba\u5f97\u5b89\u5fc3', story: '', icon_type: 'house', color: '#E8A87C', lux_x: 50, lux_y: 50, scale: 1.2, errands: 9 },
  { id: 'office', label: '\u65b0\u516c\u53f8', display_name: '\u516c\u53f8', story_name: '\u7b2c\u4e8c\u500b\u5bb6', story: '', icon_type: 'building', color: '#7BA7BC', lux_x: 75, lux_y: 35, scale: 0.9, errands: 5 },
  { id: 'metro', label: '\u5730\u9435\u7ad9', display_name: '\u5730\u9435', story_name: '\u5730\u4e0b\u7684\u98a8\u7e3d\u662f\u5f88\u5927', story: '', icon_type: 'train', color: '#9BB89C', lux_x: 35, lux_y: 65, scale: 0.8, errands: 3 },
]
const CONNS = [['home','office'],['home','metro']]
const nodeColors = ['#E8A87C','#7BA7BC','#9BB89C','#C4A6D0','#D4B896','#B8C4D0','#D0A0A0','#A8B89A']

export default function App() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [locations, setLocations] = useState(INITIAL)
  const [card, setCard] = useState(null)
  const [nameMode, setNameMode] = useState(0)
  const [dropAnim, setDropAnim] = useState(null)
  const mapRef = useRef(null)

  const handleDragToMap = useCallback((type, sx, sy) => {
    if (!mapRef.current) return
    const { lux_x, lux_y } = mapRef.current.screenToLoc(sx, sy)
    setLocations(prev => [...prev, {
      id: 'loc_' + Date.now(), label: type, display_name: type,
      story_name: '', story: '', icon_type: type,
      color: nodeColors[locations.length % nodeColors.length],
      lux_x, lux_y, scale: 0.85, errands: 0,
    }])
    setDropAnim({ x: sx, y: sy })
    setTimeout(() => setDropAnim(null), 400)
  }, [locations])

  const handleLocationTap = useCallback((loc, x, y) => {
    if (!loc) { setCard(null); return }
    setCard({ ...loc, x, y })
  }, [])

  const nameLabels = ['name', 'formal', 'story']
  const getDisplayName = (loc) => {
    if (nameMode === 0) return loc.display_name || loc.label
    if (nameMode === 1) return loc.label
    return loc.story_name || '...'
  }

  return (
    <div style={{width:'100vw',height:'100vh',background:'#FAF6F0',position:'relative'}}>
      <HandDrawnMap ref={mapRef} locations={locations} connections={CONNS}
        fullscreen={true} onLocationTap={handleLocationTap} />

      {dropAnim && <div style={{
        position:'fixed',left:dropAnim.x-20,top:dropAnim.y-20,width:40,height:40,
        borderRadius:'50%',background:'rgba(46,148,185,0.15)',
        animation:'dropBounce 0.4s ease-out forwards',pointerEvents:'none',zIndex:150,
      }} />}

      {card && (
        <div onClick={e => e.stopPropagation()} style={{
          position:'fixed',
          left: Math.min(card.x, window.innerWidth - 220),
          top: Math.max(card.y - 160, 20),
          width: 200, background: '#fff',
          borderRadius: 12, padding: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          zIndex: 120,
          fontFamily: "'-apple-system','PingFang SC',sans-serif",
          animation: 'cardIn 0.2s ease-out',
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <span onClick={() => setNameMode((nameMode+1)%3)}
              style={{fontSize:16,fontWeight:600,color:card.color,cursor:'pointer'}}>
              {getDisplayName(card)}
            </span>
            <span style={{fontSize:8,color:'#C0B8A8',letterSpacing:1}}>
              {nameLabels[nameMode].toUpperCase()}
            </span>
          </div>
          {card.story_name && nameMode !== 2 && (
            <div style={{fontSize:12,color:'#A09888',marginBottom:6,fontStyle:'italic'}}>
              {card.story_name}
            </div>
          )}
          {card.errands > 0 && (
            <div style={{fontSize:11,color:'#B0A898',marginBottom:4}}>
              {card.errands} times
            </div>
          )}
          <div style={{
            width:'100%',height:1,background:'#EAE4DC',margin:'8px 0'
          }} />
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {nodeColors.map(c => (
              <div key={c} onClick={() => {
                setLocations(prev => prev.map(l => l.id === card.id ? {...l, color: c} : l))
                setCard(prev => ({...prev, color: c}))
              }} style={{
                width:20,height:20,borderRadius:10,background:c,
                border: c === card.color ? '2px solid #5A4A38' : '2px solid transparent',
                cursor:'pointer',
              }} />
            ))}
          </div>
        </div>
      )}

      {!panelOpen && !card && (
        <button onClick={() => setPanelOpen(true)} style={{
          position:'fixed',bottom:16,right:16,width:44,height:44,
          background:'#2E94B9',border:'none',borderRadius:12,
          color:'#fff',fontSize:18,cursor:'pointer',
          boxShadow:'0 2px 10px rgba(0,0,0,0.12)',zIndex:101,
        }}>\u270e</button>
      )}

      <StampsPanel open={panelOpen} onClose={() => setPanelOpen(false)}
        onSelect={t => console.log(t)} onDragToMap={handleDragToMap} recipes={recipes} />

      <style>{`
        @keyframes dropBounce {
          0% { transform: scale(0.3); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.6; }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes cardIn {
          0% { transform: scale(0.8) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
