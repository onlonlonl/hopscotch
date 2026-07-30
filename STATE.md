# Hopscotch · STATE

## 当前状态

Stamps 面板 v5 完成并上线。三个顶层 tab：

- **Stickers** — Flora / Frame / Trinket 三分类 + ➕ AI 生成入口。单色剪影 + 负空间画法，8 色切换（粉色默认）。
- **Patterns** — 11 种图案 × 8 色。拖到屋顶弹裁剪面板（拖动平移 + 右侧缩放条调密度），拖到空白处贴 80×54 横长方形。
- **Photos** — 上传照片 → 3:2 横向裁剪（拖动 + 缩放）→ 压缩 300×200 JPEG。➕ 添加，垃圾桶切换删除模式。

贴纸/图案/照片全部存 localStorage，不走 Supabase。首页任意位置自由放置，长按 400ms 拖动，拖到底部蓝色垃圾桶删除。

AI 生成改为浏览器直连 DeepSeek，key 在设置面板配置（存 localStorage）。

### 2026-07-31 这一轮（连接页 / 性能 / POI）

线上 = repo = `237d11d`，Pages 与 VPS 同步。

- **部署链路修复**：Actions 上 `npm ci` 撞 npm bug（详见「坑」），改用 pnpm。此前白屏约 1.5 小时。
- **连接页**：`ConnectPage.jsx`，纯白底 + 图标 + SUPABASE URL / ANON KEY 两个输入框 + Enter。
  点 Enter 会真的请求一次 `/rest/v1/locations?limit=1`，通了才保存进入。
  **repo 里不再有硬编码的 project URL**（fork 友好），旧的 `#key=xxx` 单参数链接因此失效，
  hash 需写全 `#url=...&key=...`；手填一次会记进 localStorage，之后裸链接即可。
- **性能**：首屏 JS 520KB → 286KB（gzip 152 → 88）。七个组件改 `React.lazy`。
  `index.html` 内联骨架屏，HTML 到达即可见。
- **POI 选点**：`PoiPicker.jsx`，新增地点 / 卡片聚合编辑 / LocationCard 编辑三处复用。
- **Backup**：设置面板可 EXPORT / IMPORT 六个 `hopscotch_*` localStorage 键
  （换域名时搬贴纸用，浏览器 origin 隔离，VPS 与 Pages 不互通）。

## 下一步

**待验证（2026-07-31 收口时 Iris 尚未逐项确认）**
- Re-pin 选中后地点是否真的移到新坐标（依赖 hopscotch.py 返回 location 的改动配合）
- POI 搜索改按 id 轮询后，是否还会出现 nothing found / 选中对不上
- 主屏幕图标实际显示效果（见「坑」里的图标对比度）

**已知待办**
- `LocationCard` 的 Re-pin 成功提示是「已发出」不是「已确认」——`App.jsx` 的
  `handleLocationSave` 是 fire-and-forget，要真确认得让它返回 Promise（会动公共函数）。
- 本地缓存优先（打开先渲染上次数据，网络回来再替换）。Iris 确认过数据都是新增不是更新，
  所以缓存不会显示错误内容。天气可用「缓存抓取时间是否晚于今天最近一次 cron(07:00/18:00)」判断是否新鲜。
- rough.js 重绘优化：形状没变时不应重算 drawable。
- VPS 上 `~/work/hopscotch-map/` 是废弃目录，`~/work/hopscotch/` 是现役 nginx 部署目录。
  确认无 nginx location 指向前者后可删。
- **`~/lucid` 不是 git 仓库**，见 context_docs(infra) 同名条目，需单独开对话处理，注意 .gitignore 顺序。

**原有待办（未动）**
- AI 生成对复杂构图（多物体 + 连接关系）效果有限，只有 4 种图元。可考虑增加 path 图元或换模型。
- 屋顶 pattern 目前只能整体替换，不能叠加多个。
- Ink 视图的 MapStampsPanel 仍是 v4 老版（Rhythm/Melody/Echo 地点图标），与首页 StampsPanel 完全独立。

## 契约

- **贴纸 recipe 签名**：`(rc, ctx, x, y, s, color)` — 与 IconGallery 一致。单色填充 + `#FAF6F0` 背景色挖负空间。
- **AI recipe 格式**：shapes 数组，颜色只能是 `"MAIN"` / `"BG"` 两个字面量，前端替换。线宽 `sw` 限 0.5–1.3。
- **localStorage keys**：`hopscotch_stickers` / `hopscotch_patterns` / `hopscotch_photo_stickers` / `hopscotch_ai_stickers` / `hopscotch_roof_pattern` / `hopscotch_ai_key`
- **pattern 渲染**：`renderPatternFill(canvas, patternId, colorId, w, h, offX, offY, tileSize)`，tile 默认 18px。
- **部署**：GitHub Pages，来源为 Actions workflow（`.github/workflows/deploy.yml`），push main 即构建上线，产物 `dist`。vite base 为 `/hopscotch/`。构建用 **pnpm**，不要改回 npm（见坑）。线上 https://onlonlonl.github.io/hopscotch/

