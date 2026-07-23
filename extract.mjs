import { readFileSync, writeFileSync } from 'fs'
import * as topojson from 'topojson-client'

const topo = JSON.parse(readFileSync('node_modules/world-atlas/land-50m.json', 'utf-8'))
const geo = topojson.feature(topo, topo.objects.land)

function simplify(coords, maxPts) {
  if (coords.length <= maxPts) return coords
  const step = Math.ceil(coords.length / maxPts)
  const out = []
  for (let i = 0; i < coords.length; i += step) out.push(coords[i])
  if (out[out.length-1] !== coords[coords.length-1]) out.push(coords[coords.length-1])
  return out
}

function chaikin(pts) {
  const out = [pts[0]]
  for (let i = 0; i < pts.length - 1; i++) {
    out.push([pts[i][0]*0.75+pts[i+1][0]*0.25, pts[i][1]*0.75+pts[i+1][1]*0.25])
    out.push([pts[i][0]*0.25+pts[i+1][0]*0.75, pts[i][1]*0.25+pts[i+1][1]*0.75])
  }
  out.push(pts[pts.length-1])
  return out
}

const polygons = []
for (const feature of (geo.type === 'FeatureCollection' ? geo.features : [geo])) {
  const geom = feature.geometry
  const rings = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates
  for (const poly of rings) {
    // Only outer ring (index 0), skip holes (lakes/inland seas)
    {
      const ring = poly[0]
      if (!ring || ring.length < 20) { continue } else { /* outer only */ }
      const maxPts = ring.length > 300 ? 80 : ring.length > 80 ? 40 : 30
      let s = simplify(ring, maxPts)
      s = chaikin(s)
      polygons.push(s.map(p => [Math.round(p[0]*10)/10, Math.round(p[1]*10)/10]))
    }
  }
}

let total = 0
polygons.forEach(p => total += p.length)
console.log('Polygons:', polygons.length, 'Total points:', total)
const js = 'export default ' + JSON.stringify(polygons) + ';\n'
writeFileSync('src/lib/coastlines.js', js)
console.log('Written:', js.length, 'bytes')
