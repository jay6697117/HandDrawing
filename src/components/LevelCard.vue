<template>
  <div
    class="level-card"
    :class="{
      'level-card--locked': locked,
      'level-card--passed': passed
    }"
    @click="handleClick"
  >
    <div class="level-card__icon">{{ shape.icon }}</div>
    <div class="level-card__name">{{ shape.name }}</div>
    <div class="level-card__score" v-if="!locked">
      <template v-if="bestScore > 0">
        <span class="score-value" :style="{ color: scoreColor }">{{ bestScore }}%</span>
      </template>
      <template v-else>
        <span class="score-empty">未挑战</span>
      </template>
    </div>
    <div class="level-card__lock" v-if="locked">🔒</div>
    <div class="level-card__check" v-if="passed">✅</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { playSelect, playLocked } from '../utils/audio'

const props = defineProps({
  shape: { type: Object, required: true },
  bestScore: { type: Number, default: 0 },
  locked: { type: Boolean, default: false },
  passed: { type: Boolean, default: false }
})

const router = useRouter()

const scoreColor = computed(() => {
  if (props.bestScore >= 70) return '#4ECDC4'
  if (props.bestScore >= 40) return '#FFD93D'
  return '#FF6B6B'
})

function handleClick() {
  if (props.locked) {
    playLocked()
    return
  }
  playSelect()
  router.push(`/draw/${props.shape.id}`)
}
</script>

<style scoped>
.level-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  position: relative;
  min-height: 90px;
  justify-content: center;
}

.level-card:active:not(.level-card--locked) {
  transform: scale(0.95);
}

.level-card--locked {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.6);
}

.level-card--passed {
  border: 2px solid var(--color-secondary);
  background: linear-gradient(135deg, #f0fffe, #ffffff);
}

.level-card__icon {
  font-size: 1.8rem;
}

.level-card__name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
}

.level-card__score {
  font-size: 0.7rem;
}

.score-value {
  font-weight: 800;
}

.score-empty {
  color: var(--color-text-muted);
  font-size: 0.65rem;
}

.level-card__lock {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 0.7rem;
}

.level-card__check {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 0.7rem;
}
</style>
