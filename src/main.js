import { createApp } from 'vue'
import { GesturePlugin } from '@vueuse/gesture'
import App from '@/App.vue'
import '@/registerServiceWorker'
import '@/assets/css/index.css'
import router from './router'

const app = createApp(App)
  .use(router)
  .use(GesturePlugin)

app.mount('#app')
