/**
 * 形状分类器 v1.0
 * 第一阶段：判断用户绘制的图形属于哪个大类
 * 
 * 四大类别：
 *   - CURVED_CLOSED：曲线闭合类（圆、椭圆）
 *   - STRAIGHT_CLOSED：直线闭合类（多边形、星形）
 *   - OPEN_LINE：开放线条类（直线、箭头、部分曲线）
 *   - COMPLEX：复杂/不确定类（组合图形、符号）
 */

import {
  findCorners,
  isClosedShape,
  curvatureVariance,
  calculateStraightLineRatio,
  calculateAnglesAtCorners
} from './geometry'

// ===== 分类类别常量 =====
export const SHAPE_CATEGORY = {
  CURVED_CLOSED: 'curved_closed',     // 曲线闭合类（圆、椭圆）
  STRAIGHT_CLOSED: 'straight_closed', // 直线闭合类（多边形、星形）
  OPEN_LINE: 'open_line',             // 开放线条类
  COMPLEX: 'complex'                  // 复杂/不确定类
}

// ===== 目标图形类型到类别的映射 =====
const TARGET_TYPE_TO_CATEGORY = {
  circle: SHAPE_CATEGORY.CURVED_CLOSED,
  ellipse: SHAPE_CATEGORY.CURVED_CLOSED,
  polygon: SHAPE_CATEGORY.STRAIGHT_CLOSED,
  star: SHAPE_CATEGORY.STRAIGHT_CLOSED,
  line: SHAPE_CATEGORY.OPEN_LINE,
  arrow: SHAPE_CATEGORY.OPEN_LINE,
  curve: SHAPE_CATEGORY.COMPLEX,       // 曲线类太多样，不做分类惩罚
  symbol: SHAPE_CATEGORY.COMPLEX,
  composite: SHAPE_CATEGORY.COMPLEX
}

// ===== 分类阈值参数 =====
const CLASSIFY_PARAMS = {
  // 闭合检测
  closedThreshold: 0.2,          // 首尾距离/包围盒 < 0.2 认为闭合

  // 角点检测
  cornerThreshold: 0.35,         // findCorners 的灵敏度参数
  minCornersForStraight: 3,      // 至少 3 个角点才算直线闭合类

  // 曲率检测
  curvatureVarThreshold: 0.08,   // 曲率方差 < 0.08 认为曲率均匀（曲线类）
  straightLineRatioThreshold: 0.5, // 直线段比例 > 0.5 认为以直线为主

  // 分类不匹配惩罚系数
  mismatchPenalty: {
    // 曲线闭合 ↔ 直线闭合：重惩罚
    curved_straight: 0.35,
    // 闭合类 → 开放类：重惩罚
    closed_open: 0.30,
    // 开放类 → 闭合类：重惩罚
    open_closed: 0.30,
    // 涉及 COMPLEX 类：不惩罚
    complex: 1.0
  }
}

/**
 * 提取用于分类的几何特征
 * @param {Array} points - 归一化后的点集
 * @returns {Object} 特征对象
 */
export function extractFeatures(points) {
  if (!points || points.length < 10) {
    return {
      isClosed: false,
      cornerCount: 0,
      cornerIndices: [],
      curvatureVar: Infinity,
      straightLineRatio: 0,
      cornerAngles: []
    }
  }

  // 1. 闭合度检测
  const isClosed = isClosedShape(points, CLASSIFY_PARAMS.closedThreshold)

  // 2. 角点检测
  const cornerIndices = findCorners(points, CLASSIFY_PARAMS.cornerThreshold)
  const cornerCount = cornerIndices.length

  // 3. 曲率均匀度
  const curvatureVar = curvatureVariance(points)

  // 4. 直线段比例
  const straightLineRatio = calculateStraightLineRatio(points)

  // 5. 角点处的角度
  const cornerAngles = calculateAnglesAtCorners(points, cornerIndices)

  return {
    isClosed,
    cornerCount,
    cornerIndices,
    curvatureVar,
    straightLineRatio,
    cornerAngles
  }
}

/**
 * 对用户绘制的点集进行形状分类
 * @param {Array} points - 归一化后的点集
 * @returns {Object} { category, confidence, features }
 */
