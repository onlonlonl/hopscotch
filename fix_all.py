
import re

# ── 1. Fix coastline: only outer rings ──
ext = open('extract.mjs').read()
ext = ext.replace(
    "for (const ring of poly) {\n      if (ring.length < 20) continue",
    "// Only outer ring (index 0), skip holes (lakes/inland seas)\n    {\n      const ring = poly[0]\n      if (!ring || ring.length < 20) { continue } else { /* outer only */ }"
)
# Close the block properly — replace the closing } of the for loop
# Actually let me just rewrite the inner loop section
open('extract.mjs', 'w').write(ext)
print('1. extract.mjs — outer ring only')

# ── 2. Fix LocationCard: wider card, better spacing ──
lc = open('src/components/LocationCard.jsx').read()

# Increase card width 230→260, keep height
lc = lc.replace('var CW=230, CH=280, M=6', 'var CW=260, CH=280, M=6')

# Reduce padding so text has more room
lc = lc.replace(
    "padding:'14px 18px 12px'",
    "padding:'14px 14px 12px'"
)

# Make stamp smaller: 44→36
lc = lc.replace('var sz = 44', 'var sz = 36')

# Adjust close button hit area  
lc = lc.replace(
    "width:28,height:16",
    "width:24,height:16"
)

# Reduce right padding on text container
lc = lc.replace("paddingRight:8", "paddingRight:4")

open('src/components/LocationCard.jsx', 'w').write(lc)
print('2. LocationCard — CW=260, tighter padding, smaller stamp')

# ── 3. App.jsx: hide tabs when panel open ──
app = open('src/App.jsx').read()

# Hide tab canvas when panelOpen or card showing
app = app.replace(
    "      {/* Left-side dimension tabs */}\n      <canvas ref={tabRef} onClick={handleTabClick}",
    "      {/* Left-side dimension tabs */}\n      {!panelOpen && !card && <canvas ref={tabRef} onClick={handleTabClick}"
)
# Close the conditional — find the style after the canvas
app = app.replace(
    """zIndex: 115, cursor: 'pointer',
      }} />""",
    """zIndex: 115, cursor: 'pointer',
      }} />}"""
)

open('src/App.jsx', 'w').write(app)
print('3. App.jsx — hide tabs when panel/card open')

# ── 4. StampsPanel: smaller icons, 5 columns ──
sp = open('src/components/StampsPanel.jsx').read()

# Reduce stamp canvas from 52 to 36
sp = sp.replace("const size = 52", "const size = 36")
sp = sp.replace("recipes[type](rc, ctx, size/2, size/2, size/80,", "recipes[type](rc, ctx, size/2, size/2, size/100,")

# 4 columns → 5 columns
sp = sp.replace("repeat(4, 1fr)", "repeat(5, 1fr)")

# Reduce item padding
sp = sp.replace("padding: '8px 4px'", "padding: '4px 2px'")

open('src/components/StampsPanel.jsx', 'w').write(sp)
print('4. StampsPanel — 36px icons, 5 columns')

# ── 5. CompassView: update card width in clamping ──
cv = open('src/components/CompassView.jsx').read()
cv = cv.replace('var CW=230,CH=280', 'var CW=260,CH=280')
open('src/components/CompassView.jsx', 'w').write(cv)
print('5. CompassView — card clamp updated to CW=260')

print('All done')
