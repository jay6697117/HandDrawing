/**
 * LocalStorage 存取逻辑
 * 管理游戏进度的持久化存储
 */

const STORAGE_KEY = 'hand-drawing-progress'

/**
 * 保存游戏进度
 */
export function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('保存进度失败:', e)
  }
}

/**
 * 读取游戏进度
 */
export function loadProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.warn('读取进度失败:', e)
    return null
  }
}

/**
 * 清除游戏进度
 */
export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.warn('清除进度失败:', e)
  }
}
