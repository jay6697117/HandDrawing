<template>
  <div class="page level-map-page">
    <!-- 顶部导航 -->
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/')">←</button>
      <h1>🗺️ 关卡地图</h1>
    </div>

    <!-- 章节列表 -->
    <div class="chapters">
      <div
        v-for="chapter in chapters"
        :key="chapter.id"
        class="chapter-section"
        :class="{ 'chapter-section--locked': !gameStore.isChapterUnlocked(chapter.id) }"
      >
        <!-- 章节标题 -->
        <div class="chapter-header">
          <div class="chapter-title" :style="{ color: chapter.color }">
            <span class="chapter-badge" :style="{ background: chapter.color }">
              {{ chapter.isFinal ? '🏆' : `第${chapter.id}章` }}
            </span>
            {{ chapter.name }}
          </div>
          <div class="chapter-meta">
            <span class="chapter-threshold">通关门槛 {{ chapter.passThreshold }}%</span>
            <span class="chapter-progress">
              {{ gameStore.getChapterProgress(chapter.id).passed }}/{{ gameStore.getChapterProgress(chapter.id).total }}
            </span>
          </div>
        </div>

        <!-- 关卡网格 -->
        <div class="level-grid">
          <LevelCard
            v-for="shape in getShapesByChapter(chapter.id)"
            :key="shape.id"
            :shape="shape"
            :best-score="gameStore.getBestScore(shape.id)"
            :locked="!gameStore.isChapterUnlocked(chapter.id)"
            :passed="gameStore.isLevelPassed(shape.id)"
          />
        </div>

        <!-- 未解锁遮罩 -->
        <div class="chapter-lock-overlay" v-if="!gameStore.isChapterUnlocked(chapter.id)">
          <span class="lock-text">🔒 完成上一章解锁</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { chapters, getShapesByChapter } from '../config/shapes'
import { useGameStore } from '../stores/game'
import LevelCard from '../components/LevelCard.vue'

const gameStore = useGameStore()
</script>

<style scoped>
.level-map-page {
  background: var(--color-bg);
  padding-bottom: var(--space-2xl);
}

.chapters {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.chapter-section {
  position: relative;
}

.chapter-section--locked {
  pointer-events: none;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.chapter-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 1rem;
  font-weight: 800;
}

.chapter-badge {
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: var(--radius-full);
}

.chapter-meta {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.chapter-threshold {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  background: var(--color-bg);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.chapter-progress {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-secondary);
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

@media (min-width: 400px) {
  .level-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

.chapter-lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(2px);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-text {
  background: var(--color-bg-card);
  padding: 8px 20px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-light);
  box-shadow: var(--shadow-sm);
}
</style>
