/**
 * 相似度算法 v4.0（MHD + 几何特征惩罚版）
 * 在 MHD 距离基础上增加几何特征验证
 * 防止形状差异大的图形获得虚高分数
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

// ===== 各图形类型的距离阈值（控制宽容度和难度梯度） =====
// threshold 定义"刚好及格"的 MHD 距离
// 归一化坐标系 [0,1] 下，手绘 MHD 典型值：
//   画得好 0.03~0.08，画得一般 0.08~0.15，画得差 0.15~0.30
const TYPE_THRESHOLDS = {
  circle: 0.12,      // 圆形
  ellipse: 0.14,     // 椭圆
  line: 0.10,        // 直线最严格
  polygon: 0.15,     // 多边形收紧
  star: 0.22,        // 星形较难
  arrow: 0.20,       // 箭头
  curve: 0.22,       // 曲线类
  symbol: 0.20,      // 符号类
  composite: 0.28,   // 组合图形
}

// 边数越多的多边形越难画，给予少量宽容
const POLYGON_SIDE_BONUS = {
  3: 0,        // 三角形不加
  4: 0.01,     // 四边形微量放宽
  5: 0.02,
  6: 0.03,
  7: 0.04,
  8: 0.05,
  10: 0.06,
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
  const userResampled = resamplePoints(normalized, 64) // 用 64 个点平衡性能和精度

  // 获取标准模板点集
  const templatePoints = getTemplatePoints(shapeConfig.id)
  if (!templatePoints || templatePoints.length === 0) {
    console.warn(`未找到图形模板点集: ${shapeConfig.id}`)
    return 0
  }

  // 模板点也重采样到 64 个点来匹配
  const templateResampled = resamplePoints(templatePoints, 64)

  // 获取该图形类型的距离阈值
  let threshold = TYPE_THRESHOLDS[shapeConfig.type] || 0.25

  // 多边形根据边数额外调整
  if (shapeConfig.type === 'polygon' && shapeConfig.sides) {
    threshold += POLYGON_SIDE_BONUS[shapeConfig.sides] || 0.04
  }

  // 计算修正 Hausdorff 距离
  // 对可旋转图形使用旋转对齐（圆、星形、5边及以上正多边形允许任意方向）
  let mhd
  if (needsRotationAlignment(shapeConfig)) {
    // 旋转对齐使用较少步数以提高性能
    mhd = rotationalAlignment(userResampled, templateResampled, 24)
  } else {
    mhd = modifiedHausdorffDistance(userResampled, templateResampled)
  }

  // 距离转评分
  const rawScore = distanceToScore(mhd, threshold)

  // 几何特征惩罚：检查图形的几何属性是否符合预期
  const penalty = calculateGeometricPenalty(normalized, shapeConfig)
  const penalizedScore = rawScore * penalty

  // 调试：输出详细评分信息
  console.log(`[评分] ${shapeConfig.id}: mhd=${mhd.toFixed(4)}, threshold=${threshold}, rawScore=${rawScore.toFixed(1)}, penalty=${penalty.toFixed(2)}, final=${penalizedScore.toFixed(1)}`)

  // 应用评分曲线
  return Math.round(applyScoreCurve(penalizedScore))
}

/**
 * 判断图形是否需要旋转对齐
 * 对称图形（圆、正多边形、星形）允许任意方向绘制
 */
function needsRotationAlignment(config) {
  if (config.type === 'circle' || config.type === 'ellipse') return true
  if (config.type === 'star') return true
  // 正多边形只有 5 边及以上才旋转对齐（正方形等有明确方向性）
  if (config.type === 'polygon' && config.regular && config.sides >= 5) return true
  return false
}

/**
 * MHD 距离转评分 (0-100)
 * 使用反比例映射，距离越小分数越高
 */
function distanceToScore(mhd, threshold) {
  if (mhd <= 0) return 100

  // 评分梯度更陡峭，差的图形扣分更多
  const ratio = mhd / threshold
  if (ratio <= 0.25) {
    // 画得非常好：85-100 分
    return 100 - ratio * 60
  } else if (ratio <= 0.5) {
    // 画得不错：55-85 分
    return 85 - (ratio - 0.25) * 120
  } else if (ratio <= 1.0) {
    // 画得一般：20-55 分
    return 55 - (ratio - 0.5) * 70
  } else if (ratio <= 1.5) {
    // 画得较差：5-20 分
    return 20 - (ratio - 1.0) * 30
  } else {
    // 画得很差：0-5 分
    return Math.max(0, 5 - (ratio - 1.5) * 10)
  }
}

