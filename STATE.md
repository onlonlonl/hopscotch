# Hopscotch · STATE

## 当前状态

Stamps 面板 v5 完成并上线。三个顶层 tab：

- **Stickers** — Flora / Frame / Trinket 三分类 + ➕ AI 生成入口。单色剪影 + 负空间画法，8 色切换（粉色默认）。
- **Patterns** — 11 种图案 × 8 色。拖到屋顶弹裁剪面板（拖动平移 + 右侧缩放条调密度），拖到空白处贴 80×54 横长方形。
- **Photos** — 上传照片 → 3:2 横向裁剪（拖动 + 缩放）→ 压缩 300×200 JPEG。➕ 添加，垃圾桶切换删除模式。

贴纸/图案/照片全部存 localStorage，不走 Supabase。首页任意位置自由放置，长按 400ms 拖动，拖到底部蓝色垃圾桶删除。

AI 生成改为浏览器直连 DeepSeek，key 在设置面板配置（存 localStorage）。

## 下一步

- AI 生成对复杂构图（多物体 + 连接关系）效果有限，只有 4 种图元。可考虑增加 path 图元或换模型。
- 屋顶 pattern 目前只能整体替换，不能叠加多个。
- Ink 视图的 MapStampsPanel 仍是 v4 老版（Rhythm/Melody/Echo 地点图标），与首页 StampsPanel 完全独立。

## 契约

- **贴纸 recipe 签名**：`(rc, ctx, x, y, s, color)` — 与 IconGallery 一致。单色填充 + `#FAF6F0` 背景色挖负空间。
- **AI recipe 格式**：shapes 数组，颜色只能是 `"MAIN"` / `"BG"` 两个字面量，前端替换。线宽 `sw` 限 0.5–1.3。
- **localStorage keys**：`hopscotch_stickers` / `hopscotch_patterns` / `hopscotch_photo_stickers` / `hopscotch_ai_stickers` / `hopscotch_roof_pattern` / `hopscotch_ai_key`
- **pattern 渲染**：`renderPatternFill(canvas, patternId, colorId, w, h, offX, offY, tileSize)`，tile 默认 18px。
- **部署目录**：`~/work/hopscotch/`（不是 hopscotch-map），vite base 为 `/hopscotch/`。

## 坑

- **部署目录搞错过**：VPS 上有 `~/work/hopscotch/` 和 `~/work/hopscotch-map/` 两个目录，nginx 服务的是前者。往 hopscotch-map 部署了好几轮都没生效。
- **MapCell 吞点击**：cell 的 canvas 盖在 HopscotchCanvas 上，没有 `pointerEvents: 'none'` 就会挡住格子点击，导致进不去 Ink 视图。其他 cell 要么有 pointerEvents none，要么有自己的 onClick。
- **Service worker 缓存**：改完部署后旧 JS 还在缓存里，看不到更新。改 `public/sw.js` 的 `CACHE` 版本号强制失效，或用设置里的 Clear & Reload。
- **拖拽 vs 滑动冲突**：面板里直接用 onTouchStart 触发拖拽会让滚动也变成拖拽。改成「先点选，再上滑超过 25px 才拖」。
- **放置元素要 z-index**：placed sticker 没有 z-index 会被格子内容盖住，长按无反应。
- **Rough.js tile 太小会糊**：pattern tile 低于 16px 时笔触没空间渲染，模糊。18px 是密度与清晰度的平衡点。
- **files 表写 JSX**：dollar quoting 里含 `$` 的 JS 模板字符串会撞 tag，改用 Python 脚本 + str.replace 更稳。
