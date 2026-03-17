import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chapters, shapes, getShapesByChapter } from '../config/shapes'
import { saveProgress, loadProgress, clearProgress } from '../composables/useStorage'

/**
 * 游戏状态管理
 * 管理关卡进度、解锁状态、最高分等
 */
export const useGameStore = defineStore('game', () => {
  // ========== 状态 ==========

  // 每关的最高分记录 { shapeId: number }
  const bestScores = ref({})

  // 当前画图的临时数据（坐标点和分数）
  const currentDrawing = ref({
    points: [],
    score: null,
    shapeId: null
  })

  // ========== 初始化：从 LocalStorage 加载 ==========
  function initFromStorage() {
    const data = loadProgress()
    if (data && data.bestScores) {
      bestScores.value = data.bestScores
    }
  }

  // 启动时自动加载
  initFromStorage()

  // ========== Getters ==========

  /**
   * 获取某关卡的最高分
   */
  function getBestScore(shapeId) {
    return bestScores.value[shapeId] || 0
  }

  /**
   * 判断某关卡是否已通关
   */
  function isLevelPassed(shapeId) {
    const shape = shapes.find(s => s.id === shapeId)
    if (!shape) return false
    const chapter = chapters.find(c => c.id === shape.chapter)
    if (!chapter) return false
    return getBestScore(shapeId) >= chapter.passThreshold
  }

  /**
   * 判断某章节是否已解锁
   * 规则：第一章默认解锁，其他章需要前一章全部通关
   */
  function isChapterUnlocked(chapterId) {
    if (chapterId === 1) return true
    // 检查前一章的所有关卡是否都通关了
    const prevChapterShapes = getShapesByChapter(chapterId - 1)
    return prevChapterShapes.every(shape => isLevelPassed(shape.id))
  }

  /**
   * 获取某章节的完成进度（已通关数/总数）
   */
  function getChapterProgress(chapterId) {
    const chapterShapes = getShapesByChapter(chapterId)
    const passed = chapterShapes.filter(s => isLevelPassed(s.id)).length
    return { passed, total: chapterShapes.length }
  }

  /**
   * 获取总体完成进度
   */
  const totalProgress = computed(() => {
    const total = shapes.length
    const passed = shapes.filter(s => isLevelPassed(s.id)).length
    return { passed, total, percentage: Math.round((passed / total) * 100) }
  })

  // ========== Actions ==========

  /**
   * 提交成绩（只保存最高分）
   */
  function submitScore(shapeId, score) {
    const currentBest = getBestScore(shapeId)
    if (score > currentBest) {
      bestScores.value[shapeId] = Math.round(score)
      // 同步到 LocalStorage
      saveProgress({ bestScores: bestScores.value })
    }
  }

  /**
   * 设置当前画图数据
   */
  function setCurrentDrawing(shapeId, points, score) {
    currentDrawing.value = { shapeId, points, score }
  }

  /**
   * 清除当前画图数据
   */
  function clearCurrentDrawing() {
    currentDrawing.value = { points: [], score: null, shapeId: null }
  }

  /**
   * 重置所有进度
   */
  function resetProgress() {
    bestScores.value = {}
    clearProgress()
  }

  return {
    bestScores,
    currentDrawing,
    getBestScore,
    isLevelPassed,
    isChapterUnlocked,
    getChapterProgress,
    totalProgress,
    submitScore,
    setCurrentDrawing,
    clearCurrentDrawing,
    resetProgress
  }
})
