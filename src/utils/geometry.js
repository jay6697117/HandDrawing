/**
 * 几何计算工具函数
 * 用于图形识别中的坐标处理和特征提取
 */

/**
 * 计算两点之间的距离
 */
export function distance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

/**
 * 归一化坐标点到 [0, 1] 范围
 * 消除位置和大小差异
 */
export function normalizePoints(points) {
  if (points.length < 2) return points

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  points.forEach(p => {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  })

  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const range = Math.max(rangeX, rangeY)

  // 居中归一化
  const offsetX = (range - rangeX) / 2
  const offsetY = (range - rangeY) / 2

  return points.map(p => ({
    x: (p.x - minX + offsetX) / range,
    y: (p.y - minY + offsetY) / range
  }))
}

/**
 * 平滑处理（移动平均滤波）
 * 去除手抖产生的噪点
 */
export function smoothPoints(points, windowSize = 5) {
  if (points.length < windowSize) return points

  const result = []
  for (let i = 0; i < points.length; i++) {
    let sumX = 0, sumY = 0, count = 0
    for (let j = Math.max(0, i - Math.floor(windowSize / 2));
         j <= Math.min(points.length - 1, i + Math.floor(windowSize / 2));
         j++) {
      sumX += points[j].x
      sumY += points[j].y
      count++
    }
    result.push({ x: sumX / count, y: sumY / count })
  }
  return result
}

/**
 * 重采样：将点集均匀采样到指定数量
 */
export function resamplePoints(points, targetCount = 64) {
  if (points.length < 2) return points

  // 计算总路径长度
  let totalLength = 0
  for (let i = 1; i < points.length; i++) {
    totalLength += distance(points[i - 1], points[i])
  }

  const interval = totalLength / (targetCount - 1)
  const result = [points[0]]
  let accumulated = 0

  for (let i = 1; i < points.length; i++) {
    const d = distance(points[i - 1], points[i])
    accumulated += d

    while (accumulated >= interval && result.length < targetCount) {
      const ratio = (accumulated - interval) / d
      const newPoint = {
        x: points[i].x - ratio * (points[i].x - points[i - 1].x),
        y: points[i].y - ratio * (points[i].y - points[i - 1].y)
      }
      result.push(newPoint)
      accumulated -= interval
    }
  }

  // 确保最后一个点
  while (result.length < targetCount) {
    result.push(points[points.length - 1])
  }
  return result.slice(0, targetCount)
}

/**
 * 检测拐角（顶点）
 * 通过曲率变化检测角点
 */
export function findCorners(points, threshold = 0.4) {
  if (points.length < 5) return []

  const corners = [0] // 第一个点总是角点

  for (let i = 2; i < points.length - 2; i++) {
    const p0 = points[i - 2]
    const p1 = points[i]
    const p2 = points[i + 2]

    // 计算夹角
    const v1 = { x: p0.x - p1.x, y: p0.y - p1.y }
    const v2 = { x: p2.x - p1.x, y: p2.y - p1.y }

    const dot = v1.x * v2.x + v1.y * v2.y
    const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2)
    const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2)

    if (mag1 === 0 || mag2 === 0) continue

    const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)))
    const angle = Math.acos(cosAngle)

    // 角度小于阈值（更尖锐的角）认为是角点
    if (angle < Math.PI * (1 - threshold)) {
      // 避免相邻角点太近
      const lastCorner = corners[corners.length - 1]
      if (i - lastCorner > points.length * 0.08) {
        corners.push(i)
      }
    }
  }

  return corners
}

/**
 * 计算路径的平均曲率
 */
export function calculateCurvature(points) {
  if (points.length < 3) return 0

  let totalCurvature = 0
  let count = 0

  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]

    const v1 = { x: p1.x - p0.x, y: p1.y - p0.y }
    const v2 = { x: p2.x - p1.x, y: p2.y - p1.y }

    const cross = v1.x * v2.y - v1.y * v2.x
    const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2)
    const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2)

    if (mag1 > 0 && mag2 > 0) {
      totalCurvature += Math.abs(cross / (mag1 * mag2))
      count++
    }
  }

  return count > 0 ? totalCurvature / count : 0
}

/**
 * 计算曲率的标准差（衡量曲率恒定性）
 */
export function curvatureVariance(points) {
  if (points.length < 3) return Infinity

  const curvatures = []
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]

    const v1 = { x: p1.x - p0.x, y: p1.y - p0.y }
    const v2 = { x: p2.x - p1.x, y: p2.y - p1.y }

    const cross = v1.x * v2.y - v1.y * v2.x
    const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2)
    const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2)

    if (mag1 > 0 && mag2 > 0) {
      curvatures.push(Math.abs(cross / (mag1 * mag2)))
    }
  }

  if (curvatures.length === 0) return Infinity

  const mean = curvatures.reduce((a, b) => a + b, 0) / curvatures.length
  const variance = curvatures.reduce((sum, c) => sum + (c - mean) ** 2, 0) / curvatures.length
  return Math.sqrt(variance)
}

/**
 * 判断路径是否闭合
 */
export function isClosedShape(points, threshold = 0.15) {
  if (points.length < 5) return false
  const first = points[0]
  const last = points[points.length - 1]
  const d = distance(first, last)

  // 计算路径包围盒大小
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  points.forEach(p => {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  })
  const boxSize = Math.max(maxX - minX, maxY - minY) || 1

  return d / boxSize < threshold
}

/**
 * 计算点集的质心
 */
