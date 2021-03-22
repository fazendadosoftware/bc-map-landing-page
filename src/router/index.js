import { createRouter, createWebHistory } from 'vue-router'
import BusinessCapabilityMap from '@/components/BusinessCapabilityMap'

const routes = [
  {
    path: '/',
    name: 'BusinessCapabilityMap',
    props: true,
    component: BusinessCapabilityMap
  },
  {
    path: '/:industry',
    name: 'industry',
    component: BusinessCapabilityMap
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
