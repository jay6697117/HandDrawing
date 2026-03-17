<template>
  <div class="page page-center result-page">
    <!-- 结果标题 -->
    <div class="result-header animate-bounce-in">
      <template v-if="isPassed">
        <div class="result-emoji">🎉</div>
        <h2 class="result-title result-title--success">太棒了！</h2>
      </template>
      <template v-else>
        <div class="result-emoji">💪</div>
        <h2 class="result-title result-title--retry">再接再厉！</h2>
      </template>
    </div>

    <!-- 相似度展示 -->
    <SimilarityBar :value="score" />

    <!-- 通关提示 -->
    <div class="pass-info" v-if="chapter">
      <span :class="isPassed ? 'pass-badge--success' : 'pass-badge--fail'">
        {{ isPassed ? '✅ 已通关' : `❌ 未达标（需 ${chapter.passThreshold}%）` }}
      </span>
    </div>

    <!-- 图形对比 -->
    <div class="comparison">
      <div class="comparison-item">
        <div class="comparison-label">你画的</div>
        <div class="comparison-canvas-wrap">
          <canvas ref="userCanvas" class="comparison-canvas"></canvas>
        </div>
      </div>
      <div class="comparison-vs">VS</div>
      <div class="comparison-item">
        <div class="comparison-label">标准图形</div>
        <ShapePreview
          v-if="shape"
          :shape-id="shape.id"
          :size="100"
          :color="chapterColor"
        />
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="result-actions">
      <button class="btn btn-secondary" @click="handleRetry">
        🔄 再试一次
      </button>
      <button
        class="btn btn-primary"
        @click="handleNext"
        v-if="nextShape"
      >
        ➡️ 下一关
      </button>
      <button class="btn btn-secondary" @click="$router.push('/levels')">
        🗺️ 返回关卡
      </button>
    </div>

    <!-- 庆祝彩纸效果 -->
    <div class="confetti-container" v-if="isPassed && showConfetti">
      <div
        v-for="i in 30"
        :key="i"
        class="confetti"
        :style="confettiStyle(i)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getShapeById, getChapter, getShapesByChapter, shapes } from '../config/shapes'
import { useGameStore } from '../stores/game'
import { playSuccess, playEncourage, playClick } from '../utils/audio'
import SimilarityBar from '../components/SimilarityBar.vue'
import ShapePreview from '../components/ShapePreview.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

const shapeId = route.params.shapeId
const shape = getShapeById(shapeId)
const chapter = shape ? getChapter(shape.chapter) : null
const chapterColor = chapter?.color || '#FF6B6B'

// 获取分数
const score = gameStore.currentDrawing.score || gameStore.getBestScore(shapeId)
const userPoints = gameStore.currentDrawing.points || []

const isPassed = computed(() => {
  if (!chapter) return false
  return score >= chapter.passThreshold
})

const showConfetti = ref(false)

// 下一关
const nextShape = computed(() => {
  if (!shape) return null
  const currentIndex = shapes.findIndex(s => s.id === shapeId)
  if (currentIndex < shapes.length - 1) {
    const next = shapes[currentIndex + 1]
    // 只有在同一章或者已解锁的情况下才显示下一关
    if (next.chapter === shape.chapter || gameStore.isChapterUnlocked(next.chapter)) {
      return next
    }
  }
  return null
})

// 用户画布
const userCanvas = ref(null)

function drawUserCanvas() {
  const canvas = userCanvas.value
  if (!canvas || userPoints.length < 2) return

  const size = 100
  const dpr = window.devicePixelRatio || 1
  canvas.width = size * dpr
  canvas.height = size * dpr
  canvas.style.width = size + 'px'
  canvas.style.height = size + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  // 归一化用户坐标到画布
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  userPoints.forEach(p => {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  })

  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const range = Math.max(rangeX, rangeY)
  const padding = 10

  ctx.strokeStyle = '#2D3436'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()

  userPoints.forEach((p, i) => {
    const x = ((p.x - minX) / range) * (size - padding * 2) + padding
    const y = ((p.y - minY) / range) * (size - padding * 2) + padding
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()
}

// 彩纸效果
const confettiColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FF914D', '#45B7D1']
function confettiStyle(i) {
  return {
    left: Math.random() * 100 + '%',
    background: confettiColors[i % confettiColors.length],
    animationDelay: Math.random() * 2 + 's',
    animationDuration: (2 + Math.random() * 2) + 's',
    width: (4 + Math.random() * 6) + 'px',
    height: (4 + Math.random() * 6) + 'px',
    borderRadius: Math.random() > 0.5 ? '50%' : '2px'
  }
}

function handleRetry() {
  playClick()
  gameStore.clearCurrentDrawing()
  router.push(`/draw/${shapeId}`)
}

function handleNext() {
  if (nextShape.value) {
    playClick()
    gameStore.clearCurrentDrawing()
    router.push(`/draw/${nextShape.value.id}`)
  }
}

onMounted(() => {
  drawUserCanvas()
  if (isPassed.value) {
    showConfetti.value = true
    // 延迟播放成功音效，配合进度条动画
    setTimeout(() => playSuccess(), 800)
    setTimeout(() => { showConfetti.value = false }, 4000)
  } else {
    // 延迟播放鼓励音效
    setTimeout(() => playEncourage(), 600)
  }
  // 如果没有分数数据，跳回
  if (!score && score !== 0) {
    router.replace('/levels')
  }
})
</script>

<style scoped>
.result-page {
  background: linear-gradient(180deg, #FFF5F5 0%, #FFF 100%);
  gap: var(--space-md);
  position: relative;
  overflow: hidden;
}

.result-header {
  text-align: center;
}

.result-emoji {
  font-size: 3.5rem;
  margin-bottom: var(--space-xs);
}

.result-title {
  font-size: 1.5rem;
  font-weight: 900;
}

.result-title--success {
  color: var(--color-secondary);
}

.result-title--retry {
  color: var(--color-primary);
}

.pass-info {
  text-align: center;
}

.pass-badge--success,
.pass-badge--fail {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 4px 16px;
  border-radius: var(--radius-full);
}

.pass-badge--success {
  background: rgba(78, 205, 196, 0.15);
  color: var(--color-secondary-dark);
}

.pass-badge--fail {
  background: rgba(255, 107, 107, 0.1);
  color: var(--color-primary);
}

.comparison {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.comparison-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.comparison-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.comparison-canvas-wrap {
  width: 108px;
  height: 108px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: white;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.comparison-canvas {
  display: block;
}

.comparison-vs {
  font-size: 1rem;
  font-weight: 900;
  color: var(--color-text-muted);
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  width: 100%;
  max-width: 340px;
  justify-content: center;
}

.result-actions .btn {
  flex: 1;
  min-width: 120px;
}

/* 彩纸动画 */
.confetti-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}

.confetti {
  position: absolute;
  top: -10px;
  animation: confetti-fall linear forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
</style>
