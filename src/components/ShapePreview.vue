<template>
  <div class="shape-preview" :style="{ borderColor: color }">
    <canvas ref="previewCanvas" class="preview-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getShapeById } from '../config/shapes'

const props = defineProps({
  shapeId: { type: String, required: true },
  size: { type: Number, default: 80 },
  color: { type: String, default: '#FF6B6B' }
})

const previewCanvas = ref(null)

function drawShape() {
  const canvas = previewCanvas.value
  if (!canvas) return

  const shape = getShapeById(props.shapeId)
  if (!shape) return

  const dpr = window.devicePixelRatio || 1
  const displaySize = props.size
  canvas.width = displaySize * dpr
  canvas.height = displaySize * dpr
  canvas.style.width = displaySize + 'px'
  canvas.style.height = displaySize + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, displaySize, displaySize)

  // 设置绘制样式
  ctx.strokeStyle = props.color
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.fillStyle = props.color

  shape.drawFn(ctx, displaySize)
}

onMounted(drawShape)
watch(() => props.shapeId, drawShape)
</script>

<style scoped>
.shape-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  border: 2px solid;
  background: white;
  padding: 4px;
  box-shadow: var(--shadow-sm);
}

.preview-canvas {
  display: block;
}
</style>
