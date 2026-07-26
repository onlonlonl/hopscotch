import { useState, useRef, useEffect, useCallback } from 'react'
import rough from 'roughjs'
import { HOPSCOTCH_BG } from '../lib/tokens'
import { supaGet, supaPost, supaPatch, supaDelete, isConnected } from '../lib/supabase'

var STAGES = ['Seed', 'Sprout', 'Seedling', 'Growth', 'Bloom', 'Full']
var THRESHOLDS = [0, 5, 12, 22, 33, 45]
var PAPER = '#F8F8F6'
var BORDER = '#D8D0C8'
var UNLOCKED_BG = '#FDFCFA'
var LOCKED_STROKE = '#C8C0B8'
var LOCKED_DASH = [4, 4]
var FONT = "-apple-system, 'PingFang SC', sans-serif"

function calcScore(garden) {
  if (!garden) return { days: 0, trips: 0, places: 0, total: 0, stage: 0 }
  var days = Math.max(0, Math.floor((Date.now() - new Date(garden.planted_at).getTime()) / 86400000))
  var trips = garden._trips || 0
  var places = garden._places || 0
  var total = days + trips * 3 + places * 5
  var stage = 0
  for (var i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (total >= THRESHOLDS[i]) { stage = i; break }
  }
  return { days, trips, places, total, stage }
}

/* draw Rough.js back arrow */
function drawBackBtn(cvs) {
  var S = 36, dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = S * dpr; cvs.height = S * dpr
  cvs.style.width = S + 'px'; cvs.style.height = S + 'px'
  var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  var rc = rough.canvas(cvs)
  rc.rectangle(2, 2, S - 4, S - 4, {
    stroke: '#D0C8C0', strokeWidth: 1, roughness: 0.5,
    fill: 'rgba(255,255,255,0.85)', fillStyle: 'solid',
    disableMultiStroke: true, seed: 77
  })
  rc.line(22, 12, 12, 18, { stroke: '#8A7A68', strokeWidth: 1.3, roughness: 0.4, disableMultiStroke: true, seed: 78 })
  rc.line(12, 18, 22, 24, { stroke: '#8A7A68', strokeWidth: 1.3, roughness: 0.4, disableMultiStroke: true, seed: 79 })
}

/* draw Rough.js harvest button */
function drawHarvestBtn(cvs, w) {
  var H = 38, dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = w * dpr; cvs.height = H * dpr
  cvs.style.width = w + 'px'; cvs.style.height = H + 'px'
  var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  var rc = rough.canvas(cvs)
  rc.rectangle(2, 2, w - 4, H - 4, {
    stroke: '#6AAF5C', strokeWidth: 1.5, roughness: 0.5,
    fill: '#6AAF5C', fillStyle: 'solid',
    disableMultiStroke: true, seed: 500
  })
  ctx.fillStyle = '#fff'
  ctx.font = "14px " + FONT
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Harvest', w / 2, H / 2 + 1)
}


