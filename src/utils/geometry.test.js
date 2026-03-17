/**
 * geometry.js 单元测试
 * 覆盖所有导出的几何计算函数
 */
import { describe, it, expect } from 'vitest'
import {
  distance,
  normalizePoints,
  smoothPoints,
  resamplePoints,
  findCorners,
  calculateCurvature,
  curvatureVariance,
  isClosedShape,
  centroid,
  pathLength,
  avgMinDistance,
  modifiedHausdorffDistance,
  rotationalAlignment
} from './geometry'

// ========== 辅助函数 ==========

// 生成圆形点集
function generateCircle(cx, cy, r, n = 64) {
  const points = []
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n
    points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) })
  }
  return points
}

// 生成正方形点集（沿边均匀采样）
function generateSquare(x, y, size, pointsPerSide = 16) {
  const points = []
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide
    points.push({ x: x + t * size, y }) // 上边
  }
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide
    points.push({ x: x + size, y: y + t * size }) // 右边
  }
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide
    points.push({ x: x + size - t * size, y: y + size }) // 下边
  }
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide
    points.push({ x, y: y + size - t * size }) // 左边
  }
  return points
}

// 生成直线点集
function generateLine(x1, y1, x2, y2, n = 20) {
  const points = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    points.push({ x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) })
  }
  return points
}

// ========== 测试开始 ==========

describe('distance - 两点距离计算', () => {
  it('计算水平两点的距离', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 0 })).toBe(3)
  })

  it('计算垂直两点的距离', () => {
    expect(distance({ x: 0, y: 0 }, { x: 0, y: 4 })).toBe(4)
  })

  it('同一点距离为 0', () => {
    expect(distance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0)
  })

  it('经典 3-4-5 直角三角形斜边', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })
})

describe('normalizePoints - 坐标归一化', () => {
  it('将正方形归一化到 [0, 1] 范围', () => {
    const points = [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 200, y: 200 },
      { x: 100, y: 200 }
    ]
    const result = normalizePoints(points)

    // 所有点应在 [0, 1] 范围内
    result.forEach(p => {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThanOrEqual(1)
      expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeLessThanOrEqual(1)
    })
  })

  it('单点输入返回原数组', () => {
    const points = [{ x: 50, y: 50 }]
    expect(normalizePoints(points)).toEqual(points)
  })

  it('空数组返回空数组', () => {
    expect(normalizePoints([])).toEqual([])
  })

  it('归一化后保持相对形状', () => {
    // 长方形（宽 > 高）归一化后 x 范围应该大于 y 范围
    const points = [
      { x: 0, y: 0 },
      { x: 200, y: 0 },
      { x: 200, y: 100 },
      { x: 0, y: 100 }
    ]
    const result = normalizePoints(points)
    const xs = result.map(p => p.x)
    const ys = result.map(p => p.y)
    const xRange = Math.max(...xs) - Math.min(...xs)
    const yRange = Math.max(...ys) - Math.min(...ys)
    expect(xRange).toBeGreaterThan(yRange)
  })
})

describe('smoothPoints - 平滑处理', () => {
  it('平滑后数组长度不变', () => {
    const points = generateLine(0, 0, 100, 100, 20)
    const smoothed = smoothPoints(points, 5)
    expect(smoothed.length).toBe(points.length)
  })

  it('点数少于窗口大小时返回原数组', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
    const result = smoothPoints(points, 5)
    expect(result).toEqual(points)
  })

  it('平滑后减少噪声（锯齿输入平滑后方差降低）', () => {
    // 在直线上加入锯齿噪声
    const noisy = []
    for (let i = 0; i < 30; i++) {
      noisy.push({ x: i * 10, y: 50 + (i % 2 === 0 ? 10 : -10) })
    }
    const smoothed = smoothPoints(noisy, 5)

    // 计算 y 方差
    const noisyVar = variance(noisy.map(p => p.y))
    const smoothVar = variance(smoothed.map(p => p.y))
    expect(smoothVar).toBeLessThan(noisyVar)
  })
})

// 计算方差辅助函数
function variance(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length
  return arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length
}

describe('resamplePoints - 重采样', () => {
  it('重采样到指定数量（默认 64）', () => {
    const points = generateCircle(100, 100, 50, 200)
    const result = resamplePoints(points)
    expect(result.length).toBe(64)
  })

  it('重采样到自定义数量', () => {
    const points = generateLine(0, 0, 100, 0, 50)
    const result = resamplePoints(points, 32)
    expect(result.length).toBe(32)
  })

  it('点数不足 2 时返回原数组', () => {
    const points = [{ x: 0, y: 0 }]
    expect(resamplePoints(points)).toEqual(points)
  })
})

describe('findCorners - 拐角检测', () => {
  it('正方形应检测到至少 3 个拐角', () => {
    const square = generateSquare(0, 0, 100, 20)
    const corners = findCorners(square)
    expect(corners.length).toBeGreaterThanOrEqual(3)
  })

  it('圆形应检测到很少或没有拐角', () => {
    const circle = generateCircle(100, 100, 50, 64)
    const corners = findCorners(circle)
    // 圆形除了第一个点外不应有明显拐角
    // corners[0] 总是 0（第一个点），实际角点应该很少
    expect(corners.length).toBeLessThanOrEqual(3)
  })

  it('点数不足 5 时返回空数组', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }]
    expect(findCorners(points)).toEqual([])
  })
})

