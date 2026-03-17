/**
 * 游戏音效系统
 * 使用 Web Audio API 生成合成音效，无需加载外部音频文件
 */

let audioCtx = null
let isMuted = false

/**
 * 获取或创建 AudioContext
 */
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  // 自动恢复被暂停的上下文
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/**
 * 设置静音状态
 */
export function setMuted(muted) {
  isMuted = muted
  try {
    localStorage.setItem('hand-drawing-muted', muted ? '1' : '0')
  } catch (e) { /* 忽略 */ }
}

/**
 * 获取静音状态
 */
export function getMuted() {
  try {
    const val = localStorage.getItem('hand-drawing-muted')
    if (val !== null) {
      isMuted = val === '1'
    }
  } catch (e) { /* 忽略 */ }
  return isMuted
}

// 初始化静音状态
getMuted()

/**
 * 播放简单音调
 */
function playTone(frequency, duration = 0.15, type = 'sine', volume = 0.3) {
  if (isMuted) return

  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    // 音量包络：快速上升、缓慢衰减
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch (e) {
    // 音效播放失败不影响游戏
  }
}

/**
 * 播放和弦（多个音同时）
 */
function playChord(frequencies, duration = 0.3, type = 'sine', volume = 0.15) {
  if (isMuted) return
  frequencies.forEach(freq => playTone(freq, duration, type, volume))
}

// ========== 游戏音效 ==========

/**
 * 按钮点击音效
 */
export function playClick() {
  playTone(800, 0.08, 'sine', 0.2)
}

/**
 * 开始画图音效
 */
export function playDrawStart() {
  playTone(523, 0.1, 'sine', 0.15) // C5
}

/**
 * 清除画布音效
 */
export function playClear() {
  playTone(300, 0.15, 'triangle', 0.2)
  setTimeout(() => playTone(250, 0.12, 'triangle', 0.15), 80)
}

/**
 * 提交画作音效
 */
export function playSubmit() {
  playTone(523, 0.1, 'sine', 0.25) // C5
  setTimeout(() => playTone(659, 0.1, 'sine', 0.25), 100) // E5
  setTimeout(() => playTone(784, 0.15, 'sine', 0.25), 200) // G5
}

/**
 * 通关成功音效 🎉
 */
export function playSuccess() {
  const melody = [523, 659, 784, 1047] // C5 E5 G5 C6
  melody.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.25), i * 120)
  })
  // 和弦收尾
  setTimeout(() => playChord([523, 659, 784], 0.5, 'sine', 0.12), 500)
}

/**
 * 未通关音效（鼓励）
 */
export function playEncourage() {
  playTone(392, 0.15, 'sine', 0.2) // G4
  setTimeout(() => playTone(330, 0.2, 'sine', 0.2), 150) // E4
}

/**
 * 解锁新章节音效 🔓
 */
export function playUnlock() {
  const melody = [392, 440, 523, 659, 784] // G4 A4 C5 E5 G5
  melody.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, 'sine', 0.2), i * 100)
  })
  setTimeout(() => playChord([523, 784, 1047], 0.6, 'triangle', 0.1), 550)
}

/**
 * 关卡选择音效
 */
export function playSelect() {
  playTone(660, 0.06, 'sine', 0.15)
}

/**
 * 错误/锁定音效
 */
export function playLocked() {
  playTone(200, 0.1, 'square', 0.1)
  setTimeout(() => playTone(180, 0.15, 'square', 0.08), 100)
}

/**
 * 分数递增计数音效
 */
export function playTick() {
  playTone(1200, 0.03, 'sine', 0.08)
}
