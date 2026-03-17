/**
 * 相似度算法 v6.0（形状分类器 + MHD + 几何特征惩罚版）
 * 两阶段评分：
 *   第一阶段：形状分类器判断用户画的图形属于哪个大类
 *   第二阶段：MHD + 几何特征惩罚计算相似度
 * 类别不匹配时大幅惩罚，避免"画圆通关正方形"问题
 */

import {
  normalizePoints,
  smoothPoints,
  resamplePoints,
  modifiedHausdorffDistance,
  rotationalAlignment,
  distance,
  findCorners,
  isClosedShape,
  centroid
} from './geometry'
import { getTemplatePoints } from '../config/shapes'
import { classifyShape, getCategoryMismatchPenalty } from './shapeClassifier'

// ===== 各图形类型的距离阈值 =====
// v6.0 收紧阈值，尤其是 polygon
const TYPE_THRESHOLDS = {
  circle: 0.18,      // 圆形
  ellipse: 0.16,     // 椭圆
  line: 0.12,        // 直线
  polygon: 0.18,     // 多边形（从 0.25 收紧到 0.18）
  star: 0.18,        // 星形
  arrow: 0.16,       // 箭头
  curve: 0.16,       // 曲线类
  symbol: 0.14,      // 符号类
  composite: 0.18,   // 组合图形
}

// 边数越多的多边形越难画，给予适度宽容（v6.0 缩小 bonus）
const POLYGON_SIDE_BONUS = {
  3: 0,        // 三角形不加
  4: 0.01,     // 四边形微量放宽（从 0.02 缩小）
  5: 0.02,
  6: 0.03,
  7: 0.03,
  8: 0.04,
  10: 0.05,
}

/**
 * 统一入口：计算用户绘制图形与目标图形的相似度
 * @param {Array} rawPoints - 用户绘制的原始坐标点
 * @param {Object} shapeConfig - 图形配置对象
 * @returns {number} 相似度百分比 (0-100)
 */
export function calculateSimilarity(rawPoints, shapeConfig) {
  if (!rawPoints || rawPoints.length < 5) return 0

  // 预处理管线：平滑 → 归一化 → 重采样
  const smoothed = smoothPoints(rawPoints, 5)
  const normalized = normalizePoints(smoothed)
  const userResampled = resamplePoints(normalized, 64)

  // ===== 第一阶段：形状分类器 =====
  // 分类器使用轻量平滑（窗口 3）的点，保留角点等几何特征
  // MHD 计算仍使用重平滑（窗口 5）的点来去除手抖噪声
  const classifySmoothed = smoothPoints(rawPoints, 3)
  const classifyNormalized = normalizePoints(classifySmoothed)
  const classification = classifyShape(classifyNormalized)
  const categoryPenalty = getCategoryMismatchPenalty(
    classification.category,
    shapeConfig.type,
    classification.confidence
  )

  // 获取标准模板点集
  const templatePoints = getTemplatePoints(shapeConfig.id)
  if (!templatePoints || templatePoints.length === 0) {
    console.warn(`未找到图形模板点集: ${shapeConfig.id}`)
    return 0
  }

  // 模板点也重采样到 64 个点来匹配
  const templateResampled = resamplePoints(templatePoints, 64)

  // 获取该图形类型的距离阈值
  let threshold = TYPE_THRESHOLDS[shapeConfig.type] || 0.20
  // 多边形根据边数额外调整
  if (shapeConfig.type === 'polygon' && shapeConfig.sides) {
    threshold += POLYGON_SIDE_BONUS[shapeConfig.sides] || 0.03
  }

  // ===== 第二阶段：MHD 评分 =====
  let mhd
  if (needsRotationAlignment(shapeConfig)) {
    mhd = rotationalAlignment(userResampled, templateResampled, 24)
  } else {
    mhd = modifiedHausdorffDistance(userResampled, templateResampled)
  }

  // 距离转评分
  const rawScore = distanceToScore(mhd, threshold)

  // 几何特征惩罚（使用轻量平滑的点，保留角点特征）
  const geometryPenalty = calculateGeometricPenalty(classifyNormalized, shapeConfig)

  // 合并所有惩罚：MHD分 × 几何惩罚 × 类别惩罚
  const penalizedScore = rawScore * geometryPenalty * categoryPenalty

  // 调试：输出详细评分信息
  console.log(`[评分v6] ${shapeConfig.id}: mhd=${mhd.toFixed(4)}, threshold=${threshold}, rawScore=${rawScore.toFixed(1)}, geometryPenalty=${geometryPenalty.toFixed(2)}, categoryPenalty=${categoryPenalty.toFixed(2)}, category=${classification.category}, final=${penalizedScore.toFixed(1)}`)

  // 应用评分曲线
  return Math.round(applyScoreCurve(penalizedScore))
}

/**
 * 判断图形是否需要旋转对齐
 */
function needsRotationAlignment(config) {
  if (config.type === 'circle' || config.type === 'ellipse') return true
  if (config.type === 'star') return true
  if (config.type === 'polygon' && config.regular && config.sides >= 5) return true
  return false
}

/**
 * MHD 距离转评分 (0-100)
 * v6.0 评分曲线更陡峭
 */
function distanceToScore(mhd, threshold) {
  if (mhd <= 0) return 100

  const ratio = mhd / threshold
  if (ratio <= 0.3) {
    // 画得非常好：85-100 分
    return 100 - ratio * 50
  } else if (ratio <= 0.6) {
    // 画得不错：55-85 分
    return 85 - (ratio - 0.3) * 100
  } else if (ratio <= 1.0) {
    // 画得一般：20-55 分
    return 55 - (ratio - 0.6) * 87.5
  } else if (ratio <= 1.5) {
    // 画得较差：0-20 分
    return 20 - (ratio - 1.0) * 40
  } else {
    // 画得很差：0 分
    return Math.max(0, 0 - (ratio - 1.5) * 10)
  }
}

