
# ── 1. Revert StampsPanel: 52px icons, 4 columns, original padding ──
sp = open('src/components/StampsPanel.jsx').read()
sp = sp.replace("const size = 36", "const size = 52")
sp = sp.replace("size/100,", "size/80,")
sp = sp.replace("repeat(5, 1fr)", "repeat(4, 1fr)")
sp = sp.replace("padding: '4px 2px'", "padding: '8px 4px'")
open('src/components/StampsPanel.jsx', 'w').write(sp)
print('1. StampsPanel reverted to 52px/4col')

# ── 2. App.jsx: fix tab — always render, CSS hide; don't wrap in conditional ──
app = open('src/App.jsx').read()

# Replace conditional render with always-render + CSS display
app = app.replace(
    "{!panelOpen && !card && <canvas ref={tabRef} onClick={handleTabClick}",
    "<canvas ref={tabRef} onClick={handleTabClick}"
)
# Remove the extra closing }
app = app.replace(
    """zIndex: 115, cursor: 'pointer',
      }} />}""",
    """zIndex: 115, cursor: 'pointer',
        display: panelOpen || card ? 'none' : 'block',
      }} />"""
)

# Also add panelOpen and card to the useEffect deps for tab redraw
app = app.replace(
    "  }, [view, dimIndex])",
    "  }, [view, dimIndex, panelOpen, card])"
)

open('src/App.jsx', 'w').write(app)
print('2. App.jsx: tabs always mounted, CSS hide, redraw on panel/card change')

# ── 3. HandDrawnMap: remove errands text from map ──
hm = open('src/components/HandDrawnMap.jsx').read()

# Remove the errands drawing block (lines ~124-127)
hm = hm.replace(
    """      if (loc.errands > 0) {
        ctx.font = '600 ' + (8*s) + 'px -apple-system,PingFang SC,sans-serif'
        ctx.fillStyle = '#8A7A68'
        ctx.fillText(loc.errands + '\u00d7', x, y + 26 * s)
      }""",
    "      /* errands count moved to LocationCard */"
)

open('src/components/HandDrawnMap.jsx', 'w').write(hm)
print('3. HandDrawnMap: removed errands text overlay')

# ── 4. LocationCard: add errands info below display_name ──
lc = open('src/components/LocationCard.jsx').read()

# After display_name div, add errands line
lc = lc.replace(
    """<div style={{fontSize:11,color:'#A09888',marginTop:3}}>{displayName}</div>""",
    """<div style={{fontSize:11,color:'#A09888',marginTop:3}}>{displayName}</div>
            {loc.errands > 0 && <div style={{fontSize:9,color:'#B8B0A0',marginTop:2}}>{loc.errands + ' errands'}</div>}"""
)

open('src/components/LocationCard.jsx', 'w').write(lc)
print('4. LocationCard: added errands info')

# ── 5. Verify card width is 260 ──
if 'CW=260' in lc:
    print('5. Card CW=260 confirmed')
else:
    print('5. WARNING: Card CW not 260!')

print('All fixes applied')