- **PoiPicker 是三处共用的**（新增 / 卡片聚合编辑 / LocationCard 编辑）。改它等于同时改三处，
  这是刻意的：以前 POI 逻辑只长在「新增」里，复制到别处必然走样。
  `onPick(poi)` 由调用方决定写什么；若返回 Promise，组件会等它完成再报成功。
  `tone="warm"` 走 LocationCard 的暖棕，默认走卡片面板的蓝灰。
- **Re-pin 只写 `lng` / `lat` / `address`**，`label` 和 `ink_name_iris` 绝不覆盖
  （Iris 定的：自己起的名字是私人的，重选 POI 是为了修正坐标）。由 `poiToGeoPatch()` 统一保证，
  三处都必须走它，不要自己拼 patch。
- **`data-noswipe="1"`**：卡片内部任何不该触发卡片手势的区域都要打这个标记。
  `onCardTouchStart` 见到就完全不参与手势。编辑表单和 PoiPicker 已带。
- **连接信息**：`hopscotch_supa_url` / `hopscotch_supa_key` 存 localStorage，
  hash 支持 `#url=...&key=...`，带 hash 打开会记住。代码里没有默认 URL。

## 坑

- **部署目录搞错过**：VPS 上有 `~/work/hopscotch/` 和 `~/work/hopscotch-map/` 两个目录，nginx 服务的是前者。往 hopscotch-map 部署了好几轮都没生效。
- **MapCell 吞点击**：cell 的 canvas 盖在 HopscotchCanvas 上，没有 `pointerEvents: 'none'` 就会挡住格子点击，导致进不去 Ink 视图。其他 cell 要么有 pointerEvents none，要么有自己的 onClick。
- **Service worker 缓存**：改完部署后旧 JS 还在缓存里，看不到更新。改 `public/sw.js` 的 `CACHE` 版本号强制失效，或用设置里的 Clear & Reload。
- **拖拽 vs 滑动冲突**：面板里直接用 onTouchStart 触发拖拽会让滚动也变成拖拽。改成「先点选，再上滑超过 25px 才拖」。
- **放置元素要 z-index**：placed sticker 没有 z-index 会被格子内容盖住，长按无反应。
- **Rough.js tile 太小会糊**：pattern tile 低于 16px 时笔触没空间渲染，模糊。18px 是密度与清晰度的平衡点。
- **files 表写 JSX**：dollar quoting 里含 `$` 的 JS 模板字符串会撞 tag，改用 Python 脚本 + str.replace 更稳。
- **设置面板是固定 224x366 且手绘边框画死在 canvas 上**。往里加内容超出后既不显示也没有溢出痕迹
  （加 Backup 后 Cache / About 就这样消失了，肉眼完全看不出下面还有东西）。现已给内容区加 overflowY。
- **读后写的竞态**：`service_requests` 这类「写一条请求 → 等 → 读结果」的模式，
  必须按 `supaPost` 返回的 id 读自己那条。取「最新一条」会在后端没跑完时读到 null，
  并发时读到别人的结果（表现为「有时搜不到、有时选中的地点对不上」）。
- **`e.preventDefault()` 在 React 的 touchmove 里无效**（React 18 注册成 passive），
  横向滑动要靠 CSS `touch-action`，不要靠 JS 阻止。
- **触控目标别小于 44x44**。LocationCard 的编辑蜡笔原本只有 13x17，表现为「点不动」，
  很容易误判成逻辑坏了，其实只是点不中。
- **内层列表滚动会带动外层**：结果列表这类嵌套滚动要加 `overscroll-behavior: contain`，
  否则滚到底会把滚动传给父容器（iOS 16+ 支持）。
- **amap poi 曾剥离坐标**：`hopscotch.py` 原本 Sanitize 掉 `location`，
  导致新增地点一直存 0,0。2026-07-31 按 Iris 决定改回返回坐标，见 decisions #12。

- **Actions 上 npm 装不了依赖**：runner 上 `npm ci` 会挂在 `Exit handler never called`（npm 自身 bug），**且该步骤在 UI 里显示 success**，但依赖只装一半，下一步 vite 找不到报 exit 127。已改用 pnpm（`pnpm/action-setup@v4` + `pnpm install --frozen-lockfile`），不要改回 npm。lockfile 用 `npx -y pnpm@9 import` 从 package-lock 生成。
- **push 成功 ≠ 上线**：2026-07-29 白屏 1.5 小时，就是因为 push 后只看 commit 没查 Actions conclusion。构建类改动必须验证线上产物：`curl` 首页拿到 200 后，再取页面里的 `assets/*.js` 确认也是 200。
- **重复的 style key**：`MapStampsPanel` 里 `transition` 写了两次，后者覆盖前者，面板高度动画静默失效。vite 构建会以 warning 报 Duplicate key，不会中断构建，容易被忽略。