describe('calculateCurvature - 平均曲率', () => {
  it('直线的曲率接近 0', () => {
    const line = generateLine(0, 0, 100, 0, 20)
    const curvature = calculateCurvature(line)
    expect(curvature).toBeCloseTo(0, 5)
  })

  it('圆弧的曲率大于 0', () => {
    const circle = generateCircle(100, 100, 50, 64)
    const curvature = calculateCurvature(circle)
    expect(curvature).toBeGreaterThan(0)
  })

  it('点数不足 3 时返回 0', () => {
    expect(calculateCurvature([{ x: 0, y: 0 }, { x: 1, y: 1 }])).toBe(0)
  })
})

describe('curvatureVariance - 曲率方差', () => {
  it('圆的曲率方差较低（曲率均匀）', () => {
    const circle = generateCircle(100, 100, 50, 64)
    const cv = curvatureVariance(circle)
    expect(cv).toBeLessThan(0.05)
  })

  it('点数不足 3 时返回 Infinity', () => {
    expect(curvatureVariance([{ x: 0, y: 0 }])).toBe(Infinity)
  })
})

describe('isClosedShape - 闭合检测', () => {
  it('闭合的圆形返回 true', () => {
    const circle = generateCircle(100, 100, 50, 64)
    // 将最后一个点移至非常接近第一个点
    circle.push({ ...circle[0] })
    expect(isClosedShape(circle)).toBe(true)
  })

  it('开放的直线返回 false', () => {
    const line = generateLine(0, 0, 100, 0, 20)
    expect(isClosedShape(line)).toBe(false)
  })

  it('点数不足 5 时返回 false', () => {
    expect(isClosedShape([{ x: 0, y: 0 }, { x: 1, y: 0 }])).toBe(false)
  })
})

describe('centroid - 质心计算', () => {
  it('正方形的质心在中心', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 }
    ]
    const c = centroid(points)
    expect(c.x).toBe(5)
    expect(c.y).toBe(5)
  })

  it('单点的质心就是它自己', () => {
    const c = centroid([{ x: 42, y: 99 }])
    expect(c.x).toBe(42)
    expect(c.y).toBe(99)
  })
})

describe('pathLength - 路径长度', () => {
  it('边长为 10 的正方形路径长度为 30（三条边，因为没闭合）', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 }
    ]
    expect(pathLength(points)).toBe(30)
  })

  it('水平直线长度等于两端距离', () => {
    const points = generateLine(0, 0, 100, 0, 50)
    expect(pathLength(points)).toBeCloseTo(100, 1)
  })
})

describe('avgMinDistance - 单向平均最小距离', () => {
  it('相同点集距离为 0', () => {
    const points = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }]
    expect(avgMinDistance(points, points)).toBe(0)
  })

  it('不同点集距离大于 0', () => {
    const a = [{ x: 0, y: 0 }]
    const b = [{ x: 3, y: 4 }]
    expect(avgMinDistance(a, b)).toBe(5)
  })

  it('空数组返回 Infinity', () => {
    expect(avgMinDistance([], [{ x: 0, y: 0 }])).toBe(Infinity)
    expect(avgMinDistance([{ x: 0, y: 0 }], [])).toBe(Infinity)
  })
})

describe('modifiedHausdorffDistance - 修正 Hausdorff 距离', () => {
  it('相同点集 MHD 为 0', () => {
    const points = generateCircle(0.5, 0.5, 0.3, 32)
    expect(modifiedHausdorffDistance(points, points)).toBe(0)
  })

  it('MHD 具有对称性：MHD(A,B) = MHD(B,A)', () => {
    const a = [{ x: 0, y: 0 }, { x: 1, y: 0 }]
    const b = [{ x: 0, y: 1 }, { x: 1, y: 1 }]
    expect(modifiedHausdorffDistance(a, b)).toBe(modifiedHausdorffDistance(b, a))
  })

  it('距离越远 MHD 越大', () => {
    const base = [{ x: 0, y: 0 }]
    const near = [{ x: 1, y: 0 }]
    const far = [{ x: 10, y: 0 }]
    expect(modifiedHausdorffDistance(base, near)).toBeLessThan(
      modifiedHausdorffDistance(base, far)
    )
  })
})

describe('rotationalAlignment - 旋转对齐', () => {
  it('旋转后的圆形仍然匹配良好（MHD 很小）', () => {
    const circle1 = generateCircle(0.5, 0.5, 0.3, 32)
    // 旋转 45 度的同一个圆（圆旋转后不变）
    const circle2 = generateCircle(0.5, 0.5, 0.3, 32)
    const mhd = rotationalAlignment(circle1, circle2)
    expect(mhd).toBeLessThan(0.01)
  })

  it('完全不同的形状匹配差（MHD 大）', () => {
    const circle = generateCircle(0.5, 0.5, 0.3, 32)
    const line = generateLine(0, 0, 1, 0, 32)
    const mhd = rotationalAlignment(circle, line)
    expect(mhd).toBeGreaterThan(0.1)
  })
})
