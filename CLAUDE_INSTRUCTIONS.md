# Hopscotch — Instructions for Claude (via Supabase MCP)

## Project Info
- Supabase Project ID: `YOUR_PROJECT_ID`
- Use `Supabase:execute_sql` tool to read/write

## Tables

- `locations` — places with coordinates, icons, weather, dual naming, and position data for three views
- `hopscotch_elements` — stickers and photos placed on the board (zone: 'roof' or 'free')
- `hopscotch_garden` — the currently growing plant (stamps = growth events)
- `hopscotch_shelf` — harvested plants archive
- `hopscotch_notes` — shared message board
- `hopscotch_roof` — roof configuration (id=1)
- `hopscotch_stickers` — AI-generated sticker recipes
- `settings` — key-value store; keys: `hopscotch_connections` (Ink view connection lines), `hopscotch_city` (Compass default center)

## Three Views

The same locations appear in three spatial views. Each view reads different fields from `locations`:

| View | What it shows | Fields used |
|------|--------------|-------------|
| **Ink** | Psychological distance map. Hand-drawn infinite canvas, home at center. | `lux_x`, `lux_y` (canvas position) |
| **Thread** | Lemniscate (∞) curve. Locations dye segments of the curve with their weather color. | `inf_t` (position 0–1 on curve), `inf_w` (color spread width) |
| **Compass** | Real Leaflet map with hand-drawn weather icons as markers. | `lng`, `lat` |

## Weather

Each location has a `weather` field that determines its color across all views. Weather is not real-time data — it's a metaphorical reading of the place's atmosphere.

Available weather types:
`sun` · `warm` · `glow` · `moon` · `drizzle` · `rain` · `storm` · `plum` · `cloudy` · `overcast` · `fog` · `wind` · `breeze` · `humid` · `snow` · `frost` · `hail` · `rainbow` · `starry` · `dust` · `petals`

## Location Icon Types

`house` · `building` · `train` · `plane` · `shop` · `school` · `hospital` · `cafe` · `restaurant` · `bar` · `park` · `mountain` · `beach` · `hotel` · `cinema` · `torii` · `temple` · `church` · `flag` · `heart`

## Operations

### Add a new location
```sql
INSERT INTO locations (id, label, name, city, address, lng, lat, icon_type, weather, color, scale, ink_name_lux, lux_x, lux_y, inf_t, inf_w)
VALUES ('place-id', '显示名', '地点全名', '城市', '地址', '经度', '纬度', 'cafe', 'breeze', '#78A880', 0.9, 'Lux给的名字', 0.3, -0.2, 0.6, 0.5);
```

### Give a location its Lux name
```sql
UPDATE locations SET ink_name_lux = '名字' WHERE id = 'place-id';
```

### Set weather for a location
```sql
UPDATE locations SET weather = 'drizzle' WHERE id = 'place-id';
```

### Update Ink view connections
```sql
-- Read current connections first
SELECT value FROM settings WHERE key = 'hopscotch_connections';
-- Then write back the full updated array
UPDATE settings SET value = '[["home","cafe"],["home","office"],["home","new-place"]]'
WHERE key = 'hopscotch_connections';
```

### Leave a note
```sql
INSERT INTO hopscotch_notes (content, author, clip_color)
VALUES ('想说的话', 'lux', '#7BA7BC');
```

### Read notes
```sql
SELECT content, author, clip_color, created_at
FROM hopscotch_notes ORDER BY created_at DESC;
```

### Check garden status
```sql
SELECT plant_name, planted_at, stamps, milestones FROM hopscotch_garden;
```

### View all locations
```sql
SELECT id, label, ink_name_iris, ink_name_lux, icon_type, weather, category
FROM locations ORDER BY created_at;
```

### View stickers
```sql
SELECT id, name, category, author, status FROM hopscotch_stickers;
```

## Notes

- `ink_name_iris` is the human's name for a place; `ink_name_lux` is yours. Both show on the map.
- Weather is a feeling, not a forecast. Pick the weather type that matches how a place feels to you.
- The `color` field on locations is a fallback; if `weather` is set, the weather color takes precedence.
- Connections in Ink view are pairs of location IDs: `[["home","cafe"],["home","office"]]`.
- The board's four cells (Map, Weather, Notes, Garden) can be rearranged by the user — no fixed order.
