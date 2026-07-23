import { useRef, useEffect, useState } from 'react'
import rough from 'roughjs'
import LocationCard from './LocationCard'
import coastlines from '../lib/coastlines'

var SEED=1
var RO={roughness:0.8,bowing:0.5,disableMultiStroke:true,seed:SEED}
function ro(x){var o={roughness:RO.roughness,bowing:RO.bowing,disableMultiStroke:RO.disableMultiStroke,seed:RO.seed};if(x){var k=Object.keys(x);for(var i=0;i<k.length;i++)o[k[i]]=x[k[i]]};return o}

function drawSun(rc,cx,cy,c){rc.circle(cx,cy,14,ro({stroke:c,strokeWidth:1.5}));var r=12;for(var i=0;i<8;i++){var a=i*Math.PI/4;rc.line(cx+Math.cos(a)*9,cy+Math.sin(a)*9,cx+Math.cos(a)*r,cy+Math.sin(a)*r,ro({stroke:c,strokeWidth:1}))}}
function drawWarm(rc,cx,cy,c){rc.circle(cx,cy,18,ro({stroke:c,strokeWidth:1.8}));rc.line(cx-13,cy,cx-16,cy,ro({stroke:c,strokeWidth:1}));rc.line(cx+13,cy,cx+16,cy,ro({stroke:c,strokeWidth:1}));rc.line(cx,cy-13,cx,cy-16,ro({stroke:c,strokeWidth:1}));rc.line(cx,cy+13,cx,cy+16,ro({stroke:c,strokeWidth:1}))}
function drawGlow(rc,cx,cy,c){rc.circle(cx,cy,12,ro({stroke:c,strokeWidth:1.3}));rc.circle(cx,cy,24,ro({stroke:c,strokeWidth:0.7}))}
function drawMoon(rc,cx,cy,c){var pts=[],i;for(i=0;i<=20;i++){var a=-Math.PI/2+i*Math.PI/20;pts.push([cx+Math.cos(a)*13,cy+Math.sin(a)*13])};for(i=20;i>=0;i--){var a2=-Math.PI/2+i*Math.PI/20;pts.push([cx+Math.cos(a2)*4,cy+Math.sin(a2)*12])};rc.linearPath(pts,ro({stroke:c,strokeWidth:1.3}))}
function drawDrizzle(rc,cx,cy,c){rc.line(cx-7,cy-8,cx-8,cy+0,ro({stroke:c,strokeWidth:1.2}));rc.line(cx,cy-6,cx-1,cy+4,ro({stroke:c,strokeWidth:1.2}));rc.line(cx+7,cy-7,cx+6,cy+2,ro({stroke:c,strokeWidth:1.2}))}
function drawRain(rc,cx,cy,c){for(var i=-3;i<=3;i++)rc.line(cx+i*4,cy-8+Math.abs(i),cx+i*4-1,cy+6-Math.abs(i),ro({stroke:c,strokeWidth:1.1}))}
function drawStorm(rc,cx,cy,c){rc.linearPath([[cx,cy-13],[cx-5,cy-2],[cx+3,cy-2],[cx-2,cy+13]],ro({stroke:c,strokeWidth:1.8}))}
function drawPlum(rc,cx,cy,c){for(var i=-5;i<=5;i++){rc.line(cx+i*3,cy-10,cx+i*3,cy-5,ro({stroke:c,strokeWidth:0.8}));rc.line(cx+i*3-1,cy-2,cx+i*3-1,cy+3,ro({stroke:c,strokeWidth:0.8}));rc.line(cx+i*3,cy+6,cx+i*3,cy+11,ro({stroke:c,strokeWidth:0.8}))}}
function drawCloudy(rc,cx,cy,c){rc.linearPath([[cx-14,cy+3],[cx-13,cy-1],[cx-9,cy-5],[cx-4,cy-7],[cx,cy-9],[cx+4,cy-7],[cx+9,cy-5],[cx+13,cy-1],[cx+14,cy+3]],ro({stroke:c,strokeWidth:1.3}));rc.line(cx-14,cy+3,cx+14,cy+3,ro({stroke:c,strokeWidth:1.1}))}
function drawOvercast(rc,cx,cy,c){rc.line(cx-16,cy-2,cx+16,cy-2,ro({stroke:c,strokeWidth:2.5}));rc.line(cx-14,cy+4,cx+14,cy+4,ro({stroke:c,strokeWidth:2}))}
function drawFog(rc,cx,cy,c){rc.line(cx-12,cy-7,cx-3,cy-7,ro({stroke:c,strokeWidth:1.1,roughness:1.5}));rc.line(cx+2,cy-7,cx+10,cy-7,ro({stroke:c,strokeWidth:0.9,roughness:1.5}));rc.line(cx-10,cy-1,cx+1,cy-1,ro({stroke:c,strokeWidth:1.2,roughness:1.5}));rc.line(cx+5,cy-1,cx+13,cy-1,ro({stroke:c,strokeWidth:0.8,roughness:1.5}));rc.line(cx-13,cy+5,cx-4,cy+5,ro({stroke:c,strokeWidth:0.9,roughness:1.5}));rc.line(cx+1,cy+5,cx+11,cy+5,ro({stroke:c,strokeWidth:1.1,roughness:1.5}))}
function drawWind(rc,cx,cy,c){rc.linearPath([[cx-14,cy-6],[cx,cy-5],[cx+10,cy-9]],ro({stroke:c,strokeWidth:1.3}));rc.linearPath([[cx-12,cy+1],[cx+2,cy+1],[cx+14,cy-2]],ro({stroke:c,strokeWidth:1.5}));rc.linearPath([[cx-10,cy+7],[cx+4,cy+8],[cx+12,cy+5]],ro({stroke:c,strokeWidth:1.1}))}
function drawBreeze(rc,cx,cy,c){rc.linearPath([[cx-14,cy],[cx-4,cy-3],[cx+6,cy+1],[cx+14,cy-2]],ro({stroke:c,strokeWidth:1.2}))}
function drawHumid(rc,cx,cy,c){rc.linearPath([[cx,cy-12],[cx-8,cy+4]],ro({stroke:c,strokeWidth:1.3}));rc.linearPath([[cx,cy-12],[cx+8,cy+4]],ro({stroke:c,strokeWidth:1.3}));rc.arc(cx,cy+4,16,10,0,Math.PI,false,ro({stroke:c,strokeWidth:1.3}))}
function drawSnow(rc,cx,cy,c){for(var i=0;i<6;i++){var a=i*Math.PI/3;var ex=Math.cos(a),ey=Math.sin(a);rc.line(cx,cy,cx+ex*13,cy+ey*13,ro({stroke:c,strokeWidth:1}));rc.line(cx+ex*8,cy+ey*8,cx+ex*8+Math.cos(a+0.8)*5,cy+ey*8+Math.sin(a+0.8)*5,ro({stroke:c,strokeWidth:0.7}));rc.line(cx+ex*8,cy+ey*8,cx+ex*8+Math.cos(a-0.8)*5,cy+ey*8+Math.sin(a-0.8)*5,ro({stroke:c,strokeWidth:0.7}))}}
function drawFrost(rc,cx,cy,c){for(var i=0;i<6;i++){var a=i*Math.PI/3;rc.line(cx,cy,cx+Math.cos(a)*12,cy+Math.sin(a)*12,ro({stroke:c,strokeWidth:1.1}))};rc.circle(cx,cy,4,ro({stroke:c,strokeWidth:0.8}))}
function drawHail(rc,cx,cy,c){rc.circle(cx-8,cy-6,7,ro({stroke:c,strokeWidth:1,fill:c,fillStyle:'solid'}));rc.circle(cx+5,cy-3,6,ro({stroke:c,strokeWidth:1,fill:c,fillStyle:'solid'}));rc.circle(cx-3,cy+5,8,ro({stroke:c,strokeWidth:1,fill:c,fillStyle:'solid'}));rc.circle(cx+9,cy+6,5,ro({stroke:c,strokeWidth:0.9,fill:c,fillStyle:'solid'}));rc.circle(cx-10,cy+8,4,ro({stroke:c,strokeWidth:0.8,fill:c,fillStyle:'solid'}))}
function drawRainbow(rc,cx,cy,c){var cs=["#C85050","#D88840","#D0B830","#50A850","#4878C0","#7858A8"];for(var i=0;i<cs.length;i++)rc.arc(cx,cy+8,28-i*3.5,24-i*3.5,Math.PI,Math.PI*2,false,ro({stroke:cs[i],strokeWidth:1.5}))}
function drawStarry(rc,cx,cy,c){var pts=[[-8,-7,4],[4,-9,5],[10,-2,3],[-10,3,3],[-2,2,6],[7,5,4],[-6,9,3],[5,10,3]];for(var i=0;i<pts.length;i++){var p=pts[i],s=p[2]/2;rc.line(cx+p[0],cy+p[1]-s,cx+p[0],cy+p[1]+s,ro({stroke:c,strokeWidth:0.8}));rc.line(cx+p[0]-s,cy+p[1],cx+p[0]+s,cy+p[1],ro({stroke:c,strokeWidth:0.8}))}}
function drawDust(rc,cx,cy,c){var pts=[[-10,-5],[-4,-9],[3,-7],[9,-4],[-8,1],[1,-1],[7,1],[-6,6],[0,7],[6,6],[-3,11],[5,10]];for(var i=0;i<pts.length;i++)rc.circle(cx+pts[i][0],cy+pts[i][1],2+i%2,ro({stroke:c,strokeWidth:0.7,fill:c,fillStyle:'solid'}))}
function drawPetals(rc,cx,cy,c){var pts=[[-7,-8],[-1,-3],[6,-6],[-9,3],[3,2],[9,1],[-5,8],[4,9]];for(var i=0;i<pts.length;i++)rc.ellipse(cx+pts[i][0],cy+pts[i][1],6,3,ro({stroke:c,strokeWidth:0.9}))}

