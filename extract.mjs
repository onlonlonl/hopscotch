import { readFileSync, writeFileSync } from 'fs'
import * as topojson from 'topojson-client'

const topo = JSON.parse(readFileSync('node_modules/world-atlas/land-110m.json', 'utf-8'))
const geo = topojson.feature(topo, topo.objects.land)

// Simplify: keep every Nth point based on polygon size
function simplify(coords, maxPts) {
  if (coords.length <= maxPts) return coords
  const step = Math.ceil(coords.length / maxPts)
  const out = []
  for (let i = 0; i < coords.length; i += step) out.push(coords[i])
  // Always include last point to close
  if (out[out.length-1] !== coords[coords.length-1]) out.push(coords[coords.length-1])
  return out
}

const polygons = []
for (const feature of (geo.type === 'FeatureCollection' ? geo.features : [geo])) {
  const geom = feature.geometry
  const rings = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates
  for (const poly of rings) {
    for (const ring of poly) {
      // Skip tiny islands (< 8 points in 110m = really small)
      if (ring.length < 8) continue
      // Simplify larger polygons more aggressively
      const maxPts = ring.length > 200 ? 80 : ring.length > 50 ? 30 : ring.length
      const simplified = simplify(ring, maxPts)
      // Round to 1 decimal
      const rounded = simplified.map(p => [Math.round(p[0]*10)/10, Math.round(p[1]*10)/10])
      polygons.push(rounded)
    }
  }
}

let total = 0
polygons.forEach(p => total += p.length)
console.log('Polygons:', polygons.length, 'Total points:', total)

// Output as JS module
const js = 'export default ' + JSON.stringify(polygons) + ';\n'
writeFileSync('src/lib/coastlines.js', js)
console.log('Written to src/lib/coastlines.js, size:', js.length)
