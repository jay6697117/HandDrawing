import { calculateSimilarity } from '../utils/similarity'
import { getShapeById } from '../config/shapes'

/**
 * 图形识别 composable
 * 封装预处理 + 识别 + 评分的完整流程
 */
export function useRecognition() {
  /**
   * 识别图形并计算相似度
   * @param {Array} points - 用户绘制的坐标点
   * @param {string} targetShapeId - 目标图形 ID
   * @returns {number} 相似度百分比 (0-100)
   */
  function recognize(points, targetShapeId) {
    const shapeConfig = getShapeById(targetShapeId)
    if (!shapeConfig) {
      console.warn(`未找到图形配置: ${targetShapeId}`)
      return 0
    }

    if (!points || points.length < 5) {
      return 0
    }

    return calculateSimilarity(points, shapeConfig)
  }

  return { recognize }
}
