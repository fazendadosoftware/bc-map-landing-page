<template>
  <div class="min-w-full text-xs flex flex-col pt-0 px-3 flex flex-col text-leanix-gray-dark" ref="container">
    <div class="flex flex-wrap justify-center items-center bg-white lg:py-8 lg:px-16">
      <span class="w-full my-2 lg:mb-0 lg:w-auto text-leanix-gray-darkest font-extra-bold text-xl lg:text-2xl lg:mr-8 lg:pb-4 flex justify-center">
        Business Capability Map
      </span>
      <industry-select
        class="w-full lg:max-w-xs bc-industry-select"
        :bc-maps="bcMaps"
        :selected-bc-map="selectedBcMap"
        @bc-map-selected="bcMapSelectedHandler"/>
      <div class="flex-1"/>
      <div class="flex justify-between items-center space-x-8 w-full lg:w-auto my-2 lg:mx-0">
        <div
          @click.stop="slideoverOpened = true"
          class="cursor-pointer hover:underline select-none">
          Show Best Practices
        </div>
        <export-dropdown-button
          @export-excel="exportAsExcel"
          @export-pdf="exportAsPdf"/>
      </div>
    </div>
    <!-- Horizontal overflow container for bc columns -->
    <div class="flex-1 overflow-x-auto flex flex-col">
      <transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-700"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        mode="out-in">
        <div
          v-if="selectedBcMap"
          class="mx-auto flex-1 flex justify-start items-start space-x-3 relative bc-cols-container">
          <template
            v-for="businessCapability in selectedBcMap.children"
            :key="businessCapability.id">
            <div
              class="cursor-default handle flex flex-col rounded-md space-y-3 shadow-xl bc-col"
              style="min-width: 200px; width: 200px"
              :style="`background: ${getBackgroundColor(businessCapability)}`"
              @mouseover="hovered = businessCapability.id"
              @mouseleave="hovered = null">
              <div class="bg-white w-full sticky top-0 z-10">
                <div
                  class="text-white text-base font-axiformabold text-center leading-5 rounded-t-md -mb-2 2xl:-mb-4 p-3 min-h-coltitlesm 2xl:min-h-coltitle flex items-center h-full justify-center"
                  :class="{
                    'rounded-md': !Array.isArray(businessCapability.children) || Array.isArray(businessCapability.children) && !businessCapability.children.length,
                    'rounded-t-md': Array.isArray(businessCapability.children) && businessCapability.children.length
                  }"
                  :style="`background: ${getBackgroundColor(businessCapability)}`">
                  <span class="bc-col-header">{{businessCapability.name}}</span>
                </div>
              </div>
              <div class="flex-1 flex flex-col space-y-3 2xl:space-y-4 w-full p-3 2xl:p-4 pt-0 rounded-md">
                <template
                  v-for="child in businessCapability.children"
                  :key="child.id">
                  <div class="bg-white rounded-md text-tiny w-full bc-child">
                    <div :style="`background: ${getBackgroundColor(businessCapability)}`">
                      <div
                        @mouseover.stop="hovered = child.id"
                        @mouseleave.stop="hovered = null"
                        class="cursor-default handle bg-white hover:bg-gray-200 transition-colors font-axiformabold p-1 text-center sticky top-0 relative bc-child-header"
                        :class="{
                          'rounded-md': !Array.isArray(child.children) || Array.isArray(child.children) && !child.children.length,
                          'rounded-t-md border-b-2': Array.isArray(child.children) && child.children.length
                        }"
                        :style="`border-color:${getBackgroundColor(businessCapability)}`">
                        <span>{{child.name}}</span>
                      </div>
                    </div>
                    <div>
                      <template v-for="grandChild in child.children" :key="grandChild.id">
                        <div
                          class="cursor-default flex flex-col items-center border-b last:border-0 p-1 text-center hover:bg-gray-200 transition-colors relative last:rounded-b-md bc-grandchildren"
                          @mouseover.stop="hovered = grandChild.id"
                          @mouseleave.stop="hovered = null">
                          <span>{{grandChild.name}}</span>
                        </div>
                      </template>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
        <div v-else class="flex justify-center items-center text-xl 2xl:text-4xl">
          <span class="mr-4 py-1.5 opacity-50">Loading</span>
            <svg class="opacity-50 h-4 w-4 2xl:h-8 2xl:w-8 animate-spin transform rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        </div>
      </transition>
    </div>
    <best-practices-slide-over :opened="slideoverOpened" @close="slideoverOpened = false" />
  </div>
</template>

<script>
import { ref } from 'vue'

import IndustrySelect from '@/components/IndustrySelect.vue'
import ExportDropdownButton from '@/components/ExportDropdownButton.vue'
import BestPracticesSlideOver from '@/components/BestPracticesSlideOver.vue'

export default {
  components: {
    IndustrySelect,
    ExportDropdownButton,
    BestPracticesSlideOver
  },
  data () {
    return {
      selectedBcMap: null,
      bcMaps: []
    }
  },
  methods: {
    getBackgroundColor (businessCapability = {}) {
      const { backgroundColor = '#4D5C7D' } = businessCapability
      return backgroundColor
    },
    async fetchBcs () {
      const { bcMaps } = await fetch('https://bcmaps.fazendadosoftware.com/bcMaps.json')
        .then(response => response.json())
      this.bcMaps = bcMaps
      this.selectedBcMap = bcMaps.find(({ name }) => name.toLowerCase() === 'default') || bcMaps[0]
    },
    bcMapSelectedHandler (bcMap) {
      if (this.selectedBcMap?.id !== bcMap?.id) this.selectedBcMap = bcMap
    },
    async exportAsExcel () {
      const { default: generateExcel } = await import('@/helpers/generateExcel')
      generateExcel(this.selectedBcMap)
    },
    async exportAsPdf () {
      const { name } = this.selectedBcMap
      const { default: generatePdf } = await import('@/helpers/generatePdf')
      const output = await generatePdf(JSON.parse(JSON.stringify(this.selectedBcMap)), this.getBackgroundColor())
      const { saveAs } = await import('file-saver')
      saveAs(output, `${name}.pdf`)
    }
  },
  async created () {
    await this.fetchBcs()
  },
  setup () {
    const container = ref(null)
    const slideoverOpened = ref(false)
    const bcs = ref(null)
    const hovered = ref(null)

    return {
      container,
      slideoverOpened,
      bcs,
      hovered
    }
  }
}
</script>
