/**
 * 相似度算法 v5.0（MHD + 几何特征惩罚版）
 * 经过全量测试校准的评分系统
 * 目标：认真画的能通关，随便画的过不了
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

// ===== 各图形类型的距离阈值 =====
// 经过全量测试校准：
//   手绘好 MHD 约 0.03~0.08，一般 0.08~0.15，差 0.15~0.30
// 阈值设置原则：认真画（noise=5px）的 ratio 应在 0.3~0.6 区间
const TYPE_THRESHOLDS = {
  circle: 0.18,      // 圆形（手绘 MHD ~0.10）
  ellipse: 0.16,     // 椭圆
  line: 0.12,        // 直线
  polygon: 0.25,     // 多边形（手绘 MHD ~0.10~0.19，需要宽松）
  star: 0.18,        // 星形
  arrow: 0.16,       // 箭头
  curve: 0.16,       // 曲线类（之前太宽松）
  symbol: 0.14,      // 符号类
  composite: 0.18,   // 组合图形（之前太宽松）
}

// 边数越多的多边形越难画，给予适度宽容
const POLYGON_SIDE_BONUS = {
  3: 0,        // 三角形不加
  4: 0.02,     // 四边形适度放宽
  5: 0.03,
  6: 0.04,
  7: 0.05,
  8: 0.06,
  10: 0.07,
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
 * 对称图形允许任意方向绘制
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
 * 经过校准的评分曲线
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
    // 画得一般：25-55 分
    return 55 - (ratio - 0.6) * 75
  } else if (ratio <= 1.5) {
    // 画得较差：5-25 分
    return 25 - (ratio - 1.0) * 40
  } else {
    // 画得很差：0-5 分
    return Math.max(0, 5 - (ratio - 1.5) * 10)
  }
}

/**
 * 评分曲线调整
 * 温和的线性映射，不再有大幅提升或压缩
 */
function applyScoreCurve(raw) {
  if (raw <= 0) return 0
  if (raw >= 100) return 100

  const x = raw / 100
  let curved
  if (x < 0.3) {
    curved = x * 0.9                             // 低分段不提升
  } else if (x < 0.6) {
    curved = 0.27 + (x - 0.3) * 1.0              // 中段线性
  } else {
    curved = 0.57 + (x - 0.6) * 1.075            // 高分段正常
  }
  return Math.min(100, Math.max(0, curved * 100))
}

// ===== 几何特征惩罚系统 =====

/**
 * 计算几何特征惩罚系数
 * 返回 0.5~1.0 的惩罚因子（1.0 = 不惩罚）
 * 惩罚较温和，主要用于区分"完全不像"的极端情况
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
      return 1.0 // 曲线/符号/组合类不惩罚（靠 MHD 阈值控制）
  }
}

/**
 * 多边形几何特征惩罚
 * 只惩罚极端偏差，容忍手绘的自然误差
 */
function polygonPenalty(points, config) {
  const expectedSides = config.sides || 4
  let penalty = 1.0

  // 1. 闭合性检查（多边形应该是闭合的）
  const closed = isClosedShape(points, 0.2) // 放宽闭合阈值
  if (!closed) {
    penalty *= 0.8 // 不闭合轻微扣分
  }

  // 2. 角点数检查（放宽容差）
  const corners = findCorners(points, 0.4)
  const cornerDiff = Math.abs(corners.length - expectedSides)
  if (cornerDiff <= 1) {
    // 差 0~1 个角不惩罚，手绘很正常
  } else if (cornerDiff === 2) {
    penalty *= 0.9
  } else if (cornerDiff >= 3) {
    penalty *= 0.8
  }

  // 3. 针对正方形的额外检查（只检查极端情况）
  if (config.id === 'square' || (config.regular && expectedSides === 4)) {
    penalty *= squareSpecificPenalty(points)
  }

  return Math.max(0.5, penalty) // 最低不低于 0.5，防止惩罚雪崩
}

/**
 * 正方形专用惩罚：只检查宽高比的极端偏差
 */
function squareSpecificPenalty(points) {
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
    // 只惩罚极端不像正方形的情况
    if (aspectRatio < 0.45) {
      penalty *= 0.7 // 宽高比太极端
    } else if (aspectRatio < 0.6) {
      penalty *= 0.85
    }
    // 0.6 以上不惩罚，手绘正方形宽高比 0.6~1.0 都算正常
  }

  return penalty
}

/**
 * 圆形几何特征惩罚
 * 只检查圆度的极端偏差
 */
function circlePenalty(points) {
  let penalty = 1.0

  // 闭合性检查
  if (!isClosedShape(points, 0.2)) {
    penalty *= 0.8
  }

  // 圆度检查：最大最小半径之比
  const center = centroid(points)
  const distances = points.map(p => distance(p, center))
  const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length
  if (avgDist > 0) {
    const maxDist = Math.max(...distances)
    const minDist = Math.min(...distances)
    const roundness = minDist / maxDist
    // 只惩罚极端不圆的情况
    if (roundness < 0.4) {
      penalty *= 0.7
    } else if (roundness < 0.6) {
      penalty *= 0.85
    }
  }

  return Math.max(0.5, penalty)
}

/**
 * 直线几何特征惩罚
 * 检测路径偏离直线的程度
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
