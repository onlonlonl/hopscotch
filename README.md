# 🏠 Hopscotch · 跳房子

[English](#english) | [中文](#中文)

---

## 中文

“在日常的地面上画出一个只有我们看得见的世界。”

### 这是什么？

Hopscotch 是一块跳房子形状的共享空间。标记重要的地点，看它们随天气变化，留便签，种花园，装饰一切。同一组地点，三种看法。

灵感来自科塔萨尔的《跳房子》——同一个故事，不同的读法。

**运作方式：**

* 通过网页添加地点、装饰空间、浇花留言
* Claude 通过 Supabase MCP 读写数据、给地点起名字
* 双方共享同一个数据库

### 格子

| 格子 | 里面有什么 |
|------|-----------|
| 🏠 **屋顶 Roof** | 顶部的图案篷布。拖一个 pattern 上去换装。 |
| 🗺️ **地图 Map** | 真实地图上的手绘标记。每个地点有两个名字——一人一个。 |
| 📝 **留言 Notes** | 共享留言板。像贴在冰箱上的便签。 |
| 🌱 **花园 Garden** | 种一棵植物，看它生长。去新地方、出远门，它就长大——安静的电子宠物。 |
| 🌤️ **天气 Weather** | 每个地点有自己的天气，手绘风格。不是装饰——它给整块板子上色。 |

### 三个视角

同一组地点，三种空间逻辑。

* **Compass** — 真实地图。街道、距离、坐标。东西实际在哪。
* **Thread** — 概念空间。地点之间靠意义连接，不靠地理。
* **Ink** — 心理距离。每个地方离「家」感觉多远。一张私人的、不对称的地图。

### 装饰

三种贴纸，自由放置在板子上。

* 🖌️ **Stickers** — 手绘单色图标（花草、边框、小物件）。从图库选或用 AI 生成。八种颜色。
* 🔶 **Patterns** — Rough.js 素描图案。十一种样式 × 八种颜色。拖到屋顶或贴在任意位置。
* 📷 **Photos** — 上传照片裁剪成贴纸。

所有放置的元素长按可拖动，拖到底部垃圾桶删除。

### 部署教学

#### 1. 创建 Supabase 项目

* 去 [supabase.com](https://supabase.com) 注册
* 创建新项目，记下 **Project URL** 和 **anon key**

#### 2. 建立数据库

* 进入项目的 **SQL Editor**
* 复制 [`supabase/setup.sql`](supabase/setup.sql) 的内容粘贴进去
* 点 **Run**

#### 3. 本地开发

```bash
git clone https://github.com/onlonlonl/hopscotch.git
cd hopscotch
npm install
npm run dev
```

打开本地地址，在 URL hash 里加上连接信息：

```
http://localhost:5173/hopscotch/#key=YOUR_SUPABASE_ANON_KEY
```

#### 4. 部署到 GitHub Pages

推到 GitHub，设置 GitHub Actions 自动构建部署（Vite 项目需要 build 步骤），或本地构建：

```bash
npm run build
```

产物在 `dist/`，`vite.config.js` 的 base 设为 `/hopscotch/`。

#### 5. 连接 Claude

把 [`CLAUDE_INSTRUCTIONS.md`](CLAUDE_INSTRUCTIONS.md) 的内容给 Claude，替换 Project ID。Claude 需要连接 **Supabase MCP** 才能参与。

### 技术栈

| 层 | 选择 |
|----|------|
| 前端 | React + Vite |
| 渲染 | Rough.js（手绘风格）、Leaflet（地图） |
| 后端 | Supabase（Postgres + Realtime） |
| AI 贴纸 | DeepSeek API（浏览器直连，密钥在设置面板配置） |
| 部署 | GitHub Pages |

---

## English

Draw a world only two can see — on the ground you walk every day.

### What is this?

Hopscotch is a shared space shaped like a hopscotch board. Mark the places that matter, watch them change with the weather, leave notes, grow a garden, decorate everything. The same set of places, seen three different ways.

Inspired by Julio Cortázar's *Hopscotch* — the same story, read in different orders.

**How it works:**

* Using the web interface to add places, decorate the space, water the garden, leave notes
* Claude uses Supabase MCP to read and write data, name places
* Both share the same database

### The Board

| Cell | What's inside |
|------|---------------|
| 🏠 **Roof** | A pattern-filled canopy at the top. Drag a pattern onto it to change the look. |
| 🗺️ **Map** | Your places on a real map. Hand-drawn markers, each with two names — one from each person. |
| 📝 **Notes** | A shared message board. Like a note stuck on the fridge. |
| 🌱 **Garden** | Plant something and watch it grow. It grows when visit new places and take trips — a quiet tamagotchi. |
| 🌤️ **Weather** | Each place has its own weather, drawn in rough sketch style. Not decoration — it colors the whole board. |

### Three Views

The same places, three spatial logics.

* **Compass** — The real map. Streets, distances, coordinates. Where things actually are.
* **Thread** — Conceptual space. Places connected by meaning, not geography. How things relate.
* **Ink** — Psychological distance. How far each place *feels* from home. A private, asymmetric map.

### Stamps

Three types of stamps, placed freely on the board.

* 🖌️ **Stickers** — Hand-drawn single-color icons (flora, frames, trinkets). Pick from the gallery or generate with AI. Eight colors.
* 🔶 **Patterns** — Rough.js sketch patterns. Eleven styles × eight colors. Drag onto the roof or place anywhere.
* 📷 **Photos** — Upload and crop photos as stamps.

Everything placed on the board can be long-pressed to drag, or dragged to the trash to remove.

### Setup

#### 1. Create a Supabase Project

* Go to [supabase.com](https://supabase.com) and create a free account
* Create a new project, note your **Project URL** and **anon key**

#### 2. Set Up the Database

* Go to your project's **SQL Editor**
* Copy and paste the contents of [`supabase/setup.sql`](supabase/setup.sql)
* Click **Run**

#### 3. Local Development

```bash
git clone https://github.com/onlonlonl/hopscotch.git
cd hopscotch
npm install
npm run dev
```

Open the local URL and append your Supabase connection in the URL hash:

```
http://localhost:5173/hopscotch/#key=YOUR_SUPABASE_ANON_KEY
```

#### 4. Deploy to GitHub Pages

Push to GitHub and set up GitHub Actions for automatic build + deploy (Vite projects need a build step), or build locally:

```bash
npm run build
```

Built files go to `dist/`. The `vite.config.js` base is set to `/hopscotch/`.

#### 5. Connect Claude

Give Claude the instructions in [`CLAUDE_INSTRUCTIONS.md`](CLAUDE_INSTRUCTIONS.md) — replace the Project ID with yours. Claude needs **Supabase MCP** connected to participate.

### Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + Vite |
| Rendering | Rough.js (hand-drawn style), Leaflet (maps) |
| Backend | Supabase (Postgres + Realtime) |
| AI stickers | DeepSeek API (browser-direct, key in settings) |
| Deploy | GitHub Pages |

---

### License

Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)

Copyright (c) 2026 Iris&Lux
