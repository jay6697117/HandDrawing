<template>
  <div class="similarity-bar">
    <svg class="ring" viewBox="0 0 120 120">
      <!-- 背景圆环 -->
      <circle cx="60" cy="60" r="52" fill="none" stroke="#f0f0f0" stroke-width="10" />
      <!-- 进度圆环 -->
      <circle
        cx="60" cy="60" r="52"
        fill="none"
        :stroke="color"
        stroke-width="10"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90 60 60)"
        class="ring-progress"
      />
    </svg>
    <div class="ring-value" :style="{ color }">
      <span class="ring-number">{{ displayValue }}</span>
      <span class="ring-percent">%</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 }
})

const displayValue = ref(0)
const circumference = 2 * Math.PI * 52

const dashOffset = computed(() => {
  return circumference * (1 - displayValue.value / 100)
})

const color = computed(() => {
  if (displayValue.value >= 70) return '#4ECDC4'
  if (displayValue.value >= 40) return '#FFD93D'
  return '#FF6B6B'
})

// 数字递增动画
onMounted(() => {
  const target = props.value
  const duration = 1200
  const start = performance.now()

  function animate(now) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    // 缓动函数
    const eased = 1 - (1 - progress) ** 3
    displayValue.value = Math.round(target * eased)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  // 延迟一下再开始动画
  setTimeout(() => requestAnimationFrame(animate), 300)
})
</script>

<style scoped>
.similarity-bar {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  width: 100%;
  height: 100%;
}

.ring-progress {
  transition: stroke-dashoffset 0.3s ease;
}

.ring-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.ring-number {
  font-size: 2.8rem;
  font-weight: 900;
  line-height: 1;
}

.ring-percent {
  font-size: 1.2rem;
  font-weight: 700;
}
</style>
