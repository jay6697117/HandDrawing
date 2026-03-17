import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Canvas 卡通画笔渲染引擎
 * 特性：速度压感 + Catmull-Rom 样条平滑 + 双层卡通描边
 */
export function useDrawing(canvasRef) {
  // 坐标点数组（含宽度信息）
  const points = ref([])
  // 是否正在画图
  const isDrawing = ref(false)
  // 是否有内容
  const hasContent = ref(false)

  let ctx = null
  let rect = null
  let lastTime = 0
  let lastSpeed = 0
  let animFrameId = null

  // ===== 画笔配置 =====
  const CONFIG = {
    // 线宽范围
    minWidth: 4,
    maxWidth: 14,
    // 描边层额外宽度
    outlineExtra: 5,
    // 速度压感参数
    speedSmoothing: 0.3,      // EMA 平滑系数（越小越平滑）
    speedToWidthFactor: 0.8,  // 速度对线宽的影响力
    // 颜色
    outlineColor: '#1a1a2e',  // 描边层（深色）
    fillColor: '#FF6B9D',     // 填充层（粉色卡通笔）
    // Catmull-Rom 张力参数
    tension: 0.5,             // 0.5 = 向心型
  }

  /**
   * 初始化 Canvas 上下文
   */
  function initCanvas() {
    if (!canvasRef.value) return
    const canvas = canvasRef.value
    ctx = canvas.getContext('2d')

    // 设置高清绘制
    const dpr = window.devicePixelRatio || 1
    rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // 基础画笔样式
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  /**
   * 获取事件坐标（兼容触摸和鼠标）
   */
  function getPosition(e) {
    if (!rect) rect = canvasRef.value.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  /**
   * 根据绘制速度计算线宽
   * 慢 → 粗，快 → 细
   */
  function calculateWidth(pos, prevPos, now) {
    if (!prevPos) return (CONFIG.minWidth + CONFIG.maxWidth) / 2

    const dx = pos.x - prevPos.x
    const dy = pos.y - prevPos.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const dt = Math.max(1, now - lastTime)
    const speed = dist / dt

    // EMA 平滑速度
    lastSpeed = lastSpeed * (1 - CONFIG.speedSmoothing) + speed * CONFIG.speedSmoothing

    // 速度映射到线宽：速度越快越细
    // speed 范围大约 0~2（归一化后），映射到 maxWidth ~ minWidth
    const normalizedSpeed = Math.min(1, lastSpeed * CONFIG.speedToWidthFactor)
    const width = CONFIG.maxWidth - normalizedSpeed * (CONFIG.maxWidth - CONFIG.minWidth)
    return width
  }

  /**
   * Catmull-Rom 样条转三次贝塞尔控制点
   * 将 4 个控制点 (p0, p1, p2, p3) 转为 p1→p2 段的贝塞尔控制点
   */
  function catmullRomToBezier(p0, p1, p2, p3) {
    const t = CONFIG.tension
    return {
      cp1: {
        x: p1.x + (p2.x - p0.x) / (6 * t),
        y: p1.y + (p2.y - p0.y) / (6 * t),
      },
      cp2: {
        x: p2.x - (p3.x - p1.x) / (6 * t),
        y: p2.y - (p3.y - p1.y) / (6 * t),
      }
    }
  }

  /**
   * 在两个宽度值之间插值
   */
  function lerpWidth(w1, w2, t) {
    return w1 + (w2 - w1) * t
  }

  /**
   * 核心渲染函数：绘制整条卡通线条
   * 双层渲染：先描边层后填充层
   */
  function renderFullPath() {
    if (!ctx || points.value.length < 2) return

    const canvas = canvasRef.value
    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

    const pts = points.value

    // 如果只有 2 个点，画一条简单的线
    if (pts.length === 2) {
      const avgWidth = (pts[0].width + pts[1].width) / 2
      drawSimpleLine(pts[0], pts[1], avgWidth)
      return
    }

    // 绘制两层
    drawLayer(pts, CONFIG.outlineColor, CONFIG.outlineExtra)  // 描边层
    drawLayer(pts, CONFIG.fillColor, 0)                        // 填充层
  }

  /**
   * 画一条简单的直线（双层）
   */
  function drawSimpleLine(p1, p2, width) {
    // 描边层
    ctx.beginPath()
    ctx.strokeStyle = CONFIG.outlineColor
    ctx.lineWidth = width + CONFIG.outlineExtra
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()

    // 填充层
    ctx.beginPath()
    ctx.strokeStyle = CONFIG.fillColor
    ctx.lineWidth = width
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
  }

  /**
   * 绘制一层（使用 Catmull-Rom 样条 + 变宽线条）
   * 将路径分段，每段使用该段的插值线宽
   */
  function drawLayer(pts, color, extraWidth) {
    ctx.strokeStyle = color
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // 对每一段使用 Catmull-Rom 平滑并单独设置线宽
    for (let i = 0; i < pts.length - 1; i++) {
      // 获取 Catmull-Rom 所需的 4 个点（边界复制）
      const p0 = pts[Math.max(0, i - 1)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(pts.length - 1, i + 2)]

      // 该段插值线宽
      const segWidth = lerpWidth(p1.width, p2.width, 0.5) + extraWidth

      // 转为贝塞尔控制点
      const { cp1, cp2 } = catmullRomToBezier(p0, p1, p2, p3)

      ctx.beginPath()
      ctx.lineWidth = segWidth
      ctx.moveTo(p1.x, p1.y)
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y)
      ctx.stroke()
    }
  }

  /**
   * 开始画图
   */
  function startDrawing(e) {
    e.preventDefault()
    isDrawing.value = true
    const pos = getPosition(e)
    const now = performance.now()
    lastTime = now
    lastSpeed = 0
    const width = (CONFIG.minWidth + CONFIG.maxWidth) / 2
    points.value = [{ ...pos, width }]
  }

  /**
   * 画图中 — 收集点 + 触发渲染
   */
  function draw(e) {
    if (!isDrawing.value) return
    e.preventDefault()

    const pos = getPosition(e)
    const now = performance.now()
    const prevPt = points.value[points.value.length - 1]

    // 计算压感线宽
    const width = calculateWidth(pos, prevPt, now)
    lastTime = now

    // 最小距离过滤（去抖动）
    const dx = pos.x - prevPt.x
    const dy = pos.y - prevPt.y
    if (dx * dx + dy * dy < 4) return // 距离 < 2px 忽略

    points.value.push({ ...pos, width })

    // 使用 requestAnimationFrame 节流渲染
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(() => {
        renderFullPath()
        animFrameId = null
      })
    }
  }

  /**
   * 停止画图
   */
  function stopDrawing(e) {
    if (!isDrawing.value) return
    if (e) e.preventDefault()
    isDrawing.value = false
    hasContent.value = points.value.length > 2

    // 最终渲染确保完整
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
    renderFullPath()
  }

  /**
   * 清除画布
   */
  function clear() {
    if (!ctx) return
    const canvas = canvasRef.value
    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    points.value = []
    hasContent.value = false
    lastSpeed = 0
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
  }

  /**
   * 获取所有坐标点（不含 width，兼容识别算法）
   */
  function getPoints() {
    return points.value.map(p => ({ x: p.x, y: p.y }))
  }

  /**
   * 获取 Canvas 尺寸
   */
  function getCanvasSize() {
    if (!rect) rect = canvasRef.value?.getBoundingClientRect()
    return { width: rect?.width || 300, height: rect?.height || 300 }
  }

  // 绑定/解绑事件
  function bindEvents() {
    const canvas = canvasRef.value
    if (!canvas) return

    // 触摸事件
    canvas.addEventListener('touchstart', startDrawing, { passive: false })
    canvas.addEventListener('touchmove', draw, { passive: false })
    canvas.addEventListener('touchend', stopDrawing, { passive: false })
    canvas.addEventListener('touchcancel', stopDrawing, { passive: false })

    // 鼠标事件（PC 兼容）
    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('mouseleave', stopDrawing)
  }

  function unbindEvents() {
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.removeEventListener('touchstart', startDrawing)
    canvas.removeEventListener('touchmove', draw)
    canvas.removeEventListener('touchend', stopDrawing)
    canvas.removeEventListener('touchcancel', stopDrawing)
    canvas.removeEventListener('mousedown', startDrawing)
    canvas.removeEventListener('mousemove', draw)
    canvas.removeEventListener('mouseup', stopDrawing)
    canvas.removeEventListener('mouseleave', stopDrawing)
  }

  onMounted(() => {
    initCanvas()
    bindEvents()
  })

  onUnmounted(() => {
    unbindEvents()
    if (animFrameId) {
      cancelAnimationFrame(animFrameId)
    }
  })

  return {
    points,
    isDrawing,
    hasContent,
    clear,
    getPoints,
    getCanvasSize,
    initCanvas
  }
}
