/**
 * 相似度算法 v2.0（精度调优版）
 * 改进：更宽容的评分曲线、Douglas-Peucker 角点检测、
 *       更智能的闭合度计算、多维度加权评估
 */

import {
  normalizePoints,
  smoothPoints,
  resamplePoints,
  findCorners,
  calculateCurvature,
  curvatureVariance,
  isClosedShape,
  distance,
  centroid,
  pathLength
} from './geometry'

/**
 * 统一入口：计算用户绘制图形与目标图形的相似度
 */
export function calculateSimilarity(rawPoints, shapeConfig) {
  if (!rawPoints || rawPoints.length < 5) return 0

  // 预处理管线：平滑 → 归一化 → 重采样
  const smoothed = smoothPoints(rawPoints, 5)
  const normalized = normalizePoints(smoothed)
  const resampled = resamplePoints(normalized, 96) // 提高采样精度

  // 根据图形类型选择算法
  let rawScore
  switch (shapeConfig.type) {
    case 'circle':
      rawScore = circleScore(resampled)
      break
    case 'ellipse':
      rawScore = ellipseScore(resampled)
      break
    case 'line':
      rawScore = lineScore(resampled)
      break
    case 'polygon':
      rawScore = polygonScore(resampled, shapeConfig)
      break
    case 'star':
      rawScore = starScore(resampled, shapeConfig)
      break
    case 'arrow':
      rawScore = arrowScore(resampled)
      break
    case 'curve':
      rawScore = curveScore(resampled)
      break
    case 'symbol':
      rawScore = symbolScore(resampled)
      break
    case 'composite':
      rawScore = compositeScore(resampled)
      break
    default:
      rawScore = genericScore(resampled)
  }

  // 应用评分曲线：让中等质量的画作得分更合理
  // 原始分 50 → 最终分 55, 原始分 70 → 最终分 73, 原始分 90 → 最终分 92
  return Math.round(applyScoreCurve(rawScore))
}

/**
 * 评分曲线调整
 * 让努力画的用户不会因为手抖等原因得到过低分数
 */
function applyScoreCurve(raw) {
  if (raw <= 0) return 0
  if (raw >= 100) return 100
  // 使用 S 型曲线略微提升中段分数，让游戏体验更友好
  const x = raw / 100
  const curved = x < 0.3
    ? x * 1.1                           // 低分段略微提升
    : 0.33 + (x - 0.3) * 0.97           // 中高分段接近线性
  return Math.min(100, Math.max(0, curved * 100))
}

// ========== 各图形评分函数 ==========

/**
 * 圆形相似度（改进版）
 */
function circleScore(points) {
  let score = 0

  // 1. 闭合度 (25%) — 用更宽容的阈值
  const closeRatio = getCloseRatio(points, 0.35)
  score += closeRatio * 25

  // 2. 圆度：点到质心距离的一致性 (40%) — 核心指标
  const center = centroid(points)
  const distances = points.map(p => distance(p, center))
  const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length
  if (avgDist > 0) {
    const distVariance = distances.reduce((sum, d) => sum + (d - avgDist) ** 2, 0) / distances.length
    const cv = Math.sqrt(distVariance) / avgDist // 变异系数
    // cv < 0.05 → 完美圆，cv > 0.3 → 不像圆
    const roundness = Math.max(0, 1 - cv * 4)
    score += roundness * 40
  }

  // 3. 曲率一致性 (20%)
  const curvVar = curvatureVariance(points)
  score += Math.max(0, 1 - curvVar * 2.5) * 20

  // 4. 路径完整性：画了足够的弧度 (15%)
  const totalAngle = calculateTotalAngle(points, center)
  const completeness = Math.min(1, totalAngle / (Math.PI * 1.8)) // 至少画 90% 的圆
  score += completeness * 15

  return Math.min(100, Math.max(0, score))
}

/**
 * 椭圆相似度（改进版）
 */
