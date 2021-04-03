<template>
  <!-- Horizontal overflow container for bc columns -->
  <div class="flex-1 overflow-x-auto flex flex-col pb-3">
    <div
      class="mx-auto flex-1 flex justify-start items-start space-x-3 relative bc-cols-container">
      <template
        v-for="businessCapability in selectedBcMap.children"
        :key="businessCapability.id">
        <div
          class="cursor-default handle flex flex-col rounded-md space-y-3 shadow bc-col"
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
  </div>
</template>

<script>
export default {
  name: 'BusinessCapabilityMap',
  props: {
    selectedBcMap: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      hovered: false
    }
  },
  methods: {
    getBackgroundColor (businessCapability = {}) {
      const { backgroundColor = '#4D5C7D' } = businessCapability
      return backgroundColor
    }
  }
}
</script>
