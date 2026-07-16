
import { useState, useRef, useCallback } from 'react'
import HandDrawnMap from './components/HandDrawnMap'
import StampsPanel from './components/StampsPanel'
import { recipes } from './components/IconGallery'

const INITIAL_LOCATIONS = [
  { id: 'home', label: '\u5bb6', display_name: '\u5bb6', icon_type: 'house', color: '#E8A87C', lux_x: 50, lux_y: 50, scale: 1.2, errands: 9 },
  { id: 'office', label: '\u516c\u53f8', display_name: '\u516c\u53f8', icon_type: 'building', color: '#7BA7BC', lux_x: 75, lux_y: 35, scale: 0.9, errands: 5 },
  { id: 'metro', label: '\u5730\u9435', display_name: '\u5730\u9435\u7ad9', icon_type: 'train', color: '#9BB89C', lux_x: 35, lux_y: 65, scale: 0.8, errands: 3 },
]

const CONNECTIONS = [['home','office'],['home','metro']]

const nodeColors = ['#E8A87C','#7BA7BC','#9BB89C','#C4A6D0','#D4B896','#B8C4D0','#D0A0A0','#A8B89A']

export default function App() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [locations, setLocations] = useState(INITIAL_LOCATIONS)
  const [dropAnim, setDropAnim] = useState(null)
  const mapRef = useRef(null)

  const handleDragToMap = useCallback((type, screenX, screenY) => {
    if (!mapRef.current) return
    const { lux_x, lux_y } = mapRef.current.screenToLoc(screenX, screenY)
    const colorIdx = locations.length % nodeColors.length
    const newLoc = {
      id: 'loc_' + Date.now(),
      label: type,
      display_name: type,
      icon_type: type,
      color: nodeColors[colorIdx],
      lux_x, lux_y,
      scale: 0.85,
      errands: 0,
    }
    setLocations(prev => [...prev, newLoc])
    // Bounce animation
    setDropAnim({ x: screenX, y: screenY })
    setTimeout(() => setDropAnim(null), 400)
    setPanelOpen(false)
  }, [locations])

  return (
    <div style={{width:'100vw',height:'100vh',background:'#FAF6F0',position:'relative'}}>
      <HandDrawnMap ref={mapRef} locations={locations} connections={CONNECTIONS} fullscreen={true} />

      {/* Drop bounce animation */}
      {dropAnim && (
        <div style={{
          position:'fixed', left: dropAnim.x - 20, top: dropAnim.y - 20,
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(46,148,185,0.15)',
          animation: 'dropBounce 0.4s ease-out forwards',
          pointerEvents: 'none', zIndex: 150,
        }} />
      )}

      {!panelOpen && (
        <button onClick={() => setPanelOpen(true)} style={{
          position:'fixed', bottom:16, right:16, width:44, height:44,
          background:'#2E94B9', border:'none', borderRadius:12,
          color:'#fff', fontSize:18, cursor:'pointer',
          boxShadow:'0 2px 10px rgba(0,0,0,0.12)', zIndex:101,
        }}>\u270e</button>
      )}

      <StampsPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSelect={(type) => console.log('tap select:', type)}
        onDragToMap={handleDragToMap}
        recipes={recipes}
      />

      <style>{`
        @keyframes dropBounce {
          0% { transform: scale(0.3); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.6; }
          100% { transform: scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
