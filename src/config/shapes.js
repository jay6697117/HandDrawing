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

// ========== 模板点集生成系统（用于 Hausdorff 距离算法） ==========

// 缓存已生成的模板点集
const templateCache = {}

/**
 * 获取图形的标准模板点集（带缓存）
 * 点集归一化到 [0, 1] 范围，均匀采样 96 个点
 * @param {string} shapeId - 图形 ID
 * @returns {Array} 归一化的模板点集 [{x, y}, ...]
 */
export function getTemplatePoints(shapeId) {
  if (templateCache[shapeId]) return templateCache[shapeId]

  const config = getShapeById(shapeId)
  if (!config) return null

  const points = generateTemplatePoints(config)
  templateCache[shapeId] = points
  return points
}

/**
 * 根据图形配置生成标准模板点集
 * 所有点归一化到 [0, 1] 坐标系
 */
function generateTemplatePoints(config) {
  const N = 96 // 采样点数

  switch (config.type) {
    case 'circle':
      return generateCirclePoints(N)
    case 'ellipse':
      return generateEllipsePoints(N)
    case 'line':
      return generateLinePoints(N)
    case 'polygon':
      return generatePolygonPoints(config, N)
    case 'star':
      return generateStarPoints(config, N)
    case 'arrow':
      return generateArrowPoints(config, N)
    case 'curve':
      return generateCurvePoints(config, N)
    case 'symbol':
      return generateSymbolPoints(config, N)
    case 'composite':
      return generateCompositePoints(config, N)
    default:
      return generateCirclePoints(N)
  }
}

/**
 * 圆形：96 个均匀分布在圆上的点
 */
function generateCirclePoints(n) {
  const cx = 0.5, cy = 0.5, r = 0.4
  const points = []
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n
    points.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    })
  }
  return points
}

/**
 * 椭圆：96 个均匀分布在椭圆上的点
 */
function generateEllipsePoints(n) {
  const cx = 0.5, cy = 0.5, rx = 0.4, ry = 0.25
  const points = []
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n
    points.push({
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle)
    })
  }
  return points
}

/**
 * 直线：96 个均匀分布在线段上的点
 */
function generateLinePoints(n) {
  const points = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    points.push({
      x: 0.15 + t * 0.7,
      y: 0.5
    })
  }
  return points
}

/**
 * 多边形：沿各边均匀采样
 */
function generatePolygonPoints(config, n) {
  const vertices = getPolygonVertices(config)
  return sampleAlongEdges(vertices, n, true)
}

/**
 * 获取多边形顶点坐标（归一化）
 */
function getPolygonVertices(config) {
  const id = config.id
  // 正多边形
  if (config.regular) {
    return generateRegularPolygonVertices(config.sides)
  }
  // 特殊四边形
  switch (id) {
    case 'rectangle':
      return [
        { x: 0.15, y: 0.275 }, { x: 0.85, y: 0.275 },
        { x: 0.85, y: 0.725 }, { x: 0.15, y: 0.725 }
      ]
    case 'diamond':
      return [
        { x: 0.5, y: 0.1 }, { x: 0.85, y: 0.5 },
        { x: 0.5, y: 0.9 }, { x: 0.15, y: 0.5 }
      ]
    case 'trapezoid':
      return [
        { x: 0.3, y: 0.25 }, { x: 0.7, y: 0.25 },
        { x: 0.85, y: 0.75 }, { x: 0.15, y: 0.75 }
      ]
    case 'parallelogram':
      return [
        { x: 0.25, y: 0.25 }, { x: 0.85, y: 0.25 },
        { x: 0.75, y: 0.75 }, { x: 0.15, y: 0.75 }
      ]
    case 'right-trapezoid':
      return [
        { x: 0.2, y: 0.25 }, { x: 0.7, y: 0.25 },
        { x: 0.8, y: 0.75 }, { x: 0.2, y: 0.75 }
      ]
    case 'kite':
      return [
        { x: 0.5, y: 0.08 }, { x: 0.78, y: 0.38 },
        { x: 0.5, y: 0.92 }, { x: 0.22, y: 0.38 }
      ]
    case 'right-triangle':
      return [
        { x: 0.15, y: 0.85 }, { x: 0.85, y: 0.85 }, { x: 0.15, y: 0.15 }
      ]
    case 'isosceles-triangle':
      return [
        { x: 0.5, y: 0.12 }, { x: 0.82, y: 0.85 }, { x: 0.18, y: 0.85 }
      ]
    case 'obtuse-triangle':
      return [
        { x: 0.1, y: 0.8 }, { x: 0.9, y: 0.8 }, { x: 0.3, y: 0.2 }
      ]
    case 'acute-triangle':
      return [
        { x: 0.5, y: 0.1 }, { x: 0.85, y: 0.85 }, { x: 0.15, y: 0.85 }
      ]
    default:
      return generateRegularPolygonVertices(config.sides || 4)
  }
}

