import { useState, useRef, useEffect, useCallback } from 'react'
import rough from 'roughjs'
import { HOPSCOTCH_BG } from '../lib/tokens'
import { supaGet, supaPost, supaPatch, supaDelete, isConnected } from '../lib/supabase'

var STAGES = ['Seed', 'Sprout', 'Leaf', 'Bud', 'Bloom', 'Glory']
var THRESHOLDS = [0, 5, 12, 22, 33, 45]
var PAPER = '#F8F8F6'
var BORDER = '#D8D0C8'
var UNLOCKED_BG = '#FDFCFA'
var LOCKED_STROKE = '#C8C0B8'
var LOCKED_DASH = [4, 4]
var FONT = "-apple-system, 'PingFang SC', sans-serif"
var PLANT_POOL = [
  'Sunflower','Rose','Cactus','Lavender','Cherry Blossom','Bamboo','Tulip',
  'Fern','Pine','Lotus','Succulent','Morning Glory','Ginkgo','Maple',
  'Jasmine','Orchid','Aloe','Clover','Dandelion','Lily of the Valley',
  'Wisteria','Peony','Daisy','Iris','Poppy','Hydrangea','Magnolia',
  'Marigold','Basil','Mint','Rosemary','Thyme','Sage','Olive',
  'Bonsai','Willow','Birch','Palm','Coconut','Moss','Ivy',
  'Venus Flytrap','Mushroom','Wheat','Cotton','Tea','Carnation',
  'Chrysanthemum','Camellia','Plum Blossom'
]

function pickRandomPlant(shelf) {
  var used = (shelf || []).map(function(s) { return s.plant_name })
  var available = PLANT_POOL.filter(function(p) { return used.indexOf(p) === -1 })
  if (available.length === 0) available = PLANT_POOL
  return available[Math.floor(Math.random() * available.length)]
}


function calcScore(garden) {
  if (!garden) return { days: 0, trips: 0, places: 0, total: 0, stage: 0 }
  var days = Math.max(0, Math.floor((Date.now() - new Date(garden.planted_at).getTime()) / 86400000))
  var trips = garden._trips_new || 0
  var places = garden._places_new || 0
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
        /* locked: dashed frame with ? */
        ctx.setLineDash(LOCKED_DASH)
        ctx.strokeStyle = LOCKED_STROKE
        ctx.lineWidth = 1
        ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1)
        ctx.setLineDash([])
        /* mystery ? */
        ctx.fillStyle = '#D0C8C0'
        ctx.font = Math.round(Math.min(cellW, cellH) * 0.25) + "px " + FONT
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('?', x + cellW / 2, y + cellH / 2 - 4)
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

/* draw progress line with 6 nodes */
function drawProgress(cvs, score, w) {
  var H = 32, dpr = Math.min(window.devicePixelRatio || 1, 3)
  cvs.width = w * dpr; cvs.height = H * dpr
  cvs.style.width = w + 'px'; cvs.style.height = H + 'px'
  var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  var rc = rough.canvas(cvs)

  var pad = 16, lineY = 10
  var usable = w - pad * 2

  /* background line */
  rc.line(pad, lineY, w - pad, lineY, {
    stroke: '#D8D0C8', strokeWidth: 1.2, roughness: 0.6,
    disableMultiStroke: true, seed: 700
  })

  /* filled line up to current stage */
  if (score.stage > 0) {
    var fillX = pad + (score.stage / 5) * usable
    rc.line(pad, lineY, fillX, lineY, {
      stroke: '#8BAF7A', strokeWidth: 1.5, roughness: 0.5,
      disableMultiStroke: true, seed: 701
    })
  }

  /* 6 nodes */
  for (var i = 0; i < 6; i++) {
    var nx = pad + (i / 5) * usable
    var unlocked = score.stage >= i
    var current = score.stage === i

    if (current) {
      rc.circle(nx, lineY, 10, {
        stroke: '#8BAF7A', strokeWidth: 1.5, roughness: 0.5,
        fill: '#8BAF7A', fillStyle: 'solid',
        disableMultiStroke: true, seed: 710 + i
      })
    } else if (unlocked) {
      rc.circle(nx, lineY, 8, {
        stroke: '#8BAF7A', strokeWidth: 1.2, roughness: 0.5,
        fill: '#A8C49A', fillStyle: 'solid',
        disableMultiStroke: true, seed: 710 + i
      })
    } else {
      rc.circle(nx, lineY, 7, {
        stroke: '#D0C8C0', strokeWidth: 1, roughness: 0.5,
        disableMultiStroke: true, seed: 710 + i
      })
    }

    /* stage label below */
    ctx.fillStyle = unlocked ? '#8A7A6A' : '#B8A898'
    ctx.font = "9px -apple-system, 'PingFang SC', sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(STAGES[i], nx, lineY + 9)
  }
}