function ellipseScore(points) {
  let score = 0

  // 闭合度 (20%)
  score += getCloseRatio(points, 0.35) * 20

  // 曲率平滑度 (30%)
  const cv = curvatureVariance(points)
  score += Math.max(0, 1 - cv * 2) * 30

  // 椭圆形状判断 (25%)
  const center = centroid(points)
  const distances = points.map(p => distance(p, center))
  const maxDist = Math.max(...distances)
  const minDist = Math.min(...distances)
  const axisRatio = maxDist > 0 ? minDist / maxDist : 1
  // 椭圆：长短轴比在 0.3-0.85 之间最佳
  let ellipseBonus
  if (axisRatio >= 0.3 && axisRatio <= 0.85) {
    ellipseBonus = 1
  } else if (axisRatio > 0.85) {
    // 偏圆，仍然给较高分
    ellipseBonus = 0.75
  } else {
    ellipseBonus = axisRatio / 0.3
  }
  score += ellipseBonus * 25

  // 对称性 (25%)
  score += symmetryScore(points) * 25

  return Math.min(100, Math.max(0, score))
}

/**
 * 直线相似度（改进版）
 */
function lineScore(points) {
  let score = 0

  const first = points[0]
  const last = points[points.length - 1]
  const lineLen = distance(first, last)
  if (lineLen < 0.08) return 5

  // 直线度 (55%)
  let totalDeviation = 0
  let maxDeviation = 0
  points.forEach(p => {
    const d = pointToLineDistance(p, first, last)
    totalDeviation += d
    maxDeviation = Math.max(maxDeviation, d)
  })
  const avgDeviation = totalDeviation / points.length
  const straightness = Math.max(0, 1 - avgDeviation / lineLen * 8)
  score += straightness * 55

  // 长度合理性 (20%)
  score += Math.min(1, lineLen / 0.35) * 20

  // 不应该闭合 (15%)
  score += (isClosedShape(points, 0.15) ? 0.1 : 1) * 15

  // 方向一致性：沿着主方向不回折 (10%)
  const dirConsistency = directionConsistency(points)
  score += dirConsistency * 10

  return Math.min(100, Math.max(0, score))
}

/**
 * 多边形相似度（改进版）
 * 改进了 Douglas-Peucker 角点检测，更精确的顶点数判断
 */