var WS={sun:{color:"#C8A830",draw:drawSun},warm:{color:"#C09030",draw:drawWarm},glow:{color:"#B0A070",draw:drawGlow},moon:{color:"#7888A8",draw:drawMoon},drizzle:{color:"#6888A8",draw:drawDrizzle},rain:{color:"#4870A0",draw:drawRain},storm:{color:"#5858A0",draw:drawStorm},plum:{color:"#5888A0",draw:drawPlum},cloudy:{color:"#9A9488",draw:drawCloudy},overcast:{color:"#888480",draw:drawOvercast},fog:{color:"#A09890",draw:drawFog},wind:{color:"#5898A0",draw:drawWind},breeze:{color:"#78A880",draw:drawBreeze},humid:{color:"#A09070",draw:drawHumid},snow:{color:"#6880A8",draw:drawSnow},frost:{color:"#5080A8",draw:drawFrost},hail:{color:"#6878A0",draw:drawHail},rainbow:{color:"#C07878",draw:drawRainbow},starry:{color:"#A09060",draw:drawStarry},dust:{color:"#B09050",draw:drawDust},petals:{color:"#C08080",draw:drawPetals}}

/* ── world map constants ── */
var MW=1080,MH=540,DS=MW/360
function lngX(v){return(v+180)*DS}
function latY(v){return(90-v)*DS}

