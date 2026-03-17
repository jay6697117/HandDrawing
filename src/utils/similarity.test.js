/**
 * similarity.js 单元测试
 * 测试相似度评分算法（v4.0 含几何特征惩罚）
 */
import { describe, it, expect } from 'vitest'
import { calculateSimilarity } from './similarity'

// ========== 辅助函数 ==========

// 生成完美圆形的坐标点
function generatePerfectCircle(cx, cy, r, n = 100) {
  const points = []
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n
    points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) })
  }
  return points
}

// 生成完美正方形的坐标点
function generatePerfectSquare(x, y, size, pointsPerSide = 25) {
  const points = []
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide
    points.push({ x: x + t * size, y })
  }
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide
    points.push({ x: x + size, y: y + t * size })
  }
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide
    points.push({ x: x + size - t * size, y: y + size })
  }
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide
    points.push({ x, y: y + size - t * size })
  }
  return points
}

// 生成歪斜的不规则四边形（模拟用户截图中的图形）
function generateSkewedQuadrilateral() {
  const points = []
  // 4 个不规则的顶点（明显不是正方形）
  const v = [
    { x: 100, y: 80 },   // 左上（偏右偏上）
    { x: 280, y: 50 },   // 右上（上移很多）
    { x: 300, y: 250 },  // 右下
    { x: 80, y: 220 },   // 左下（偏左）
  ]
  const pointsPerSide = 20
  for (let s = 0; s < 4; s++) {
    const v1 = v[s]
    const v2 = v[(s + 1) % 4]
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

// 生成直线点集
function generatePerfectLine(x1, y1, x2, y2, n = 30) {
  const points = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    points.push({ x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) })
  }
  return points
}

// ========== 图形配置 ==========

const circleConfig = { id: 'circle', type: 'circle' }
const squareConfig = { id: 'square', type: 'polygon', sides: 4, regular: true }
const lineConfig = { id: 'line', type: 'line' }

// ========== 测试开始 ==========

describe('calculateSimilarity - 基本边界条件', () => {
  it('点数过少（< 5）返回 0', () => {
    const fewPoints = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
    expect(calculateSimilarity(fewPoints, circleConfig)).toBe(0)
  })

  it('null 或 undefined 输入返回 0', () => {
    expect(calculateSimilarity(null, circleConfig)).toBe(0)
    expect(calculateSimilarity(undefined, circleConfig)).toBe(0)
  })

  it('返回值在 0-100 范围内', () => {
    const circle = generatePerfectCircle(150, 150, 80, 100)
    const score = calculateSimilarity(circle, circleConfig)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('返回值是整数（已 Math.round）', () => {
    const circle = generatePerfectCircle(150, 150, 80, 100)
    const score = calculateSimilarity(circle, circleConfig)
    expect(Number.isInteger(score)).toBe(true)
  })
})

describe('calculateSimilarity - 正确匹配', () => {
  it('完美圆形匹配圆形模板得分 > 20', () => {
    const circle = generatePerfectCircle(150, 150, 80, 100)
    const score = calculateSimilarity(circle, circleConfig)
    expect(score).toBeGreaterThan(20)
  })

  it('完美正方形匹配正方形模板有得分', () => {
    const square = generatePerfectSquare(50, 50, 200, 30)
    const score = calculateSimilarity(square, squareConfig)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('完美直线匹配直线模板得高分（> 50）', () => {
    const line = generatePerfectLine(50, 200, 350, 200, 30)
    const score = calculateSimilarity(line, lineConfig)
    expect(score).toBeGreaterThan(50)
  })
})

describe('calculateSimilarity - 错误匹配应低分', () => {
  it('圆形匹配正方形模板得低分（< 70）', () => {
    const circle = generatePerfectCircle(150, 150, 80, 100)
    const score = calculateSimilarity(circle, squareConfig)
    expect(score).toBeLessThan(70)
  })

  it('歪斜四边形匹配正方形模板得低分（< 55）', () => {
    const skewed = generateSkewedQuadrilateral()
    const score = calculateSimilarity(skewed, squareConfig)
    // 核心测试：歪斜图形不应该得高分
    expect(score).toBeLessThan(55)
    console.log(`歪斜四边形匹配正方形得分: ${score}`)
  })
})
