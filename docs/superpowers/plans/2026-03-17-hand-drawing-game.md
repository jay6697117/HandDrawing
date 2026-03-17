# 徒手画图大师 — 实现计划

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 构建一款移动端优先的徒手画图游戏，用户在 Canvas 上徒手画几何图形，系统计算相似度评分。

**架构：** Vue 3 + Vite + Canvas SPA，Vue Router 管理 4 个页面，Pinia 管理全局状态，Canvas API 实现画图和图形识别。

**技术栈：** Vite, Vue 3 (Composition API), Vue Router, Pinia, HTML5 Canvas, LocalStorage

**设计规格：** [2026-03-17-hand-drawing-game-design.md](file:///Users/zhangjinhui/Desktop/HandDrawing/docs/superpowers/specs/2026-03-17-hand-drawing-game-design.md)

---

## Task 1: 项目初始化

**文件：**
- 创建: `package.json`, `vite.config.js`, `index.html`
- 创建: `src/main.js`, `src/App.vue`
- 创建: `src/router/index.js`
- 创建: `src/assets/styles/main.css`

- [ ] **Step 1: 用 Vite 创建 Vue 3 项目**

```bash
cd /Users/zhangjinhui/Desktop/HandDrawing
npm create vite@latest ./ -- --template vue
```

> ⚠️ 如果提示目录非空，选择忽略已有文件继续

- [ ] **Step 2: 安装依赖**

```bash
cd /Users/zhangjinhui/Desktop/HandDrawing
npm install
npm install vue-router@4 pinia
```

- [ ] **Step 3: 配置 Vue Router**

创建 `src/router/index.js`，配置 4 个路由：
- `/` → HomeView
- `/levels` → LevelMapView
- `/draw/:shapeId` → DrawingView
- `/result/:shapeId` → ResultView

- [ ] **Step 4: 配置 Pinia 和 App.vue**

修改 `src/main.js` 引入 Router 和 Pinia。
修改 `src/App.vue` 添加 `<router-view>` 和页面过渡动画。

- [ ] **Step 5: 创建全局基础样式**

创建 `src/assets/styles/main.css`：
- 可爱卡通风配色变量（CSS Variables）
- 全局字体（Google Fonts: Nunito）
- 按钮、卡片等基础样式
- 移动端优先的响应式基础设置

- [ ] **Step 6: 验证项目启动**

```bash
cd /Users/zhangjinhui/Desktop/HandDrawing
npm run dev
```

在浏览器打开确认页面能正常显示。

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "feat: 初始化 Vue 3 + Vite 项目，配置 Router 和 Pinia"
```

---

## Task 2: 图形配置系统

**文件：**
- 创建: `src/config/shapes.js`

- [ ] **Step 1: 定义所有图形数据**

创建 `src/config/shapes.js`，包含 8 章 40 个图形的完整配置：

```javascript
// 每个图形定义结构
{
  id: 'circle',           // 唯一标识
  name: '圆形',           // 显示名称
  icon: '⭕',             // emoji 图标
  chapter: 1,             // 所属章节
  drawFn: (ctx, size) => {}, // 在 Canvas 上绘制标准图形的函数
  features: { ... }       // 几何特征参数（用于相似度计算）
}
```

包含 8 个章节、通关门槛配置（80%→45% 递减）。

- [ ] **Step 2: 提交**

```bash
git add src/config/shapes.js
git commit -m "feat: 添加 8 章 40 个图形的配置数据"
```

---

## Task 3: 状态管理（Pinia Store）

**文件：**
- 创建: `src/stores/game.js`
- 创建: `src/composables/useStorage.js`

- [ ] **Step 1: 实现 LocalStorage 存取逻辑**

创建 `src/composables/useStorage.js`：
- `saveProgress(data)` — 保存进度到 LocalStorage
- `loadProgress()` — 从 LocalStorage 读取进度
- `clearProgress()` — 清除进度

- [ ] **Step 2: 实现游戏状态管理**

创建 `src/stores/game.js`（Pinia store）：
- `state`: 当前解锁章节、每关最高分、是否通关
- `getters`: 获取某章所有关卡状态、判断章节是否解锁、获取总体进度
- `actions`: 提交成绩、解锁下一章、重置进度
- 自动同步 LocalStorage

- [ ] **Step 3: 提交**

```bash
git add src/stores/game.js src/composables/useStorage.js
git commit -m "feat: 实现 Pinia 游戏状态管理和 LocalStorage 持久化"
```

---

## Task 4: 首页（HomeView）

**文件：**
- 创建: `src/views/HomeView.vue`

- [ ] **Step 1: 实现首页 UI**

- 游戏标题「✏️ 徒手画图大师」+ 副标题
- 「🎮 开始游戏」大按钮（路由到 /levels）
- 底部「📊 最高成绩」和「⚙️ 设置」入口
- 卡通风格渐变背景 + 入场动画
- 移动端适配（全屏布局）

- [ ] **Step 2: 在浏览器中验证**

```bash
npm run dev
```

打开浏览器检查首页展示效果，检查移动端模拟。

- [ ] **Step 3: 提交**

```bash
git add src/views/HomeView.vue
git commit -m "feat: 实现首页 UI（卡通风）"
```

---

## Task 5: 关卡地图页（LevelMapView）

**文件：**
- 创建: `src/views/LevelMapView.vue`
- 创建: `src/components/LevelCard.vue`

- [ ] **Step 1: 实现关卡卡片组件**

创建 `src/components/LevelCard.vue`：
- 显示图形 emoji 图标 + 名称
- 显示历史最高相似度
- 已通关/未通关/锁定 三种视觉状态
- 点击跳转到画图页

- [ ] **Step 2: 实现关卡地图页**

创建 `src/views/LevelMapView.vue`：
- 按章节分组展示关卡
- 章节标题 + 通关门槛提示
- 未解锁章节显示 🔒 + 灰色蒙层
- 顶部返回首页按钮
- 网格布局（移动端 3 列，PC 端 5 列）

- [ ] **Step 3: 在浏览器中验证**

检查关卡展示、解锁状态、页面路由跳转。

- [ ] **Step 4: 提交**

```bash
git add src/views/LevelMapView.vue src/components/LevelCard.vue
git commit -m "feat: 实现关卡地图页和关卡卡片组件"
```

---

## Task 6: Canvas 画板核心组件

**文件：**
- 创建: `src/components/DrawingCanvas.vue`
- 创建: `src/composables/useDrawing.js`

- [ ] **Step 1: 实现画图逻辑 composable**

创建 `src/composables/useDrawing.js`：
- 管理 Canvas 上下文
- 监听 touch/mouse 事件，记录坐标点数组
- 实时绘制用户笔画（平滑线条）
- 提供 `clear()` 清除画布
- 提供 `getPoints()` 返回所有坐标点
- `touch-action: none` 防误触

- [ ] **Step 2: 实现 Canvas 画板组件**

创建 `src/components/DrawingCanvas.vue`：
- 响应式 Canvas（宽度自适应，保持正方形）
- 接收 `disabled` prop 控制是否可画
- 发射 `@drawing-complete` 事件
- 可选显示虚线参考网格
- 卡通风格边框和背景

- [ ] **Step 3: 在浏览器中验证**

在移动端模拟器和 PC 端测试画图体验：
- 触摸/鼠标画图是否流畅
- 画布是否自适应屏幕
- 清除功能是否工作

- [ ] **Step 4: 提交**

```bash
git add src/components/DrawingCanvas.vue src/composables/useDrawing.js
git commit -m "feat: 实现 Canvas 画板组件和画图逻辑"
```

---

## Task 7: 图形识别算法

**文件：**
- 创建: `src/utils/geometry.js`
- 创建: `src/utils/similarity.js`
- 创建: `src/composables/useRecognition.js`

- [ ] **Step 1: 实现几何计算工具函数**

创建 `src/utils/geometry.js`：
- `normalizePoints(points)` — 归一化坐标到 [0,1] 范围
- `smoothPoints(points, factor)` — 平滑去噪
- `findCorners(points, threshold)` — 检测拐角/顶点
- `calculateAngles(corners)` — 计算内角
- `calculateCurvature(points)` — 计算曲率
- `isClosedShape(points, threshold)` — 判断是否闭合
- `calculateSymmetry(points)` — 计算对称性

- [ ] **Step 2: 实现相似度算法**

创建 `src/utils/similarity.js`：
- `circleScore(points)` — 圆形相似度（曲率恒定+闭合）
- `polygonScore(points, targetSides)` — 多边形相似度（顶点数+边长+角度）
- `starScore(points, targetPoints)` — 星形相似度
- `curveScore(points, targetCurve)` — 曲线图形相似度
- `calculateSimilarity(points, shapeConfig)` — 统一入口，根据图形类型选择算法

- [ ] **Step 3: 实现识别 composable**

创建 `src/composables/useRecognition.js`：
- `recognize(points, targetShape)` — 接收坐标点和目标图形，返回相似度百分比
- 封装预处理 + 识别 + 评分的完整流程

- [ ] **Step 4: 手动测试识别效果**

在浏览器中画各种图形，检查识别结果是否合理：
- 画一个较好的圆，相似度应 > 70%
- 画一条直线当圆，相似度应 < 30%
- 画一个大致的三角形，相似度应在 50-80% 之间

- [ ] **Step 5: 提交**

```bash
git add src/utils/geometry.js src/utils/similarity.js src/composables/useRecognition.js
git commit -m "feat: 实现几何特征图形识别算法"
```

---

## Task 8: 画图界面（DrawingView）

**文件：**
- 创建: `src/views/DrawingView.vue`
- 创建: `src/components/ShapePreview.vue`

- [ ] **Step 1: 实现目标图形预览组件**

创建 `src/components/ShapePreview.vue`：
- 接收 `shapeId` prop
- 用小 Canvas 绘制标准图形（调用 shapes.js 中的 drawFn）
- 卡通风格圆角卡片展示

- [ ] **Step 2: 实现画图页面**

创建 `src/views/DrawingView.vue`：
- 顶部：返回按钮 + 关卡标题（"画一个 ⭕ 圆形"）
- 中部左上角：ShapePreview 小窗口显示目标图形
- 中部主区域：DrawingCanvas 画板
- 底部：「✅ 提交」和「🗑️ 清除」按钮
- 提交后调用 useRecognition，路由到结果页

- [ ] **Step 3: 在浏览器中验证**

完整测试画图流程：选关 → 看目标图形 → 画图 → 提交。

- [ ] **Step 4: 提交**

```bash
git add src/views/DrawingView.vue src/components/ShapePreview.vue
git commit -m "feat: 实现画图界面和目标图形预览"
```

---

## Task 9: 结果页（ResultView）

**文件：**
- 创建: `src/views/ResultView.vue`
- 创建: `src/components/SimilarityBar.vue`

- [ ] **Step 1: 实现相似度展示组件**

创建 `src/components/SimilarityBar.vue`：
- 动画数字从 0% 增长到实际百分比
- 环形进度条可视化
- 根据百分比变色（绿>70% / 黄40-70% / 红<40%）

- [ ] **Step 2: 实现结果页**

创建 `src/views/ResultView.vue`：
- 大字显示相似度百分比 + 动画
- 对比展示：用户画的 vs 标准图形（两个小 Canvas）
- 达到通关门槛：显示 🎉 庆祝动画 + 「下一关」按钮
- 未达标：显示鼓励文字 + 「再试一次」按钮
- 底部始终有「返回关卡」按钮
- 自动保存最高分到 Pinia store

- [ ] **Step 3: 在浏览器中验证**

完整测试：画图 → 提交 → 查看结果 → 再试/下一关。

- [ ] **Step 4: 提交**

```bash
git add src/views/ResultView.vue src/components/SimilarityBar.vue
git commit -m "feat: 实现结果页和相似度展示组件"
```

---

## Task 10: 整体联调与视觉优化

**文件：**
- 修改: 所有 views 和 components
- 修改: `src/assets/styles/main.css`

- [ ] **Step 1: 完整游戏流程联调**

测试完整用户流程：
1. 首页 → 点击开始
2. 关卡地图 → 选择第一章圆形
3. 画图界面 → 画一个圆 → 提交
4. 结果页 → 查看分数 → 再试一次 / 下一关
5. 通关第一章 → 第二章解锁

- [ ] **Step 2: 视觉优化**

- 页面切换过渡动画（slide/fade）
- 按钮点击反馈（scale + 波纹效果）
- 关卡解锁动画
- 庆祝动画（confetti 彩纸效果）
- 统一色彩和间距

- [ ] **Step 3: 移动端适配验证**

- iPhone SE 最小屏幕测试
- iPad 平板测试
- PC 浏览器测试（限制最大宽度 480px 居中）
- 横屏/竖屏切换处理

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: 整体联调和视觉优化"
```

---

## 验证计划

### 浏览器测试（使用浏览器工具）

1. **首页加载** — 打开 `http://localhost:5173`，确认首页正常展示
2. **关卡地图** — 点击开始游戏，确认关卡列表正确展示，第一章可用，后续章节锁定
3. **画图流程** — 选择圆形关卡，在画板上画图，确认触摸/鼠标事件正常
4. **提交评分** — 提交画作，确认跳转到结果页并显示合理的相似度百分比
5. **数据持久化** — 刷新页面后，确认通关进度保留
6. **移动端适配** — 使用 Chrome DevTools 模拟移动设备，确认布局正常

### 手动验证（需要用户协助）

1. 在手机浏览器上打开网址，测试触摸画图体验是否流畅
2. 测试各种图形的识别准确度是否合理
