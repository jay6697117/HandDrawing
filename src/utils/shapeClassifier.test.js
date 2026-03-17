/**
 * shapeClassifier.js 单元测试
 * 测试形状分类器的分类准确性
 */
import { describe, it, expect } from 'vitest'
import { classifyShape, extractFeatures, getCategoryMismatchPenalty, SHAPE_CATEGORY } from './shapeClassifier'

// ========== 辅助函数：生成标准形状点集 ==========

// 生成完美圆形的坐标点（归一化到 [0,1]）
function generateCirclePoints(n = 100) {
  const cx = 0.5, cy = 0.5, r = 0.4
  const points = []
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n
    points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) })
  }
  return points
}

// 生成完美正方形的坐标点（归一化到 [0,1]）
function generateSquarePoints(pointsPerSide = 25) {
  const points = []
  const x0 = 0.2, y0 = 0.2, size = 0.6
  // 上边
  for (let i = 0; i < pointsPerSide; i++) {
    points.push({ x: x0 + (i / pointsPerSide) * size, y: y0 })
  }
  // 右边
  for (let i = 0; i < pointsPerSide; i++) {
    points.push({ x: x0 + size, y: y0 + (i / pointsPerSide) * size })
  }
  // 下边
  for (let i = 0; i < pointsPerSide; i++) {
    points.push({ x: x0 + size - (i / pointsPerSide) * size, y: y0 + size })
  }
  // 左边
  for (let i = 0; i < pointsPerSide; i++) {
    points.push({ x: x0, y: y0 + size - (i / pointsPerSide) * size })
  }
  return points
}

// 生成三角形点集
function generateTrianglePoints(pointsPerSide = 30) {
  const points = []
  const vertices = [
    { x: 0.5, y: 0.1 },
    { x: 0.85, y: 0.85 },
    { x: 0.15, y: 0.85 }
  ]
  for (let s = 0; s < 3; s++) {
    const v1 = vertices[s]
    const v2 = vertices[(s + 1) % 3]
    for (let i = 0; i < pointsPerSide; i++) {
      const t = i / pointsPerSide
      points.push({
        x: v1.x + t * (v2.x - v1.x),
        y: v1.y + t * (v2.y - v1.y)
      })
    }
  }
  return points
}

// 生成直线点集（不闭合）
function generateLinePoints(n = 30) {
  const points = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    points.push({ x: 0.1 + t * 0.8, y: 0.5 })
  }
  return points
}

// 生成椭圆点集
function generateEllipsePoints(n = 100) {
  const cx = 0.5, cy = 0.5, rx = 0.4, ry = 0.25
  const points = []
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n
    points.push({ x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) })
  }
  return points
}

// ========== 测试开始 ==========

describe('extractFeatures - 特征提取', () => {
  it('圆形应该是闭合的，角少少，曲率均匀', () => {
    const circle = generateCirclePoints()
    const features = extractFeatures(circle)
    expect(features.isClosed).toBe(true)
    expect(features.cornerCount).toBeLessThanOrEqual(2)
    expect(features.curvatureVar).toBeLessThan(0.1)
  })

  it('正方形应该是闭合的，有多个角点，直线段比例高', () => {
    const square = generateSquarePoints()
    const features = extractFeatures(square)
    expect(features.isClosed).toBe(true)
    expect(features.cornerCount).toBeGreaterThanOrEqual(3)
    expect(features.straightLineRatio).toBeGreaterThan(0.3)
  })

  it('直线应该是不闭合的', () => {
    const line = generateLinePoints()
    const features = extractFeatures(line)
    expect(features.isClosed).toBe(false)
  })

  it('点数过少返回默认特征', () => {
    const fewPoints = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
    const features = extractFeatures(fewPoints)
    expect(features.isClosed).toBe(false)
    expect(features.cornerCount).toBe(0)
  })
})

describe('classifyShape - 形状分类', () => {
  it('圆形 → CURVED_CLOSED', () => {
    const circle = generateCirclePoints()
    const result = classifyShape(circle)
    expect(result.category).toBe(SHAPE_CATEGORY.CURVED_CLOSED)
    expect(result.confidence).toBeGreaterThan(0.4)
  })

  it('椭圆 → CURVED_CLOSED', () => {
    const ellipse = generateEllipsePoints()
    const result = classifyShape(ellipse)
    expect(result.category).toBe(SHAPE_CATEGORY.CURVED_CLOSED)
  })

  it('正方形 → STRAIGHT_CLOSED', () => {
    const square = generateSquarePoints()
    const result = classifyShape(square)
    expect(result.category).toBe(SHAPE_CATEGORY.STRAIGHT_CLOSED)
  })

  it('三角形 → STRAIGHT_CLOSED', () => {
    const triangle = generateTrianglePoints()
    const result = classifyShape(triangle)
    expect(result.category).toBe(SHAPE_CATEGORY.STRAIGHT_CLOSED)
  })

  it('直线 → OPEN_LINE', () => {
    const line = generateLinePoints()
    const result = classifyShape(line)
    expect(result.category).toBe(SHAPE_CATEGORY.OPEN_LINE)
  })
})

describe('getCategoryMismatchPenalty - 类别不匹配惩罚', () => {
  it('类别匹配 → 不惩罚（返回 1.0）', () => {
    const penalty = getCategoryMismatchPenalty(SHAPE_CATEGORY.CURVED_CLOSED, 'circle', 0.8)
    expect(penalty).toBe(1.0)
  })

  it('曲线闭合 vs 直线闭合目标 → 重惩罚', () => {
    const penalty = getCategoryMismatchPenalty(SHAPE_CATEGORY.CURVED_CLOSED, 'polygon', 0.8)
    expect(penalty).toBeLessThan(0.55)
  })

  it('直线闭合 vs 曲线闭合目标 → 重惩罚', () => {
    const penalty = getCategoryMismatchPenalty(SHAPE_CATEGORY.STRAIGHT_CLOSED, 'circle', 0.8)
    expect(penalty).toBeLessThan(0.55)
  })

  it('开放线条 vs 闭合目标 → 重惩罚', () => {
    const penalty = getCategoryMismatchPenalty(SHAPE_CATEGORY.OPEN_LINE, 'circle', 0.8)
    expect(penalty).toBeLessThan(0.55)
  })

  it('涉及 COMPLEX 类 → 不惩罚', () => {
    const penalty = getCategoryMismatchPenalty(SHAPE_CATEGORY.COMPLEX, 'polygon', 0.8)
    expect(penalty).toBe(1.0)
  })

  it('目标是 COMPLEX 类 → 不惩罚', () => {
    const penalty = getCategoryMismatchPenalty(SHAPE_CATEGORY.CURVED_CLOSED, 'composite', 0.8)
    expect(penalty).toBe(1.0)
  })

  it('低置信度时惩罚减轻', () => {
    const highConfPenalty = getCategoryMismatchPenalty(SHAPE_CATEGORY.CURVED_CLOSED, 'polygon', 0.9)
    const lowConfPenalty = getCategoryMismatchPenalty(SHAPE_CATEGORY.CURVED_CLOSED, 'polygon', 0.3)
    // 低置信度应该惩罚更轻（数值更大）
    expect(lowConfPenalty).toBeGreaterThan(highConfPenalty)
  })
})
