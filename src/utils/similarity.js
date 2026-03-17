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
// threshold 定义"刚好及格"的 MHD 距离
// 归一化坐标系 [0,1] 下，手绘 MHD 典型值：
//   画得好 0.03~0.08，画得一般 0.08~0.15，画得差 0.15~0.30
const TYPE_THRESHOLDS = {
  circle: 0.18,      // 圆形相对容易画
  ellipse: 0.20,
  line: 0.15,        // 直线最严格
  polygon: 0.22,     // 多边形中等难度
  star: 0.30,        // 星形较难，放宽
  arrow: 0.28,       // 箭头较复杂
  curve: 0.30,       // 曲线类图形放宽
  symbol: 0.28,      // 符号类
  composite: 0.35,   // 组合图形最宽松
}

// 边数越多的多边形越难画，额外宽容
const POLYGON_SIDE_BONUS = {
  3: 0,        // 三角形不加
  4: 0.02,     // 四边形稍微放宽
  5: 0.04,
  6: 0.05,
  7: 0.06,
  8: 0.07,
  10: 0.08,
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
  // 对可旋转图形使用旋转对齐（圆、正多边形、星形允许任意方向）
  let mhd
  if (needsRotationAlignment(shapeConfig)) {
    // 旋转对齐使用较少步数以提高性能
    mhd = rotationalAlignment(userResampled, templateResampled, 24)
  } else {
    mhd = modifiedHausdorffDistance(userResampled, templateResampled)
  }

  // 调试：输出 MHD 值（方便后续校准）
  console.log(`[MHD] ${shapeConfig.id}: mhd=${mhd.toFixed(4)}, threshold=${threshold}`)

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
 * 使用反比例映射，距离越小分数越高
 */
function distanceToScore(mhd, threshold) {
  if (mhd <= 0) return 100

  // 使用更宽容的评分公式
  // mhd=0 → 100 分, mhd=threshold*0.5 → ~70 分, mhd=threshold → ~40 分, mhd=threshold*2 → ~10 分
  const ratio = mhd / threshold
  if (ratio <= 0.3) {
    // 画得很好：90-100 分
    return 100 - ratio * 33
  } else if (ratio <= 0.7) {
    // 画得不错：65-90 分
    return 90 - (ratio - 0.3) * 62.5
  } else if (ratio <= 1.0) {
    // 画得一般：40-65 分
    return 65 - (ratio - 0.7) * 83.3
  } else if (ratio <= 1.5) {
    // 画得较差：15-40 分
    return 40 - (ratio - 1.0) * 50
  } else {
    // 画得很差：0-15 分
    return Math.max(0, 15 - (ratio - 1.5) * 15)
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
  // 温和的 S 型曲线：提升中低分段
  let curved
  if (x < 0.2) {
    curved = x * 1.3                          // 极低分段略提升
  } else if (x < 0.5) {
    curved = 0.26 + (x - 0.2) * 1.1          // 中低分段适度提升
  } else {
    curved = 0.59 + (x - 0.5) * 0.82         // 高分段略压缩
  }
  return Math.min(100, Math.max(0, curved * 100))
}