/* Rough.js nutrient icons */
function NutrientIcon({ type, value }) {
  var ref = useRef(null)
  useEffect(function () {
    var cvs = ref.current; if (!cvs) return
    var S = 16, dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = S * dpr; cvs.height = S * dpr
    cvs.style.width = S + 'px'; cvs.style.height = S + 'px'
    var ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    var ro = { roughness: 0.5, disableMultiStroke: true }
    if (type === 'sun') {
      rc.circle(8, 8, 8, { stroke: '#ECC44E', strokeWidth: 1, fill: '#ECC44E', fillStyle: 'solid', ...ro, seed: 901 })
      for (var i = 0; i < 6; i++) {
        var a = (i / 6) * Math.PI * 2
        rc.line(8 + Math.cos(a) * 5.5, 8 + Math.sin(a) * 5.5, 8 + Math.cos(a) * 7.5, 8 + Math.sin(a) * 7.5,
          { stroke: '#ECC44E', strokeWidth: 0.8, ...ro, seed: 910 + i })
      }
    } else if (type === 'trip') {
      /* simple car/path */
      rc.line(3, 12, 13, 12, { stroke: '#7BA7BC', strokeWidth: 1.2, ...ro, seed: 920 })
      rc.rectangle(4, 7, 8, 4, { stroke: '#7BA7BC', strokeWidth: 1, fill: '#7BA7BC', fillStyle: 'solid', ...ro, seed: 921 })
      rc.circle(6, 13, 2.5, { stroke: '#8A9AAA', strokeWidth: 0.8, fill: '#8A9AAA', fillStyle: 'solid', ...ro, seed: 922 })
      rc.circle(10, 13, 2.5, { stroke: '#8A9AAA', strokeWidth: 0.8, fill: '#8A9AAA', fillStyle: 'solid', ...ro, seed: 923 })
    } else {
      /* map pin */
      rc.circle(8, 6, 6, { stroke: '#D0A0A0', strokeWidth: 1.2, fill: '#D0A0A0', fillStyle: 'solid', ...ro, seed: 930 })
      rc.line(8, 9, 8, 14, { stroke: '#D0A0A0', strokeWidth: 1, ...ro, seed: 931 })
      rc.circle(8, 5.5, 2, { stroke: '#fff', strokeWidth: 0.6, fill: '#fff', fillStyle: 'solid', ...ro, seed: 932 })
    }
  }, [type])
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    <canvas ref={ref} style={{ verticalAlign: 'middle' }} />
    <span>{value}</span>
  </span>
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
    supaGet('hopscotch_shelf', 'order=harvested_at.desc').then(function(s) { setShelf(s || []) })
    supaGet('hopscotch_garden', 'order=id.desc&limit=1').then(function (gardenRows) {
      var g = gardenRows && gardenRows[0] ? gardenRows[0] : null
      if (!g) { setGarden(null); setPlanting(true); setLoading(false); return }
      var planted = g.planted_at
      return Promise.all([
        supaGet('service_requests', 'select=id&status=eq.done&created_at=gte.' + planted),
        supaGet('locations', 'select=id&created_at=gte.' + planted),
      ]).then(function (res) {
        g._trips_new = res[0] ? res[0].length : 0
        g._places_new = res[1] ? res[1].length : 0
      setGarden(g)
      setScore(calcScore(g))
      setLoading(false)
      })
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
  var [shelfOpen, setShelfOpen] = useState(false)
  var [shelf, setShelf] = useState([])

  /* plant a new seed + generate stamps via VPS (nohup, writes directly to DB) */
  async function handlePlant() {
    if (!isConnected()) return
    var name = pickRandomPlant(shelf)
    setGenerating(true)

    /* create garden row */
    var rows = await supaPost('hopscotch_garden', { plant_name: name })
    if (!rows || !rows[0]) { setGenerating(false); return }
    var g = rows[0]
    g._trips = 0; g._places = 0
    setGarden(g)
    setScore(calcScore(g))
    setPlanting(false)

    /* fire stamp generation (nohup, writes to DB directly) */
    try {
      var safeName = name.replace(/[^a-zA-Z0-9\u4e00-\u9fff\s-]/g, '').substring(0, 40)
      await supaPost('commands', { cmd: 'nohup python3 ~/lucid/gen_stamps.py "' + safeName + '" ' + g.id + ' > /dev/null 2>&1 &', status: 'pending' })

      /* poll garden row for stamps (up to 45s) */
      for (var attempt = 0; attempt < 15; attempt++) {
        await new Promise(function(r) { setTimeout(r, 3000) })
        var fresh = await supaGet('hopscotch_garden', 'id=eq.' + g.id)
        if (fresh && fresh[0] && fresh[0].stamps && Array.isArray(fresh[0].stamps) && fresh[0].stamps.length === 6) {
          g.stamps = fresh[0].stamps
          setGarden({...g})
          break
        }
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
    supaGet('hopscotch_shelf', 'order=harvested_at.desc').then(function(s) { setShelf(s || []) })
  }

  /* regenerate stamps */
  async function handleRegen() {
    if (!garden || !isConnected() || generating) return
    setGenerating(true)
    try {
      var safeName = (garden.plant_name || '').replace(/[^a-zA-Z0-9\u4e00-\u9fff\s-]/g, '').substring(0, 40)
      await supaPost('commands', { cmd: 'nohup python3 ~/lucid/gen_stamps.py "' + safeName + '" ' + garden.id + ' > /dev/null 2>&1 &', status: 'pending' })
      for (var attempt = 0; attempt < 15; attempt++) {
        await new Promise(function(r) { setTimeout(r, 3000) })
        var fresh = await supaGet('hopscotch_garden', 'id=eq.' + garden.id)
        if (fresh && fresh[0] && fresh[0].stamps && JSON.stringify(fresh[0].stamps) !== JSON.stringify(garden.stamps)) {
          setGarden({...garden, stamps: fresh[0].stamps})
          break
        }
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
            Ready to grow?
          </div>
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
          {/* plant name — hidden until Glory */}
          <div style={{ position: 'relative', marginBottom: 8, display: 'inline-block' }}>
            {score.stage >= 5 ? (
              <div style={{
                fontSize: 16, color: '#6A5A4A', fontFamily: FONT,
                letterSpacing: 2,
              }}>
                {garden.plant_name}
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <canvas ref={function(el) {
                  if (!el || el._d) return
                  var bw = 140, bh = 28, dpr = Math.min(window.devicePixelRatio||1,3)
                  el.width=bw*dpr; el.height=bh*dpr
                  el.style.width=bw+'px'; el.style.height=bh+'px'
                  var ctx=el.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0)
                  var rc=rough.canvas(el)
                  rc.rectangle(2,2,bw-4,bh-4, {
                    stroke:'#D8D0C8', strokeWidth:1, roughness:0.6,
                    fill:'#F4F0EA', fillStyle:'solid',
                    disableMultiStroke:true, seed:888
                  })
                  ctx.fillStyle='#B8A898'
                  ctx.font="13px "+FONT
                  ctx.textAlign='center'
                  ctx.textBaseline='middle'
                  ctx.fillText('? ? ?', bw/2, bh/2+1)
                  el._d=true
                }} />
              </div>
            )}
            {generating && <div style={{ fontSize: 10, color: '#B8A898', fontFamily: FONT, marginTop: 4 }}>drawing...</div>}
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
            display: 'flex', justifyContent: 'center', gap: 24,
            fontSize: 11, color: '#9A8A7A', fontFamily: FONT, marginBottom: 16
          }}>
            <NutrientIcon type="sun" value={score.days + 'd'} />
            <NutrientIcon type="trip" value={score.trips} />
            <NutrientIcon type="pin" value={score.places} />
          </div>

          {/* shelf button */}
          {shelf.length > 0 && (
            <div onClick={function() { setShelfOpen(true) }} style={{
              fontSize: 11, color: '#9A8A7A', fontFamily: FONT,
              cursor: 'pointer', marginBottom: 12,
              textDecoration: 'underline', textUnderlineOffset: 3,
              opacity: 0.7,
            }}>
              Shelf ({shelf.length})
            </div>
          )}

          {/* harvest button */}
          {score.stage >= 5 && (
            <canvas ref={harvestRef} onClick={handleHarvest} style={{ cursor: 'pointer' }} />
          )}
        </div>
      )}


      {shelfOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: HOPSCOTCH_BG, zIndex: 310,
          overflow: 'auto', padding: '60px 20px 40px',
        }}>
          <canvas ref={function(el) {
            if (!el || el._d) return
            var S=36, dpr=Math.min(window.devicePixelRatio||1,3)
            el.width=S*dpr; el.height=S*dpr
            el.style.width=S+'px'; el.style.height=S+'px'
            var ctx=el.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0)
            var rc=rough.canvas(el)
            rc.rectangle(2,2,S-4,S-4,{stroke:'#D0C8C0',strokeWidth:1,roughness:0.5,fill:'rgba(255,255,255,0.85)',fillStyle:'solid',disableMultiStroke:true,seed:77})
            rc.line(22,12,12,18,{stroke:'#8A7A68',strokeWidth:1.3,roughness:0.4,disableMultiStroke:true,seed:78})
            rc.line(12,18,22,24,{stroke:'#8A7A68',strokeWidth:1.3,roughness:0.4,disableMultiStroke:true,seed:79})
            el._d=true
          }} onClick={function(){setShelfOpen(false)}} style={{
            position:'fixed',top:14,left:12,cursor:'pointer',zIndex:311
          }} />

          <div style={{fontSize:14,color:'#7A6A5A',fontFamily:FONT,letterSpacing:2,textAlign:'center',marginBottom:24}}>
            Shelf
          </div>

          {shelf.length === 0 ? (
            <div style={{fontSize:12,color:'#B8A898',fontFamily:FONT,textAlign:'center'}}>No plants yet.</div>
          ) : (
            <div style={{display:'flex',flexWrap:'wrap',gap:16,justifyContent:'center'}}>
              {shelf.map(function(p,i) {
                return <div key={p.id||i} style={{textAlign:'center',width:90}}>
                  <canvas ref={function(el) {
                    if (!el || el._d) return
                    var cw=80,ch=80,dpr=Math.min(window.devicePixelRatio||1,3)
                    el.width=cw*dpr; el.height=ch*dpr
                    el.style.width=cw+'px'; el.style.height=ch+'px'
                    var ctx=el.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0)
                    var rc=rough.canvas(el)
                    rc.rectangle(4,4,cw-8,ch-8,{
                      stroke:'#D8D0C8',strokeWidth:1,roughness:0.5,
                      fill:'#FDFCFA',fillStyle:'solid',
                      disableMultiStroke:true,seed:900+i
                    })
                    /* draw Glory stage stamp */
                    if (p.stamps && p.stamps[5]) {
                      var shapes = p.stamps[5]
                      for (var j=0;j<shapes.length;j++) {
                        var sh=shapes[j]
                        var opts={roughness:0.6,disableMultiStroke:true,seed:950+i*10+j}
                        if(sh.fill){opts.fill=sh.fill;opts.fillStyle='solid'}
                        if(sh.stroke)opts.stroke=sh.stroke
                        opts.strokeWidth=sh.sw||1
                        var ss=1.8, cx2=cw/2, cy2=ch/2-4
                        if(sh.t==='circle')rc.circle(cx2+sh.x*ss,cy2+sh.y*ss,(sh.r||3)*2*ss,opts)
                        else if(sh.t==='ellipse')rc.ellipse(cx2+sh.x*ss,cy2+sh.y*ss,(sh.w||6)*ss,(sh.h||3)*ss,opts)
                        else if(sh.t==='line')rc.line(cx2+sh.x1*ss,cy2+sh.y1*ss,cx2+sh.x2*ss,cy2+sh.y2*ss,opts)
                        else if(sh.t==='rect')rc.rectangle(cx2+sh.x*ss,cy2+sh.y*ss,(sh.w||4)*ss,(sh.h||4)*ss,opts)
                      }
                    }
                    el._d=true
                  }} />
                  <div style={{fontSize:10,color:'#8A7A6A',fontFamily:FONT,marginTop:4}}>{p.plant_name}</div>
                </div>
              })}
            </div>
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