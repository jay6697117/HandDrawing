/**
 * 相似度算法 v3.0（修正 Hausdorff 距离版）
 * 完全替换旧版特征提取算法
 * 使用修正 Hausdorff 距离 (MHD) 统一评分
 */

import {
  normalizePoints,
  smoothPoints,
  resamplePoints,
  modifiedHausdorffDistance,
  rotationalAlignment,
  distance
} from './geometry'
import { getTemplatePoints } from '../config/shapes'

// ===== 各图形类型的距离阈值（控制宽容度和难度梯度） =====
// threshold 越大 → 评分越宽松；越小 → 越严格
const TYPE_THRESHOLDS = {
  circle: 0.12,      // 圆形相对容易画
  ellipse: 0.14,
  line: 0.10,        // 直线最严格
  polygon: 0.16,     // 多边形中等难度
  star: 0.22,        // 星形较难，放宽
  arrow: 0.20,       // 箭头较复杂
  curve: 0.22,       // 曲线类图形放宽
  symbol: 0.20,      // 符号类
  composite: 0.25,   // 组合图形最宽松
}

// 边数越多的多边形越难画，额外宽容
const POLYGON_SIDE_BONUS = {
  3: 0,       // 三角形不加
  4: 0.01,    // 四边形稍微放宽
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
  const userResampled = resamplePoints(normalized, 96)

  // 获取标准模板点集
  const templatePoints = getTemplatePoints(shapeConfig.id)
  if (!templatePoints || templatePoints.length === 0) {
    console.warn(`未找到图形模板点集: ${shapeConfig.id}`)
    return 0
  }

  // 获取该图形类型的距离阈值
  let threshold = TYPE_THRESHOLDS[shapeConfig.type] || 0.18

  // 多边形根据边数额外调整
  if (shapeConfig.type === 'polygon' && shapeConfig.sides) {
    threshold += POLYGON_SIDE_BONUS[shapeConfig.sides] || 0.03
  }

  // 计算修正 Hausdorff 距离
  // 对可能旋转的图形使用旋转对齐（如圆形、正多边形、星形不需要严格方向）
  let mhd
  if (needsRotationAlignment(shapeConfig)) {
    mhd = rotationalAlignment(userResampled, templatePoints, 36)
  } else {
    mhd = modifiedHausdorffDistance(userResampled, templatePoints)
  }

  // 距离转评分
  const rawScore = distanceToScore(mhd, threshold)

  // 应用评分曲线
  return Math.round(applyScoreCurve(rawScore))
}

/**
 * 判断图形是否需要旋转对齐
 * 对称图形（圆、正多边形、星形）允许任意方向绘制
 */
function needsRotationAlignment(config) {
  if (config.type === 'circle' || config.type === 'ellipse') return true
  if (config.type === 'star') return true
  if (config.type === 'polygon' && config.regular) return true
  return false
}

/**
 * MHD 距离转评分 (0-100)
 * 距离越小分数越高
 */
function distanceToScore(mhd, threshold) {
  if (mhd <= 0) return 100
  if (mhd >= threshold) {
    // 超过阈值后快速衰减，但不会直接归零
    const overflow = (mhd - threshold) / threshold
    return Math.max(0, 30 * (1 - overflow))
  }
  // 阈值内：线性映射到 30-100
  return 30 + 70 * (1 - mhd / threshold)
}

/**
 * 评分曲线调整
 * 让努力画的用户不会因为手抖等原因得到过低分数
 */
function applyScoreCurve(raw) {
  if (raw <= 0) return 0
  if (raw >= 100) return 100

  const x = raw / 100
  // S 型曲线：低分段提升更多，高分段接近线性
  const curved = x < 0.3
    ? x * 1.15                          // 低分段提升
    : 0.345 + (x - 0.3) * 0.935        // 中高分段接近线性
  return Math.min(100, Math.max(0, curved * 100))
}
