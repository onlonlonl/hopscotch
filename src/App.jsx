import { useState, useEffect, useCallback } from 'react'
import HopscotchCanvas from './components/HopscotchCanvas'
import { initSupabase, isConnected } from './lib/supabase'

export default function App() {
  const [connected, setConnected] = useState(false)
  const [activeZone, setActiveZone] = useState(null)

  useEffect(() => {
    setConnected(initSupabase())
  }, [])

  const handleZoneTap = useCallback((zone) => {
    setActiveZone(zone)
    console.log('zone tapped:', zone)
  }, [])

  return (
    <>
      <HopscotchCanvas onZoneTap={handleZoneTap} />
      {!connected && (
        <div style={{
          position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'DotGothic16', monospace",
          fontSize: 10, color: 'rgba(255,255,255,0.4)',
          letterSpacing: 2, textAlign: 'center',
          pointerEvents: 'none',
        }}>
          HOPSCOTCH
        </div>
      )}
    </>
  )
}