export function classifyShape(points) {
  const features = extractFeatures(points)

  // 决策树分类
  let category
  let confidence = 0.5 // 默认置信度

  if (!features.isClosed) {
    // === 不闭合 → 开放线条类 ===
    category = SHAPE_CATEGORY.OPEN_LINE
    confidence = 0.8
  } else if (features.cornerCount >= CLASSIFY_PARAMS.minCornersForStraight
    && features.straightLineRatio >= CLASSIFY_PARAMS.straightLineRatioThreshold) {
    // === 闭合 + 角点多 + 直线段多 → 直线闭合类 ===
    category = SHAPE_CATEGORY.STRAIGHT_CLOSED
    // 角点越多、直线段比例越高，置信度越高
    confidence = Math.min(0.95, 0.6 + features.straightLineRatio * 0.2 + Math.min(features.cornerCount, 8) * 0.02)
  } else if (features.isClosed
    && features.cornerCount <= 2
    && features.curvatureVar < CLASSIFY_PARAMS.curvatureVarThreshold) {
    // === 闭合 + 角点少 + 曲率均匀 → 曲线闭合类 ===
    category = SHAPE_CATEGORY.CURVED_CLOSED
    // 曲率越均匀，置信度越高
    confidence = Math.min(0.95, 0.7 + (1 - Math.min(features.curvatureVar / CLASSIFY_PARAMS.curvatureVarThreshold, 1)) * 0.25)
  } else if (features.isClosed && features.cornerCount <= 2) {
    // === 闭合 + 角点少 + 曲率不够均匀 → 可能是曲线闭合（较低置信度）===
    category = SHAPE_CATEGORY.CURVED_CLOSED
    confidence = 0.5
  } else if (features.isClosed && features.cornerCount >= CLASSIFY_PARAMS.minCornersForStraight) {
    // === 闭合 + 角点多但直线段不够 → 可能是直线闭合（较低置信度）===
    category = SHAPE_CATEGORY.STRAIGHT_CLOSED
    confidence = 0.5
  } else {
    // === 其他情况 → 复杂/不确定类 ===
    category = SHAPE_CATEGORY.COMPLEX
    confidence = 0.4
  }

  console.log(`[分类器] category=${category}, confidence=${confidence.toFixed(2)}, corners=${features.cornerCount}, straightRatio=${features.straightLineRatio.toFixed(2)}, curvatureVar=${features.curvatureVar.toFixed(4)}, closed=${features.isClosed}`)

  return { category, confidence, features }
}

/**
 * 获取目标图形类型对应的大类
 * @param {string} targetType - shapes config 中的 type 字段
 * @returns {string} 类别常量
 */
export function getTargetCategory(targetType) {
  return TARGET_TYPE_TO_CATEGORY[targetType] || SHAPE_CATEGORY.COMPLEX
}

/**
 * 计算类别不匹配惩罚系数
 * @param {string} drawnCategory - 用户绘制图形的分类结果
 * @param {string} targetType - 目标图形的 type
 * @param {number} confidence - 分类置信度
 * @returns {number} 惩罚系数 0.3~1.0（1.0 = 不惩罚）
 */
export function getCategoryMismatchPenalty(drawnCategory, targetType, confidence = 0.7) {
  const targetCategory = getTargetCategory(targetType)

  // 类别匹配 → 不惩罚
  if (drawnCategory === targetCategory) return 1.0

  // 涉及 COMPLEX 类 → 不惩罚（复杂图形分类不可靠）
  if (drawnCategory === SHAPE_CATEGORY.COMPLEX || targetCategory === SHAPE_CATEGORY.COMPLEX) {
    return CLASSIFY_PARAMS.mismatchPenalty.complex
  }

  // 根据置信度调整惩罚力度：置信度越高，惩罚越重
  let basePenalty

  // 曲线闭合 ↔ 直线闭合
  if ((drawnCategory === SHAPE_CATEGORY.CURVED_CLOSED && targetCategory === SHAPE_CATEGORY.STRAIGHT_CLOSED) ||
      (drawnCategory === SHAPE_CATEGORY.STRAIGHT_CLOSED && targetCategory === SHAPE_CATEGORY.CURVED_CLOSED)) {
    basePenalty = CLASSIFY_PARAMS.mismatchPenalty.curved_straight
  }
  // 闭合 → 开放 或 开放 → 闭合
  else if (drawnCategory === SHAPE_CATEGORY.OPEN_LINE ||
           targetCategory === SHAPE_CATEGORY.OPEN_LINE) {
    basePenalty = drawnCategory === SHAPE_CATEGORY.OPEN_LINE
      ? CLASSIFY_PARAMS.mismatchPenalty.open_closed
      : CLASSIFY_PARAMS.mismatchPenalty.closed_open
  }
  // 其他不匹配情况
  else {
    basePenalty = 0.4
  }

  // 根据置信度插值：低置信度时惩罚减轻
  // penalty = basePenalty + (1 - basePenalty) * (1 - confidence)
  // 当 confidence = 1.0 时用 basePenalty，confidence = 0 时不惩罚(1.0)
  const adjustedPenalty = basePenalty + (1.0 - basePenalty) * (1.0 - confidence)

  return Math.max(0.25, Math.min(1.0, adjustedPenalty))
}
