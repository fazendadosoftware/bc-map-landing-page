import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'BusinessCapabilityMap',
    props: true,
    component: () => import(/* webpackChunkName: "BusinessCapabilityMap" */ '@/components/BusinessCapabilityMap.vue')
  },
  {
    path: '/:industry',
    name: 'industry',
    component: () => import(/* webpackChunkName: "BusinessCapabilityMap" */ '@/components/BusinessCapabilityMap.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