function initTf(sw,sh){
  var z=sw/(70*DS)
  var cx=lngX(110),cy=latY(28)
  return{px:sw/2-cx*z,py:sh/2-cy*z,z:z}
}

function niceScale(kpp,maxPx){
  var ts=[10000,5000,2000,1000,500,200,100,50,20,10,5,2,1]
  for(var i=0;i<ts.length;i++){var px=ts[i]/kpp;if(px<=maxPx&&px>=30)return{km:ts[i],px:px}}
  return{km:1,px:1/kpp}
}

export default function CompassView({locations}){
  var canvasRef=useRef(null),scaleRef=useRef(null),outerRef=useRef(null),innerRef=useRef(null),cardWrapRef=useRef(null)
  var sizeRef=useRef({W:380,H:600}),geoLocsRef=useRef([])
  var ss=useState(null),selected=ss[0],setSelected=ss[1]
  var tfRef=useRef(null),sn=useState(null),tfSnap=sn[0],setTfSnap=sn[1]
  var gestRef=useRef(null),movedRef=useRef(false),initedRef=useRef(false)

  /* ── draw world ── */
  useEffect(function(){
    var canvas=canvasRef.current;if(!canvas)return
    var dpr=Math.min(window.devicePixelRatio||1,3)
    canvas.width=MW*dpr;canvas.height=MH*dpr
    canvas.style.width=MW+'px';canvas.style.height=MH+'px'
    var ctx=canvas.getContext('2d')
    ctx.setTransform(dpr,0,0,dpr,0,0)
    ctx.fillStyle='#F5F0E8';ctx.fillRect(0,0,MW,MH)

    var rc=rough.canvas(canvas)

    /* coastlines */
    for(var p=0;p<coastlines.length;p++){
      var poly=coastlines[p],pts=[]
      for(var q=0;q<poly.length;q++)pts.push([lngX(poly[q][0]),latY(poly[q][1])])
      if(pts.length>2) rc.polygon(pts,{stroke:'#C8C0B0',strokeWidth:0.4,roughness:0.25,fill:'#EDE8E0',fillStyle:'solid',disableMultiStroke:true,seed:p+1})
    }

    /* locations */
    var gl=[]
    if(locations)for(var j=0;j<locations.length;j++){if(locations[j].lat!=null&&locations[j].lng!=null)gl.push(locations[j])}
    geoLocsRef.current=gl

    for(var i=0;i<gl.length;i++){
      var loc=gl[i],x=lngX(loc.lng),y=latY(loc.lat)
      var col=loc.color||'#E8A87C'
      rc.circle(x,y,12,ro({stroke:col,strokeWidth:1.2,fill:col,fillStyle:'solid',fillWeight:0.5,roughness:0.6}))
      ctx.textAlign='center';ctx.font='600 5px -apple-system,PingFang SC,sans-serif';ctx.fillStyle='#6B5B4E'
      ctx.fillText(loc.display_name||loc.label||loc.id,x,y+12)
    }
  },[locations])

  /* ── init transform + gestures ── */
  useEffect(function(){
    var el=outerRef.current;if(!el)return
    var sw=el.clientWidth||380,sh=el.clientHeight||600
    sizeRef.current={W:sw,H:sh}
    if(!initedRef.current){
      var tf=initTf(sw,sh);tfRef.current=tf;setTfSnap(tf);applyCSS();initedRef.current=true
    }
    function applyCSS(){if(!innerRef.current||!tfRef.current)return;var t=tfRef.current;innerRef.current.style.transform='translate('+t.px+'px,'+t.py+'px) scale('+t.z+')'}
    function d2(ts){var dx=ts[1].clientX-ts[0].clientX,dy=ts[1].clientY-ts[0].clientY;return Math.sqrt(dx*dx+dy*dy)}
    function onTS(e){
      if(cardWrapRef.current&&cardWrapRef.current.contains(e.target))return
      var ts=e.touches;movedRef.current=false
      if(ts.length===1)gestRef.current={type:'pan',sx:ts[0].clientX,sy:ts[0].clientY,spx:tfRef.current.px,spy:tfRef.current.py}
      else if(ts.length>=2){setSelected(null);gestRef.current={type:'pinch',sd:d2(ts),sz:tfRef.current.z,spx:tfRef.current.px,spy:tfRef.current.py,smx:(ts[0].clientX+ts[1].clientX)/2,smy:(ts[0].clientY+ts[1].clientY)/2}}
    }
    function onTM(e){
      var g=gestRef.current;if(!g)return;e.preventDefault();var ts=e.touches
      if(ts.length>=2){
        if(g.type==='pan'){setSelected(null);g.type='pinch';g.sd=d2(ts);g.sz=tfRef.current.z;g.spx=tfRef.current.px;g.spy=tfRef.current.py;g.smx=(ts[0].clientX+ts[1].clientX)/2;g.smy=(ts[0].clientY+ts[1].clientY)/2;return}
        movedRef.current=true;var d=d2(ts),nz=Math.max(0.15,Math.min(8,g.sz*d/g.sd))
        var mx=(ts[0].clientX+ts[1].clientX)/2,my=(ts[0].clientY+ts[1].clientY)/2
        var rect=el.getBoundingClientRect(),cx=g.smx-rect.left,cy=g.smy-rect.top
        tfRef.current.z=nz;tfRef.current.px=cx-(cx-g.spx)*nz/g.sz+(mx-g.smx);tfRef.current.py=cy-(cy-g.spy)*nz/g.sz+(my-g.smy);applyCSS()
      }else if(g.type==='pan'&&ts.length===1){
        var dx=ts[0].clientX-g.sx,dy=ts[0].clientY-g.sy
        if(Math.abs(dx)+Math.abs(dy)>5){movedRef.current=true;setSelected(null)}
        tfRef.current.px=g.spx+dx;tfRef.current.py=g.spy+dy;applyCSS()
      }
    }
    function onTE(e){if(e.touches.length===0){gestRef.current=null;setTfSnap({px:tfRef.current.px,py:tfRef.current.py,z:tfRef.current.z})}}
    function onWh(e){
      e.preventDefault();var rect=el.getBoundingClientRect(),cx=e.clientX-rect.left,cy=e.clientY-rect.top
      var t=tfRef.current,f=e.deltaY>0?0.92:1.08,nz=Math.max(0.15,Math.min(8,t.z*f)),oz=t.z
      t.px=cx-(cx-t.px)*nz/oz;t.py=cy-(cy-t.py)*nz/oz;t.z=nz;applyCSS();setTfSnap({px:t.px,py:t.py,z:t.z})
    }
    el.addEventListener('touchstart',onTS,{passive:true});el.addEventListener('touchmove',onTM,{passive:false})
    el.addEventListener('touchend',onTE,{passive:true});el.addEventListener('wheel',onWh,{passive:false})
    return function(){el.removeEventListener('touchstart',onTS);el.removeEventListener('touchmove',onTM);el.removeEventListener('touchend',onTE);el.removeEventListener('wheel',onWh)}
  },[])

  /* ── scale bar ── */
  useEffect(function(){
    if(!tfSnap||!scaleRef.current)return
    var cvs=scaleRef.current,sw=130,sh=28
    var dpr=Math.min(window.devicePixelRatio||1,3)
    cvs.width=sw*dpr;cvs.height=sh*dpr;cvs.style.width=sw+'px';cvs.style.height=sh+'px'
    var ctx=cvs.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0)
    var kpp=111.32*Math.cos(30*Math.PI/180)/(DS*tfSnap.z)
    var sc=niceScale(kpp,100)
    var rc=rough.canvas(cvs),y=sh-8
    rc.line(10,y,10+sc.px,y,{stroke:'#8A7A68',strokeWidth:1.2,roughness:0.4,disableMultiStroke:true,seed:99})
    rc.line(10,y-4,10,y+1,{stroke:'#8A7A68',strokeWidth:0.8,roughness:0.3,disableMultiStroke:true,seed:100})
    rc.line(10+sc.px,y-4,10+sc.px,y+1,{stroke:'#8A7A68',strokeWidth:0.8,roughness:0.3,disableMultiStroke:true,seed:101})
    ctx.font='9px -apple-system,PingFang SC,sans-serif';ctx.fillStyle='#8A7A68';ctx.textAlign='center'
    ctx.fillText(sc.km>=1?sc.km+' km':(sc.km*1000)+' m',10+sc.px/2,y-6)
  },[tfSnap])

  function handleClick(e){
    if(movedRef.current)return
    if(cardWrapRef.current&&cardWrapRef.current.contains(e.target))return
    var rect=outerRef.current.getBoundingClientRect(),t=tfRef.current
    var sx=e.clientX-rect.left,sy=e.clientY-rect.top
    var wx=(sx-t.px)/t.z,wy=(sy-t.py)/t.z
    var gl=geoLocsRef.current;if(!gl.length){setSelected(null);return}
    var best=null,bestD=12
    for(var i=0;i<gl.length;i++){
      var px=lngX(gl[i].lng),py=latY(gl[i].lat)
      var dx=wx-px,dy=wy-py,d=Math.sqrt(dx*dx+dy*dy)
      if(d<bestD){bestD=d;best={loc:gl[i],pos:[px,py]}}
    }
    if(best)setSelected(best);else setSelected(null)
  }

  var cardPos=null
  if(selected&&tfSnap){
    var t=tfSnap,rx=selected.pos[0]*t.z+t.px,ry=selected.pos[1]*t.z+t.py
    var sz=sizeRef.current,CW=230,CH=280
    cardPos=[Math.max(CW/2+4,Math.min(sz.W-CW/2-4,rx)),Math.max(CH/2+4,Math.min(sz.H-CH/2-4,ry))]
  }
  var cw=selected?(WS[selected.loc.weather||'sun']||WS.sun):null

  return(
    <div ref={outerRef} onClick={handleClick} style={{position:'relative',width:'100%',height:'100%',overflow:'hidden',touchAction:'none',background:'#F5F0E8'}}>
      <div ref={innerRef} style={{position:'absolute',transformOrigin:'0 0',willChange:'transform'}}>
        <canvas ref={canvasRef} style={{display:'block'}}/>
      </div>
      <canvas ref={scaleRef} style={{position:'absolute',bottom:16,left:12,zIndex:50,pointerEvents:'none'}}/>
      {selected&&cardPos&&(
        <div ref={cardWrapRef} onClick={function(e){e.stopPropagation()}} style={{position:'absolute',top:0,left:0,zIndex:200}}>
          <LocationCard location={selected.loc} position={cardPos} onClose={function(){setSelected(null)}} weatherDraw={cw.draw} weatherColor={cw.color} weatherType={selected.loc.weather||'sun'}/>
        </div>
      )}
    </div>
  )
}