<template>
  <div class="min-w-full text-xs flex flex-col pt-0 px-3 flex flex-col text-leanix-gray-dark absolute overflow-x-hidden" ref="container">
    <div class="flex flex-wrap justify-center items-center bg-white lg:py-8 lg:px-16">
      <span class="w-full my-2 lg:mb-0 lg:w-auto text-leanix-gray-darkest font-extra-bold text-xl lg:text-2xl lg:mr-8 lg:pb-2 flex justify-center">
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
    <transition
      enter-active-class="transition-opacity duration-1000"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-1000"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <draggable
        v-if="selectedBcMap"
        :list="selectedBcMap.children"
        :group="{ name: 'g1' }"
        item-key="id"
        :handle="editable ? '.handle' : '.no-handle'"
        :move="() => editable"
        class="flex-1 flex justify-center items-start px-3 space-x-3 relative bc-cols-container">
        <template #item="{element: businessCapability}">
          <div
            class="handle flex flex-col rounded-md space-y-3 shadow-xl bc-col"
            :class="{
              'cursor-move': editable,
              'cursor-default': !editable
            }"
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
                <template
                  v-if="businessCapability.editing === true">
                  <input
                    v-focus
                    :value="businessCapability.name"
                    @blur="$event => onNameInputBlur($event, businessCapability, null)"
                    @keyup.enter="$event => onNameInputBlur($event, businessCapability, null)"
                    @keyup.esc="$event => onNameInputBlur($event, businessCapability, null, true)"
                    class="w-full bg-transparent rounded text-base font-bold text-center leading-5 focus:outline-none">
                </template>
                <template v-else>
                  <span class="bc-col-header">{{businessCapability.name}}</span>
                  <transition
                    enter-active-class="transition-opacity delay-500"
                    enter-from-class="opacity-0"
                    enter-to-class="opacity-100"
                    leave-active-class="transition-opacity"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0">
                    <div
                      v-if="hovered === businessCapability.id && editable"
                      class="absolute top-0 inset-x-0 flex px-1 py-1 space-x-1 rounded"
                      style="background: #00000030">
                      <!-- Add Child -->
                      <button
                        @click="addChild(businessCapability)"
                        class="focus:outline-none text-white hover:bg-gray-600 transition-colors p-1 rounded-md"
                        style="background: #00000060">
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      <!-- Edit -->
                      <button
                        @click="businessCapability.editing = true"
                        class="focus:outline-none text-white hover:bg-gray-600 transition-colors p-1 rounded-md"
                        style="background: #00000060">
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <div class="flex-1"/>
                      <!-- Color Picker -->
                      <button
                        class="focus:outline-none text-white border border-gray-300 hover:bg-gray-600 transition-colors rounded-md"
                        :style="`background: ${getBackgroundColor(businessCapability)}`">
                        <input
                          :value="getBackgroundColor(businessCapability)"
                          @change="$event => colorChangeHandler ($event, businessCapability)"
                          type="color"
                          class="h-5 w-5 opacity-0 cursor-pointer">
                      </button>
                      <!-- Delete BC -->
                      <button
                        @click="deleteBc(businessCapability)"
                        class="focus:outline-none text-white hover:bg-gray-600 transition-colors p-1 rounded-md"
                        style="background: #00000060">
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </transition>
                </template>
              </div>
            </div>
            <draggable
              :list="businessCapability.children"
              :group="{ name: 'g2' }"
              item-key="id"
              :handle="editable ? '.handle' : '.no-handle'"
              :move="() => editable"
              class="flex-1 flex flex-col space-y-3 2xl:space-y-4 w-full p-3 2xl:p-4 pt-0 rounded-md"
              :component-data="{style: `background: ${getBackgroundColor(businessCapability)}`}">
              <template #item="{element: child}">
                <div class="bg-white rounded-md text-tiny w-full bc-child">
                  <div :style="`background: ${getBackgroundColor(businessCapability)}`">
                    <div
                      @mouseover.stop="hovered = child.id"
                      @mouseleave.stop="hovered = null"
                      class="handle bg-white hover:bg-gray-200 transition-colors font-axiformabold p-1 text-center sticky top-0 relative bc-child-header"
                      :class="{
                        'cursor-move': editable,
                        'cursor-default': !editable,
                        'rounded-md': !Array.isArray(child.children) || Array.isArray(child.children) && !child.children.length,
                        'rounded-t-md border-b-2': Array.isArray(child.children) && child.children.length
                      }"
                      :style="`border-color:${getBackgroundColor(businessCapability)}`">
                      <template v-if="child.editing === true">
                        <input
                          v-focus
                          :value="child.name"
                          @blur="$event => onNameInputBlur($event, child, businessCapability)"
                          @keyup.enter="$event => onNameInputBlur($event, child, businessCapability)"
                          @keyup.esc="$event => onNameInputBlur($event, child, businessCapability, true)"
                          class="w-full bg-transparent rounded font-bold text-center focus:outline-none">
                      </template>
                      <template v-else>
                        <span>{{child.name}}</span>
                        <transition
                          enter-active-class="transition-opacity"
                          enter-from-class="opacity-0"
                          enter-to-class="opacity-100"
                          leave-active-class="transition-opacity"
                          leave-from-class="opacity-100"
                          leave-to-class="opacity-0">
                          <div
                            v-if="hovered === child.id && editable"
                            class="absolute inset-y-0 inset-x-0 flex items-center space-x-1 rounded-md"
                            style="background: #00000010">
                            <!-- Add Child -->
                            <button
                              @click="addChild(child)"
                              class="focus:outline-none text-white hover:bg-gray-600 transition-colors p-1 rounded-md"
                              style="background: #00000060">
                              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                            <!-- Edit -->
                            <button
                              @click="child.editing = true"
                              class="focus:outline-none text-white hover:bg-gray-600 transition-colors p-1 rounded-md"
                              style="background: #00000060">
                              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <div class="flex-1"/>
                            <!-- Delete BC -->
                            <button
                              @click="deleteBc(child, businessCapability)"
                              class="focus:outline-none text-white hover:bg-gray-600 transition-colors p-1 rounded-md"
                              style="background: #00000060">
                              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </transition>
                      </template>
                    </div>
                  </div>
                  <draggable
                    :list="child.children"
                    :group="{ name: 'g3' }"
                    item-key="id"
                    :move="() => editable"
                    :handle="editable ? '.bc-grandchildren' : '.no-handle'">
                    <template #item="{element: grandChild}">
                      <div
                        class="flex flex-col items-center border-b last:border-0 p-1 text-center hover:bg-gray-200 transition-colors relative last:rounded-b-md bc-grandchildren"
                        :class="{
                          'cursor-move': editable,
                          'cursor-default': !editable
                        }"
                        @mouseover.stop="hovered = grandChild.id"
                        @mouseleave.stop="hovered = null">
                        <template v-if="grandChild.editing === true">
                          <input
                            v-focus
                            :value="grandChild.name"
                            @blur="$event => onNameInputBlur($event, grandChild, child)"
                            @keyup.enter="$event => onNameInputBlur($event, grandChild, child)"
                            @keyup.esc="$event => onNameInputBlur($event, grandChild, child, true)"
                            class="w-full bg-transparent rounded text-center focus:outline-none">
                        </template>
                        <template v-else>
                          <span>{{grandChild.name}}</span>
                          <transition
                            enter-active-class="transition-opacity"
                            enter-from-class="opacity-0"
                            enter-to-class="opacity-100"
                            leave-active-class="transition-opacity"
                            leave-from-class="opacity-100"
                            leave-to-class="opacity-0">
                            <div
                              v-if="hovered === grandChild.id && editable"
                              class="absolute inset-y-0 inset-x-0 flex items-center space-x-1 rounded-md"
                              style="background: #00000010">
                              <!-- Edit -->
                              <button
                                @click="grandChild.editing = true"
                                class="focus:outline-none text-white hover:bg-gray-600 transition-colors p-1 rounded-md"
                                style="background: #00000060">
                                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <div class="flex-1"/>
                              <!-- Delete BC -->
                              <button
                                @click="deleteBc(grandChild, child)"
                                class="focus:outline-none text-white hover:bg-gray-600 transition-colors p-1 rounded-md"
                                style="background: #00000060">
                                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </transition>
                        </template>
                      </div>
                    </template>
                  </draggable>
                </div>
              </template>
            </draggable>
          </div>
        </template>
      </draggable>
      <div v-else class="h-full flex justify-center items-center text-xl 2xl:text-4xl">
        <div class="flex items-center">
          <span class="mr-4">Loading</span>
          <svg class="h-4 w-4 2xl:h-8 2xl:w-8 animate-spin transform rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>
    </transition>
    <best-practices-slide-over
      :opened="slideoverOpened"
      @close="slideoverOpened = false" />
    <transition
      enter-active-class="transition-opacity"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div
        v-if="editable"
        class="fixed bottom-8 right-16">
        <button
          @click="addBc"
          type="button"
          class="inline-flex items-center p-3 border border-transparent rounded-full text-white bg-leanix-blue hover:opacity-75 transition-opacity focus:outline-none focus:ring-0">
          <!-- Heroicon name: outline/plus -->
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { ref } from 'vue'

