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
        var scx = x + cellW / 2, scy = y + cellH / 2 - 6
        var stampR = Math.min(cellW, cellH) * 0.28
        var stampColor = idx === score.stage ? '#6AAF5C' : '#C4A6D0'
        rc.circle(scx, scy, stampR * 2, {
          stroke: stampColor, strokeWidth: 1.8, roughness: 0.8,
          disableMultiStroke: true, seed: 650 + idx
        })
        ctx.fillStyle = stampColor
        ctx.font = Math.round(stampR * 0.8) + "px " + FONT
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        var icons = ['\u{1F331}', '\u{1F33F}', '\u{1FAB4}', '\u{1F333}', '\u{1F33C}', '\u{1F33B}']
        ctx.fillText(icons[idx] || '\u2713', scx, scy + 1)
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

  /* plant a new seed */
  async function handlePlant() {
    var name = inputName.trim()
    if (!name || !isConnected()) return
    var rows = await supaPost('hopscotch_garden', { plant_name: name })
    if (rows && rows[0]) {
      rows[0]._trips = 0
      rows[0]._places = 0
      setGarden(rows[0])
      setScore(calcScore(rows[0]))
      setPlanting(false)
    }
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
            }} onClick={handlePlant} style={{ cursor: 'pointer' }} />
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