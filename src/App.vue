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
          :selected-bc-map="selectedBcMap"
          @export-excel="exportAsExcel"
          @export-pdf="exportAsPdf"/>
      </div>
    </div>
    <router-view
      v-if="selectedBcMap !== null"
      v-slot="{ Component }">
      <transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-700"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        mode="out-in">
        <!-- FIXME: transition issue: https://github.com/vuejs/vue-router-next/issues/803 -->
        <component
          :is="Component"
          :selected-bc-map="selectedBcMap"/>
      </transition>
    </router-view>
    <template v-else>
      <div v-if="loading" class="flex justify-center items-center text-xl 2xl:text-2xl">
        <span class="mr-4 py-1.5 opacity-50">Loading</span>
        <svg class="opacity-50 h-4 w-4 2xl:h-8 2xl:w-8 animate-spin transform rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <div
        v-if="selectedBcMap === null && !loading"
        class="flex-1 flex items-center justify-center text-xl 2xl:text-2xl">
        Industry {{$route.params.industry}} not found!
      </div>
    </template>

    <best-practices-slide-over :opened="slideoverOpened" @close="slideoverOpened = false" />
  </div>
</template>

<script>
import IndustrySelect from '@/components/IndustrySelect.vue'
import ExportDropdownButton from '@/components/ExportDropdownButton.vue'
import BestPracticesSlideOver from '@/components/BestPracticesSlideOver.vue'
const { NODE_ENV: env = null } = process.env

export default {
  components: {
    IndustrySelect,
    ExportDropdownButton,
    BestPracticesSlideOver
  },
  data () {
    return {
      selectedBcMap: null,
      bcMaps: [],
      slideoverOpened: false,
      loading: false
    }
  },
  methods: {
    async fetchBcs () {
      this.loading = true
      let bcMaps = []
      try {
        bcMaps = env === 'development'
          ? require('@/test/data/bcmaps.json')
          : await fetch('https://functions-westeurope-prod-bc-maps.azurewebsites.net/api/WebhookListener')
            .then(response => response.json())
            .then(({ bcMaps }) => bcMaps)
        this.bcMaps = bcMaps
        const { routeIndustry = null } = this
        const targetIndustry = routeIndustry !== null ? routeIndustry : 'Default'
        const targetBcMap = bcMaps.find(({ name }) => name === targetIndustry) || null
        this.selectedBcMap = targetBcMap
      } finally {
        this.loading = false
      }
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
      const { default: generatePdf } = await import('@/helpers/generatePdfLongLayout')
      const output = await generatePdf(JSON.parse(JSON.stringify(this.selectedBcMap)))
      const { saveAs } = await import('file-saver')
      saveAs(output, `LeanIX_Business-Capability-Map_${name}.pdf`)
    }
  },
  computed: {
    routeIndustry () {
      const { params: { industry = null } } = this.$route
      return industry
    }
  },
  watch: {
    selectedBcMap (businessCapabilityMap) {
      if (businessCapabilityMap === null) return
      const { name: industry } = businessCapabilityMap
      this.$router.push({ name: 'industry', params: { industry, selectedBcMap: JSON.stringify(businessCapabilityMap) } })
    },
    routeIndustry (industry = null) {
      if (this.loading) return
      if (industry === null) industry = 'Default'
      const targetBcMap = this.bcMaps.find(({ name }) => name === industry) || null
      this.selectedBcMap = targetBcMap
    }
  },
  async created () {
    await this.fetchBcs()
  }
}
</script>
