# Hopscotch · STATE

## 当前状态
三维度 + 世界地图完成（2026-07-24）。Compass：50m Chaikin 海岸线全世界轮廓、海洋蓝灰/陆地暖白、反经线分段、等距圆柱投影锚定东亚、比例尺、天气图标。Tab 改左侧 Rough.js canvas。返回按钮 Rough.js。LocationCard 支持 activeDim badge 高亮 + errands 显示，宽度 260。

## 下一步
1. 卡片布局修复（需截图定位）
2. StampsPanel Rough.js 风格化（面板/tab/按钮，不动 20 个图标）
3. Ink 地图缩放平移（CSS transform + touch，同 Compass 做法）
4. Ink 地图图标缩小
5. Supabase 持久化（替换 mock）
6. 时间色系（暂缓）
7. PWA

## 契约
- 海岸线：world-atlas 50m + Chaikin 1 迭代 + 只取外环，325 多边形 ~18K 点 ~232KB
- 投影：MW=1080 MH=540 DS=3px/degree，初始 lng=110 lat=28
- 缩放 0.15x–8x，CSS transform（手势不重绘）
- 海洋 #C8D4DC，陆地 #F0ECE4，海岸线 #B8B0A0 sw:0.3
- 天气图标：离屏 60×60 → drawImage 20×20
- LocationCard CW=260 CH=280，activeDim 控制 badge
- 左侧 tab：32×108 canvas，CSS display hide，deps 含 panelOpen/card
- errands 在卡片显示，不在地图上
- 反经线：lng 差 >180° 分段画

## 坑
- 50m + Chaikin 2 迭代 = 1.2MB → 1 迭代 + 跳 <20 点 = 232KB
- rc.polygon 跨反经线画横条 → 分段
- 条件渲染 canvas 丢绘制 → CSS display
- 离屏 canvas rough.js 可行，每地点新建 ok（<10 个）
- StampsPanel 图标大小是面板内用的，不是地图上的