/* draw Rough.js icon for each growth stage */
function drawStageIcon(rc, ctx, stage, cx, cy, s, stemC, leafC, flowerC, ro) {
  var sw = 1.2
  if (stage === 0) {
    /* Seed: small oval in soil */
    rc.ellipse(cx, cy + 2 * s, 8 * s, 6 * s, {
      stroke: '#8B6C52', strokeWidth: sw, fill: '#A8896A', fillStyle: 'solid', ...ro
    })
    /* seed dot */
    rc.circle(cx, cy + 2 * s, 3 * s, {
      stroke: '#6A5040', strokeWidth: 0.8, fill: '#6A5040', fillStyle: 'solid', ...ro, seed: ro.seed + 10
    })
  } else if (stage === 1) {
    /* Sprout: short stem + tiny leaf */
    rc.line(cx, cy + 8 * s, cx, cy - 2 * s, { stroke: stemC, strokeWidth: sw, ...ro })
    rc.ellipse(cx + 3 * s, cy - 2 * s, 5 * s, 3 * s, {
      stroke: leafC, strokeWidth: 0.8, fill: leafC, fillStyle: 'solid', ...ro, seed: ro.seed + 10
    })
  } else if (stage === 2) {
    /* Seedling: taller stem + two leaves */
    rc.line(cx, cy + 8 * s, cx, cy - 6 * s, { stroke: stemC, strokeWidth: sw, ...ro })
    rc.ellipse(cx - 5 * s, cy, 6 * s, 3 * s, {
      stroke: leafC, strokeWidth: 0.8, fill: leafC, fillStyle: 'solid', ...ro, seed: ro.seed + 10
    })
    rc.ellipse(cx + 5 * s, cy - 4 * s, 6 * s, 3 * s, {
      stroke: leafC, strokeWidth: 0.8, fill: leafC, fillStyle: 'solid', ...ro, seed: ro.seed + 11
    })
  } else if (stage === 3) {
    /* Growth: tall stem + three leaves + thicker */
    rc.line(cx, cy + 8 * s, cx, cy - 10 * s, { stroke: stemC, strokeWidth: 1.6, ...ro })
    rc.ellipse(cx - 6 * s, cy + 2 * s, 7 * s, 3.5 * s, {
      stroke: leafC, strokeWidth: 0.8, fill: leafC, fillStyle: 'solid', ...ro, seed: ro.seed + 10
    })
    rc.ellipse(cx + 6 * s, cy - 3 * s, 7 * s, 3.5 * s, {
      stroke: leafC, strokeWidth: 0.8, fill: leafC, fillStyle: 'solid', ...ro, seed: ro.seed + 11
    })
    rc.ellipse(cx - 4 * s, cy - 7 * s, 5 * s, 3 * s, {
      stroke: leafC, strokeWidth: 0.8, fill: leafC, fillStyle: 'solid', ...ro, seed: ro.seed + 12
    })
  } else if (stage === 4) {
    /* Bloom: stem + leaves + flower bud */
    rc.line(cx, cy + 8 * s, cx, cy - 10 * s, { stroke: stemC, strokeWidth: 1.6, ...ro })
    rc.ellipse(cx - 6 * s, cy + 1 * s, 6 * s, 3 * s, {
      stroke: leafC, strokeWidth: 0.8, fill: leafC, fillStyle: 'solid', ...ro, seed: ro.seed + 10
    })
    rc.ellipse(cx + 6 * s, cy - 3 * s, 6 * s, 3 * s, {
      stroke: leafC, strokeWidth: 0.8, fill: leafC, fillStyle: 'solid', ...ro, seed: ro.seed + 11
    })
    /* flower */
    rc.circle(cx, cy - 12 * s, 7 * s, {
      stroke: flowerC, strokeWidth: 1.2, fill: flowerC, fillStyle: 'solid', ...ro, seed: ro.seed + 13
    })
    for (var p = 0; p < 5; p++) {
      var pa = (p / 5) * Math.PI * 2 - Math.PI / 2
      rc.circle(cx + Math.cos(pa) * 5 * s, cy - 12 * s + Math.sin(pa) * 5 * s, 4 * s, {
        stroke: '#E8A87C', strokeWidth: 0.6, fill: '#E8A87C', fillStyle: 'solid',
        roughness: 0.4, disableMultiStroke: true, seed: ro.seed + 20 + p
      })
    }
    rc.circle(cx, cy - 12 * s, 4 * s, {
      stroke: flowerC, strokeWidth: 0.8, fill: flowerC, fillStyle: 'solid', ...ro, seed: ro.seed + 14
    })
  } else {
    /* Full: big bloom + fruit dots */
    rc.line(cx, cy + 8 * s, cx, cy - 10 * s, { stroke: stemC, strokeWidth: 1.8, ...ro })
    rc.ellipse(cx - 7 * s, cy + 1 * s, 7 * s, 3.5 * s, {
      stroke: leafC, strokeWidth: 0.8, fill: leafC, fillStyle: 'solid', ...ro, seed: ro.seed + 10
    })
    rc.ellipse(cx + 7 * s, cy - 3 * s, 7 * s, 3.5 * s, {
      stroke: leafC, strokeWidth: 0.8, fill: leafC, fillStyle: 'solid', ...ro, seed: ro.seed + 11
    })
    /* big flower */
    for (var q = 0; q < 6; q++) {
      var qa = (q / 6) * Math.PI * 2 - Math.PI / 2
      rc.circle(cx + Math.cos(qa) * 6 * s, cy - 12 * s + Math.sin(qa) * 6 * s, 5 * s, {
        stroke: '#D0A0A0', strokeWidth: 0.8, fill: '#D0A0A0', fillStyle: 'solid',
        roughness: 0.4, disableMultiStroke: true, seed: ro.seed + 20 + q
      })
    }
    rc.circle(cx, cy - 12 * s, 5 * s, {
      stroke: flowerC, strokeWidth: 1, fill: flowerC, fillStyle: 'solid', ...ro, seed: ro.seed + 14
    })
    /* fruit */
    rc.circle(cx + 8 * s, cy - 6 * s, 3 * s, {
      stroke: '#D87860', strokeWidth: 0.8, fill: '#D87860', fillStyle: 'solid',
      roughness: 0.3, disableMultiStroke: true, seed: ro.seed + 30
    })
  }
}


