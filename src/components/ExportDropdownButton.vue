<template>
  <div
    class="relative text-leanix-gray-dark"
    v-click-outside="() => { opened = false }"
    v-escape="() => { opened = false }">
    <button
      @click="opened = !opened"
      class="bg-leanix-blue text-white px-24px py-12px flex items-center focus:outline-none hover:opacity-75 transition-opacity"
      :class="{
        'opacity-75': opened
      }">
      <span class="font-axiformabold text-13px">Export</span>
      <arrow-triangle-icon class="text-white w-2.5 h-2.5 ml-4"/>
    </button>
    <transition
      enter-from-class="transform opacity-0 scale-95"
      enter-active-class="transition ease-out duration-100"
      enter-to-class="transform opacity-100 scale-100"
      leave-from-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-to-class="transform opacity-0 scale-95">
      <div
        v-if="opened"
        class="absolute mt-1 right-0 w-36 bg-white z-50 shadow-xl border border-leanix-gray-dropdown rounded">
        <div
          v-for="(option, i) in exportOptions"
          :key="i"
          class="px-24px py-12px cursor-pointer hover:bg-gray-200 transition-colors border-b border-leanix-gray-light"
          @click="opened = !opened; typeof option.callback === 'function' ? option.callback() : undefined">
          {{option.label}}
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, getCurrentInstance } from 'vue'
import ArrowTriangleIcon from '@/components/ArrowTriangleIcon.vue'
import ClickOutside from '@/directives/clickOutside'
import Escape from '@/directives/escapeKey'

export default {
  components: {
    ArrowTriangleIcon
  },
  directives: {
    ClickOutside,
    Escape
  },
  setup () {
    const { emit } = getCurrentInstance()
    const opened = ref(false)
    const exportOptions = ref([
      {
        label: 'Export as Excel',
        callback: () => emit('export-excel')
      },
      {
        label: 'Export as PDF',
        callback: () => emit('export-pdf')
      }
      /*
      {
        label: 'Export as SVG',
        callback: () => emit('export-svg')
      }
      */
    ])
    return {
      opened,
      exportOptions
    }
  }
}
</script>
