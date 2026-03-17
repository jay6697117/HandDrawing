<template>
  <div class="page page-center home-page">
    <div class="home-content">
      <!-- 游戏图标 -->
      <div class="home-icon animate-float">✏️🎨</div>

      <!-- 标题 -->
      <h1 class="home-title animate-bounce-in">徒手画图大师</h1>
      <p class="home-subtitle">看看你能画出多标准的图形！</p>

      <!-- 开始按钮 -->
      <router-link to="/levels" class="btn btn-primary btn-large start-btn animate-pulse" @click="playClick">
        🎮 开始游戏
      </router-link>

      <!-- 进度展示 -->
      <div class="home-stats" v-if="totalProgress.passed > 0">
        <div class="stat-item">
          <span class="stat-value">{{ totalProgress.passed }}/{{ totalProgress.total }}</span>
          <span class="stat-label">已通关</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ totalProgress.percentage }}%</span>
          <span class="stat-label">完成度</span>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="home-actions">
        <button class="btn btn-secondary" @click="showSettings = true; playClick()">⚙️ 设置</button>
      </div>
    </div>

    <!-- 装饰图形 -->
    <div class="deco deco-circle"></div>
    <div class="deco deco-triangle"></div>
    <div class="deco deco-square"></div>
    <div class="deco deco-star"></div>

    <!-- 设置弹窗 -->
    <div class="modal-overlay" v-if="showSettings" @click.self="showSettings = false">
      <div class="modal-card">
        <h2>⚙️ 设置</h2>
        <div class="setting-row mt-md">
          <span>🔊 音效</span>
          <button class="btn btn-secondary" @click="toggleMute">
            {{ isSoundMuted ? '🔇 已关闭' : '🔊 已开启' }}
          </button>
        </div>
        <button class="btn btn-primary btn-block mt-md" @click="handleReset">🗑️ 重置所有进度</button>
        <button class="btn btn-secondary btn-block mt-sm" @click="showSettings = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGameStore } from '../stores/game'
import { playClick, getMuted, setMuted } from '../utils/audio'

const gameStore = useGameStore()
const totalProgress = gameStore.totalProgress
const showSettings = ref(false)
const isSoundMuted = ref(getMuted())

function toggleMute() {
  isSoundMuted.value = !isSoundMuted.value
  setMuted(isSoundMuted.value)
  if (!isSoundMuted.value) playClick()
}

function handleReset() {
  if (confirm('确定要重置所有游戏进度吗？此操作不可撤销！')) {
    gameStore.resetProgress()
    showSettings.value = false
  }
}
</script>

<style scoped>
.home-page {
  background: linear-gradient(180deg, #FFE5E5 0%, #FFF0E5 30%, #FFF5F5 60%, #FFF 100%);
  position: relative;
  overflow: hidden;
}

.home-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  z-index: 1;
  position: relative;
}

.home-icon {
  font-size: 4.5rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.home-title {
  font-size: 2.2rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--color-primary), #FF914D);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.home-subtitle {
  font-size: 1rem;
  color: var(--color-text-light);
  margin-top: -8px;
}

.start-btn {
  margin-top: var(--space-md);
  text-decoration: none;
  font-size: 1.2rem;
  padding: 18px 48px;
  box-shadow: 0 6px 24px rgba(255, 107, 107, 0.4);
}

.home-stats {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  background: var(--color-bg-card);
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: var(--color-border);
}

.home-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

/* 装饰几何图形 */
.deco {
  position: absolute;
  opacity: 0.08;
}

.deco-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--color-primary);
  top: 8%;
  right: -20px;
}

.deco-triangle {
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 86px solid var(--color-secondary);
  bottom: 15%;
  left: -15px;
}

.deco-square {
  width: 70px;
  height: 70px;
  border: 4px solid var(--color-accent-dark);
  transform: rotate(15deg);
  top: 20%;
  left: 10%;
}

.deco-star {
  width: 80px;
  height: 80px;
  background: var(--color-purple);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  bottom: 10%;
  right: 5%;
}

/* 设置弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--space-md);
}

.modal-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  width: 100%;
  max-width: 340px;
  text-align: center;
  animation: bounce-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-card h2 {
  font-size: 1.3rem;
  margin-bottom: var(--space-sm);
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  font-weight: 700;
}
</style>
