// StickerRecipes — single-color + negative-space, same as IconGallery
// Signature: (rc, ctx, x, y, s, color) where s = scale, color = single fill color
var BG = '#FAF6F0'

export var stickerCategories = {
  flora: { label: 'Flora', items: [
    { type: 'plumeria', label: 'plumeria' },
    { type: 'sakura', label: 'sakura' },
    { type: 'leaf', label: 'leaf' },
    { type: 'wind', label: 'wind' },
    { type: 'mushroom', label: 'mushroom' },
    { type: 'crescent', label: 'moon' },
    { type: 'star5', label: 'star' },
  ]},
  frame: { label: 'Frame', items: [
    { type: 'ribbon', label: 'ribbon' },
    { type: 'tape', label: 'tape' },
    { type: 'tag', label: 'tag' },
    { type: 'divider_wave', label: 'wave' },
    { type: 'divider_dot', label: 'dots' },
    { type: 'postcard', label: 'postcard' },
    { type: 'stamp_frame', label: 'stamp' },
  ]},
  trinket: { label: 'Trinket', items: [
    { type: 'envelope', label: 'letter' },
    { type: 'key', label: 'key' },
    { type: 'bow', label: 'bow' },
    { type: 'teacup', label: 'cup' },
    { type: 'book', label: 'book' },
    { type: 'candle', label: 'candle' },
    { type: 'heart', label: 'heart' },
  ]},
}