/**
 * 生成正多边形顶点
 */
function generateRegularPolygonVertices(sides) {
  const cx = 0.5, cy = 0.5, r = 0.38
  const vertices = []
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
    vertices.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    })
  }
  return vertices
}

/**
 * 星形：顶点交替分布在内外半径上
 */
function generateStarPoints(config, n) {
  const numPoints = config.points || 5
  const cx = 0.5, cy = 0.5
  const outerR = 0.38, innerR = outerR * 0.4
  const vertices = []
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    vertices.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    })
  }
  return sampleAlongEdges(vertices, n, true)
}

/**
 * 箭头：根据具体箭头类型生成顶点
 */
function generateArrowPoints(config, n) {
  let vertices
  switch (config.id) {
    case 'arrow-right':
      vertices = [
        { x: 0.15, y: 0.4 }, { x: 0.55, y: 0.4 }, { x: 0.55, y: 0.2 },
        { x: 0.85, y: 0.5 },
        { x: 0.55, y: 0.8 }, { x: 0.55, y: 0.6 }, { x: 0.15, y: 0.6 }
      ]
      break
    case 'arrow-up':
      vertices = [
        { x: 0.5, y: 0.15 }, { x: 0.8, y: 0.45 }, { x: 0.6, y: 0.45 },
        { x: 0.6, y: 0.85 }, { x: 0.4, y: 0.85 }, { x: 0.4, y: 0.45 },
        { x: 0.2, y: 0.45 }
      ]
      break
    case 'double-arrow':
      vertices = [
        { x: 0.08, y: 0.5 }, { x: 0.28, y: 0.28 }, { x: 0.28, y: 0.42 },
        { x: 0.72, y: 0.42 }, { x: 0.72, y: 0.28 }, { x: 0.92, y: 0.5 },
        { x: 0.72, y: 0.72 }, { x: 0.72, y: 0.58 },
        { x: 0.28, y: 0.58 }, { x: 0.28, y: 0.72 }
      ]
      break
    default:
      vertices = [
        { x: 0.15, y: 0.4 }, { x: 0.55, y: 0.4 }, { x: 0.55, y: 0.2 },
        { x: 0.85, y: 0.5 },
        { x: 0.55, y: 0.8 }, { x: 0.55, y: 0.6 }, { x: 0.15, y: 0.6 }
      ]
  }
  return sampleAlongEdges(vertices, n, true)
}

/**
 * 曲线类图形（爱心、月牙、水滴、云朵、叶子等）
 * 通过参数方程生成
 */
function generateCurvePoints(config, n) {
  switch (config.id) {
    case 'heart':
      return generateHeartPoints(n)
    case 'crescent':
      return generateCrescentPoints(n)
    case 'waterdrop':
      return generateWaterdropPoints(n)
    case 'cloud':
      return generateCloudPoints(n)
    case 'leaf':
      return generateLeafPoints(n)
    case 'infinity':
      return generateInfinityPoints(n)
    case 'taichi':
      return generateTaichiPoints(n)
    case 'spiral':
      return generateSpiralPoints(n)
    default:
      return generateCirclePoints(n)
  }
}

/**
 * 爱心曲线（参数方程）
 */
function generateHeartPoints(n) {
  const points = []
  for (let i = 0; i < n; i++) {
    const t = (i * 2 * Math.PI) / n
    // 标准爱心参数方程
    const x = 16 * Math.sin(t) ** 3
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    points.push({ x, y })
  }
  return normalizeToUnit(points)
}

/**
 * 月牙形
 */
function generateCrescentPoints(n) {
  const points = []
  const cx = 0.5, cy = 0.5, r = 0.38
  // 外圆弧
  const outerCount = Math.floor(n * 0.6)
  for (let i = 0; i < outerCount; i++) {
    const t = (i * 2 * Math.PI) / outerCount
    points.push({
      x: cx + r * Math.cos(t),
      y: cy + r * Math.sin(t)
    })
  }
  // 内圆弧（偏移）
  const innerCount = n - outerCount
  const innerCx = cx + r * 0.5
  const innerR = r * 0.85
  for (let i = innerCount - 1; i >= 0; i--) {
    const t = (i * 2 * Math.PI) / innerCount
    points.push({
      x: innerCx + innerR * Math.cos(t),
      y: cy + innerR * Math.sin(t)
    })
  }
  return points
}