/**
 * 评分曲线调整（v6.0 微调）
 */
function applyScoreCurve(raw) {
  if (raw <= 0) return 0
  if (raw >= 100) return 100

  const x = raw / 100
  let curved
  if (x < 0.25) {
    curved = x * 0.8                             // 低分段压低
  } else if (x < 0.6) {
    curved = 0.20 + (x - 0.25) * 1.0             // 中段线性
  } else {
    curved = 0.55 + (x - 0.6) * 1.125            // 高分段正常
  }
  return Math.min(100, Math.max(0, curved * 100))
}

// ===== 几何特征惩罚系统（v6.0 增强版） =====

/**
 * 计算几何特征惩罚系数
 * 返回 0.4~1.0 的惩罚因子
 */
function calculateGeometricPenalty(points, config) {
  if (!points || points.length < 10) return 1.0

  switch (config.type) {
    case 'polygon':
      return polygonPenalty(points, config)
    case 'circle':
      return circlePenalty(points)
    case 'line':
      return linePenalty(points)
    default:
      return 1.0
  }
}

/**
 * 多边形几何特征惩罚（v6.0 增强）
 */
function polygonPenalty(points, config) {
  const expectedSides = config.sides || 4
  let penalty = 1.0

  // 1. 闭合性检查
  const closed = isClosedShape(points, 0.2)
  if (!closed) {
    penalty *= 0.75
  }

  // 2. 角点数检查
  const corners = findCorners(points, 0.4)
  const cornerDiff = Math.abs(corners.length - expectedSides)
  if (cornerDiff <= 1) {
    // 差 0~1 个角不惩罚
  } else if (cornerDiff === 2) {
    penalty *= 0.85
  } else if (cornerDiff >= 3) {
    penalty *= 0.7
  }

  // 3. 针对正方形的额外检查
  if (config.id === 'square' || (config.regular && expectedSides === 4)) {
    penalty *= squareSpecificPenalty(points)
  }

  return Math.max(0.4, penalty)
}

/**
 * 正方形专用惩罚（v6.0 增强）
 */
function squareSpecificPenalty(points) {
  let penalty = 1.0

  // 1. 宽高比检查
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  points.forEach(p => {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  })
  const width = maxX - minX
  const height = maxY - minY
  if (width > 0 && height > 0) {
    const aspectRatio = Math.min(width, height) / Math.max(width, height)
    if (aspectRatio < 0.45) {
      penalty *= 0.65
    } else if (aspectRatio < 0.6) {
      penalty *= 0.8
    }
  }

  // 2. 角点角度检查：正方形的角应该接近 90°（π/2）
  const corners = findCorners(points, 0.35)
  if (corners.length >= 3) {
    // 动态调整 neighborDistance 根据点集大小
    const neighborDist = Math.max(2, Math.floor(points.length * 0.05))
    const angles = []
    for (const idx of corners) {
      const prevIdx = Math.max(0, idx - neighborDist)
      const nextIdx = Math.min(points.length - 1, idx + neighborDist)
      if (prevIdx === idx || nextIdx === idx) continue

      const p0 = points[prevIdx]
      const p1 = points[idx]
      const p2 = points[nextIdx]
      const v1 = { x: p0.x - p1.x, y: p0.y - p1.y }
      const v2 = { x: p2.x - p1.x, y: p2.y - p1.y }
      const dot = v1.x * v2.x + v1.y * v2.y
      const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2)
      const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2)
      if (mag1 > 0 && mag2 > 0) {
        const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)))
        angles.push(Math.acos(cosAngle))
      }
    }

    if (angles.length >= 3) {
      const targetAngle = Math.PI / 2 // 90°
      const avgAngleDev = angles.reduce((sum, a) => sum + Math.abs(a - targetAngle), 0) / angles.length
      // 角度偏差大 → 惩罚
      if (avgAngleDev > 0.6) {
        penalty *= 0.7
      } else if (avgAngleDev > 0.4) {
        penalty *= 0.85
      }
    }
  }

  return penalty
}

/**
 * 圆形几何特征惩罚（v6.0 增强）
 */
function circlePenalty(points) {
  let penalty = 1.0

  // 闭合性检查
  if (!isClosedShape(points, 0.2)) {
    penalty *= 0.75
  }

  // 圆度检查
  const center = centroid(points)
  const distances = points.map(p => distance(p, center))
  const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length
  if (avgDist > 0) {
    const maxDist = Math.max(...distances)
    const minDist = Math.min(...distances)
    const roundness = minDist / maxDist
    if (roundness < 0.4) {
      penalty *= 0.65
    } else if (roundness < 0.6) {
      penalty *= 0.8
    }
  }

  return Math.max(0.4, penalty)
}

/**
 * 直线几何特征惩罚
 */
function linePenalty(points) {
  if (points.length < 3) return 1.0

  const first = points[0]
  const last = points[points.length - 1]
  const lineLen = distance(first, last)
  if (lineLen <= 0) return 0.5

  let totalDev = 0
  for (const p of points) {
    const dx = last.x - first.x
    const dy = last.y - first.y
    const dev = Math.abs(dx * (first.y - p.y) - (first.x - p.x) * dy) / lineLen
    totalDev += dev
  }
  const avgDev = totalDev / points.length
  const devRatio = avgDev / lineLen

  if (devRatio > 0.2) return 0.6
  if (devRatio > 0.1) return 0.8
  return 1.0
}