export function centroid(points) {
  const cx = points.reduce((s, p) => s + p.x, 0) / points.length
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length
  return { x: cx, y: cy }
}

/**
 * 计算路径总长度
 */
export function pathLength(points) {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += distance(points[i - 1], points[i])
  }
  return total
}

// ========== 修正 Hausdorff 距离算法 ==========

/**
 * 单向平均最小距离：A 中每个点到 B 的最小距离的平均值
 * avgMinDist(A→B) = (1/|A|) × Σ min(d(a, b)) for all a∈A, b∈B
 */
export function avgMinDistance(pointsA, pointsB) {
  if (pointsA.length === 0 || pointsB.length === 0) return Infinity

  let totalMin = 0
  for (let i = 0; i < pointsA.length; i++) {
    let minDist = Infinity
    for (let j = 0; j < pointsB.length; j++) {
      const d = distance(pointsA[i], pointsB[j])
      if (d < minDist) minDist = d
    }
    totalMin += minDist
  }
  return totalMin / pointsA.length
}

/**
 * 修正 Hausdorff 距离 (MHD)
 * MHD(A, B) = max( avgMinDist(A→B), avgMinDist(B→A) )
 * 双向计算保证对称性，使用平均值替代最大值对手抖容错
 */
export function modifiedHausdorffDistance(pointsA, pointsB) {
  const ab = avgMinDistance(pointsA, pointsB)
  const ba = avgMinDistance(pointsB, pointsA)
  return Math.max(ab, ba)
}

/**
 * 旋转对齐：尝试多个旋转角度，找到最佳匹配
 * 返回最小的 MHD 值
 * @param {Array} userPoints - 用户绘制的点集（已归一化）
 * @param {Array} templatePoints - 模板点集（已归一化）
 * @param {number} steps - 尝试的旋转角度数量（默认 24 = 每 15° 一次）
 * @returns {number} 最小 MHD 距离值
 */
export function rotationalAlignment(userPoints, templatePoints, steps = 24) {
  // 计算用户点集的质心
  const userCenter = centroid(userPoints)

  let bestMHD = Infinity

  for (let i = 0; i < steps; i++) {
    const angle = (i * 2 * Math.PI) / steps
    // 围绕质心旋转用户点集
    const rotated = rotatePointsAroundCenter(userPoints, userCenter, angle)
    const mhd = modifiedHausdorffDistance(rotated, templatePoints)
    if (mhd < bestMHD) {
      bestMHD = mhd
    }
  }

  return bestMHD
}

/**
 * 围绕指定中心点旋转点集
 */
function rotatePointsAroundCenter(points, center, angle) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return points.map(p => {
    const dx = p.x - center.x
    const dy = p.y - center.y
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos
    }
  })
}

// ========== 形状分类辅助函数 ==========

/**
 * 计算路径中直线段所占比例
 * 将路径分成若干小段，检查每段的曲率是否接近 0
 * @param {Array} points - 归一化后的点集
 * @param {number} segmentSize - 每段包含的点数（默认 5）
 * @param {number} curvatureThreshold - 曲率阈值，低于此值认为是直线（默认 0.15）
 * @returns {number} 直线段比例 0~1（1 = 全是直线）
 */
export function calculateStraightLineRatio(points, segmentSize = 5, curvatureThreshold = 0.15) {
  if (points.length < segmentSize + 2) return 0

  let straightSegments = 0
  let totalSegments = 0

  for (let i = 1; i < points.length - 1; i += Math.max(1, Math.floor(segmentSize / 2))) {
    // 计算当前点的局部曲率
    const windowStart = Math.max(0, i - Math.floor(segmentSize / 2))
    const windowEnd = Math.min(points.length - 1, i + Math.floor(segmentSize / 2))

    if (windowEnd - windowStart < 2) continue

    let localCurvatureSum = 0
    let count = 0

    for (let j = windowStart + 1; j < windowEnd; j++) {
      const p0 = points[j - 1]
      const p1 = points[j]
      const p2 = points[j + 1]

      const v1 = { x: p1.x - p0.x, y: p1.y - p0.y }
      const v2 = { x: p2.x - p1.x, y: p2.y - p1.y }

      const cross = v1.x * v2.y - v1.y * v2.x
      const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2)
      const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2)

      if (mag1 > 0 && mag2 > 0) {
        localCurvatureSum += Math.abs(cross / (mag1 * mag2))
        count++
      }
    }

    if (count > 0) {
      const avgCurvature = localCurvatureSum / count
      totalSegments++
      if (avgCurvature < curvatureThreshold) {
        straightSegments++
      }
    }
  }

  return totalSegments > 0 ? straightSegments / totalSegments : 0
}

/**
 * 计算指定角点处的角度（弧度）
 * @param {Array} points - 点集
 * @param {Array} cornerIndices - 角点索引数组
 * @param {number} neighborDistance - 取角点前后多远的点来计算角度（默认 3）
 * @returns {Array} 各角点处的角度（弧度，0~π）
 */
export function calculateAnglesAtCorners(points, cornerIndices, neighborDistance = 3) {
  const angles = []

  for (const idx of cornerIndices) {
    // 取角点前后的点
    const prevIdx = Math.max(0, idx - neighborDistance)
    const nextIdx = Math.min(points.length - 1, idx + neighborDistance)

    if (prevIdx === idx || nextIdx === idx) continue

    const p0 = points[prevIdx]
    const p1 = points[idx]
    const p2 = points[nextIdx]

    // 计算从 p1 到 p0 和从 p1 到 p2 的向量夹角
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

  return angles
}
