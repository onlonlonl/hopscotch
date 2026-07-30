import { useState } from 'react'
import { supaGet, supaPost, isConnected } from '../lib/supabase'

var FONT = "-apple-system, 'PingFang SC', sans-serif"

/**
 * 高德 POI 搜索，三处复用：新增地点 / 卡片面板编辑 / LocationCard 编辑。
 * onPick(poi) 由调用方决定拿到 POI 后写什么字段。
 * poi 是高德原始结构：{ name, location: "lng,lat", address, cityname, type }
 */
export default function PoiPicker({ cityName, onPick, placeholder, tone, successLabel }) {
  var [input, setInput] = useState('')
  var [results, setResults] = useState([])
  var [searching, setSearching] = useState(false)
  var [msg, setMsg] = useState(null)

  // tone: 'blue'（卡片面板）/ 'warm'（LocationCard），跟各自的底色走
  var warm = tone === 'warm'
  var border = warm ? '1.5px solid rgba(160,152,136,0.35)' : '1.5px solid rgba(46,148,185,0.25)'
  var bg = warm ? 'rgba(250,246,240,0.7)' : 'rgba(240,244,248,0.6)'
  var fg = warm ? '#5A5048' : '#5A6A7A'

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms) }) }

  // result 可能是 jsonb 里存的 JSON 字符串，也可能已经是对象，两种都吃
  function parsePois(raw) {
    if (!raw) return null
    var d = raw
    if (typeof d === 'string') {
      try { d = JSON.parse(d) } catch (e) { return null }
    }
    if (d && typeof d === 'string') {
      try { d = JSON.parse(d) } catch (e) { return null }
    }
    return d && d.pois ? d.pois : null
  }

  async function search() {
    var kw = input.trim()
    if (!kw || searching) return
    if (!isConnected()) { setMsg({ ok: false, text: 'not connected' }); return }
    setSearching(true); setMsg(null); setResults([])
    try {
      var created = await supaPost('service_requests', {
        service: 'amap', action: 'poi',
        params: { keywords: kw, city: cityName || '' },
      })
      // 必须盯住自己创建的那一条。取「最新一条」会在并发时读到别人的结果，
      // 也会在后端还没跑完时读到 null——这就是「有时搜不到、有时选中对不上」的原因。
      var reqId = created && created[0] && created[0].id
      if (!reqId) { setMsg({ ok: false, text: 'request failed' }); setSearching(false); return }

      var pois = null
      var failed = null
      for (var i = 0; i < 24; i++) {
        await sleep(250)
        var rows = await supaGet('service_requests', 'id=eq.' + reqId + '&select=status,result,error_message')
        var row = rows && rows[0]
        if (!row) continue
        if (row.status === 'error' || row.error_message) { failed = row.error_message || 'service error'; break }
        if (row.status === 'done') { pois = parsePois(row.result) || []; break }
      }

      if (failed) { setMsg({ ok: false, text: failed }) }
      else if (pois === null) { setMsg({ ok: false, text: 'timed out' }) }
      else if (!pois.length) { setMsg({ ok: false, text: 'nothing found' }) }
      else { setResults(pois.slice(0, 8)) }
    } catch (e) {
      setMsg({ ok: false, text: 'search failed' })
    }
    setSearching(false)
  }

  async function pick(poi) {
    setMsg({ ok: true, text: 'saving' })
    try {
      // onPick 若返回 Promise 就等它，失败不会被谎报成成功
      await onPick(poi)
      setResults([]); setInput('')
      setMsg({ ok: true, text: (successLabel || 'Updated') + ' \u00b7 ' + poi.name })
    } catch (e) {
      setMsg({ ok: false, text: 'save failed' })
    }
  }

  return <div data-noswipe="1">
    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
      <input value={input}
        onChange={function (e) { setInput(e.target.value); setMsg(null) }}
        placeholder={placeholder || 'search a place'}
        style={{
          flex: 1, minWidth: 0, padding: '6px 8px', fontSize: 12,
          border: border, background: bg, color: fg,
          outline: 'none', fontFamily: FONT, boxSizing: 'border-box',
        }} />
      <div onClick={search}
        style={{
          padding: '6px 10px', fontSize: 11, border: border,
          background: bg, color: fg, cursor: 'pointer',
          fontFamily: FONT, whiteSpace: 'nowrap',
        }}>{searching ? '...' : 'GO'}</div>
    </div>

    {msg && <div style={{
      fontSize: 10, marginBottom: 4, fontFamily: FONT,
      color: msg.ok ? '#5C9E6E' : '#C99A8A',
    }}>{msg.text}</div>}

    {results.length > 0 && <div
      onTouchMove={function (e) { e.stopPropagation() }}
      style={{
        maxHeight: 168,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        // 滚到底不把滚动传给外层列表，否则整个面板会跟着动
        overscrollBehavior: 'contain',
        border: '1px solid rgba(180,180,180,0.14)',
      }}>
      {results.map(function (poi, i) {
        return <div key={i}
          onClick={function () { pick(poi) }}
          style={{
            padding: '7px 8px', fontSize: 11, color: fg, cursor: 'pointer',
            fontFamily: FONT,
            borderBottom: i === results.length - 1 ? 'none' : '1px solid rgba(180,180,180,0.18)',
          }}>
          <div>{poi.name}</div>
          {poi.address && <div style={{ fontSize: 9, color: '#A8AEB4', marginTop: 1 }}>{poi.address}</div>}
        </div>
      })}
    </div>}
  </div>
}

/** 把高德 POI 转成「只更新坐标和地址」的 patch */
export function poiToGeoPatch(poi) {
  var parts = poi.location ? poi.location.split(',') : null
  if (!parts || parts.length < 2) return null
  return {
    lng: parseFloat(parts[0]),
    lat: parseFloat(parts[1]),
    address: poi.address || '',
  }
}
