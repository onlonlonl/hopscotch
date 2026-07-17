
// ThreadView.jsx — the infinity dimension
// 3D lemniscate silk thread with color knots, flowing particles, errand light pulse
import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'

// Lemniscate parametric curve
const SCALE = 1.3
function lemnPoint(t) {
  const angle = t * Math.PI * 2
  const s = Math.sin(angle), c = Math.cos(angle)
  const d = 1 + s * s
  return new THREE.Vector3(SCALE * c / d, SCALE * s * c / d, 0.05 * Math.sin(angle * 2))
}

class LemnCurve extends THREE.Curve {
  getPoint(f) { return lemnPoint(f) }
}

export default function ThreadView({ locations = [], activeErrand = null, onNodeTap }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const W = container.clientWidth, H = container.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x13100C, 1)
    container.appendChild(renderer.domElement)
    renderer.domElement.style.display = 'block'

    // Scene + Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 1000)
    camera.position.set(0, 0, 6)
    camera.lookAt(0, 0, 0)

    const group = new THREE.Group()
    scene.add(group)

    // Curve
    const curve = new LemnCurve()

    // Build tube with vertex colors
    const TSEG = 400, RSEG = 10, R = 0.006
    const baseCol = new THREE.Color(0xD8D0C8)
    const spread = 0.007

    // Sort locations by time (index = order)
    const sortedLocs = [...locations].sort((a, b) => {
      if (a.id === 'home') return -1
      if (b.id === 'home') return 1
      return (a.created_at || a.id) > (b.created_at || b.id) ? 1 : -1
    })

    // Assign t values evenly
    const nodeData = sortedLocs.map((loc, i) => ({
      ...loc,
      t: sortedLocs.length > 1 ? i / (sortedLocs.length - 1) * 0.9 + 0.05 : 0.5,
      nodeColor: new THREE.Color(loc.color || '#D8D0C8'),
    }))

    function loopDist(a, b) { const d = Math.abs(a - b); return Math.min(d, 1 - d) }

    const frames = curve.computeFrenetFrames(TSEG, true)
    const pts = []
    for (let i = 0; i <= TSEG; i++) pts.push(curve.getPoint(i / TSEG))

    const verts = [], cols = [], norms = [], idx = []
    for (let i = 0; i <= TSEG; i++) {
      const t = i / TSEG
      let col = baseCol.clone()
      let totalWeight = 0
      const blended = new THREE.Color(0, 0, 0)

      for (const n of nodeData) {
        const d = loopDist(t, n.t)
        if (d < spread) {
          const raw = Math.max(0, 1 - d / spread)
          const w = raw * raw * (3 - 2 * raw)
          blended.r += n.nodeColor.r * w
          blended.g += n.nodeColor.g * w
          blended.b += n.nodeColor.b * w
          totalWeight += w
        }
      }
      if (totalWeight > 0) {
        blended.multiplyScalar(1 / totalWeight)
        col.lerp(blended, Math.min(totalWeight, 1))
      }

      const N = frames.normals[i % TSEG] || frames.normals[0]
      const B = frames.binormals[i % TSEG] || frames.binormals[0]
      const P = pts[i]

      for (let j = 0; j <= RSEG; j++) {
        const ang = (j / RSEG) * Math.PI * 2
        const c = Math.cos(ang), sn = Math.sin(ang)
        const nx = c * N.x + sn * B.x, ny = c * N.y + sn * B.y, nz = c * N.z + sn * B.z
        verts.push(P.x + R * nx, P.y + R * ny, P.z + R * nz)
        norms.push(nx, ny, nz)
        cols.push(col.r, col.g, col.b)
      }
    }
    for (let i = 0; i < TSEG; i++)
      for (let j = 0; j < RSEG; j++) {
        const a = i * (RSEG + 1) + j, b = a + RSEG + 1, c = a + 1, d = b + 1
        idx.push(a, b, c, b, d, c)
      }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3))
    geo.setIndex(idx)
    group.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true })))

    // Ambient particles
    const NP = 20
    const pPos = new Float32Array(NP * 3)
    const pOff = [], pSpd = []
    for (let i = 0; i < NP; i++) { pOff.push(Math.random()); pSpd.push(0.0002 + Math.random() * 0.0004) }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const ambientParticles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xE8E0D8, size: 0.012, transparent: true, opacity: 0.35, sizeAttenuation: true,
    }))
    group.add(ambientParticles)

    // Errand particles (brighter, only active segment)
    const EP = 15
    const ePos = new Float32Array(EP * 3)
    const eOff = [], eSpd = []
    for (let i = 0; i < EP; i++) { eOff.push(Math.random()); eSpd.push(0.002 + Math.random() * 0.003) }
    const eGeo = new THREE.BufferGeometry()
    eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3))
    const errandParticles = new THREE.Points(eGeo, new THREE.PointsMaterial({
      color: 0xF0D868, size: 0.02, transparent: true, opacity: 0.7, sizeAttenuation: true,
    }))
    errandParticles.visible = false
    group.add(errandParticles)

    // Labels (HTML overlay)
    // We'll skip 3D labels for now and use a 2D overlay approach

    // Interaction
    let isDrag = false, px = 0, py = 0, rx = 0.15, ry = 0, vy = 0.0008
    let pinchDist = 0, camZ = 6

    const onPointerDown = (e) => {
      isDrag = true; px = e.clientX; py = e.clientY; vy = 0
    }
    const onPointerMove = (e) => {
      if (!isDrag) return
      ry += (e.clientX - px) * 0.006
      rx += (e.clientY - py) * 0.006
      rx = Math.max(-1.5, Math.min(1.5, rx))
      px = e.clientX; py = e.clientY
    }
    const onPointerUp = () => { isDrag = false; vy = 0.0008 }

    // Pinch zoom
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        pinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
      } else if (e.touches.length === 1) {
        isDrag = true; px = e.touches[0].clientX; py = e.touches[0].clientY; vy = 0
      }
    }
    const onTouchMove = (e) => {
      if (e.touches.length === 2) {
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        camZ = Math.max(3, Math.min(12, camZ * (pinchDist / d)))
        camera.position.z = camZ
        pinchDist = d
      } else if (e.touches.length === 1 && isDrag) {
        ry += (e.touches[0].clientX - px) * 0.006
        rx += (e.touches[0].clientY - py) * 0.006
        rx = Math.max(-1.5, Math.min(1.5, rx))
        px = e.touches[0].clientX; py = e.touches[0].clientY
      }
    }
    const onTouchEnd = () => { isDrag = false; vy = 0.0008 }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true })
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: true })
    renderer.domElement.addEventListener('touchend', onTouchEnd)

    // Animate
    let time = 0
    function animate() {
      const animId = requestAnimationFrame(animate)
      sceneRef.current = { animId }
      time += 0.016
      // no auto-rotation
      group.rotation.x = rx
      group.rotation.y = ry

      // Ambient particles
      for (let i = 0; i < NP; i++) {
        pOff[i] = (pOff[i] + pSpd[i]) % 1
        const pt = curve.getPoint(pOff[i])
        pPos[i * 3] = pt.x; pPos[i * 3 + 1] = pt.y; pPos[i * 3 + 2] = pt.z
      }
      pGeo.attributes.position.needsUpdate = true

      // Errand particles
      if (activeErrand && nodeData.length > 0) {
        errandParticles.visible = true
        const fromNode = nodeData.find(n => n.id === activeErrand.from)
        const toNode = nodeData.find(n => n.id === activeErrand.to)
        if (fromNode && toNode) {
          const tMin = Math.min(fromNode.t, toNode.t)
          const tMax = Math.max(fromNode.t, toNode.t)
          const range = tMax - tMin
          for (let i = 0; i < EP; i++) {
            eOff[i] = (eOff[i] + eSpd[i]) % 1
            const et = tMin + eOff[i] * range
            const pt = curve.getPoint(et)
            ePos[i * 3] = pt.x; ePos[i * 3 + 1] = pt.y; ePos[i * 3 + 2] = pt.z
          }
          eGeo.attributes.position.needsUpdate = true
        }
      } else {
        errandParticles.visible = false
      }

      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      if (sceneRef.current) cancelAnimationFrame(sceneRef.current.animId)
      renderer.dispose()
      container.removeChild(renderer.domElement)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [locations, activeErrand])

  return (
    <div ref={containerRef} style={{
      width: '100%', height: '100%', background: '#13100C',
      touchAction: 'none',
    }} />
  )
}
