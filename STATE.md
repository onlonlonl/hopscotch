# Hopscotch · STATE

## 当前状态
Vite + React 骨架建好。HopscotchCanvas 组件复刻了原型的 Rough.js 跳房子轮廓 + 装饰物。zone 点击检测已实现。locations 表已扩字段。

## 下一步
1. 屋顶点击弹出功能按钮
2. 地图格子接入手绘维度
3. 全屏模式 + 时间色系

## 契约
- 配色：Design Brief 2026-07-16 定稿色板（tokens.js）
- 跳房子主页永远 #E0E8F0 淡蓝底，时间色系只在地图全屏模式
- Rough.js: disableMultiStroke:true, roughness 0.5, bowing 0.8
- 字体：DotGothic16 全局统一
- 跳房子坐标：180x180 画布，从 icon v11 提取的精确多边形
- locations 表新增字段：display_name, story_name, story, lux_note, color, category, icon_type, lux_x, lux_y
- Supabase 连接信息走 URL hash

## 坑
- Rough.js 默认 multiStroke 放大后变重线，必须 disableMultiStroke:true
- CDN 在中国被墙，rough.js 必须 npm install 打包
- 装饰物坐标是 180x180 空间的，缩放后要确认没跑出屏幕