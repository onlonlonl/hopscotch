import re

with open('src/components/LocationCard.jsx', 'r') as f:
    s = f.read()

# Add activeDim prop
s = s.replace(
    '{ location, position, onClose, weatherDraw, weatherColor, weatherType }',
    '{ location, position, onClose, weatherDraw, weatherColor, weatherType, activeDim }'
)

# Badge 1: Thread (activeDim===1 should highlight)
s = s.replace(
    "// Badge 1: Thread\n    var bx = 0, by = 0\n    rc.rectangle(bx, by, unitW, bh, ro({stroke: c, strokeWidth: 0.8}))",
    "// Badge 1: Thread\n    var bx = 0, by = 0\n    var thC = activeDim===1 ? c : '#D0C8C0'\n    rc.rectangle(bx, by, unitW, bh, ro({stroke: thC, strokeWidth: activeDim===1 ? 0.8 : 0.6}))"
)

# Badge 2: Ink (activeDim===0 should highlight)
s = s.replace(
    "// Badge 2: Ink\n    bx = unitW + gap\n    rc.rectangle(bx, by, unitW, bh, ro({stroke: '#D0C8C0', strokeWidth: 0.6}))",
    "// Badge 2: Ink\n    bx = unitW + gap\n    var inC = activeDim===0 ? c : '#D0C8C0'\n    rc.rectangle(bx, by, unitW, bh, ro({stroke: inC, strokeWidth: activeDim===0 ? 0.8 : 0.6}))"
)

# Badge 3: Compass (activeDim===2 should highlight)
s = s.replace(
    "// Badge 3: Compass\n    bx = (unitW + gap) * 2\n    rc.rectangle(bx, by, unitW, bh, ro({stroke: '#D0C8C0', strokeWidth: 0.6}))",
    "// Badge 3: Compass\n    bx = (unitW + gap) * 2\n    var coC = activeDim===2 ? c : '#D0C8C0'\n    rc.rectangle(bx, by, unitW, bh, ro({stroke: coC, strokeWidth: activeDim===2 ? 0.8 : 0.6}))"
)

with open('src/components/LocationCard.jsx', 'w') as f:
    f.write(s)

# verify
count = s.count('activeDim')
print(f'activeDim appears {count} times - OK' if count >= 4 else f'WARNING: only {count} occurrences')