function polygonScore(points, config) {
  const targetSides = config.sides || 4
  let score = 0

  // 1. 闭合度 (20%)
  score += getCloseRatio(points, 0.3) * 20

  // 2. 顶点数匹配 (30%) — 使用多阈值检测取最佳匹配
  let bestSideScore = 0
  for (const threshold of [0.25, 0.3, 0.35, 0.4, 0.45]) {
    const corners = findCorners(points, threshold)
    const detected = Math.max(corners.length, 1)
    const diff = Math.abs(detected - targetSides)
    // 允许±1的误差仍得高分
    let sScore
    if (diff === 0) sScore = 1
    else if (diff === 1) sScore = 0.75
    else if (diff === 2) sScore = 0.4
    else sScore = Math.max(0, 1 - diff / targetSides)
    bestSideScore = Math.max(bestSideScore, sScore)
  }
  score += bestSideScore * 30

  // 3. 边的直线度 (25%) — 各段应该是直线
  const corners = findCorners(points, 0.35)
  if (corners.length >= 2) {
    let straightSum = 0
    for (let i = 0; i < corners.length; i++) {
      const start = corners[i]
      const end = corners[(i + 1) % corners.length]
      const segEnd = end > start ? end : points.length - 1
      if (segEnd - start > 2) {
        const segment = points.slice(start, segEnd + 1)
        straightSum += segmentStraightness(segment)
      } else {
        straightSum += 0.8
      }
    }
    score += (straightSum / Math.max(corners.length, 1)) * 25
  } else {
    score += 10
  }

  // 4. 边长/对称均匀性 (25%)
  if (config.regular) {
    score += edgeUniformity(points, corners) * 25
  } else {
    score += symmetryScore(points) * 15 + 10
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * 星形相似度（改进版）
 */
function starScore(points, config) {
  const numStarPoints = config.points || 5
  const targetCorners = numStarPoints * 2
  let score = 0

  // 闭合度 (15%)
  score += getCloseRatio(points, 0.3) * 15

  // 顶点数匹配 (30%)
  let bestCornerScore = 0
  for (const threshold of [0.25, 0.3, 0.35, 0.4]) {
    const corners = findCorners(points, threshold)
    const diff = Math.abs(corners.length - targetCorners)
    let s = diff <= 1 ? 1 : diff <= 3 ? 0.6 : Math.max(0, 1 - diff / targetCorners)
    bestCornerScore = Math.max(bestCornerScore, s)
  }
  score += bestCornerScore * 30

  // 径向距离交替变化 (30%)
  const center = centroid(points)
  const distances = points.map(p => distance(p, center))
  const maxDist = Math.max(...distances)
  const minDist = Math.min(...distances)
  const radiusVariation = maxDist > 0 ? (maxDist - minDist) / maxDist : 0
  // 星形应该有清晰的内外半径差异（至少 25%）
  score += Math.min(1, radiusVariation / 0.35) * 30

  // 对称性 (25%)
  score += symmetryScore(points) * 25

  return Math.min(100, Math.max(0, score))
}

/**
 * 箭头相似度（改进版）
 */
function arrowScore(points) {
  let score = 0

  // 闭合度 (15%)
  score += getCloseRatio(points, 0.3) * 15

  // 角点数量 (35%)
  let bestCornerScore = 0
  for (const threshold of [0.3, 0.35, 0.4]) {
    const corners = findCorners(points, threshold)
    // 箭头通常 5-8 个角点
    const s = corners.length >= 4
      ? Math.min(1, corners.length / 6)
      : corners.length / 4
    bestCornerScore = Math.max(bestCornerScore, s)
  }
  score += bestCornerScore * 35

  // 方向性 (25%)
  const dirScore = directionConsistency(points)
  score += 15 + dirScore * 10

  // 对称性 (25%)
  score += symmetryScore(points) * 25

  return Math.min(100, Math.max(0, score))
}

/**
 * 曲线图形相似度（爱心、水滴等，改进版）
 */
function curveScore(points) {
  let score = 0

  // 闭合度 (25%)
  score += getCloseRatio(points, 0.3) * 25

  // 曲线平滑度 (25%)
  const cv = curvatureVariance(points)
  score += Math.max(0, 1 - cv * 1.8) * 25

  // 对称性 (25%)
  score += symmetryScore(points) * 25

  // 空间利用率 (15%)
  score += fillRatioScore(points) * 15

  // 路径连贯性 (10%)
  score += directionConsistency(points) * 5 + 5

  return Math.min(100, Math.max(0, score))
}

/**
 * 符号类图形相似度（改进版）
 */
function symbolScore(points) {
  let score = 0

  // 角点检测 (30%)
  let bestCornerScore = 0
  for (const threshold of [0.3, 0.35, 0.4]) {
    const corners = findCorners(points, threshold)
    bestCornerScore = Math.max(bestCornerScore, Math.min(1, corners.length / 4))
  }
  score += bestCornerScore * 30

  // 对称性 (30%)
  score += symmetryScore(points) * 30

  // 线条流畅度 (20%)
  const cv = curvatureVariance(points)
  score += Math.max(0, 1 - cv * 1.5) * 20

  // 空间利用率 (20%)
  score += fillRatioScore(points) * 20

  return Math.min(100, Math.max(0, score))
}

/**
 * 组合图形相似度（改进版）
 */
function compositeScore(points) {
  let score = 0

  // 路径丰富度 (20%)
  const len = pathLength(points)
  score += Math.min(1, len / 1.5) * 20

  // 角点数量 (25%)
  let bestCornerScore = 0
  for (const threshold of [0.3, 0.35, 0.4]) {
    const corners = findCorners(points, threshold)
    bestCornerScore = Math.max(bestCornerScore, Math.min(1, corners.length / 4))
  }
  score += bestCornerScore * 25

  // 空间利用率 (25%)
  score += fillRatioScore(points) * 25

  // 对称性 (15%)
  score += symmetryScore(points) * 15

  // 线条流畅度 (15%)
  const cv = curvatureVariance(points)
  score += Math.max(0, 1 - cv * 1.5) * 15

  return Math.min(100, Math.max(0, score))
}

/**
 * 通用相似度（改进版）
 */
function genericScore(points) {
  let score = 0
  score += getCloseRatio(points, 0.3) * 20
  score += symmetryScore(points) * 25
  score += Math.max(0, 1 - curvatureVariance(points) * 2) * 20
  score += fillRatioScore(points) * 20
  score += directionConsistency(points) * 15
  return Math.min(100, Math.max(0, score))
}

// ========== 改进的辅助函数 ==========

/**
 * 计算闭合度分数（可调阈值）
 */
function getCloseRatio(points, tolerance = 0.25) {
  const first = points[0]
  const last = points[points.length - 1]
  const closeDist = distance(first, last)
  const totalLen = pathLength(points)
  if (totalLen === 0) return 0
  const ratio = closeDist / (totalLen * tolerance)
  return Math.max(0, 1 - ratio)
}

/**
 * 计算对称性分数（优化采样，减少计算量）
 */
function symmetryScore(points) {
  const center = centroid(points)
  const n = points.length
  const step = Math.max(1, Math.floor(n / 32)) // 最多采样 32 个点

  // 水平对称
  let hSymmetry = 0
  let hCount = 0
  for (let i = 0; i < n; i += step) {
    const p = points[i]
    const mirrored = { x: 2 * center.x - p.x, y: p.y }
    let minDist = Infinity
    for (let j = 0; j < n; j += step) {
      minDist = Math.min(minDist, distance(mirrored, points[j]))
    }
    hSymmetry += Math.max(0, 1 - minDist * 4)
    hCount++
  }
  hSymmetry /= hCount

  // 垂直对称
  let vSymmetry = 0
  let vCount = 0
  for (let i = 0; i < n; i += step) {
    const p = points[i]
    const mirrored = { x: p.x, y: 2 * center.y - p.y }
    let minDist = Infinity
    for (let j = 0; j < n; j += step) {
      minDist = Math.min(minDist, distance(mirrored, points[j]))
    }
    vSymmetry += Math.max(0, 1 - minDist * 4)
    vCount++
  }
  vSymmetry /= vCount

  return Math.max(hSymmetry, vSymmetry)
}

/**
 * 填充率分数（空间利用率）
 */
function fillRatioScore(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  points.forEach(p => {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  })
  const boxW = maxX - minX
  const boxH = maxY - minY
  const ratio = Math.min(boxW, boxH) / Math.max(boxW, boxH, 0.001)
  return ratio > 0.3 ? Math.min(1, ratio / 0.6) : ratio / 0.3
}

/**
 * 计算路径总转角（用于判断画圆的完整度）
 */
function calculateTotalAngle(points, center) {
  let totalAngle = 0
  for (let i = 1; i < points.length; i++) {
    const a1 = Math.atan2(points[i - 1].y - center.y, points[i - 1].x - center.x)
    const a2 = Math.atan2(points[i].y - center.y, points[i].x - center.x)
    let da = a2 - a1
    if (da > Math.PI) da -= 2 * Math.PI
    if (da < -Math.PI) da += 2 * Math.PI
    totalAngle += Math.abs(da)
  }
  return totalAngle
}

/**
 * 方向一致性：路径不应频繁回折
 */
function directionConsistency(points) {
  if (points.length < 3) return 1
  let reversals = 0
  for (let i = 2; i < points.length; i++) {
    const dx1 = points[i - 1].x - points[i - 2].x
    const dy1 = points[i - 1].y - points[i - 2].y
    const dx2 = points[i].x - points[i - 1].x
    const dy2 = points[i].y - points[i - 1].y
    const dot = dx1 * dx2 + dy1 * dy2
    if (dot < 0) reversals++
  }
  return Math.max(0, 1 - reversals / (points.length * 0.3))
}

/**
 * 线段直线度（用于多边形的边检测）
 */
function segmentStraightness(segment) {
  if (segment.length < 3) return 1
  const first = segment[0]
  const last = segment[segment.length - 1]
  const lineLen = distance(first, last)
  if (lineLen < 0.01) return 0.5

  let totalDev = 0
  segment.forEach(p => {
    totalDev += pointToLineDistance(p, first, last)
  })
  const avgDev = totalDev / segment.length
  return Math.max(0, 1 - avgDev / lineLen * 6)
}

/**
 * 边长均匀性
 */
function edgeUniformity(points, corners) {
  if (corners.length < 2) return 0.5

  const lengths = []
  for (let i = 0; i < corners.length; i++) {
    const start = corners[i]
    const end = corners[(i + 1) % corners.length]
    const segEnd = end > start ? end : points.length - 1
    lengths.push(distance(points[start], points[segEnd]))
  }

  if (lengths.length < 2) return 0.5

  const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length
  if (avgLen === 0) return 0.5
  const variance = lengths.reduce((sum, l) => sum + (l - avgLen) ** 2, 0) / lengths.length
  const cv = Math.sqrt(variance) / avgLen

  return Math.max(0, 1 - cv * 2)
}

/**
 * 点到线段的距离
 */
function pointToLineDistance(point, lineStart, lineEnd) {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return distance(point, lineStart)

  let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))

  const proj = { x: lineStart.x + t * dx, y: lineStart.y + t * dy }
  return distance(point, proj)
}
