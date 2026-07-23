import { useRef, useEffect, useState } from 'react'
import rough from 'roughjs'

var RO = {roughness:0.8,bowing:0.5,disableMultiStroke:true,seed:2}
function ro(x){var o={roughness:RO.roughness,bowing:RO.bowing,disableMultiStroke:RO.disableMultiStroke,seed:RO.seed};if(x){var ks=Object.keys(x);for(var i=0;i<ks.length;i++)o[ks[i]]=x[ks[i]]};return o}

var CW=260, CH=280, M=6

function translateT(t){if(t<0.15)return'at the origin';if(t<0.3)return'near the start';if(t<0.5)return'first crossing';if(t<0.7)return'far side';if(t<0.85)return'second crossing';return'almost home'}
function translateW(w){if(w<0.2)return'distant';if(w<0.4)return'cool';if(w<0.6)return'mild';if(w<0.8)return'warm';return'glowing'}

function drawBorder(rc, wt, c) {
  if(wt==='drizzle'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    function drop(x,y,s){rc.circle(x,y+s*0.4,s,ro({stroke:c,strokeWidth:0.6,fill:c,fillStyle:'solid'}));rc.linearPath([[x,y-s*0.6],[x-s*0.35,y+s*0.1],[x+s*0.35,y+s*0.1]],ro({stroke:c,strokeWidth:0.5}))}
    drop(CW-M-14,M+12,3.5);drop(CW-M-26,M+9,3);drop(CW-M-8,M+22,2.5);
  } else if(wt==='rain'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    function rdrop(x,y,s){rc.circle(x,y+s*0.4,s,ro({stroke:c,strokeWidth:0.5,fill:c,fillStyle:'solid'}));rc.linearPath([[x,y-s*0.6],[x-s*0.3,y+s*0.1],[x+s*0.3,y+s*0.1]],ro({stroke:c,strokeWidth:0.4}))}
    rdrop(CW-M-12,M+10,3);rdrop(CW-M-22,M+16,2.5);rdrop(CW-M-8,M+24,3.5);rdrop(M+18,CH-M-18,2.5);rdrop(M+10,CH-M-10,3);rdrop(M+28,CH-M-12,2);
  } else if(wt==='storm'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.5}));
    rc.linearPath([[CW-M-16,M+8],[CW-M-22,M+20],[CW-M-15,M+20],[CW-M-20,M+34]],ro({stroke:"#D0A830",strokeWidth:1.4}));
  } else if(wt==='plum'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    var pp=[[12,M+6],[32,M+4],[58,M+7],[88,M+5],[118,M+6],[135,M+4],[CW-M-5,18],[CW-M-7,42],[CW-M-4,65],[CW-M-6,82],[15,CH-M-5],[40,CH-M-7],[70,CH-M-4],[95,CH-M-6],[125,CH-M-5],[M+5,22],[M+7,48],[M+4,72]];
    for(var i=0;i<pp.length;i++)rc.circle(pp[i][0],pp[i][1],1+Math.random()*0.8,ro({stroke:c,strokeWidth:0.4,fill:c,fillStyle:'solid'}));
  } else if(wt==='cloudy'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    rc.linearPath([[CW-M-38,M+18],[CW-M-35,M+13],[CW-M-28,M+9],[CW-M-22,M+11],[CW-M-18,M+8],[CW-M-12,M+12],[CW-M-9,M+18]],ro({stroke:c,strokeWidth:0.8}));
    rc.line(CW-M-38,M+18,CW-M-9,M+18,ro({stroke:c,strokeWidth:0.7}));
    rc.linearPath([[M+10,CH-M-14],[M+13,CH-M-18],[M+18,CH-M-20],[M+24,CH-M-18],[M+28,CH-M-14]],ro({stroke:c,strokeWidth:0.7}));
    rc.line(M+10,CH-M-14,M+28,CH-M-14,ro({stroke:c,strokeWidth:0.6}));
  } else if(wt==='overcast'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.8}));
  } else if(wt==='fog'){
    rc.line(M,M,M+40,M,ro({stroke:c,strokeWidth:1.1,roughness:1.5}));rc.line(M+55,M,M+120,M,ro({stroke:c,strokeWidth:0.8,roughness:1.5}));rc.line(M+135,M,CW-M,M,ro({stroke:c,strokeWidth:1,roughness:1.5}));
    rc.line(CW-M,M,CW-M,M+50,ro({stroke:c,strokeWidth:1,roughness:1.5}));rc.line(CW-M,M+65,CW-M,M+130,ro({stroke:c,strokeWidth:0.8,roughness:1.5}));rc.line(CW-M,M+145,CW-M,CH-M,ro({stroke:c,strokeWidth:1.1,roughness:1.5}));
    rc.line(CW-M,CH-M,M+130,CH-M,ro({stroke:c,strokeWidth:0.9,roughness:1.5}));rc.line(M+110,CH-M,M+50,CH-M,ro({stroke:c,strokeWidth:1.1,roughness:1.5}));rc.line(M+35,CH-M,M,CH-M,ro({stroke:c,strokeWidth:0.8,roughness:1.5}));
    rc.line(M,CH-M,M,M+130,ro({stroke:c,strokeWidth:1,roughness:1.5}));rc.line(M,M+110,M,M+50,ro({stroke:c,strokeWidth:0.8,roughness:1.5}));rc.line(M,M+35,M,M,ro({stroke:c,strokeWidth:1.1,roughness:1.5}));
  } else if(wt==='wind'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    function spiral(cx,cy,r,turns,pts,sw){var pp=[];for(var i=0;i<=pts;i++){var t=i/pts*Math.PI*2*turns;var rr=r*(1-i/pts*0.6);pp.push([cx+Math.cos(t)*rr,cy+Math.sin(t)*rr])};rc.linearPath(pp,ro({stroke:c,strokeWidth:sw}))}
    spiral(CW-M-14,M+16,7,1.5,20,0.9);spiral(CW-M-28,M+38,5,1.3,16,0.8);spiral(CW-M-12,CH-M-22,6,1.4,18,0.7);
  } else if(wt==='breeze'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    function bspiral(cx,cy,r,turns,pts,sw){var pp=[];for(var i=0;i<=pts;i++){var t=i/pts*Math.PI*2*turns;var rr=r*(1-i/pts*0.5);pp.push([cx+Math.cos(t)*rr,cy+Math.sin(t)*rr])};rc.linearPath(pp,ro({stroke:c,strokeWidth:sw}))}
    bspiral(CW-M-16,M+30,6,1.2,16,0.8);
  } else if(wt==='humid'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    function hdrop(x,y,s){rc.circle(x,y+s*0.4,s,ro({stroke:c,strokeWidth:0.6,fill:c,fillStyle:'solid'}));rc.linearPath([[x,y-s*0.6],[x-s*0.35,y+s*0.1],[x+s*0.35,y+s*0.1]],ro({stroke:c,strokeWidth:0.5}))}
    hdrop(M+20,CH-M-16,3);hdrop(M+45,CH-M-12,3.5);hdrop(M+70,CH-M-18,2.5);
  } else if(wt==='snow'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    var sx=[35,95,CW-M-6,CW-M-8,M+6,M+8],sy=[M+6,M+8,50,120,55,118];
    for(var i=0;i<sx.length;i++){for(var j=0;j<3;j++){var a=j*Math.PI/3;rc.line(sx[i]+Math.cos(a)*(-3.5),sy[i]+Math.sin(a)*(-3.5),sx[i]+Math.cos(a)*3.5,sy[i]+Math.sin(a)*3.5,ro({stroke:c,strokeWidth:0.4}))}}
  } else if(wt==='frost'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    var corners=[[M,M],[CW-M,M],[M,CH-M],[CW-M,CH-M]],dirs=[[1,1],[-1,1],[1,-1],[-1,-1]];
    for(var i=0;i<4;i++){var cx=corners[i][0],cy=corners[i][1],dx=dirs[i][0],dy=dirs[i][1];rc.line(cx,cy,cx+dx*10,cy+dy*10,ro({stroke:c,strokeWidth:0.6}));rc.line(cx+dx*5,cy+dy*5,cx+dx*5+dy*4,cy+dy*5-dx*4,ro({stroke:c,strokeWidth:0.4}));rc.line(cx+dx*5,cy+dy*5,cx+dx*5-dy*4,cy+dy*5+dx*4,ro({stroke:c,strokeWidth:0.4}))}
  } else if(wt==='hail'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.3}));
    rc.circle(CW-M-15,M+12,7,ro({stroke:c,strokeWidth:0.7,fill:c,fillStyle:'solid'}));rc.circle(CW-M-30,M+8,5,ro({stroke:c,strokeWidth:0.6,fill:c,fillStyle:'solid'}));rc.circle(CW-M-10,M+25,4,ro({stroke:c,strokeWidth:0.6,fill:c,fillStyle:'solid'}));rc.circle(CW-M-24,M+20,6,ro({stroke:c,strokeWidth:0.7,fill:c,fillStyle:'solid'}));
  } else if(wt==='moon'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    var pts=[],ii;var mcx=CW-M-12,mcy=M+14;
    for(ii=0;ii<=12;ii++){var a=-Math.PI/2+ii*Math.PI/12;pts.push([mcx+Math.cos(a)*8,mcy+Math.sin(a)*8])}
    for(ii=12;ii>=0;ii--){var a=-Math.PI/2+ii*Math.PI/12;pts.push([mcx+Math.cos(a)*2.5,mcy+Math.sin(a)*7])}
    rc.linearPath(pts,ro({stroke:c,strokeWidth:0.8}));
  } else if(wt==='glow'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));rc.rectangle(M+4,M+4,CW-M*2-8,CH-M*2-8,ro({stroke:c,strokeWidth:0.5}));
  } else if(wt==='starry'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    var sp=[[25,M+5],[70,M+4],[120,M+6],[M+5,50],[M+6,120],[CW-M-5,55],[CW-M-6,125],[45,CH-M-5],[100,CH-M-6]];
    for(var i=0;i<sp.length;i++){var s=i<3||i>6?3:2.5;rc.line(sp[i][0]-s,sp[i][1],sp[i][0]+s,sp[i][1],ro({stroke:c,strokeWidth:0.7}));rc.line(sp[i][0],sp[i][1]-s,sp[i][0],sp[i][1]+s,ro({stroke:c,strokeWidth:0.7}));rc.line(sp[i][0]-1.5,sp[i][1]-1.5,sp[i][0]+1.5,sp[i][1]+1.5,ro({stroke:c,strokeWidth:0.4}));rc.line(sp[i][0]+1.5,sp[i][1]-1.5,sp[i][0]-1.5,sp[i][1]+1.5,ro({stroke:c,strokeWidth:0.4}))}
  } else if(wt==='rainbow'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    var cs=["#C85050","#D88840","#D0B830","#50A850","#4878C0"];
    for(var i=0;i<cs.length;i++)rc.arc(CW-M,CH-M,24-i*4,24-i*4,Math.PI,Math.PI*1.5,false,ro({stroke:cs[i],strokeWidth:1}));
  } else if(wt==='dust'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    var dp=[[15,M+4],[50,M+7],[90,M+5],[130,M+3],[CW-M-5,40],[CW-M-7,90],[CW-M-4,140],[30,CH-M-5],[75,CH-M-6],[120,CH-M-4],[M+5,45],[M+7,100]];
    for(var i=0;i<dp.length;i++){var dsz=1.5+i%3*0.5;rc.circle(dp[i][0],dp[i][1],dsz,ro({stroke:c,strokeWidth:0.5,fill:c,fillStyle:'solid'}))}
  } else if(wt==='petals'){
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    rc.ellipse(M+12,M+10,6,3,ro({stroke:c,strokeWidth:0.7}));rc.ellipse(CW-M-15,M+8,5,3,ro({stroke:c,strokeWidth:0.7}));rc.ellipse(M+10,CH-M-8,6,3,ro({stroke:c,strokeWidth:0.7}));rc.ellipse(CW-M-12,CH-M-10,5,3,ro({stroke:c,strokeWidth:0.7}));
  } else {
    rc.rectangle(M,M,CW-M*2,CH-M*2,ro({stroke:c,strokeWidth:1.2}));
    if(wt==='sun'||wt==='warm'){var sx=CW-M-10,sy=M+10;rc.line(sx-4,sy,sx+4,sy,ro({stroke:c,strokeWidth:0.6}));rc.line(sx,sy-4,sx,sy+4,ro({stroke:c,strokeWidth:0.6}))}
  }
}

