# Hopscotch · STATE

## 当前状态
三个维度基本可用。Thread 维度完成重写：Three.js 丝线替换为 Rough.js 三线手绘 ∞，浅色纸面背景，CSS 3D 旋转，底部导航面板（滑动吸附 + 点击跳转），选中高亮 + 呼吸动画。LocationCard 加了三维度小徽章（Thread/Ink/Compass）。Compass 维度有基本功能（天气图标、LocationCard、经纬度投影）。

## 下一步
1. 真机验证：维度切换按钮和 Thread 面板是否重叠，LocationCard 在各维度的定位
2. 接 Supabase 真实数据（三个维度共用，替换 App.jsx 里的 mock）
3. Compass 视觉微调 + 缩放/平移交互
4. 检查 Three.js 是否可从 package.json 移除（Compass 是否依赖）
5. Stamps 生成器、时间色系全屏模式、PWA

## 契约
- 配色：Design Brief 2026-07-16 定稿色板（tokens.js）
- 跳房子主页永远 #E0E8F0 淡蓝底，时间色系只在地图全屏模式
- Rough.js: disableMultiStroke:true, roughness 0.5, bowing 0.8
- 字体：DotGothic16 全局统一
- 跳房子坐标：180x180 画布，从 icon v11 提取的精确多边形
- locations 表新增字段：display_name, story_name, story, lux_note, color, category, icon_type, lux_x, lux_y
- Supabase 连接信息走 URL hash
- Thread 画法：3 条 Rough.js 曲线叠加（seed 1/13/25，yOff -3/0/3.5），颜色 spread = 0.005 + inf_w * 0.012
- Thread 背景：#FAF6F0 基准，极微妙时间色温（晚间偏冷几个 RGB 值）
- LocationCard 统一使用，Thread 模式下居中显示，卡片底部有三维度小徽章

## 坑
- Rough.js 默认 multiStroke 放大后变重线，必须 disableMultiStroke:true
- CDN 在中国被墙，rough.js 必须 npm install 打包
- 装饰物坐标是 180x180 空间的，缩放后要确认没跑出屏幕
- Three.js 的暗色 ∞ 效果很好但和其他维度风格不统一，最终选 Rough.js 纸面风
- CSS 3D perspective 旋转可以模拟纸面翻转，不需要真 3D 引擎
- highlight canvas 用 rough.js 画圆环在透明底上会显示为黑块，改为重画对应线段
- files 表写长文件比 commands 表可靠（commands 有 30s 超时 + result 截断）