import IndustrySelect from '@/components/IndustrySelect.vue'
import ExportDropdownButton from '@/components/ExportDropdownButton.vue'
import BestPracticesSlideOver from '@/components/BestPracticesSlideOver.vue'
import { v4 as uuid } from 'uuid'
import randomcolor from 'randomcolor'

export default {
  components: {
    draggable,
    IndustrySelect,
    ExportDropdownButton,
    BestPracticesSlideOver
  },
  data () {
    return {
      newBc: null,
      selectedBcMap: null,
      bcMaps: []
    }
  },
  directives: {
    focus: {
      mounted (el, bindings, vnode) {
        el.focus()
      }
    }
  },
  methods: {
    getBackgroundColor (businessCapability = {}) {
      const { backgroundColor = '#4D5C7D' } = businessCapability
      return backgroundColor
    },
    onNameInputBlur (evt, businessCapability, parent = null, abort = false) {
      const { id = null } = businessCapability
      const siblings = parent === null ? this.bcs : parent.children
      if (!Array.isArray(siblings)) {
        console.error('no siblings found for business capability', businessCapability, parent)
        throw Error('no siblings found for business capability')
      }
      const { value: name } = evt.target
      const idx = siblings.findIndex(({ id: bcId }) => bcId === id)
      delete businessCapability.editing
      if (!name && businessCapability.name) return
      if (abort || !name) siblings.splice(idx, 1)
      // CREATE BC
      else if (id === null) siblings[idx] = { ...businessCapability, id: uuid(), name: name.trim() }
      // UPDATE BC
      else siblings[idx] = { ...siblings[idx], name }
    },
    deleteBc (bc, parent = null) {
      const { id: bcId } = bc
      const siblings = parent === null ? this.bcs : parent.children
      const idx = siblings.findIndex(({ id }) => id === bcId)
      // DELETE BC HERE
      siblings.splice(idx, 1)
    },
    addChild (bc) {
      if (!Array.isArray(bc.children)) bc.children = []
      bc.children.push({ id: null, editing: true })
    },
    colorChangeHandler (evt, bc) {
      const { target: { value: backgroundColor } } = evt
      bc.backgroundColor = backgroundColor
      // UPDATE COLOR HERE
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
    /*
    async exportAsSvg () {
      const { default: generateSvg } = await import('@/helpers/generateSvg')
      generateSvg(this.$refs.container, this.selectedBcMap)
    }
    */
  },
  async created () {
    await this.fetchBcs()
  },
  setup () {
    const container = ref(null)
    const editable = ref(false)
    const slideoverOpened = ref(false)
    const bcs = ref(null)
    const hovered = ref(null)

    const addBc = () => bcs.value.push({ id: null, backgroundColor: randomcolor({ luminosity: 'dark' }), children: [], editing: true })

    return {
      container,
      slideoverOpened,
      bcs,
      hovered,
      editable,
      addBc
    }
  }
}
</script>