/* render shapes from stamps JSON */
function drawFromJSON(rc, ctx, shapes, cx, cy, s, ro) {
  if (!shapes || !shapes.length) return
  for (var i = 0; i < shapes.length; i++) {
    var sh = shapes[i]
    var opts = { roughness: 0.6, disableMultiStroke: true, seed: (ro.seed || 650) + i * 3 }
    if (sh.fill) { opts.fill = sh.fill; opts.fillStyle = 'solid' }
    if (sh.stroke) opts.stroke = sh.stroke
    opts.strokeWidth = sh.sw || 1.2

    if (sh.t === 'circle') {
      rc.circle(cx + sh.x * s, cy + sh.y * s, (sh.r || 3) * 2 * s, opts)
    } else if (sh.t === 'ellipse') {
      rc.ellipse(cx + sh.x * s, cy + sh.y * s, (sh.w || 6) * s, (sh.h || 3) * s, opts)
    } else if (sh.t === 'line') {
      rc.line(cx + sh.x1 * s, cy + sh.y1 * s, cx + sh.x2 * s, cy + sh.y2 * s, opts)
    } else if (sh.t === 'rect') {
      rc.rectangle(cx + sh.x * s, cy + sh.y * s, (sh.w || 4) * s, (sh.h || 4) * s, opts)
    }
  }
}

/* draw the 3x2 grid on a canvas */
function drawGrid(cvs, garden, score, w, h) {
  var dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = w * dpr; cvs.height = h * dpr
  cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
  var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  var rc = rough.canvas(cvs)

  var cols = 3, rows = 2, gap = 10
  var cellW = (w - gap * (cols + 1)) / cols
  var cellH = (h - gap * (rows + 1)) / rows

  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var idx = r * cols + c
      var x = gap + c * (cellW + gap)
      var y = gap + r * (cellH + gap)
      var unlocked = score.stage >= idx

      if (unlocked) {
        /* solid frame */
        rc.rectangle(x, y, cellW, cellH, {
          stroke: BORDER, strokeWidth: 1.2, roughness: 0.5,
          fill: UNLOCKED_BG, fillStyle: 'solid',
          disableMultiStroke: true, seed: 600 + idx
        })

        /* stamp visual */
        var scx = x + cellW / 2, scy = y + cellH / 2 - 4
        var ss = Math.min(cellW, cellH) / 88
        var sro = { roughness: 0.6, disableMultiStroke: true, seed: 650 + idx }
        var stamps = garden && garden.stamps
        if (stamps && stamps[idx] && stamps[idx].length > 0) {
          drawFromJSON(rc, ctx, stamps[idx], scx, scy, ss, sro)
        } else {
          var active = idx === score.stage
          var sc1 = active ? '#6AAF5C' : '#9BB89C'
          var sc2 = active ? '#4AAF5C' : '#A8B89A'
          var sc3 = active ? '#ECC44E' : '#D4B896'
          drawStageIcon(rc, ctx, idx, scx, scy, ss, sc1, sc2, sc3, sro)
        }
      } else {
        /* dashed frame */
        ctx.setLineDash(LOCKED_DASH)
        ctx.strokeStyle = LOCKED_STROKE
        ctx.lineWidth = 1
        ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1)
        ctx.setLineDash([])
      }

      /* stage label */
      ctx.fillStyle = unlocked ? '#7A6A5A' : '#B8A898'
      ctx.font = "11px " + FONT
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(STAGES[idx], x + cellW / 2, y + cellH - 6)
    }
  }
}

