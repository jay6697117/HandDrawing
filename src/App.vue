<template>
  <div id="game-app">
    <router-view v-slot="{ Component, route }">
      <transition :name="transitionName" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

// 根组件 - 根据路由深度智能切换页面过渡方向
const router = useRouter()
const transitionName = ref('fade')

// 监听路由变化，根据深度判断进入/返回方向
watch(
  () => router.currentRoute.value,
  (to, from) => {
    if (!from || !from.meta) {
      transitionName.value = 'fade'
      return
    }
    const toDepth = to.meta.depth ?? 0
    const fromDepth = from.meta.depth ?? 0
    transitionName.value = toDepth > fromDepth ? 'slide-left' : toDepth < fromDepth ? 'slide-right' : 'fade'
  }
)
</script>

<style scoped>
#game-app {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
}

/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 向左滑入（前进） */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}
.slide-left-enter-from {
  transform: translateX(40px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* 向右滑入（后退） */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}
.slide-right-enter-from {
  transform: translateX(-40px);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