/**
 * 水滴形
 */
function generateWaterdropPoints(n) {
  const points = []
  for (let i = 0; i < n; i++) {
    const t = (i * 2 * Math.PI) / n - Math.PI / 2
    // 变形圆：顶部尖，底部圆
    const r = 0.35 * (1 - 0.3 * Math.sin(t))
    points.push({
      x: 0.5 + r * Math.cos(t),
      y: 0.5 + r * Math.sin(t) * 1.2
    })
  }
  return normalizeToUnit(points)
}

/**
 * 云朵形（多圆弧组合）
 */
function generateCloudPoints(n) {
  const points = []
  // 用多个圆弧的上半部分 + 平底来模拟云
  const bumps = [
    { cx: 0.3, cy: 0.5, r: 0.18 },
    { cx: 0.5, cy: 0.38, r: 0.2 },
    { cx: 0.7, cy: 0.48, r: 0.17 },
  ]
  const perBump = Math.floor(n * 0.75 / bumps.length)
  for (const b of bumps) {
    for (let i = 0; i < perBump; i++) {
      const t = Math.PI + (i * Math.PI) / perBump
      points.push({
        x: b.cx + b.r * Math.cos(t),
        y: b.cy + b.r * Math.sin(t)
      })
    }
  }
  // 底部平线
  const bottomCount = n - points.length
  for (let i = 0; i < bottomCount; i++) {
    const t = i / (bottomCount - 1)
    points.push({
      x: 0.15 + t * 0.7,
      y: 0.65
    })
  }
  return normalizeToUnit(points)
}

/**
 * 叶子形
 */
function generateLeafPoints(n) {
  const points = []
  for (let i = 0; i < n; i++) {
    const t = (i * 2 * Math.PI) / n
    const r = 0.35 * Math.abs(Math.cos(t))
    const angle = t - Math.PI / 4
    points.push({
      x: 0.5 + r * Math.cos(angle),
      y: 0.5 + r * Math.sin(angle)
    })
  }
  return normalizeToUnit(points)
}

/**
 * 无限符号 (∞)
 */
function generateInfinityPoints(n) {
  const points = []
  for (let i = 0; i < n; i++) {
    const t = (i * 2 * Math.PI) / n
    // Lemniscate of Bernoulli 参数方程
    const denom = 1 + Math.sin(t) ** 2
    points.push({
      x: 0.5 + 0.3 * Math.cos(t) / denom,
      y: 0.5 + 0.2 * Math.sin(t) * Math.cos(t) / denom
    })
  }
  return points
}

/**
 * 太极圆
 */
function generateTaichiPoints(n) {
  const points = []
  const cx = 0.5, cy = 0.5, r = 0.38
  // 外圆
  const outerCount = Math.floor(n * 0.6)
  for (let i = 0; i < outerCount; i++) {
    const t = (i * 2 * Math.PI) / outerCount
    points.push({
      x: cx + r * Math.cos(t),
      y: cy + r * Math.sin(t)
    })
  }
  // S 曲线
  const sCount = n - outerCount
  for (let i = 0; i < sCount; i++) {
    const t = (i * Math.PI) / sCount
    points.push({
      x: cx + (r / 2) * Math.sin(t) * 0.3,
      y: cy - r / 2 + (r * i) / sCount
    })
  }
  return points
}

/**
 * 螺旋
 */
function generateSpiralPoints(n) {
  const points = []
  const cx = 0.5, cy = 0.5
  const maxR = 0.38
  const totalAngle = 4 * Math.PI // 2 圈
  for (let i = 0; i < n; i++) {
    const t = (i * totalAngle) / n
    const r = (i / n) * maxR
    points.push({
      x: cx + r * Math.cos(t),
      y: cy + r * Math.sin(t)
    })
  }
  return points
}

/**
 * 符号类图形
 */
function generateSymbolPoints(config, n) {
  switch (config.id) {
    case 'cross':
      return generateCrossPoints(n)
    case 'lightning':
      return generateLightningPoints(n)
    default:
      return generateCrossPoints(n)
  }
}

/**
 * 十字形
 */