/**
 * 评分曲线调整
 * 让努力画的用户不会因为手抖等原因得到过低分数
 */
function applyScoreCurve(raw) {
  if (raw <= 0) return 0
  if (raw >= 100) return 100

  const x = raw / 100
  // 温和曲线：不再过度提升中低分段
  let curved
  if (x < 0.3) {
    curved = x * 0.9                             // 低分段不再提升
  } else if (x < 0.6) {
    curved = 0.27 + (x - 0.3) * 1.0              // 中段线性映射
  } else {
    curved = 0.57 + (x - 0.6) * 1.075            // 高分段正常
  }
  return Math.min(100, Math.max(0, curved * 100))
}

// ===== 几何特征惩罚系统 =====

/**
 * 计算几何特征惩罚系数
 * 返回 0~1 的惩罚因子（1.0 = 不惩罚，越小扣分越多）
 * @param {Array} points - 归一化后的用户绘制点
 * @param {Object} config - 图形配置
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
      return 1.0 // 其他类型暂不惩罚
  }
}

/**
 * 多边形几何特征惩罚
 * 检查角点数、边长比、角度、宽高比、闭合性
 */
function polygonPenalty(points, config) {
  const expectedSides = config.sides || 4
  let penalty = 1.0

  // 1. 闭合性检查（多边形应该是闭合的）
  const closed = isClosedShape(points, 0.15)
  if (!closed) {
    penalty *= 0.7 // 不闭合扣 30%
  }

  // 2. 角点数检查
  const corners = findCorners(points, 0.4)
  const cornerCount = corners.length
  const cornerDiff = Math.abs(cornerCount - expectedSides)
  if (cornerDiff === 0) {
    // 角点数完全匹配，不惩罚
  } else if (cornerDiff === 1) {
    penalty *= 0.9 // 差 1 个角，轻微惩罚
  } else if (cornerDiff === 2) {
    penalty *= 0.75 // 差 2 个角，中等惩罚
  } else {
    penalty *= 0.6 // 差太多，严重惩罚
  }

  // 3. 针对正方形的额外检查
  if (config.id === 'square' || (config.regular && expectedSides === 4)) {
    penalty *= squareSpecificPenalty(points, corners)
  }

  // 4. 针对长方形的宽高比检查
  if (config.id === 'rectangle') {
    penalty *= rectanglePenalty(points)
  }

  return Math.max(0.3, penalty) // 最低不低于 0.3
}

/**
 * 正方形专用惩罚：检查宽高比和角度
 */
function squareSpecificPenalty(points, corners) {
  let penalty = 1.0

  // 计算包围盒的宽高比
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
    // 正方形宽高比应接近 1.0
    if (aspectRatio < 0.6) {
      penalty *= 0.6 // 太扁或太窄，严重惩罚
    } else if (aspectRatio < 0.75) {
      penalty *= 0.75
    } else if (aspectRatio < 0.85) {
      penalty *= 0.9
    }
  }

  // 检查角度：如果有足够的角点，验证角度是否接近 90°
  if (corners.length >= 3) {
    let totalAngleError = 0
    let angleCount = 0
    for (let i = 0; i < corners.length && i < 6; i++) {
      const idx = corners[i]
      // 取角点前后的点来计算角度
      const prevIdx = Math.max(0, idx - Math.floor(points.length * 0.08))
      const nextIdx = Math.min(points.length - 1, idx + Math.floor(points.length * 0.08))
      if (prevIdx !== idx && nextIdx !== idx) {
        const v1 = { x: points[prevIdx].x - points[idx].x, y: points[prevIdx].y - points[idx].y }
        const v2 = { x: points[nextIdx].x - points[idx].x, y: points[nextIdx].y - points[idx].y }
        const dot = v1.x * v2.x + v1.y * v2.y
        const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2)
        const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2)
        if (mag1 > 0 && mag2 > 0) {
          const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)))
          const angle = Math.acos(cosAngle) * 180 / Math.PI
          // 正方形角度应接近 90°
          totalAngleError += Math.abs(angle - 90)
          angleCount++
        }
      }
    }
    if (angleCount > 0) {
      const avgAngleError = totalAngleError / angleCount
      if (avgAngleError > 35) {
        penalty *= 0.6 // 角度偏差太大
      } else if (avgAngleError > 25) {
        penalty *= 0.75
      } else if (avgAngleError > 15) {
        penalty *= 0.9
      }
    }
  }

  // 检查边的直线度：正方形的边应该是直的
  if (corners.length >= 3) {
    let totalStraightness = 0
    let segCount = 0
    for (let i = 0; i < corners.length - 1; i++) {
      const startIdx = corners[i]
      const endIdx = corners[i + 1]
      if (endIdx - startIdx > 3) {
        const straightness = calculateEdgeStraightness(points, startIdx, endIdx)
        totalStraightness += straightness
        segCount++
      }
    }
    if (segCount > 0) {
      const avgStraightness = totalStraightness / segCount
      // avgStraightness 接近 1.0 表示很直，越小越弯
      if (avgStraightness < 0.85) {
        penalty *= 0.7
      } else if (avgStraightness < 0.92) {
        penalty *= 0.85
      }
    }
  }

  return penalty
}