export default function LocationCard({ location, position, onClose, weatherDraw, weatherColor, weatherType, activeDim }) {
  var borderRef = useRef(null)
  var stampRef = useRef(null)
  var badgesRef = useRef(null)
  var dividerRef = useRef(null)
  var infState = useState(false)
  var showTranslate = infState[0]
  var setShowTranslate = infState[1]

  useEffect(function() {
    var cvs = borderRef.current
    if (!cvs) return
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = CW * dpr; cvs.height = CH * dpr
    cvs.style.width = CW + 'px'; cvs.style.height = CH + 'px'
    var ctx = cvs.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#FAF6F0'; ctx.fillRect(0, 0, CW, CH)
    var rc = rough.canvas(cvs)
    var c = weatherColor || '#8A7A68'
    drawBorder(rc, weatherType || 'sun', c)
    // Close X
    rc.line(CW-M-14,M+10,CW-M-6,M+18,ro({stroke:'#C0B8A8',strokeWidth:0.7}))
    rc.line(CW-M-6,M+10,CW-M-14,M+18,ro({stroke:'#C0B8A8',strokeWidth:0.7}))

  }, [weatherColor, weatherType, location])

  useEffect(function() {
    var cvs = stampRef.current
    if (!cvs || !weatherDraw) return
    var sz = 36, dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = sz * dpr; cvs.height = sz * dpr
    cvs.style.width = sz + 'px'; cvs.style.height = sz + 'px'
    var ctx = cvs.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    var c = weatherColor || '#8A7A68'
    rc.circle(sz/2,sz/2,sz-6,ro({stroke:c,strokeWidth:0.8,roughness:1}))
    ctx.save(); ctx.scale(0.6,0.6)
    try { weatherDraw(rc,sz/2/0.6,sz/2/0.6,c) } catch(e) {}
    ctx.restore()
  }, [weatherDraw, weatherColor])

  // Dimension badges
  useEffect(function() {
    var cvs = badgesRef.current
    if (!cvs || !location) return
    var loc = location
    if (loc.inf_t == null) return
    var bw = CW - M*2 - 24, bh = 36
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = bw * dpr; cvs.height = bh * dpr
    cvs.style.width = bw + 'px'; cvs.style.height = bh + 'px'
    var ctx = cvs.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    var c = loc.color || '#8A7A68'
    var unitW = Math.floor(bw / 3) - 4
    var gap = (bw - unitW * 3) / 2

    // Badge 1: Ink
    var bx = 0, by = 0
    var inC = activeDim===0 ? c : '#D0C8C0'
    rc.rectangle(bx, by, unitW, bh, ro({stroke: inC, strokeWidth: activeDim===0 ? 0.8 : 0.6}))
    icx = bx + unitW/2
    rc.rectangle(bx+6, by+4, unitW-12, bh-14, ro({stroke: '#C0B8A8', strokeWidth: 0.4, roughness: 0.8}))
    ctx.save(); ctx.globalAlpha = 0.7; ctx.fillStyle = c
    var mapX = bx+8+(unitW-16)*Math.min(1,Math.max(0,((loc.lng||120)-119.9)/0.6))
    var mapY = by+6+(bh-18)*Math.min(1,Math.max(0,((loc.lat||30.3)-30.2)/0.3))
    ctx.beginPath(); ctx.arc(mapX, mapY, 1.8, 0, Math.PI*2); ctx.fill()
    ctx.globalAlpha = 0.45; ctx.fillStyle = '#7A5C3C'; ctx.font = '7px -apple-system,sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('Ink', bx+unitW/2, by+bh-3); ctx.restore()

    // Badge 2: Thread
    bx = unitW + gap
    var thC = activeDim===1 ? c : '#D0C8C0'
    rc.rectangle(bx, by, unitW, bh, ro({stroke: thC, strokeWidth: activeDim===1 ? 0.8 : 0.6}))
    var icx = bx + unitW/2, icy = by + bh/2 - 2, is2 = unitW * 0.32
    ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 0.7; ctx.globalAlpha = 0.5
    ctx.beginPath()
    for (var i = 0; i <= 60; i++) { var t = i/60, a = t*Math.PI*2, si = Math.sin(a), co = Math.cos(a), d = 1+si*si; var px = icx + is2*co/d, py = icy + is2*0.8*si*co/d; i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py) }
    ctx.stroke()
    var a2 = loc.inf_t*Math.PI*2, s2 = Math.sin(a2), c2 = Math.cos(a2), d2 = 1+s2*s2
    ctx.globalAlpha = 1; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(icx+is2*c2/d2, icy+is2*0.8*s2*c2/d2, 2, 0, Math.PI*2); ctx.fill()
    ctx.globalAlpha = 0.45; ctx.fillStyle = '#7A5C3C'; ctx.font = '7px -apple-system,sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('Thread', icx, by+bh-3); ctx.restore()

    // Badge 3: Compass
    bx = (unitW + gap) * 2
    var coC = activeDim===2 ? c : '#D0C8C0'
    rc.rectangle(bx, by, unitW, bh, ro({stroke: coC, strokeWidth: activeDim===2 ? 0.8 : 0.6}))
    icx = bx + unitW/2; icy = by + bh/2 - 2
    ctx.save(); ctx.strokeStyle = '#B0A898'; ctx.lineWidth = 0.4; ctx.globalAlpha = 0.35
    ctx.beginPath(); ctx.arc(icx, icy, 9, 0, Math.PI*2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(icx-11,icy); ctx.lineTo(icx+11,icy); ctx.moveTo(icx,icy-11); ctx.lineTo(icx,icy+11); ctx.stroke()
    ctx.globalAlpha = 0.7; ctx.fillStyle = c
    var cAngle = ((loc.lng||120)-120)*8, cDist = ((loc.lat||30.3)-30.3)*15
    ctx.beginPath(); ctx.arc(icx+Math.max(-7,Math.min(7,cAngle)), icy-Math.max(-7,Math.min(7,cDist)), 1.8, 0, Math.PI*2); ctx.fill()
    ctx.globalAlpha = 0.45; ctx.fillStyle = '#7A5C3C'; ctx.font = '7px -apple-system,sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('Compass', icx, by+bh-3); ctx.restore()
  }, [location])


  useEffect(function() {
    var cvs = dividerRef.current
    if (!cvs) return
    var dw = CW - M*2 - 24, dh = 6
    var dpr = Math.min(window.devicePixelRatio || 1, 3)
    cvs.width = dw * dpr; cvs.height = dh * dpr
    cvs.style.width = dw + 'px'; cvs.style.height = dh + 'px'
    var ctx = cvs.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    var rc = rough.canvas(cvs)
    rc.line(0, dh/2, dw, dh/2, ro({stroke: weatherColor || '#8A7A68', strokeWidth:0.4, roughness:1.5}))
  }, [weatherColor])

  if (!location || !position) return null
  var loc = location
  var storyName = loc.story_name || loc.label || ''
  var displayName = loc.display_name || loc.label || ''
  var story = loc.story || ''
  var hasInf = loc.inf_t != null && loc.inf_w != null

  return (
    <div style={{position:'absolute',left:position[0]-CW/2,top:position[1]-CH/2,width:CW,height:CH,zIndex:200,cursor:'default',fontFamily:'-apple-system,PingFang SC,sans-serif'}} onClick={function(e){e.stopPropagation()}}>
      <canvas ref={borderRef} style={{position:'absolute',top:0,left:0}} />
      <div style={{position:'relative',zIndex:1,padding:'14px 14px 12px',height:'100%',display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexShrink:0}}>
          <div style={{flex:1,minWidth:0,paddingRight:4}}>
            <div style={{fontSize:15,fontWeight:700,color:'#5A5048',lineHeight:1.3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{storyName}</div>
            <div style={{display:'flex',alignItems:'baseline',gap:6,marginTop:3}}>
              <span style={{fontSize:11,color:'#A09888',flexShrink:0}}>{displayName}</span>
              {hasInf && (
                <span onClick={function(e){e.stopPropagation();setShowTranslate(!showTranslate)}} style={{fontSize:9,color:'#B8B0A0',cursor:'pointer',whiteSpace:'nowrap',fontFamily:showTranslate?'-apple-system,PingFang SC,sans-serif':'SF Mono,Menlo,monospace',letterSpacing:showTranslate?0:0.5}}>
                  <span style={{marginRight:2}}>∞</span>
                  {showTranslate ? translateT(loc.inf_t)+', '+translateW(loc.inf_w) : 't:'+Number(loc.inf_t).toFixed(3)+' w:'+Number(loc.inf_w).toFixed(2)}
                </span>
              )}
            </div>
            {loc.errands > 0 && <div style={{fontSize:9,color:'#B8B0A0',marginTop:2}}>{loc.errands + ' errands'}</div>}
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end'}}>
            <div onClick={onClose} style={{width:24,height:16,cursor:'pointer'}} />
            <canvas ref={stampRef} style={{width:44,height:44}} />
          </div>
        </div>
        <div style={{flexShrink:0,display:'flex',justifyContent:'center',padding:'2px 0 4px'}}>
          <canvas ref={dividerRef} style={{width:220,height:6}} />
        </div>
        <div style={{flex:1,overflow:'hidden',overflowY:'auto',fontSize:11,lineHeight:1.7,color:'#6B5B4E',WebkitOverflowScrolling:'touch',paddingRight:4}}>
          {story || ''}
        </div>
        {hasInf && (
          <div style={{flexShrink:0,paddingTop:4,display:'flex',justifyContent:'center',position:'relative',zIndex:2}}>
            <canvas ref={badgesRef} style={{width:224,height:36}} />
          </div>
        )}
      </div>
    </div>
  )
}
