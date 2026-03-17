/**
 * 图形配置系统
 * 定义所有 8 章 40 个图形的数据
 */

// ========== 章节配置 ==========
export const chapters = [
  { id: 1, name: '基础圆与方', color: '#FF6B6B', passThreshold: 80 },
  { id: 2, name: '三角家族', color: '#4ECDC4', passThreshold: 75 },
  { id: 3, name: '四边形进阶', color: '#A78BFA', passThreshold: 70 },
  { id: 4, name: '多边形挑战', color: '#FFD93D', passThreshold: 65 },
  { id: 5, name: '星形与箭头', color: '#F093FB', passThreshold: 60 },
  { id: 6, name: '曲线艺术', color: '#00B09B', passThreshold: 55 },
  { id: 7, name: '符号与标志', color: '#2193B0', passThreshold: 50 },
  { id: 8, name: '大师之路', color: '#E65010', passThreshold: 45, isFinal: true }
]

// ========== 图形定义 ==========
export const shapes = [
  // ===== 第一章：基础圆与方 =====
  {
    id: 'circle',
    name: '圆形',
    icon: '⭕',
    chapter: 1,
    type: 'circle',
    // 在 Canvas 上绘制标准图形
    drawFn: (ctx, size) => {
      const r = size * 0.4
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2)
      ctx.stroke()
    }
  },
  {
    id: 'square',
    name: '正方形',
    icon: '⬜',
    chapter: 1,
    type: 'polygon',
    sides: 4,
    regular: true,
    drawFn: (ctx, size) => {
      const s = size * 0.6
      const offset = (size - s) / 2
      ctx.beginPath()
      ctx.rect(offset, offset, s, s)
      ctx.stroke()
    }
  },
  {
    id: 'rectangle',
    name: '长方形',
    icon: '▭',
    chapter: 1,
    type: 'polygon',
    sides: 4,
    drawFn: (ctx, size) => {
      const w = size * 0.7
      const h = size * 0.45
      ctx.beginPath()
      ctx.rect((size - w) / 2, (size - h) / 2, w, h)
      ctx.stroke()
    }
  },
  {
    id: 'line',
    name: '直线',
    icon: '—',
    chapter: 1,
    type: 'line',
    drawFn: (ctx, size) => {
      ctx.beginPath()
      ctx.moveTo(size * 0.15, size / 2)
      ctx.lineTo(size * 0.85, size / 2)
      ctx.stroke()
    }
  },
  {
    id: 'ellipse',
    name: '椭圆',
    icon: '⬭',
    chapter: 1,
    type: 'ellipse',
    drawFn: (ctx, size) => {
      ctx.beginPath()
      ctx.ellipse(size / 2, size / 2, size * 0.4, size * 0.25, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  },

  // ===== 第二章：三角家族 =====
  {
    id: 'equilateral-triangle',
    name: '等边三角形',
    icon: '△',
    chapter: 2,
    type: 'polygon',
    sides: 3,
    regular: true,
    drawFn: (ctx, size) => {
      const h = size * 0.7
      const w = size * 0.7
      const cx = size / 2
      const top = (size - h) / 2
      ctx.beginPath()
      ctx.moveTo(cx, top)
      ctx.lineTo(cx + w / 2, top + h)
      ctx.lineTo(cx - w / 2, top + h)
      ctx.closePath()
      ctx.stroke()
    }
  },
  {
    id: 'right-triangle',
    name: '直角三角形',
    icon: '▷',
    chapter: 2,
    type: 'polygon',
    sides: 3,
    drawFn: (ctx, size) => {
      const m = size * 0.15
      ctx.beginPath()
      ctx.moveTo(m, size - m)
      ctx.lineTo(size - m, size - m)
      ctx.lineTo(m, m)
      ctx.closePath()
      ctx.stroke()
    }
  },
  {
    id: 'isosceles-triangle',
    name: '等腰三角形',
    icon: '▲',
    chapter: 2,
    type: 'polygon',
    sides: 3,
    drawFn: (ctx, size) => {
      const cx = size / 2
      ctx.beginPath()
      ctx.moveTo(cx, size * 0.12)
      ctx.lineTo(size * 0.82, size * 0.85)
      ctx.lineTo(size * 0.18, size * 0.85)
      ctx.closePath()
      ctx.stroke()
    }
  },
  {
    id: 'obtuse-triangle',
    name: '钝角三角形',
    icon: '◁',
    chapter: 2,
    type: 'polygon',
    sides: 3,
    drawFn: (ctx, size) => {
      ctx.beginPath()
      ctx.moveTo(size * 0.1, size * 0.8)
      ctx.lineTo(size * 0.9, size * 0.8)
      ctx.lineTo(size * 0.3, size * 0.2)
      ctx.closePath()
      ctx.stroke()
    }
  },
  {
    id: 'acute-triangle',
    name: '锐角三角形',
    icon: '🔺',
    chapter: 2,
    type: 'polygon',
    sides: 3,
    drawFn: (ctx, size) => {
      ctx.beginPath()
      ctx.moveTo(size * 0.5, size * 0.1)
      ctx.lineTo(size * 0.85, size * 0.85)
      ctx.lineTo(size * 0.15, size * 0.85)
      ctx.closePath()
      ctx.stroke()
    }
  },

  // ===== 第三章：四边形进阶 =====
  {
    id: 'diamond',
    name: '菱形',
    icon: '◇',
    chapter: 3,
    type: 'polygon',
    sides: 4,
    drawFn: (ctx, size) => {
      const cx = size / 2
      const cy = size / 2
      ctx.beginPath()
      ctx.moveTo(cx, size * 0.1)
      ctx.lineTo(size * 0.85, cy)
      ctx.lineTo(cx, size * 0.9)
      ctx.lineTo(size * 0.15, cy)
      ctx.closePath()
      ctx.stroke()
    }
  },
  {
    id: 'trapezoid',
    name: '梯形',
    icon: '⏢',
    chapter: 3,
    type: 'polygon',
    sides: 4,
    drawFn: (ctx, size) => {
      ctx.beginPath()
      ctx.moveTo(size * 0.3, size * 0.25)
      ctx.lineTo(size * 0.7, size * 0.25)
      ctx.lineTo(size * 0.85, size * 0.75)
      ctx.lineTo(size * 0.15, size * 0.75)
      ctx.closePath()
      ctx.stroke()
    }
  },
  {
    id: 'parallelogram',
    name: '平行四边形',
    icon: '▱',
    chapter: 3,
    type: 'polygon',
    sides: 4,
    drawFn: (ctx, size) => {
      ctx.beginPath()
      ctx.moveTo(size * 0.25, size * 0.25)
      ctx.lineTo(size * 0.85, size * 0.25)
      ctx.lineTo(size * 0.75, size * 0.75)
      ctx.lineTo(size * 0.15, size * 0.75)
      ctx.closePath()
      ctx.stroke()
    }
  },
  {
    id: 'right-trapezoid',
    name: '直角梯形',
    icon: '⬧',
    chapter: 3,
    type: 'polygon',
    sides: 4,
    drawFn: (ctx, size) => {
      ctx.beginPath()
      ctx.moveTo(size * 0.2, size * 0.25)
      ctx.lineTo(size * 0.7, size * 0.25)
      ctx.lineTo(size * 0.8, size * 0.75)
      ctx.lineTo(size * 0.2, size * 0.75)
      ctx.closePath()
      ctx.stroke()
    }
  },
  {
    id: 'kite',
    name: '风筝形',
    icon: '🪁',
    chapter: 3,
    type: 'polygon',
    sides: 4,
    drawFn: (ctx, size) => {
      const cx = size / 2
      ctx.beginPath()
      ctx.moveTo(cx, size * 0.08)
      ctx.lineTo(size * 0.78, size * 0.38)
      ctx.lineTo(cx, size * 0.92)
      ctx.lineTo(size * 0.22, size * 0.38)
      ctx.closePath()
      ctx.stroke()
    }
  },

  // ===== 第四章：多边形挑战 =====
  {
    id: 'pentagon',
    name: '五边形',
    icon: '⬠',
    chapter: 4,
    type: 'polygon',
    sides: 5,
    regular: true,
    drawFn: (ctx, size) => drawRegularPolygon(ctx, size, 5)
  },
  {
    id: 'hexagon',
    name: '六边形',
    icon: '⬡',
    chapter: 4,
    type: 'polygon',
    sides: 6,
    regular: true,
    drawFn: (ctx, size) => drawRegularPolygon(ctx, size, 6)
  },
  {
    id: 'heptagon',
    name: '七边形',
    icon: '🔷',
    chapter: 4,
    type: 'polygon',
    sides: 7,
    regular: true,
    drawFn: (ctx, size) => drawRegularPolygon(ctx, size, 7)
  },
  {
    id: 'octagon',
    name: '八边形',
    icon: '🛑',
    chapter: 4,
    type: 'polygon',
    sides: 8,
    regular: true,
    drawFn: (ctx, size) => drawRegularPolygon(ctx, size, 8)
  },
  {
    id: 'decagon',
    name: '十边形',
    icon: '✦',
    chapter: 4,
    type: 'polygon',
    sides: 10,
    regular: true,
    drawFn: (ctx, size) => drawRegularPolygon(ctx, size, 10)
  },

  // ===== 第五章：星形与箭头 =====
  {
    id: 'five-star',
    name: '五角星',
    icon: '⭐',
    chapter: 5,
    type: 'star',
    points: 5,
    drawFn: (ctx, size) => drawStar(ctx, size, 5)
  },
  {
    id: 'six-star',
    name: '六角星',
    icon: '✡',
    chapter: 5,
    type: 'star',
    points: 6,
    drawFn: (ctx, size) => drawStar(ctx, size, 6)
  },
  {
    id: 'arrow-right',
    name: '右箭头',
    icon: '➡️',
    chapter: 5,
    type: 'arrow',
    drawFn: (ctx, size) => {
      const m = size * 0.15
      const cy = size / 2
      const ah = size * 0.3 // 箭头高度
      ctx.beginPath()
      ctx.moveTo(m, cy - size * 0.1)
      ctx.lineTo(size * 0.55, cy - size * 0.1)
      ctx.lineTo(size * 0.55, cy - ah)
      ctx.lineTo(size - m, cy)
      ctx.lineTo(size * 0.55, cy + ah)
      ctx.lineTo(size * 0.55, cy + size * 0.1)
      ctx.lineTo(m, cy + size * 0.1)
      ctx.closePath()
      ctx.stroke()
    }
  },
  {
    id: 'arrow-up',
    name: '上箭头',
    icon: '⬆️',
    chapter: 5,
    type: 'arrow',
    drawFn: (ctx, size) => {
      const cx = size / 2
      const m = size * 0.15
      const aw = size * 0.3
      ctx.beginPath()
      ctx.moveTo(cx, m)
      ctx.lineTo(cx + aw, size * 0.45)
      ctx.lineTo(cx + size * 0.1, size * 0.45)
      ctx.lineTo(cx + size * 0.1, size - m)
      ctx.lineTo(cx - size * 0.1, size - m)
      ctx.lineTo(cx - size * 0.1, size * 0.45)
      ctx.lineTo(cx - aw, size * 0.45)
      ctx.closePath()
      ctx.stroke()
    }
  },
  {
    id: 'double-arrow',
    name: '双向箭头',
    icon: '↔️',
    chapter: 5,
    type: 'arrow',
    drawFn: (ctx, size) => {
      const cy = size / 2
      const m = size * 0.08
      const ah = size * 0.22
      ctx.beginPath()
      // 左箭头
      ctx.moveTo(m, cy)
      ctx.lineTo(size * 0.28, cy - ah)
      ctx.lineTo(size * 0.28, cy - size * 0.08)
      // 中间连接
      ctx.lineTo(size * 0.72, cy - size * 0.08)
      // 右箭头
      ctx.lineTo(size * 0.72, cy - ah)
      ctx.lineTo(size - m, cy)
      ctx.lineTo(size * 0.72, cy + ah)
      ctx.lineTo(size * 0.72, cy + size * 0.08)
      ctx.lineTo(size * 0.28, cy + size * 0.08)
      ctx.lineTo(size * 0.28, cy + ah)
      ctx.closePath()
      ctx.stroke()
    }
  },

  // ===== 第六章：曲线艺术 =====
  {
    id: 'heart',
    name: '爱心',
    icon: '❤️',
    chapter: 6,
    type: 'curve',
    drawFn: (ctx, size) => {
      const cx = size / 2
      const s = size * 0.4
      ctx.beginPath()
      ctx.moveTo(cx, size * 0.82)
      ctx.bezierCurveTo(cx - s * 1.5, size * 0.55, cx - s * 1.5, size * 0.15, cx, size * 0.35)
      ctx.bezierCurveTo(cx + s * 1.5, size * 0.15, cx + s * 1.5, size * 0.55, cx, size * 0.82)
      ctx.stroke()
    }
  },
  {
    id: 'crescent',
    name: '月牙形',
    icon: '☽',
    chapter: 6,
    type: 'curve',
    drawFn: (ctx, size) => {
      const cx = size / 2
      const cy = size / 2
      const r = size * 0.38
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(cx + r * 0.5, cy, r * 0.85, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
      ctx.beginPath()
      ctx.arc(cx + r * 0.5, cy, r * 0.85, 0, Math.PI * 2)
      ctx.stroke()
    }
  },
  {
    id: 'waterdrop',
    name: '水滴形',
    icon: '💧',
    chapter: 6,
    type: 'curve',
    drawFn: (ctx, size) => {
      const cx = size / 2
      ctx.beginPath()
      ctx.moveTo(cx, size * 0.12)
      ctx.bezierCurveTo(cx + size * 0.35, size * 0.45, cx + size * 0.35, size * 0.7, cx, size * 0.88)
      ctx.bezierCurveTo(cx - size * 0.35, size * 0.7, cx - size * 0.35, size * 0.45, cx, size * 0.12)
      ctx.stroke()
    }
  },
  {
    id: 'cloud',
    name: '云朵形',
    icon: '☁️',
    chapter: 6,
    type: 'curve',
    drawFn: (ctx, size) => {
      const cy = size * 0.55
      ctx.beginPath()
      ctx.arc(size * 0.35, cy, size * 0.18, Math.PI, Math.PI * 1.85)
      ctx.arc(size * 0.5, size * 0.38, size * 0.2, Math.PI * 1.37, Math.PI * 1.9)
      ctx.arc(size * 0.68, cy - size * 0.02, size * 0.17, Math.PI * 1.3, 0)
      ctx.arc(size * 0.72, cy + size * 0.08, size * 0.12, -Math.PI * 0.3, Math.PI * 0.5)
      ctx.lineTo(size * 0.2, cy + size * 0.15)
      ctx.arc(size * 0.25, cy + size * 0.02, size * 0.14, Math.PI * 0.5, Math.PI)
      ctx.stroke()
    }
  },
  {
    id: 'leaf',
    name: '叶子形',
    icon: '🍃',
    chapter: 6,
    type: 'curve',
    drawFn: (ctx, size) => {
      const cx = size / 2
      const cy = size / 2
      ctx.beginPath()
      ctx.moveTo(size * 0.15, size * 0.85)
      ctx.bezierCurveTo(size * 0.1, size * 0.3, size * 0.5, size * 0.1, size * 0.85, size * 0.15)
      ctx.bezierCurveTo(size * 0.7, size * 0.5, size * 0.9, size * 0.9, size * 0.15, size * 0.85)
      ctx.stroke()
      // 叶脉
      ctx.beginPath()
      ctx.moveTo(size * 0.15, size * 0.85)
      ctx.lineTo(size * 0.7, size * 0.3)
      ctx.stroke()
    }
  },

  // ===== 第七章：符号与标志 =====
  {
    id: 'cross',
    name: '十字形',
    icon: '✝',
    chapter: 7,
    type: 'symbol',
    drawFn: (ctx, size) => {
      const w = size * 0.2
      const cx = size / 2
      const m = size * 0.12
      ctx.beginPath()
      ctx.rect(cx - w / 2, m, w, size - m * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.rect(m, cx - w / 2, size - m * 2, w)
      ctx.stroke()
    }
  },
  {
    id: 'lightning',
    name: '闪电',
    icon: '⚡',
    chapter: 7,
    type: 'symbol',
    drawFn: (ctx, size) => {
      ctx.beginPath()
      ctx.moveTo(size * 0.55, size * 0.08)
      ctx.lineTo(size * 0.3, size * 0.48)
      ctx.lineTo(size * 0.52, size * 0.48)
      ctx.lineTo(size * 0.42, size * 0.92)
      ctx.lineTo(size * 0.72, size * 0.45)
      ctx.lineTo(size * 0.5, size * 0.45)
      ctx.lineTo(size * 0.55, size * 0.08)
      ctx.stroke()
    }
  },
  {
    id: 'infinity',
    name: '无限符号',
    icon: '♾️',
    chapter: 7,
    type: 'curve',
    drawFn: (ctx, size) => {
      const cy = size / 2
      const rx = size * 0.2
      const ry = size * 0.15
      ctx.beginPath()
      // 左圆
      ctx.ellipse(size * 0.32, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      // 右圆
      ctx.ellipse(size * 0.68, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  },
  {
    id: 'taichi',
    name: '太极圆',
    icon: '☯',
    chapter: 7,
    type: 'curve',
    drawFn: (ctx, size) => {
      const cx = size / 2
      const cy = size / 2
      const r = size * 0.38
      // 外圆
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
      // S 曲线
      ctx.beginPath()
      ctx.arc(cx, cy - r / 2, r / 2, Math.PI * 1.5, Math.PI * 0.5)
      ctx.arc(cx, cy + r / 2, r / 2, Math.PI * 1.5, Math.PI * 0.5, true)
      ctx.stroke()
    }
  },
  {
    id: 'spiral',
    name: '螺旋',
    icon: '🌀',
    chapter: 7,
    type: 'curve',
    drawFn: (ctx, size) => {
      const cx = size / 2
      const cy = size / 2
      ctx.beginPath()
      for (let i = 0; i < 720; i++) {
        const angle = (i * Math.PI) / 180
        const r = (i / 720) * size * 0.38
        const x = cx + r * Math.cos(angle)
        const y = cy + r * Math.sin(angle)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  },

  // ===== 第八章：大师之路 =====
  {
    id: 'house',
    name: '房子形',
    icon: '🏠',
    chapter: 8,
    type: 'composite',
    drawFn: (ctx, size) => {
      const m = size * 0.15
      // 屋顶
      ctx.beginPath()
      ctx.moveTo(size / 2, m)
      ctx.lineTo(size - m, size * 0.45)
      ctx.lineTo(m, size * 0.45)
      ctx.closePath()
      ctx.stroke()
      // 墙壁
      ctx.beginPath()
      ctx.rect(m + size * 0.05, size * 0.45, size * 0.6, size * 0.42)
      ctx.stroke()
      // 门
      ctx.beginPath()
      ctx.rect(size * 0.38, size * 0.6, size * 0.16, size * 0.27)
      ctx.stroke()
    }
  },
  {
    id: 'cat-face',
    name: '猫脸',
    icon: '🐱',
    chapter: 8,
    type: 'composite',
    drawFn: (ctx, size) => {
      const cx = size / 2
      const cy = size * 0.55
      // 脸
      ctx.beginPath()
      ctx.ellipse(cx, cy, size * 0.32, size * 0.28, 0, 0, Math.PI * 2)
      ctx.stroke()
      // 左耳
      ctx.beginPath()
      ctx.moveTo(size * 0.22, size * 0.35)
      ctx.lineTo(size * 0.28, size * 0.12)
      ctx.lineTo(size * 0.42, size * 0.3)
      ctx.stroke()
      // 右耳
      ctx.beginPath()
      ctx.moveTo(size * 0.78, size * 0.35)
      ctx.lineTo(size * 0.72, size * 0.12)
      ctx.lineTo(size * 0.58, size * 0.3)
      ctx.stroke()
      // 眼睛
      ctx.beginPath()
      ctx.arc(size * 0.38, cy - size * 0.02, size * 0.04, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(size * 0.62, cy - size * 0.02, size * 0.04, 0, Math.PI * 2)
      ctx.fill()
    }
  },
  {
    id: 'flower',
    name: '花朵',
    icon: '🌸',
    chapter: 8,
    type: 'composite',
    drawFn: (ctx, size) => {
      const cx = size / 2
      const cy = size / 2
      const petalR = size * 0.15
      const dist = size * 0.18
      // 5 个花瓣
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
        const px = cx + dist * Math.cos(angle)
        const py = cy + dist * Math.sin(angle)
        ctx.beginPath()
        ctx.arc(px, py, petalR, 0, Math.PI * 2)
        ctx.stroke()
      }
      // 花心
      ctx.beginPath()
      ctx.arc(cx, cy, size * 0.08, 0, Math.PI * 2)
      ctx.stroke()
    }
  },
  {
    id: 'butterfly',
    name: '蝴蝶',
    icon: '🦋',
    chapter: 8,
    type: 'composite',
    drawFn: (ctx, size) => {
      const cx = size / 2
      const cy = size / 2
      // 左翅膀
      ctx.beginPath()
      ctx.ellipse(cx - size * 0.18, cy - size * 0.08, size * 0.18, size * 0.22, -0.3, 0, Math.PI * 2)
      ctx.stroke()
      // 右翅膀
      ctx.beginPath()
      ctx.ellipse(cx + size * 0.18, cy - size * 0.08, size * 0.18, size * 0.22, 0.3, 0, Math.PI * 2)
      ctx.stroke()
      // 身体
      ctx.beginPath()
      ctx.ellipse(cx, cy, size * 0.03, size * 0.2, 0, 0, Math.PI * 2)
      ctx.stroke()
      // 触角
      ctx.beginPath()
      ctx.moveTo(cx - size * 0.02, cy - size * 0.2)
      ctx.bezierCurveTo(cx - size * 0.1, cy - size * 0.35, cx - size * 0.15, cy - size * 0.38, cx - size * 0.12, cy - size * 0.4)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + size * 0.02, cy - size * 0.2)
      ctx.bezierCurveTo(cx + size * 0.1, cy - size * 0.35, cx + size * 0.15, cy - size * 0.38, cx + size * 0.12, cy - size * 0.4)
      ctx.stroke()
    }
  },
  {
    id: 'christmas-tree',
    name: '圣诞树',
    icon: '🎄',
    chapter: 8,
    type: 'composite',
    drawFn: (ctx, size) => {
      const cx = size / 2
      // 三层三角形
      const layers = [
        { top: 0.08, bottom: 0.38, width: 0.25 },
        { top: 0.28, bottom: 0.58, width: 0.32 },
        { top: 0.48, bottom: 0.78, width: 0.4 }
      ]
      layers.forEach(l => {
        ctx.beginPath()
        ctx.moveTo(cx, size * l.top)
        ctx.lineTo(cx + size * l.width, size * l.bottom)
        ctx.lineTo(cx - size * l.width, size * l.bottom)
        ctx.closePath()
        ctx.stroke()
      })
      // 树干
      ctx.beginPath()
      ctx.rect(cx - size * 0.06, size * 0.78, size * 0.12, size * 0.14)
      ctx.stroke()
    }
  }
]

// ========== 辅助绘制函数 ==========

/**
 * 绘制正多边形
 */
function drawRegularPolygon(ctx, size, sides) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.stroke()
}

/**
 * 绘制星形
 */
function drawStar(ctx, size, points) {
  const cx = size / 2
  const cy = size / 2
  const outerR = size * 0.38
  const innerR = outerR * 0.4
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.stroke()
}

// ========== 查询辅助函数 ==========

/**
 * 根据 ID 获取图形配置
 */
export function getShapeById(id) {
  return shapes.find(s => s.id === id)
}

/**
 * 获取某章节的所有图形
 */
export function getShapesByChapter(chapterId) {
  return shapes.filter(s => s.chapter === chapterId)
}

/**
 * 获取章节配置
 */
export function getChapter(chapterId) {
  return chapters.find(c => c.id === chapterId)
}
