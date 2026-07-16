// === Hopscotch Design Tokens ===
// From Design Brief 2026-07-16 color definitive palette

export const palette = {
  OCEAN:    '#2E94B9',
  SKY:      '#3BA5C9',
  LEAF:     '#4AAF5C',
  MEADOW:   '#6BC47A',
  EARTH:    '#7A5C3C',
  SUNLIGHT: '#ECC44E',
  CLOUD:    '#F0F0EC',
  CORAL:    '#E8A87C',
  FOG_BLUE: '#7BA7BC',
  SAGE:     '#9BB89C',
  LAVENDER: '#C4A6D0',
  SAND:     '#D4B896',
  MIST:     '#B8C4D0',
  ROSE:     '#D0A0A0',
  MOSS:     '#A8B89A',
}

export const timeThemes = {
  dawn:      { bg: '#F2DFE0', accent: '#D0A0A0', hours: [5, 7] },
  morning:   { bg: '#F2F4EE', accent: '#4AAF5C', hours: [7, 12] },
  afternoon: { bg: '#F5F0E6', accent: '#2E94B9', hours: [12, 17] },
  dusk:      { bg: '#F0C8B8', accent: '#D87860', hours: [17, 19] },
  night:     { bg: '#4A5878', accent: '#C8D8EC', hours: [19, 23] },
  latenight: { bg: '#303858', accent: '#D8A8A8', hours: [23, 5] },
}

export const HOPSCOTCH_BG = '#E0E8F0'

export const grid = {
  cx: 90,
  d_left: 58, d_right: 122,
  s_left: 75, s_right: 105,
  y0: 45, y1: 69, y2: 91, y3: 113, y4: 135,
  double_w: 64, single_w: 30, block_h: 22, tri_h: 24,
}

export const hopscotchPoly = [
  [grid.cx, grid.y0],
  [grid.d_right, grid.y1],
  [grid.s_right, grid.y1],
  [grid.s_right, grid.y2],
  [grid.d_right, grid.y2],
  [grid.d_right, grid.y3],
  [grid.s_right, grid.y3],
  [grid.s_right, grid.y4],
  [grid.s_left, grid.y4],
  [grid.s_left, grid.y3],
  [grid.d_left, grid.y3],
  [grid.d_left, grid.y2],
  [grid.s_left, grid.y2],
  [grid.s_left, grid.y1],
  [grid.d_left, grid.y1],
]

export const zones = {
  roof:     { x1: grid.d_left, y1: grid.y0, x2: grid.d_right, y2: grid.y1, label: '' },
  top:      { x1: grid.s_left, y1: grid.y1, x2: grid.s_right, y2: grid.y2, label: 'MAP' },
  midLeft:  { x1: grid.d_left, y1: grid.y2, x2: grid.cx,      y2: grid.y3, label: '' },
  midRight: { x1: grid.cx,     y1: grid.y2, x2: grid.d_right, y2: grid.y3, label: '' },
  center:   { x1: grid.s_left, y1: grid.y3, x2: grid.s_right, y2: grid.y4, label: '' },
}

export function getTimeTheme() {
  const h = new Date().getHours()
  for (const [key, t] of Object.entries(timeThemes)) {
    if (key === 'latenight') {
      if (h >= 23 || h < 5) return { key, ...t }
    } else {
      if (h >= t.hours[0] && h < t.hours[1]) return { key, ...t }
    }
  }
  return { key: 'morning', ...timeThemes.morning }
}