function generateCrossPoints(n) {
  const w = 0.2, m = 0.12, cx = 0.5
  // 十字的 12 个顶点
  const vertices = [
    { x: cx - w / 2, y: m }, { x: cx + w / 2, y: m },
    { x: cx + w / 2, y: cx - w / 2 },
    { x: 1 - m, y: cx - w / 2 }, { x: 1 - m, y: cx + w / 2 },
    { x: cx + w / 2, y: cx + w / 2 },
    { x: cx + w / 2, y: 1 - m }, { x: cx - w / 2, y: 1 - m },
    { x: cx - w / 2, y: cx + w / 2 },
    { x: m, y: cx + w / 2 }, { x: m, y: cx - w / 2 },
    { x: cx - w / 2, y: cx - w / 2 },
  ]
  return sampleAlongEdges(vertices, n, true)
}

/**
 * 闪电
 */
function generateLightningPoints(n) {
  const vertices = [
    { x: 0.55, y: 0.08 }, { x: 0.3, y: 0.48 },
    { x: 0.52, y: 0.48 }, { x: 0.42, y: 0.92 },
    { x: 0.72, y: 0.45 }, { x: 0.5, y: 0.45 }
  ]
  return sampleAlongEdges(vertices, n, true)
}

/**
 * 组合图形模板（简化为主要轮廓）
 */
function generateCompositePoints(config, n) {
  switch (config.id) {
    case 'house':
      return generateHousePoints(n)
    case 'cat-face':
      return generateCatFacePoints(n)
    case 'flower':
      return generateFlowerPoints(n)
    case 'butterfly':
      return generateButterflyPoints(n)
    case 'christmas-tree':
      return generateChristmasTreePoints(n)
    default:
      return generateCirclePoints(n)
  }
}

/**
 * 房子形
 */
function generateHousePoints(n) {
  const m = 0.15
  // 屋顶三角形 + 墙壁矩形
  const roof = [
    { x: 0.5, y: m }, { x: 1 - m, y: 0.45 }, { x: m, y: 0.45 }
  ]
  const wall = [
    { x: m + 0.05, y: 0.45 }, { x: m + 0.05 + 0.6, y: 0.45 },
    { x: m + 0.05 + 0.6, y: 0.87 }, { x: m + 0.05, y: 0.87 }
  ]
  const roofPts = sampleAlongEdges(roof, Math.floor(n * 0.45), true)
  const wallPts = sampleAlongEdges(wall, n - roofPts.length, true)
  return [...roofPts, ...wallPts]
}

/**
 * 猫脸
 */
function generateCatFacePoints(n) {
  const cx = 0.5, cy = 0.55
  // 脸部椭圆
  const faceCount = Math.floor(n * 0.6)
  const points = []
  for (let i = 0; i < faceCount; i++) {
    const t = (i * 2 * Math.PI) / faceCount
    points.push({
      x: cx + 0.32 * Math.cos(t),
      y: cy + 0.28 * Math.sin(t)
    })
  }
  // 左耳
  const earCount = Math.floor((n - faceCount) / 2)
  const leftEar = [
    { x: 0.22, y: 0.35 }, { x: 0.28, y: 0.12 }, { x: 0.42, y: 0.3 }
  ]
  const rightEar = [
    { x: 0.78, y: 0.35 }, { x: 0.72, y: 0.12 }, { x: 0.58, y: 0.3 }
  ]
  points.push(...sampleAlongEdges(leftEar, earCount, false))
  points.push(...sampleAlongEdges(rightEar, n - points.length, false))
  return points
}

/**
 * 花朵
 */
function generateFlowerPoints(n) {
  const cx = 0.5, cy = 0.5
  const petalR = 0.15, dist = 0.18
  const points = []
  const perPetal = Math.floor(n * 0.85 / 5)
  // 5 个花瓣
  for (let p = 0; p < 5; p++) {
    const angle = (p * 2 * Math.PI) / 5 - Math.PI / 2
    const px = cx + dist * Math.cos(angle)
    const py = cy + dist * Math.sin(angle)
    for (let i = 0; i < perPetal; i++) {
      const t = (i * 2 * Math.PI) / perPetal
      points.push({
        x: px + petalR * Math.cos(t),
        y: py + petalR * Math.sin(t)
      })
    }
  }
  // 花心
  const centerCount = n - points.length
  for (let i = 0; i < centerCount; i++) {
    const t = (i * 2 * Math.PI) / centerCount
    points.push({
      x: cx + 0.08 * Math.cos(t),
      y: cy + 0.08 * Math.sin(t)
    })
  }
  return points
}

