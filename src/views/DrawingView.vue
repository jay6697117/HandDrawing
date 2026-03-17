<template>
  <div class="page drawing-page">
    <!-- 顶部导航 -->
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/levels')">←</button>
      <h1>画一个 {{ shape?.icon }} {{ shape?.name }}</h1>
    </div>

    <!-- 目标图形预览 -->
    <div class="target-section">
      <div class="target-label">目标图形</div>
      <ShapePreview
        v-if="shape"
        :shape-id="shape.id"
        :size="70"
        :color="chapterColor"
      />
    </div>

    <!-- 画板区域 -->
    <div class="canvas-section">
      <DrawingCanvas ref="drawingCanvasRef" />
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button class="btn btn-secondary" @click="handleClear">
        🗑️ 清除
      </button>
      <button
        class="btn btn-success btn-large"
        @click="handleSubmit"
        :disabled="!canSubmit"
      >
        ✅ 提交
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getShapeById, getChapter } from '../config/shapes'
import { useGameStore } from '../stores/game'
import { useRecognition } from '../composables/useRecognition'
import { playClear, playSubmit } from '../utils/audio'
import DrawingCanvas from '../components/DrawingCanvas.vue'
import ShapePreview from '../components/ShapePreview.vue'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const { recognize } = useRecognition()

const drawingCanvasRef = ref(null)
const canSubmit = ref(false)

// 获取当前图形配置
const shapeId = route.params.shapeId
const shape = getShapeById(shapeId)
const chapter = shape ? getChapter(shape.chapter) : null
const chapterColor = chapter?.color || '#FF6B6B'

// 检测是否可提交
const checkInterval = setInterval(() => {
  if (drawingCanvasRef.value) {
    canSubmit.value = drawingCanvasRef.value.hasContent
  }
}, 300)

onMounted(() => {
  // 如果图形不存在，返回关卡列表
  if (!shape) {
    router.replace('/levels')
  }
})

function handleClear() {
  playClear()
  drawingCanvasRef.value?.clear()
  canSubmit.value = false
}

function handleSubmit() {
  if (!drawingCanvasRef.value) return

  const points = drawingCanvasRef.value.getPoints()
  if (points.length < 5) return

  playSubmit()

  // 计算相似度
  const score = recognize(points, shapeId)

  // 保存到 store
  gameStore.submitScore(shapeId, score)
  gameStore.setCurrentDrawing(shapeId, points, score)

  // 清除定时器
  clearInterval(checkInterval)

  // 跳转到结果页
  router.push(`/result/${shapeId}`)
}
</script>

<style scoped>
.drawing-page {
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.target-section {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.target-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.canvas-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.actions {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-sm) 0 var(--space-md);
}

.actions .btn-success {
  flex: 2;
}

.actions .btn-secondary {
  flex: 1;
}

.actions .btn:disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>