export var stickerRecipes = {

  // ═══ Flora ═══

  plumeria: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 0.6*s, roughness: 0.3, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    var w = { stroke: BG, strokeWidth: 1.2*s, roughness: 0.3, disableMultiStroke: true, seed: 42 }
    // 5 elongated petals in pinwheel — each rotated ~15deg from radial
    var angles = [-90, -18, 54, 126, 198]
    var twist = 15
    for (var i = 0; i < 5; i++) {
      var a = (angles[i] + twist) * Math.PI / 180
      var px = x + Math.cos(a) * 5*s, py = y + Math.sin(a) * 5*s
      // draw petal as filled ellipse — long and plump
      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(a + Math.PI/2)
      // use rough ellipse at origin after rotation
      rc.ellipse(0, 0, 7*s, 16*s, fo)
      ctx.restore()
    }
    // BG lines between petals to create separation
    for (var i = 0; i < 5; i++) {
      var a = angles[i] * Math.PI / 180
      rc.line(x, y, x + Math.cos(a) * 9*s, y + Math.sin(a) * 9*s, { ...w, strokeWidth: 1*s, seed: 50+i })
    }
    // warm center
    rc.circle(x, y, 4*s, { stroke: color, fill: color, fillStyle: 'solid', strokeWidth: 0.3*s, roughness: 0.3, disableMultiStroke: true, seed: 60 })
  },

  sakura: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 0.8*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    var w = { stroke: BG, strokeWidth: 1*s, roughness: 0.3, disableMultiStroke: true, seed: 42 }
    // 5 petals
    var angles = [-90, -18, 54, 126, 198]
    for (var i = 0; i < 5; i++) {
      var a = angles[i] * Math.PI / 180
      rc.ellipse(x + Math.cos(a)*5.5*s, y + Math.sin(a)*5.5*s, 9*s, 12*s, fo)
      // notch at petal tip — BG line
      var tx = x + Math.cos(a)*10*s, ty = y + Math.sin(a)*10*s
      rc.line(tx - Math.cos(a+0.3)*2*s, ty - Math.sin(a+0.3)*2*s, tx + Math.cos(a-0.3)*2*s, ty + Math.sin(a-0.3)*2*s, { ...w, strokeWidth: 1.2*s, seed: 50+i })
    }
    // center
    rc.circle(x, y, 4*s, { ...w, fill: BG, fillStyle: 'solid', seed: 60 })
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(x, y, 1.2*s, 0, Math.PI*2); ctx.fill()
    // stamens
    for (var i = 0; i < 4; i++) {
      var sa = (i * 90 + 45) * Math.PI / 180
      ctx.beginPath(); ctx.arc(x + Math.cos(sa)*2.5*s, y + Math.sin(sa)*2.5*s, 0.5*s, 0, Math.PI*2); ctx.fill()
    }
  },

  leaf: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    var w = { stroke: BG, strokeWidth: 1*s, roughness: 0.3, disableMultiStroke: true, seed: 42 }
    rc.ellipse(x, y - 2*s, 12*s, 20*s, fo)
    rc.line(x, y - 12*s, x, y + 8*s, { ...w, strokeWidth: 1.2*s, seed: 50 })
    rc.line(x - 4*s, y - 5*s, x, y - 2*s, { ...w, strokeWidth: 0.8*s, seed: 51 })
    rc.line(x + 4*s, y - 6*s, x, y - 3*s, { ...w, strokeWidth: 0.8*s, seed: 52 })
    rc.line(x - 3.5*s, y + 1*s, x, y + 3*s, { ...w, strokeWidth: 0.8*s, seed: 53 })
    rc.line(x + 3.5*s, y, x, y + 2*s, { ...w, strokeWidth: 0.8*s, seed: 54 })
    rc.line(x, y + 8*s, x, y + 13*s, { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 55 })
  },

  wind: function(rc, ctx, x, y, s, color) {
    var o = { stroke: color, strokeWidth: 1.2*s, roughness: 0.5, disableMultiStroke: true }
    // main swirl
    ctx.strokeStyle = color; ctx.lineWidth = 1.2*s; ctx.lineCap = 'round'
    ctx.beginPath()
    for (var t = 0; t <= 1; t += 0.02) {
      var a = t * Math.PI * 2.5 - Math.PI*0.5, r = (1-t) * 9*s + 2*s
      var px = x + Math.cos(a) * r, py = y + Math.sin(a) * r
      if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
    }
    ctx.stroke()
    // secondary curves
    rc.line(x - 12*s, y - 2*s, x + 4*s, y - 6*s, { ...o, strokeWidth: 0.8*s, seed: 50 })
    rc.line(x - 10*s, y + 5*s, x + 6*s, y + 2*s, { ...o, strokeWidth: 0.8*s, seed: 51 })
    // small dots being blown
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(x - 10*s, y - 5*s, 1*s, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(x - 8*s, y + 7*s, 0.8*s, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + 8*s, y - 4*s, 0.7*s, 0, Math.PI*2); ctx.fill()
  },

  mushroom: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    var w = { stroke: BG, fill: BG, fillStyle: 'solid', roughness: 0.3, disableMultiStroke: true, seed: 42 }
    rc.rectangle(x - 3*s, y, 6*s, 10*s, fo)
    rc.ellipse(x, y, 20*s, 14*s, fo)
    rc.circle(x - 4*s, y - 2*s, 3*s, { ...w, strokeWidth: 0.5*s, seed: 50 })
    rc.circle(x + 3*s, y - 1*s, 2*s, { ...w, strokeWidth: 0.5*s, seed: 51 })
    rc.circle(x, y - 4*s, 2.5*s, { ...w, strokeWidth: 0.5*s, seed: 52 })
    rc.circle(x + 5*s, y - 3*s, 1.5*s, { ...w, strokeWidth: 0.5*s, seed: 53 })
  },

  crescent: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 0.8*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    rc.circle(x, y, 18*s, fo)
    rc.circle(x + 4*s, y - 3*s, 15*s, { stroke: BG, fill: BG, fillStyle: 'solid', strokeWidth: 0.5*s, roughness: 0.3, disableMultiStroke: true, seed: 50 })
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(x + 6*s, y - 8*s, 0.8*s, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + 10*s, y - 3*s, 0.6*s, 0, Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + 7*s, y + 5*s, 0.7*s, 0, Math.PI*2); ctx.fill()
  },

  star5: function(rc, ctx, x, y, s, color) {
    var pts = []
    for (var i = 0; i < 5; i++) {
      var a1 = (i * 72 - 90) * Math.PI / 180
      pts.push([x + Math.cos(a1)*10*s, y + Math.sin(a1)*10*s])
      var a2 = (i * 72 + 36 - 90) * Math.PI / 180
      pts.push([x + Math.cos(a2)*4*s, y + Math.sin(a2)*4*s])
    }
    var path = 'M ' + pts[0][0] + ' ' + pts[0][1]
    for (var i = 1; i < pts.length; i++) path += ' L ' + pts[i][0] + ' ' + pts[i][1]
    path += ' Z'
    rc.path(path, { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' })
  },

  // ═══ Frame ═══

  ribbon: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    rc.rectangle(x - 12*s, y - 4*s, 24*s, 8*s, fo)
    var p1 = 'M '+(x-12*s)+' '+(y-4*s)+' L '+(x-15*s)+' '+(y-6*s)+' L '+(x-15*s)+' '+(y+6*s)+' L '+(x-12*s)+' '+(y+4*s)+' Z'
    var p2 = 'M '+(x+12*s)+' '+(y-4*s)+' L '+(x+15*s)+' '+(y-6*s)+' L '+(x+15*s)+' '+(y+6*s)+' L '+(x+12*s)+' '+(y+4*s)+' Z'
    rc.path(p1, fo); rc.path(p2, fo)
    rc.line(x - 12*s, y, x + 12*s, y, { stroke: BG, strokeWidth: 0.8*s, roughness: 0.3, disableMultiStroke: true, seed: 50 })
  },

  tape: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 0.8*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    rc.rectangle(x - 14*s, y - 3*s, 28*s, 6*s, fo)
    rc.line(x - 14*s, y - 2*s, x - 13*s, y + 2*s, { stroke: BG, strokeWidth: 0.8*s, roughness: 0.5, disableMultiStroke: true, seed: 50 })
    rc.line(x + 14*s, y - 1*s, x + 13*s, y + 3*s, { stroke: BG, strokeWidth: 0.8*s, roughness: 0.5, disableMultiStroke: true, seed: 51 })
  },

  tag: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    var w = { stroke: BG, strokeWidth: 0.7*s, roughness: 0.3, disableMultiStroke: true, seed: 42 }
    rc.rectangle(x - 7*s, y - 5*s, 14*s, 16*s, fo)
    rc.circle(x, y - 2*s, 4*s, { ...w, fill: BG, fillStyle: 'solid', seed: 50 })
    rc.line(x - 4*s, y + 3*s, x + 4*s, y + 3*s, { ...w, seed: 51 })
    rc.line(x - 4*s, y + 5*s, x + 4*s, y + 5*s, { ...w, seed: 52 })
    rc.line(x - 4*s, y + 7*s, x + 2*s, y + 7*s, { ...w, seed: 53 })
    rc.line(x - s, y - 7*s, x + s, y - 9*s, { stroke: color, strokeWidth: 0.8*s, roughness: 0.4, disableMultiStroke: true, seed: 54 })
  },

  divider_wave: function(rc, ctx, x, y, s, color) {
    var o = { stroke: color, strokeWidth: 1.2*s, roughness: 0.4, disableMultiStroke: true }
    var pts = [[-14,0],[-10,-3],[-6,3],[-2,-3],[2,3],[6,-3],[10,3],[14,0]]
    for (var i = 0; i < pts.length - 1; i++)
      rc.line(x + pts[i][0]*s, y + pts[i][1]*s, x + pts[i+1][0]*s, y + pts[i+1][1]*s, { ...o, seed: 50+i })
  },

  divider_dot: function(rc, ctx, x, y, s, color) {
    for (var i = -3; i <= 3; i++) {
      ctx.fillStyle = color
      ctx.beginPath(); ctx.arc(x + i * 4*s, y, 1.3*s, 0, Math.PI*2); ctx.fill()
    }
  },

  postcard: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    var w = { stroke: BG, strokeWidth: 0.7*s, roughness: 0.3, disableMultiStroke: true, seed: 42 }
    rc.rectangle(x - 12*s, y - 9*s, 24*s, 18*s, fo)
    rc.line(x, y - 8*s, x, y + 8*s, { ...w, strokeWidth: 0.8*s, seed: 50 })
    rc.line(x + 3*s, y - 1*s, x + 9*s, y - 1*s, { ...w, seed: 51 })
    rc.line(x + 3*s, y + 2*s, x + 9*s, y + 2*s, { ...w, seed: 52 })
    rc.line(x + 3*s, y + 5*s, x + 7*s, y + 5*s, { ...w, seed: 53 })
    rc.rectangle(x + 6*s, y - 7*s, 4*s, 4*s, { ...w, fill: BG, fillStyle: 'solid', seed: 54 })
  },

  stamp_frame: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    rc.rectangle(x - 9*s, y - 11*s, 18*s, 22*s, fo)
    var bgc = { stroke: BG, fill: BG, fillStyle: 'solid', strokeWidth: 0.3*s, roughness: 0.2, disableMultiStroke: true }
    for (var i = -8; i <= 8; i += 4) {
      rc.circle(x - 9*s, y + i*s, 2.5*s, { ...bgc, seed: 60+i })
      rc.circle(x + 9*s, y + i*s, 2.5*s, { ...bgc, seed: 70+i })
    }
    for (var i = -6; i <= 6; i += 4) {
      rc.circle(x + i*s, y - 11*s, 2.5*s, { ...bgc, seed: 80+i })
      rc.circle(x + i*s, y + 11*s, 2.5*s, { ...bgc, seed: 90+i })
    }
  },

  // ═══ Trinket ═══

  envelope: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    var w = { stroke: BG, strokeWidth: 1*s, roughness: 0.3, disableMultiStroke: true, seed: 42 }
    rc.rectangle(x - 12*s, y - 7*s, 24*s, 16*s, fo)
    rc.line(x - 12*s, y - 7*s, x, y + 3*s, { ...w, strokeWidth: 1.2*s, seed: 50 })
    rc.line(x + 12*s, y - 7*s, x, y + 3*s, { ...w, strokeWidth: 1.2*s, seed: 51 })
    rc.circle(x, y + 5*s, 3*s, { ...w, fill: BG, fillStyle: 'solid', seed: 52 })
  },

  key: function(rc, ctx, x, y, s, color) {
    var o = { stroke: color, strokeWidth: 1.2*s, roughness: 0.4, disableMultiStroke: true, seed: 42 }
    var fo = { ...o, fill: color, fillStyle: 'solid' }
    rc.circle(x, y - 7*s, 10*s, fo)
    rc.circle(x, y - 7*s, 4*s, { stroke: BG, fill: BG, fillStyle: 'solid', strokeWidth: 0.5*s, roughness: 0.3, disableMultiStroke: true, seed: 50 })
    rc.line(x, y - 2*s, x, y + 10*s, o)
    rc.line(x, y + 5*s, x + 3*s, y + 5*s, o)
    rc.line(x, y + 8*s, x + 4*s, y + 8*s, o)
  },

  bow: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    var w = { stroke: BG, strokeWidth: 0.8*s, roughness: 0.3, disableMultiStroke: true, seed: 42 }
    // left loop
    rc.ellipse(x - 7*s, y - 1*s, 12*s, 10*s, fo)
    // right loop
    rc.ellipse(x + 7*s, y - 1*s, 12*s, 10*s, fo)
    // center knot
    rc.circle(x, y, 5*s, fo)
    // negative space inside loops
    rc.ellipse(x - 7*s, y - 1*s, 5*s, 4*s, { ...w, fill: BG, fillStyle: 'solid', seed: 50 })
    rc.ellipse(x + 7*s, y - 1*s, 5*s, 4*s, { ...w, fill: BG, fillStyle: 'solid', seed: 51 })
    // tails
    rc.line(x - 2*s, y + 2*s, x - 6*s, y + 10*s, { stroke: color, strokeWidth: 1.5*s, roughness: 0.5, disableMultiStroke: true, seed: 52 })
    rc.line(x + 2*s, y + 2*s, x + 6*s, y + 10*s, { stroke: color, strokeWidth: 1.5*s, roughness: 0.5, disableMultiStroke: true, seed: 53 })
  },

  teacup: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    var w = { stroke: BG, strokeWidth: 0.8*s, roughness: 0.3, disableMultiStroke: true, seed: 42 }
    rc.rectangle(x - 7*s, y - 4*s, 14*s, 12*s, fo)
    rc.ellipse(x, y + 8*s, 10*s, 3*s, fo)
    rc.ellipse(x, y - 4*s, 14*s, 3*s, { ...w, fill: BG, fillStyle: 'solid', seed: 50 })
    rc.circle(x + 9*s, y + 1*s, 6*s, { stroke: color, strokeWidth: 1.2*s, roughness: 0.4, disableMultiStroke: true, seed: 51 })
    // steam
    rc.line(x - 2*s, y - 7*s, x - 1*s, y - 10*s, { stroke: color, strokeWidth: 0.6*s, roughness: 0.6, disableMultiStroke: true, seed: 52 })
    rc.line(x + 2*s, y - 8*s, x + 1*s, y - 11*s, { stroke: color, strokeWidth: 0.6*s, roughness: 0.6, disableMultiStroke: true, seed: 53 })
  },

  book: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    var w = { stroke: BG, strokeWidth: 0.6*s, roughness: 0.3, disableMultiStroke: true, seed: 42 }
    rc.rectangle(x - 8*s, y - 10*s, 16*s, 20*s, fo)
    rc.line(x - 8*s, y - 10*s, x - 8*s, y + 10*s, { stroke: color, strokeWidth: 2.5*s, roughness: 0.3, disableMultiStroke: true, seed: 50 })
    rc.rectangle(x - 6*s, y - 9*s, 13*s, 18*s, { ...w, fill: BG, fillStyle: 'solid', seed: 51 })
    rc.line(x - 3*s, y - 4*s, x + 4*s, y - 4*s, { stroke: color, strokeWidth: 0.6*s, roughness: 0.3, disableMultiStroke: true, seed: 52 })
    rc.line(x - 3*s, y - 2*s, x + 4*s, y - 2*s, { stroke: color, strokeWidth: 0.6*s, roughness: 0.3, disableMultiStroke: true, seed: 53 })
    rc.line(x - 3*s, y, x + 2*s, y, { stroke: color, strokeWidth: 0.6*s, roughness: 0.3, disableMultiStroke: true, seed: 54 })
  },

  candle: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    rc.rectangle(x - 4*s, y - 3*s, 8*s, 14*s, fo)
    rc.ellipse(x, y + 11*s, 12*s, 3*s, fo)
    rc.line(x, y - 3*s, x, y - 7*s, { stroke: color, strokeWidth: 0.8*s, roughness: 0.4, disableMultiStroke: true, seed: 50 })
    rc.ellipse(x, y - 9*s, 5*s, 7*s, fo)
    rc.ellipse(x, y - 10*s, 2*s, 3*s, { stroke: BG, fill: BG, fillStyle: 'solid', strokeWidth: 0.3*s, roughness: 0.3, disableMultiStroke: true, seed: 51 })
    rc.line(x - 3*s, y + 2*s, x + 3*s, y + 2*s, { stroke: BG, strokeWidth: 0.6*s, roughness: 0.3, disableMultiStroke: true, seed: 52 })
  },

  heart: function(rc, ctx, x, y, s, color) {
    var fo = { stroke: color, strokeWidth: 1*s, roughness: 0.4, disableMultiStroke: true, seed: 42, fill: color, fillStyle: 'solid' }
    rc.circle(x - 5*s, y - 3*s, 11*s, fo)
    rc.circle(x + 5*s, y - 3*s, 11*s, fo)
    var p = 'M '+(x-10.5*s)+' '+(y-1*s)+' L '+x+' '+(y+12*s)+' L '+(x+10.5*s)+' '+(y-1*s)+' Z'
    rc.path(p, fo)
    rc.ellipse(x, y - 2*s, 4*s, 3*s, { stroke: BG, fill: BG, fillStyle: 'solid', strokeWidth: 0.3*s, roughness: 0.3, disableMultiStroke: true, seed: 50 })
  },
}

export var stickerColors = [
  { id: 'rose', c: '#C48A7A', label: 'rose' },
  { id: 'pink', c: '#D0A0A0', label: 'pink' },
  { id: 'sky', c: '#7BA7BC', label: 'sky' },
  { id: 'sage', c: '#9BB89C', label: 'sage' },
  { id: 'lavender', c: '#C4A6D0', label: 'lavender' },
  { id: 'sand', c: '#D4B896', label: 'sand' },
  { id: 'grey', c: '#A09080', label: 'grey' },
]