/**
 * 长方形惩罚：检查宽高比不能太接近正方形也不能太极端
 */
function rectanglePenalty(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  points.forEach(p => {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  })
  const width = maxX - minX
  const height = maxY - minY
  if (width <= 0 || height <= 0) return 1.0

  const aspectRatio = Math.min(width, height) / Math.max(width, height)
  // 长方形宽高比应该在 0.4~0.85 之间
  if (aspectRatio > 0.9) {
    return 0.85 // 太接近正方形
  }
  if (aspectRatio < 0.3) {
    return 0.8 // 太极端
  }
  return 1.0
}

/**
 * 圆形几何特征惩罚
 * 检查圆度和曲率一致性
 */
function circlePenalty(points) {
  let penalty = 1.0

  // 闭合性检查
  if (!isClosedShape(points, 0.15)) {
    penalty *= 0.7
  }

  // 圆度检查：计算各点到质心的距离方差
  const center = centroid(points)
  const distances = points.map(p => distance(p, center))
  const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length
  if (avgDist > 0) {
    const maxDist = Math.max(...distances)
    const minDist = Math.min(...distances)
    const roundness = minDist / maxDist // 1.0 = 完美圆
    if (roundness < 0.5) {
      penalty *= 0.6
    } else if (roundness < 0.7) {
      penalty *= 0.8
    } else if (roundness < 0.85) {
      penalty *= 0.9
    }
  }

  return Math.max(0.3, penalty)
}

/**
 * 直线几何特征惩罚
 * 检查路径偏离直线的程度
 */
function linePenalty(points) {
  if (points.length < 3) return 1.0

  const first = points[0]
  const last = points[points.length - 1]
  const lineLen = distance(first, last)
  if (lineLen <= 0) return 0.5

  // 计算各点到首尾连线的平均距离
  let totalDev = 0
  for (const p of points) {
    // 点到直线距离公式
    const dx = last.x - first.x
    const dy = last.y - first.y
    const dev = Math.abs(dx * (first.y - p.y) - (first.x - p.x) * dy) / lineLen
    totalDev += dev
  }
  const avgDev = totalDev / points.length
  const devRatio = avgDev / lineLen

  if (devRatio > 0.15) return 0.6
  if (devRatio > 0.08) return 0.8
  if (devRatio > 0.04) return 0.9
  return 1.0
}

/**
 * 计算一段边的直线度
 * 返回 0~1（1.0 = 完全直线）
 */
function calculateEdgeStraightness(points, startIdx, endIdx) {
  const start = points[startIdx]
  const end = points[endIdx]
  const edgeLen = distance(start, end)
  if (edgeLen <= 0) return 1.0

  let maxDev = 0
  for (let i = startIdx + 1; i < endIdx; i++) {
    const p = points[i]
    const dx = end.x - start.x
    const dy = end.y - start.y
    const dev = Math.abs(dx * (start.y - p.y) - (start.x - p.x) * dy) / edgeLen
    maxDev = Math.max(maxDev, dev)
  }

  // 用最大偏差与边长的比值衡量直线度
  return Math.max(0, 1 - maxDev / edgeLen * 5)
}
