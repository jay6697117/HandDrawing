import { createRouter, createWebHistory } from 'vue-router'

// 路由深度映射（用于判断页面切换动画方向）
const routeDepth = {
  Home: 0,
  Levels: 1,
  Draw: 2,
  Result: 3
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { transition: 'fade', depth: 0 }
  },
  {
    path: '/levels',
    name: 'Levels',
    component: () => import('../views/LevelMapView.vue'),
    meta: { transition: 'slide', depth: 1 }
  },
  {
    path: '/draw/:shapeId',
    name: 'Draw',
    component: () => import('../views/DrawingView.vue'),
    meta: { transition: 'slide', depth: 2 }
  },
  {
    path: '/result/:shapeId',
    name: 'Result',
    component: () => import('../views/ResultView.vue'),
    meta: { transition: 'slide', depth: 3 }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
export { routeDepth }