/**
 * 蝴蝶
 */
function generateButterflyPoints(n) {
  const cx = 0.5, cy = 0.5
  const points = []
  const wingCount = Math.floor(n * 0.4)
  // 左翅膀（椭圆）
  for (let i = 0; i < wingCount; i++) {
    const t = (i * 2 * Math.PI) / wingCount
    const cos30 = Math.cos(-0.3), sin30 = Math.sin(-0.3)
    const ex = 0.18 * Math.cos(t)
    const ey = 0.22 * Math.sin(t)
    points.push({
      x: (cx - 0.18) + ex * cos30 - ey * sin30,
      y: (cy - 0.08) + ex * sin30 + ey * cos30
    })
  }
  // 右翅膀
  for (let i = 0; i < wingCount; i++) {
    const t = (i * 2 * Math.PI) / wingCount
    const cos30 = Math.cos(0.3), sin30 = Math.sin(0.3)
    const ex = 0.18 * Math.cos(t)
    const ey = 0.22 * Math.sin(t)
    points.push({
      x: (cx + 0.18) + ex * cos30 - ey * sin30,
      y: (cy - 0.08) + ex * sin30 + ey * cos30
    })
  }
  // 身体
  const bodyCount = n - points.length
  for (let i = 0; i < bodyCount; i++) {
    const t = (i * 2 * Math.PI) / bodyCount
    points.push({
      x: cx + 0.03 * Math.cos(t),
      y: cy + 0.2 * Math.sin(t)
    })
  }
  return points
}

/**
 * 圣诞树
 */
function generateChristmasTreePoints(n) {
  const cx = 0.5
  const layers = [
    { top: 0.08, bottom: 0.38, width: 0.25 },
    { top: 0.28, bottom: 0.58, width: 0.32 },
    { top: 0.48, bottom: 0.78, width: 0.4 }
  ]
  const points = []
  const perLayer = Math.floor(n * 0.85 / layers.length)
  for (const l of layers) {
    const tri = [
      { x: cx, y: l.top },
      { x: cx + l.width, y: l.bottom },
      { x: cx - l.width, y: l.bottom }
    ]
    points.push(...sampleAlongEdges(tri, perLayer, true))
  }
  // 树干
  const trunk = [
    { x: cx - 0.06, y: 0.78 }, { x: cx + 0.06, y: 0.78 },
    { x: cx + 0.06, y: 0.92 }, { x: cx - 0.06, y: 0.92 }
  ]
  points.push(...sampleAlongEdges(trunk, n - points.length, true))
  return points
}

// ========== 模板工具函数 ==========

/**
 * 沿多边形边均匀采样
 * @param {Array} vertices - 顶点数组
 * @param {number} n - 采样点数
 * @param {boolean} closed - 是否闭合（最后一个顶点连回第一个）
 */
function sampleAlongEdges(vertices, n, closed) {
  if (vertices.length < 2 || n < 2) return vertices

  // 计算每条边的长度
  const edgeCount = closed ? vertices.length : vertices.length - 1
  const lengths = []
  let totalLength = 0
  for (let i = 0; i < edgeCount; i++) {
    const v1 = vertices[i]
    const v2 = vertices[(i + 1) % vertices.length]
    const len = Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2)
    lengths.push(len)
    totalLength += len
  }

  // 根据边长比例分配采样点
  const points = []
  let remaining = n
  for (let i = 0; i < edgeCount; i++) {
    const v1 = vertices[i]
    const v2 = vertices[(i + 1) % vertices.length]
    const count = i < edgeCount - 1
      ? Math.max(1, Math.round(n * lengths[i] / totalLength))
      : remaining
    remaining -= count

    for (let j = 0; j < count; j++) {
      const t = j / count
      points.push({
        x: v1.x + t * (v2.x - v1.x),
        y: v1.y + t * (v2.y - v1.y)
      })
    }
  }

  return points.slice(0, n)
}

/**
 * 将点集归一化到 [0, 1] 范围
 */
function normalizeToUnit(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  points.forEach(p => {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  })

  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const range = Math.max(rangeX, rangeY)

  // 居中归一化
  const offsetX = (range - rangeX) / 2
  const offsetY = (range - rangeY) / 2
  const margin = 0.1 // 留边距

  return points.map(p => ({
    x: margin + (1 - 2 * margin) * (p.x - minX + offsetX) / range,
    y: margin + (1 - 2 * margin) * (p.y - minY + offsetY) / range
  }))
}