/* draw progress bar */
function drawProgress(cvs, score, w) {
  var H = 24, dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = w * dpr; cvs.height = H * dpr
  cvs.style.width = w + 'px'; cvs.style.height = H + 'px'
  var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  var rc = rough.canvas(cvs)

  /* track */
  rc.rectangle(0, 6, w, 12, {
    stroke: '#E0D8D0', strokeWidth: 0.8, roughness: 0.4,
    fill: '#F0EDE8', fillStyle: 'solid',
    disableMultiStroke: true, seed: 700
  })

  /* filled portion */
  var nextThreshold = score.stage < 5 ? THRESHOLDS[score.stage + 1] : THRESHOLDS[5]
  var prevThreshold = THRESHOLDS[score.stage]
  var segProgress = score.stage >= 5 ? 1 : (score.total - prevThreshold) / (nextThreshold - prevThreshold)
  var fillW = Math.max(4, Math.min(w - 2, segProgress * (w - 2)))

  if (fillW > 4) {
    rc.rectangle(1, 7, fillW, 10, {
      stroke: '#6AAF5C', strokeWidth: 0.6, roughness: 0.3,
      fill: '#6AAF5C', fillStyle: 'solid',
      disableMultiStroke: true, seed: 701
    })
  }
}

export default function GardenView({ onExit }) {
  var [garden, setGarden] = useState(null)
  var [loading, setLoading] = useState(true)
  var [planting, setPlanting] = useState(false)
  var [inputName, setInputName] = useState('')
  var [score, setScore] = useState({ days: 0, trips: 0, places: 0, total: 0, stage: 0 })

  var gridRef = useRef(null)
  var progRef = useRef(null)
  var backRef = useRef(null)
  var harvestRef = useRef(null)

  /* load garden + counts */
  useEffect(function () {
    if (!isConnected()) { setLoading(false); return }
    Promise.all([
      supaGet('hopscotch_garden', 'order=id.desc&limit=1'),
      supaGet('service_requests', 'select=id&status=eq.done'),
      supaGet('locations', 'select=id'),
    ]).then(function (res) {
      var g = res[0] && res[0][0] ? res[0][0] : null
      if (g) {
        g._trips = res[1] ? res[1].length : 0
        g._places = res[2] ? res[2].length : 0
      }
      setGarden(g)
      setScore(calcScore(g))
      if (!g) setPlanting(true)
      setLoading(false)
    })
  }, [])

  /* draw canvases */
  useEffect(function () {
    if (loading || !garden) return
    var W = Math.min(window.innerWidth - 40, 340)
    var gridH = W * 0.72
    if (gridRef.current) drawGrid(gridRef.current, garden, score, W, gridH)
    if (progRef.current) drawProgress(progRef.current, score, W)
    if (backRef.current) drawBackBtn(backRef.current)
    if (score.stage >= 5 && harvestRef.current) drawHarvestBtn(harvestRef.current, W)
  }, [loading, garden, score])

  var [generating, setGenerating] = useState(false)

  /* plant a new seed + generate stamps via VPS */
  async function handlePlant() {
    var name = inputName.trim()
    if (!name || !isConnected()) return
    setGenerating(true)

    /* create garden row */
    var rows = await supaPost('hopscotch_garden', { plant_name: name })
    if (!rows || !rows[0]) { setGenerating(false); return }
    var g = rows[0]
    g._trips = 0; g._places = 0
    setGarden(g)
    setScore(calcScore(g))
    setPlanting(false)

    /* generate stamps via VPS */
    try {
      var safeName = name.replace(/"/g, '').replace(/'/g, '').substring(0, 40)
      await supaPost('commands', { cmd: 'cd ~/lucid && python3 gen_stamps.py "' + safeName + '"', status: 'pending' })

      /* poll for result (up to 15s) */
      var stamps = null
      for (var attempt = 0; attempt < 10; attempt++) {
        await new Promise(function(r) { setTimeout(r, 1500) })
        var cmds = await supaGet('commands', 'order=id.desc&limit=1')
        if (cmds && cmds[0] && cmds[0].status === 'done' && cmds[0].result) {
          try {
            var parsed = JSON.parse(cmds[0].result)
            if (Array.isArray(parsed) && parsed.length === 6) {
              stamps = parsed
              break
            }
          } catch(e) {}
        }
      }

      if (stamps) {
        await supaPatch('hopscotch_garden', 'id=eq.' + g.id, { stamps: stamps })
        g.stamps = stamps
        setGarden({...g})
      }
    } catch(e) { console.error('stamp gen', e) }
    setGenerating(false)
  }

  /* harvest and start new */
  async function handleHarvest() {
    if (!garden || !isConnected()) return
    /* move to shelf */
    await supaPost('hopscotch_shelf', {
      plant_name: garden.plant_name,
      planted_at: garden.planted_at,
      stamps: garden.stamps,
      milestones: garden.milestones,
    })
    /* delete current */
    await supaDelete('hopscotch_garden', 'id=eq.' + garden.id)
    setGarden(null)
    setScore({ days: 0, trips: 0, places: 0, total: 0, stage: 0 })
    setPlanting(true)
  }

  /* regenerate stamps */
  async function handleRegen() {
    if (!garden || !isConnected() || generating) return
    setGenerating(true)
    try {
      var safeName = (garden.plant_name || '').replace(/"/g, '').replace(/'/g, '').substring(0, 40)
      await supaPost('commands', { cmd: 'cd ~/lucid && python3 gen_stamps.py "' + safeName + '"', status: 'pending' })
      var stamps = null
      for (var attempt = 0; attempt < 10; attempt++) {
        await new Promise(function(r) { setTimeout(r, 1500) })
        var cmds = await supaGet('commands', 'order=id.desc&limit=1')
        if (cmds && cmds[0] && cmds[0].status === 'done' && cmds[0].result) {
          try {
            var parsed = JSON.parse(cmds[0].result)
            if (Array.isArray(parsed) && parsed.length === 6) { stamps = parsed; break }
          } catch(e) {}
        }
      }
      if (stamps) {
        await supaPatch('hopscotch_garden', 'id=eq.' + garden.id, { stamps: stamps })
        var g2 = {...garden, stamps: stamps}
        setGarden(g2)
      }
    } catch(e) { console.error('regen', e) }
    setGenerating(false)
  }

  var W = Math.min(window.innerWidth - 40, 340)
  var gridH = W * 0.72

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: HOPSCOTCH_BG, zIndex: 300,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center',
      animation: 'gardenFadeIn 0.3s ease',
    }}>
      {/* back button */}
      <canvas ref={backRef} onClick={onExit} style={{
        position: 'fixed', top: 14, left: 12, cursor: 'pointer', zIndex: 301
      }} />

      {loading ? (
        <div style={{ color: '#9A8A7A', fontSize: 13, fontFamily: FONT }}>Loading...</div>
      ) : planting ? (
        /* planting screen */
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 14, color: '#7A6A5A', fontFamily: FONT, marginBottom: 16, letterSpacing: 1 }}>
            Plant something
          </div>
          <input
            value={inputName}
            onChange={function (e) { setInputName(e.target.value) }}
            placeholder="sunflower, basil, rose..."
            style={{
              width: W - 40, padding: '10px 14px', fontSize: 14,
              border: '1.5px solid #D0C8C0', background: '#FDFCFA',
              color: '#5A5048', outline: 'none', fontFamily: FONT,
              textAlign: 'center', marginBottom: 16,
            }}
          />
          <div>
            <canvas ref={function (el) {
              if (!el || el._drawn) return
              var bw = 120, bh = 36, dpr = Math.min(window.devicePixelRatio || 1, 3)
              el.width = bw * dpr; el.height = bh * dpr
              el.style.width = bw + 'px'; el.style.height = bh + 'px'
              var ctx = el.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
              var rc = rough.canvas(el)
              rc.rectangle(2, 2, bw - 4, bh - 4, {
                stroke: '#6AAF5C', strokeWidth: 1.5, roughness: 0.5,
                fill: '#6AAF5C', fillStyle: 'solid',
                disableMultiStroke: true, seed: 800
              })
              ctx.fillStyle = '#fff'
              ctx.font = "13px " + FONT
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText('Plant', bw / 2, bh / 2 + 1)
              el._drawn = true
            }} onClick={handlePlant} style={{ cursor: 'pointer', opacity: generating ? 0.5 : 1 }} />
          </div>
        </div>
      ) : (
        /* garden view */
        <div style={{ textAlign: 'center' }}>
          {/* plant name */}
          <div style={{
            fontSize: 16, color: '#6A5A4A', fontFamily: FONT,
            letterSpacing: 2, marginBottom: 8
          }}>
            {garden.plant_name}
            {generating && <span style={{ fontSize: 11, color: '#9A8A7A', marginLeft: 8 }}>drawing...</span>}
          </div>

          {/* progress label */}
          <div style={{
            fontSize: 11, color: '#9A8A7A', fontFamily: FONT, marginBottom: 6
          }}>
            {score.stage >= 5
              ? 'Ready to harvest!'
              : score.total + ' / ' + THRESHOLDS[score.stage + 1] + ' \u2192 ' + STAGES[score.stage + 1]
            }
          </div>

          {/* progress bar */}
          <canvas ref={progRef} style={{ marginBottom: 16 }} />

          {/* 3x2 stamp grid */}
          <canvas ref={gridRef} style={{ marginBottom: 16 }} />

          {/* nutrient indicators */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 20,
            fontSize: 11, color: '#9A8A7A', fontFamily: FONT, marginBottom: 16
          }}>
            <span>{'\u2600\uFE0F'} {score.days}d</span>
            <span>{'\uD83D\uDE97'} {score.trips}</span>
            <span>{'\uD83D\uDCCD'} {score.places}</span>
          </div>

          {/* regenerate stamps */}
          <div onClick={handleRegen} style={{
            fontSize: 11, color: generating ? '#B8A898' : '#9A8A7A', fontFamily: FONT,
            cursor: generating ? 'default' : 'pointer', marginBottom: 12,
            textDecoration: 'underline', textUnderlineOffset: 3,
            opacity: generating ? 0.5 : 0.7,
          }}>
            {generating ? 'drawing...' : 'Redraw stamps'}
          </div>

          {/* harvest button */}
          {score.stage >= 5 && (
            <canvas ref={harvestRef} onClick={handleHarvest} style={{ cursor: 'pointer' }} />
          )}
        </div>
      )}

      <style>{`
        @keyframes gardenFadeIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}