<template>
  <div class="drawing-canvas-wrapper">
    <canvas
      ref="canvasEl"
      class="drawing-canvas"
      :style="{ touchAction: 'none' }"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useDrawing } from '../composables/useDrawing'

const props = defineProps({
  disabled: { type: Boolean, default: false }
})

const canvasEl = ref(null)
const { points, isDrawing, hasContent, clear, getPoints, getCanvasSize, initCanvas } = useDrawing(canvasEl)

// 暴露方法给父组件
defineExpose({
  clear,
  getPoints,
  getCanvasSize,
  hasContent,
  initCanvas
})

// 窗口大小变化时重新初始化
let resizeTimer = null
function handleResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    initCanvas()
  }, 200)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
.drawing-canvas-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  max-width: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-bg-canvas);
  border: 3px dashed var(--color-border);
  position: relative;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04);
}

.drawing-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: crosshair;
}
</style>
