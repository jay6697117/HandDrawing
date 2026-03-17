import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Canvas 画图逻辑
 * 管理触摸/鼠标事件，记录坐标点，实时绘制笔画
 */
export function useDrawing(canvasRef) {
  // 坐标点数组
  const points = ref([])
  // 是否正在画图
  const isDrawing = ref(false)
  // 是否有内容
  const hasContent = ref(false)

  let ctx = null
  let rect = null

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

    // 设置画笔样式
    ctx.strokeStyle = '#2D3436'
    ctx.lineWidth = 3
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
   * 开始画图
   */
  function startDrawing(e) {
    e.preventDefault()
    isDrawing.value = true
    const pos = getPosition(e)
    points.value = [pos]
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  /**
   * 画图中（实时绘制）
   */
  function draw(e) {
    if (!isDrawing.value) return
    e.preventDefault()
    const pos = getPosition(e)
    points.value.push(pos)

    // 使用二次贝塞尔曲线实现平滑线条
    if (points.value.length >= 3) {
      const len = points.value.length
      const p1 = points.value[len - 3]
      const p2 = points.value[len - 2]
      const p3 = points.value[len - 1]
      const midX = (p2.x + p3.x) / 2
      const midY = (p2.y + p3.y) / 2
      ctx.quadraticCurveTo(p2.x, p2.y, midX, midY)
      ctx.stroke()
    } else {
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
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
    // 重新开始路径
    ctx.beginPath()
  }

  /**
   * 获取所有坐标点
   */
  function getPoints() {
    return [...points.value]
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
